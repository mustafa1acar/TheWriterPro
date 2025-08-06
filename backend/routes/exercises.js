const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { 
  validateExerciseCreation, 
  validateObjectId, 
  validatePagination, 
  validateSearch 
} = require('../middleware/validation');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    // Build filter query
    const filter = { isActive: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.level) filter.level = parseInt(req.query.level);

    const exercises = await Exercise.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-sampleResponse'); // Don't include sample response in list

    const total = await Exercise.countDocuments(filter);

    res.json({
      success: true,
      exercises,
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
    console.error('Get exercises error:', error);
    res.status(500).json({
      error: 'Server error fetching exercises'
    });
  }
});

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private (Instructor/Admin)
router.post('/', protect, authorize('instructor', 'admin'), validateExerciseCreation, async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      createdBy: req.user._id
    };

    const exercise = await Exercise.create(exerciseData);
    
    await exercise.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      exercise
    });

  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      error: 'Server error creating exercise'
    });
  }
});

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Public
router.get('/:id', optionalAuth, validateObjectId('id'), async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!exercise || !exercise.isActive) {
      return res.status(404).json({
        error: 'Exercise not found'
      });
    }

    // Don't show sample response to regular users unless they're instructors/admins
    if (!req.user || (req.user.role !== 'instructor' && req.user.role !== 'admin')) {
      exercise.sampleResponse = undefined;
    }

    res.json({
      success: true,
      exercise
    });

  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      error: 'Server error fetching exercise'
    });
  }
});

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private (Creator/Admin)
router.put('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        error: 'Exercise not found'
      });
    }

    // Check if user owns the exercise or is admin
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to update this exercise'
      });
    }

    const updateFields = {};
    const allowedFields = [
      'title', 'description', 'instructions', 'type', 'category', 
      'difficulty', 'level', 'prompt', 'sampleResponse', 'keywords',
      'requirements', 'gradingCriteria', 'tags', 'isActive', 'isPremium'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      exercise: updatedExercise
    });

  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      error: 'Server error updating exercise'
    });
  }
});

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private (Creator/Admin)
router.delete('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        error: 'Exercise not found'
      });
    }

    // Check if user owns the exercise or is admin
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to delete this exercise'
      });
    }

    // Soft delete - deactivate exercise
    exercise.isActive = false;
    await exercise.save();

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });

  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      error: 'Server error deleting exercise'
    });
  }
});

// @desc    Search exercises
// @route   GET /api/exercises/search
// @access  Public
router.get('/search', optionalAuth, validateSearch, async (req, res) => {
  try {
    const { q, type, category, difficulty, level } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const filters = { type, category, difficulty };
    if (level) filters.level = parseInt(level);

    const exercises = await Exercise.searchExercises(q, filters);

    res.json({
      success: true,
      exercises,
      count: exercises.length
    });

  } catch (error) {
    console.error('Search exercises error:', error);
    res.status(500).json({
      error: 'Server error searching exercises'
    });
  }
});

// @desc    Get popular exercises
// @route   GET /api/exercises/popular
// @access  Public
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const exercises = await Exercise.getPopular(limit);

    res.json({
      success: true,
      exercises
    });

  } catch (error) {
    console.error('Get popular exercises error:', error);
    res.status(500).json({
      error: 'Server error fetching popular exercises'
    });
  }
});

// @desc    Get exercise statistics
// @route   GET /api/exercises/:id/stats
// @access  Private
router.get('/:id/stats', protect, validateObjectId('id'), async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        error: 'Exercise not found'
      });
    }

    // Get progress statistics for this exercise
    const Progress = require('../models/Progress');
    const stats = await Progress.getExerciseStats(exercise._id);

    res.json({
      success: true,
      stats: {
        exercise: {
          title: exercise.title,
          type: exercise.type,
          difficulty: exercise.difficulty,
          totalAttempts: exercise.totalAttempts,
          averageScore: exercise.averageScore,
          completionRate: exercise.completionRate
        },
        progress: stats[0] || {}
      }
    });

  } catch (error) {
    console.error('Get exercise stats error:', error);
    res.status(500).json({
      error: 'Server error fetching exercise statistics'
    });
  }
});

// @desc    Get exercises by difficulty
// @route   GET /api/exercises/difficulty/:difficulty
// @access  Public
router.get('/difficulty/:difficulty', optionalAuth, async (req, res) => {
  try {
    const { difficulty } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const exercises = await Exercise.getByDifficulty(difficulty);

    res.json({
      success: true,
      exercises: exercises.slice(0, limit),
      count: exercises.length
    });

  } catch (error) {
    console.error('Get exercises by difficulty error:', error);
    res.status(500).json({
      error: 'Server error fetching exercises by difficulty'
    });
  }
});

module.exports = router; 