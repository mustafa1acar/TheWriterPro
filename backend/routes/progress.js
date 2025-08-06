const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
  validateProgressSubmission, 
  validateProgressGrading, 
  validateObjectId, 
  validatePagination 
} = require('../middleware/validation');

// @desc    Get user's progress
// @route   GET /api/progress
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.exerciseId) filter.exercise = req.query.exerciseId;

    const progress = await Progress.find(filter)
      .populate('exercise', 'title type difficulty category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Progress.countDocuments(filter);

    res.json({
      success: true,
      progress,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      error: 'Server error fetching progress'
    });
  }
});

// @desc    Submit exercise attempt
// @route   POST /api/progress
// @access  Private
router.post('/', protect, validateProgressSubmission, async (req, res) => {
  try {
    const { exerciseId, response } = req.body;

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise || !exercise.isActive) {
      return res.status(404).json({
        error: 'Exercise not found'
      });
    }

    // Get user's previous attempts for this exercise
    const existingAttempts = await Progress.countDocuments({
      user: req.user._id,
      exercise: exerciseId
    });

    // Check if user can make another attempt
    if (!exercise.canUserAttempt(existingAttempts)) {
      return res.status(400).json({
        error: `Maximum attempts (${exercise.requirements.allowedAttempts}) reached for this exercise`
      });
    }

    // Calculate word count
    const wordCount = response.content.trim().split(/\s+/).length;

    // Validate word count requirements
    if (wordCount < exercise.requirements.minWords) {
      return res.status(400).json({
        error: `Response must be at least ${exercise.requirements.minWords} words. Current: ${wordCount} words`
      });
    }

    if (wordCount > exercise.requirements.maxWords) {
      return res.status(400).json({
        error: `Response cannot exceed ${exercise.requirements.maxWords} words. Current: ${wordCount} words`
      });
    }

    // Create progress entry
    const progressData = {
      user: req.user._id,
      exercise: exerciseId,
      attemptNumber: existingAttempts + 1,
      status: 'submitted',
      response: {
        ...response,
        wordCount
      },
      submittedAt: new Date()
    };

    const progress = await Progress.create(progressData);
    
    // Update exercise statistics
    exercise.totalAttempts += 1;
    await exercise.save();

    // Update user statistics
    const user = await User.findById(req.user._id);
    user.totalWords += wordCount;
    user.updateStreak();
    await user.save();

    await progress.populate('exercise', 'title type difficulty category');

    res.status(201).json({
      success: true,
      message: 'Exercise submitted successfully',
      progress
    });

  } catch (error) {
    console.error('Submit progress error:', error);
    res.status(500).json({
      error: 'Server error submitting exercise'
    });
  }
});

// @desc    Get specific progress
// @route   GET /api/progress/:id
// @access  Private (Owner/Admin)
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id)
      .populate('exercise', 'title type difficulty category gradingCriteria')
      .populate('user', 'firstName lastName email')
      .populate('feedback.instructor', 'firstName lastName');

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found'
      });
    }

    // Check authorization
    if (progress.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'instructor') {
      return res.status(403).json({
        error: 'Not authorized to view this progress'
      });
    }

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Get specific progress error:', error);
    res.status(500).json({
      error: 'Server error fetching progress'
    });
  }
});

