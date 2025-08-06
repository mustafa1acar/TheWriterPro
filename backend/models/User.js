const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },

  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Proficient'],
    default: 'Beginner'
  },
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Progress Tracking
  exercisesCompleted: {
    type: Number,
    default: 0
  },
  totalWords: {
    type: Number,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },

  // Skills Breakdown (0-100 for each skill)
  skills: {
    grammar: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    vocabulary: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    spelling: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    structure: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    creativity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },

  // Settings & Preferences
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    dailyGoal: {
      type: Number,
      default: 500 // words per day
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user'
  },
  
  // Assessment Status
  hasCompletedAssessment: {
    type: Boolean,
    default: false
  },
  assessmentCompletedAt: {
    type: Date,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for avatar initials
userSchema.virtual('avatarInitials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Index for better query performance
userSchema.index({ createdAt: -1 });
userSchema.index({ overallScore: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.lastActiveDate);
  
  // Get dates without time component for accurate day comparison
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  
  // Calculate difference in days
  const diffTime = todayDate.getTime() - lastActiveDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Continue streak - last active was yesterday
    this.streakDays += 1;
  } else if (diffDays > 1) {
    // Reset streak - missed days
    this.streakDays = 1;
  } else if (diffDays === 0 && this.streakDays === 0) {
    // First exercise of the day, start streak if not already started
    this.streakDays = 1;
  }
  // If diffDays === 0 and streak > 0, don't change streak (same day)
  
  this.lastActiveDate = today;
};

// Method to calculate overall score
userSchema.methods.calculateOverallScore = function() {
  const { grammar, vocabulary, spelling, structure, creativity, clarity } = this.skills;
  const total = grammar + vocabulary + spelling + structure + creativity + clarity;
  this.overallScore = Math.round(total / 6);
  return this.overallScore;
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        totalExercises: { $sum: '$exercisesCompleted' },
        totalWords: { $sum: '$totalWords' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema); 