const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect, authorizeSelf, authorize } = require('../middleware/auth');
const { 
  validateUserUpdate, 
  validateObjectId, 
  validatePagination 
} = require('../middleware/validation');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's progress summary
    const progressSummary = await Progress.getUserProgressSummary(user._id);
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        avatarInitials: user.avatarInitials,
        level: user.level,
        overallScore: user.overallScore,
        exercisesCompleted: user.exercisesCompleted,
        streakDays: user.streakDays,
        totalWords: user.totalWords,
        skills: user.skills,
        preferences: user.preferences,
        isVerified: user.isVerified,
        hasCompletedAssessment: user.hasCompletedAssessment,
        assessmentCompletedAt: user.assessmentCompletedAt,
        lastActiveDate: user.lastActiveDate,
        createdAt: user.createdAt,
        progressSummary: progressSummary[0] || null
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Server error fetching user profile'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, validateObjectId('id'), authorizeSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's progress summary
    const progressSummary = await Progress.getUserProgressSummary(user._id);
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        avatarInitials: user.avatarInitials,
        level: user.level,
        overallScore: user.overallScore,
        exercisesCompleted: user.exercisesCompleted,
        streakDays: user.streakDays,
        totalWords: user.totalWords,
        skills: user.skills,
        preferences: user.preferences,
        isVerified: user.isVerified,
        lastActiveDate: user.lastActiveDate,
        createdAt: user.createdAt,
        progressSummary: progressSummary[0] || null
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error fetching user'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, validateObjectId('id'), authorizeSelf, validateUserUpdate, async (req, res) => {
  try {
    const updateFields = {};
    const allowedFields = [
      'firstName', 'lastName', 'level', 'preferences'
    ];

    // Only include allowed fields that were provided
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        level: user.level,
        overallScore: user.overallScore,
        exercisesCompleted: user.exercisesCompleted,
        streakDays: user.streakDays,
        totalWords: user.totalWords,
        skills: user.skills,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Server error updating user'
    });
  }
});

// @desc    Get user's progress history
// @route   GET /api/users/:id/progress
// @access  Private
router.get('/:id/progress', protect, validateObjectId('id'), authorizeSelf, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const progress = await Progress.find({ 
      user: req.params.id,
      isCompleted: true 
    })
    .populate('exercise', 'title type difficulty category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Progress.countDocuments({ 
      user: req.params.id,
      isCompleted: true 
    });

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
    console.error('Get user progress error:', error);
    res.status(500).json({
      error: 'Server error fetching progress'
    });
  }
});

// @desc    Get user's recent exercises
// @route   GET /api/users/:id/recent-exercises
// @access  Private
router.get('/:id/recent-exercises', protect, validateObjectId('id'), authorizeSelf, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentExercises = await Progress.find({ 
      user: req.params.id,
      isCompleted: true 
    })
    .populate('exercise', 'title type difficulty')
    .sort({ submittedAt: -1 })
    .limit(limit)
    .select('exercise overallScore submittedAt timeSpent');

    res.json({
      success: true,
      recentExercises
    });

  } catch (error) {
    console.error('Get recent exercises error:', error);
    res.status(500).json({
      error: 'Server error fetching recent exercises'
    });
  }
});

// @desc    Get user's statistics
// @route   GET /api/users/:id/stats
// @access  Private
router.get('/:id/stats', protect, validateObjectId('id'), authorizeSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get detailed progress statistics
    const progressStats = await Progress.aggregate([
      { $match: { user: user._id, isCompleted: true } },
      {
        $group: {
          _id: null,
          totalExercises: { $sum: 1 },
          averageScore: { $avg: '$overallScore' },
          totalTimeSpent: { $sum: '$response.timeSpent' },
          totalWords: { $sum: '$response.wordCount' },
          bestScore: { $max: '$overallScore' },
          averageGrammar: { $avg: '$scores.grammar.score' },
          averageVocabulary: { $avg: '$scores.vocabulary.score' },
          averageStructure: { $avg: '$scores.structure.score' },
          averageCreativity: { $avg: '$scores.creativity.score' },
          averageClarity: { $avg: '$scores.clarity.score' }
        }
      }
    ]);

    // Get monthly progress data for charts
    const monthlyProgress = await Progress.aggregate([
      { $match: { user: user._id, isCompleted: true } },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          averageScore: { $avg: '$overallScore' },
          exerciseCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 } // Last 12 months
    ]);

    res.json({
      success: true,
      stats: {
        user: {
          overallScore: user.overallScore,
          exercisesCompleted: user.exercisesCompleted,
          streakDays: user.streakDays,
          totalWords: user.totalWords,
          skills: user.skills,
          level: user.level
        },
        progress: progressStats[0] || {},
        monthlyProgress
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Server error fetching statistics'
    });
  }
});

// @desc    Update user skills
// @route   PUT /api/users/:id/skills
// @access  Private
router.put('/:id/skills', protect, validateObjectId('id'), authorizeSelf, async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || typeof skills !== 'object') {
      return res.status(400).json({
        error: 'Invalid skills data'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update skills
    Object.keys(skills).forEach(skill => {
      if (user.skills[skill] !== undefined && 
          typeof skills[skill] === 'number' && 
          skills[skill] >= 0 && 
          skills[skill] <= 100) {
        user.skills[skill] = skills[skill];
      }
    });

    // Recalculate overall score
    user.calculateOverallScore();
    
    await user.save();

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skills: user.skills,
      overallScore: user.overallScore
    });

  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      error: 'Server error updating skills'
    });
  }
});

// @desc    Deactivate user account
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', protect, validateObjectId('id'), authorizeSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: 'Server error deactivating account'
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    const users = await User.find()
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
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
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Server error fetching users'
    });
  }
});

module.exports = router; 