// @desc    Grade exercise
// @route   PUT /api/progress/:id/grade
// @access  Private (Instructor/Admin)
router.put('/:id/grade', protect, authorize('instructor', 'admin'), validateObjectId('id'), validateProgressGrading, async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found'
      });
    }

    if (progress.status !== 'submitted') {
      return res.status(400).json({
        error: 'Can only grade submitted exercises'
      });
    }

    const { scores, feedback, analysis } = req.body;

    // Update scores
    if (scores) {
      Object.keys(scores).forEach(criterion => {
        if (progress.scores[criterion] && scores[criterion]) {
          progress.scores[criterion] = {
            ...progress.scores[criterion],
            ...scores[criterion]
          };
        }
      });
    }

    // Update feedback
    if (feedback) {
      progress.feedback = {
        ...progress.feedback,
        ...feedback,
        instructor: req.user._id,
        isAIGenerated: false
      };
    }

    // Update analysis
    if (analysis) {
      progress.analysis = {
        ...progress.analysis,
        ...analysis
      };
    }

    // Get exercise for grading criteria weights
    const exercise = await Exercise.findById(progress.exercise);
    
    // Calculate overall score
    progress.calculateOverallScore(exercise.gradingCriteria);
    progress.calculateGrade();
    
    // Calculate improvement from previous attempts
    await progress.calculateImprovement();

    progress.status = 'graded';
    progress.isGraded = true;
    progress.gradedAt = new Date();

    await progress.save();

    // Update exercise average score
    const exerciseStats = await Progress.getExerciseStats(exercise._id);
    if (exerciseStats[0]) {
      exercise.averageScore = exerciseStats[0].averageScore;
      exercise.completionRate = exerciseStats[0].completionRate;
      await exercise.save();
    }

    // Update user progress
    const user = await User.findById(progress.user);
    if (progress.isCompleted) {
      user.exercisesCompleted += 1;
    }
    
    // Update user skills based on scores
    Object.keys(progress.scores).forEach(skill => {
      if (user.skills[skill] !== undefined && progress.scores[skill].score !== undefined) {
        // Weighted average with existing skill level
        const currentSkill = user.skills[skill];
        const newScore = progress.scores[skill].score;
        user.skills[skill] = Math.round((currentSkill * 0.8) + (newScore * 0.2));
      }
    });
    
    user.calculateOverallScore();
    await user.save();

    await progress.populate([
      { path: 'exercise', select: 'title type difficulty category' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'feedback.instructor', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      message: 'Exercise graded successfully',
      progress
    });

  } catch (error) {
    console.error('Grade progress error:', error);
    res.status(500).json({
      error: 'Server error grading exercise'
    });
  }
});

// @desc    Delete progress
// @route   DELETE /api/progress/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found'
      });
    }

    // Check authorization
    if (progress.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to delete this progress'
      });
    }

    await Progress.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Progress deleted successfully'
    });

  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({
      error: 'Server error deleting progress'
    });
  }
});

// @desc    Get progress analytics
// @route   GET /api/progress/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's progress summary
    const summary = await Progress.getUserProgressSummary(userId);

    // Get recent progress trends
    const recentProgress = await Progress.find({
      user: userId,
      isCompleted: true
    })
    .sort({ submittedAt: -1 })
    .limit(10)
    .select('overallScore submittedAt exercise')
    .populate('exercise', 'title type difficulty');

    // Get skills progress over time
    const skillsProgress = await Progress.aggregate([
      { $match: { user: userId, isCompleted: true } },
      {
        $group: {
          _id: {
            month: { $month: '$submittedAt' },
            year: { $year: '$submittedAt' }
          },
          grammar: { $avg: '$scores.grammar.score' },
          vocabulary: { $avg: '$scores.vocabulary.score' },
          structure: { $avg: '$scores.structure.score' },
          creativity: { $avg: '$scores.creativity.score' },
          clarity: { $avg: '$scores.clarity.score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      analytics: {
        summary: summary[0] || {},
        recentProgress,
        skillsProgress
      }
    });

  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({
      error: 'Server error fetching progress analytics'
    });
  }
});

// @desc    Get all progress for grading (Instructor/Admin)
// @route   GET /api/progress/grading
// @access  Private (Instructor/Admin)
router.get('/grading', protect, authorize('instructor', 'admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { 
      status: 'submitted',
      isGraded: false 
    };

    if (req.query.exerciseId) filter.exercise = req.query.exerciseId;

    const progress = await Progress.find(filter)
      .populate('exercise', 'title type difficulty category')
      .populate('user', 'firstName lastName email')
      .sort({ submittedAt: 1 }) // Oldest first for grading queue
      .skip(skip)
      .limit(limit);

    const total = await Progress.countDocuments(filter);

    res.json({
      success: true,
      progress,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get grading queue error:', error);
    res.status(500).json({
      error: 'Server error fetching grading queue'
    });
  }
});

module.exports = router; 