const mongoose = require('mongoose');

const userAssessmentSchema = new mongoose.Schema({
  // References
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },

  // Assessment attempt data
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    selectedAnswer: String,
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],

  // Results
  results: {
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    totalScore: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    determinedLevel: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true
    },
    userFriendlyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Upper-Intermediate', 'Advanced'],
      required: true
    }
  },

  // Skills breakdown from assessment
  skillsBreakdown: {
    grammar: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    vocabulary: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    structure: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    comprehension: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  },

  // Timing data
  timeData: {
    startedAt: {
      type: Date,
      required: true
    },
    completedAt: {
      type: Date,
      required: true
    },
    totalTimeSpent: {
      type: Number, // in seconds
      required: true
    }
  },

  // Status
  status: {
    type: String,
    enum: ['completed', 'incomplete'],
    default: 'completed'
  },
  isLatest: {
    type: Boolean,
    default: true
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userAssessmentSchema.index({ user: 1, createdAt: -1 });
userAssessmentSchema.index({ user: 1, isLatest: 1 });

// Pre-save middleware to ensure only one latest assessment per user
userAssessmentSchema.pre('save', async function(next) {
  if (this.isNew && this.isLatest) {
    // Set all previous assessments for this user as not latest
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isLatest: false }
    );
  }
  next();
});

// Method to calculate skills breakdown
userAssessmentSchema.methods.calculateSkillsBreakdown = function(assessment) {
  const breakdown = {
    grammar: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    structure: { correct: 0, total: 0 },
    comprehension: { correct: 0, total: 0 }
  };

  // Count correct/total for each skill category
  this.responses.forEach(response => {
    const question = assessment.questions.find(q => q.id === response.questionId);
    if (question && breakdown[question.category]) {
      breakdown[question.category].total++;
      if (response.isCorrect) {
        breakdown[question.category].correct++;
      }
    }
  });

  // Calculate percentages
  Object.keys(breakdown).forEach(skill => {
    const data = breakdown[skill];
    data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  });

  this.skillsBreakdown = breakdown;
  return breakdown;
};

// Static method to get user's latest assessment
userAssessmentSchema.statics.getLatestByUser = function(userId) {
  return this.findOne({ user: userId, isLatest: true })
    .populate('assessment')
    .populate('user', 'firstName lastName email');
};

module.exports = mongoose.model('UserAssessment', userAssessmentSchema); 