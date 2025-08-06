const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  // Assessment Configuration
  title: {
    type: String,
    required: true,
    default: 'English Level Assessment'
  },
  description: {
    type: String,
    default: 'Comprehensive assessment to determine your English proficiency level'
  },
  
  // Questions with answers and scoring
  questions: [{
    id: {
      type: Number,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'fill_blank', 'grammar_correction'],
      required: true
    },
    category: {
      type: String,
      enum: ['grammar', 'vocabulary', 'structure', 'comprehension'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    explanation: String,
    points: {
      type: Number,
      default: 1
    }
  }],

  // Scoring configuration
  scoring: {
    totalPoints: {
      type: Number,
      default: 15
    },
    levelThresholds: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        A1: { min: 0, max: 3 },
        A2: { min: 4, max: 6 },
        B1: { min: 7, max: 9 },
        B2: { min: 10, max: 12 },
        C1: { min: 13, max: 14 },
        C2: { min: 15, max: 15 }
      }
    }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to get assessment by version
assessmentSchema.statics.getLatestAssessment = function() {
  return this.findOne({ isActive: true }).sort({ createdAt: -1 });
};

// Method to calculate level from score
assessmentSchema.methods.calculateLevel = function(score) {
  const thresholds = this.scoring.levelThresholds;
  
  if (score >= thresholds.C2.min) return 'C2';
  if (score >= thresholds.C1.min) return 'C1';
  if (score >= thresholds.B2.min) return 'B2';
  if (score >= thresholds.B1.min) return 'B1';
  if (score >= thresholds.A2.min) return 'A2';
  return 'A1';
};

// Method to map level to user-friendly format
assessmentSchema.methods.mapLevelToUserFormat = function(level) {
  const levelMap = {
    'A1': 'Beginner',
    'A2': 'Beginner',
    'B1': 'Intermediate',
    'B2': 'Upper-Intermediate',
    'C1': 'Advanced',
    'C2': 'Advanced'
  };
  return levelMap[level] || 'Beginner';
};

module.exports = mongoose.model('Assessment', assessmentSchema); 