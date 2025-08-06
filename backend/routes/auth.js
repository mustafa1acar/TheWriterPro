const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validatePasswordChange 
} = require('../middleware/validation');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  console.log('Registration request body:', req.body);
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Create user
    console.log('Creating user with data:', { firstName, lastName, email });
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });
    console.log('User created successfully:', user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      level: user.level,
      overallScore: user.overallScore,
      exercisesCompleted: user.exercisesCompleted,
      streakDays: user.streakDays,
      totalWords: user.totalWords,
      skills: user.skills,
      preferences: user.preferences,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account has been deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update streak and last active date
    user.updateStreak();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      level: user.level,
      overallScore: user.overallScore,
      exercisesCompleted: user.exercisesCompleted,
      streakDays: user.streakDays,
      totalWords: user.totalWords,
      skills: user.skills,
      preferences: user.preferences,
      isVerified: user.isVerified,
      role: user.role,
      lastActiveDate: user.lastActiveDate
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        level: user.level,
        overallScore: user.overallScore,
        exercisesCompleted: user.exercisesCompleted,
        streakDays: user.streakDays,
        totalWords: user.totalWords,
        skills: user.skills,
        preferences: user.preferences,
        isVerified: user.isVerified,
        role: user.role,
        lastActiveDate: user.lastActiveDate,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error fetching user data'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error changing password'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    // The client should remove the token from storage
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Server error during logout'
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Server error refreshing token'
    });
  }
});

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    res.json({
      success: true,
      exists: !!user
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      error: 'Server error checking email'
    });
  }
});

// @desc    Debug: Get all users (remove in production)
// @route   GET /api/auth/debug/users
// @access  Public
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('firstName lastName email createdAt');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({
      error: 'Server error fetching users'
    });
  }
});

module.exports = router; 