const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Exercise title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Exercise description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  instructions: {
    type: String,
    required: [true, 'Exercise instructions are required'],
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },

  // Exercise Configuration
  type: {
    type: String,
    required: true,
    enum: [
      'essay', 
      'story', 
      'letter', 
      'report', 
      'description', 
      'dialogue', 
      'argumentative',
      'creative',
      'summary',
      'grammar',
      'vocabulary'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'writing',
      'grammar',
      'vocabulary',
      'comprehension',
      'creative',
      'business',
      'academic'
    ]
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'],
    default: 'intermediate'
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },

  // Exercise Content
  prompt: {
    type: String,
    required: [true, 'Exercise prompt is required'],
    maxlength: [2000, 'Prompt cannot exceed 2000 characters']
  },
  sampleResponse: {
    type: String,
    maxlength: [5000, 'Sample response cannot exceed 5000 characters']
  },
  keywords: [{
    type: String,
    trim: true
  }],

  // Requirements & Constraints
  requirements: {
    minWords: {
      type: Number,
      default: 100
    },
    maxWords: {
      type: Number,
      default: 500
    },
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    allowedAttempts: {
      type: Number,
      default: 3
    }
  },

  // Assessment Criteria
  gradingCriteria: {
    grammar: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      description: String
    },
    vocabulary: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      description: String
    },
    structure: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      description: String
    },
    creativity: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      description: String
    },
    clarity: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      description: String
    }
  },

  // Exercise Status & Management
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Analytics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Media attachments (optional)
  attachments: [{
    fileName: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],

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

// Virtual for exercise duration in friendly format
exerciseSchema.virtual('durationFormatted').get(function() {
  const minutes = this.requirements.timeLimit;
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
});

// Virtual for word count range
exerciseSchema.virtual('wordCountRange').get(function() {
  return `${this.requirements.minWords}-${this.requirements.maxWords} words`;
});

// Indexes for better query performance
exerciseSchema.index({ type: 1, difficulty: 1 });
exerciseSchema.index({ category: 1, isActive: 1 });
exerciseSchema.index({ tags: 1 });
exerciseSchema.index({ createdAt: -1 });
exerciseSchema.index({ averageScore: -1 });

// Pre-save middleware to update timestamps
exerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate difficulty score
exerciseSchema.methods.getDifficultyScore = function() {
  const difficultyMap = {
    'beginner': 1,
    'elementary': 2,
    'intermediate': 3,
    'upper-intermediate': 4,
    'advanced': 5
  };
  return difficultyMap[this.difficulty] || 3;
};

// Method to check if user can attempt exercise
exerciseSchema.methods.canUserAttempt = function(userAttempts = 0) {
  return userAttempts < this.requirements.allowedAttempts;
};

// Static method to get exercises by difficulty
exerciseSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ 
    difficulty, 
    isActive: true 
  }).populate('createdBy', 'firstName lastName');
};

// Static method to get popular exercises
exerciseSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalAttempts: -1, averageScore: -1 })
    .limit(limit)
    .populate('createdBy', 'firstName lastName');
};

// Static method to search exercises
exerciseSchema.statics.searchExercises = function(query, filters = {}) {
  const searchCriteria = {
    isActive: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.type) searchCriteria.type = filters.type;
  if (filters.category) searchCriteria.category = filters.category;
  if (filters.difficulty) searchCriteria.difficulty = filters.difficulty;
  if (filters.level) searchCriteria.level = filters.level;

  return this.find(searchCriteria)
    .sort({ averageScore: -1, totalAttempts: -1 })
    .populate('createdBy', 'firstName lastName');
};

module.exports = mongoose.model('Exercise', exerciseSchema); 