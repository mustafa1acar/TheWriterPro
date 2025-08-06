const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  // References
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },

  // Attempt Information
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'submitted', 'graded', 'timeout'],
    default: 'in_progress'
  },

  // User Response
  response: {
    content: {
      type: String,
      required: [true, 'Response content is required'],
      maxlength: [10000, 'Response cannot exceed 10000 characters']
    },
    wordCount: {
      type: Number,
      required: true
    },
    timeSpent: {
      type: Number, // in minutes
      required: true
    }
  },

  // Scoring & Feedback
  scores: {
    grammar: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      suggestions: [String]
    },
    vocabulary: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      suggestions: [String]
    },
    structure: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      suggestions: [String]
    },
    creativity: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      suggestions: [String]
    },
    clarity: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      suggestions: [String]
    },
    spelling: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      mistakes: [{
        word: String,
        suggestion: String,
        position: Number
      }]
    }
  },

  // Overall Assessment
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
  },
  
  // Detailed Analysis
  analysis: {
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
    nextSteps: [String]
  },

  // Instructor/AI Feedback
  feedback: {
    general: String,
    positive: [String],
    improvements: [String],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isAIGenerated: {
      type: Boolean,
      default: true
    }
  },

  // Progress Tracking
  improvements: {
    grammarImprovement: Number,
    vocabularyImprovement: Number,
    structureImprovement: Number,
    creativityImprovement: Number,
    clarityImprovement: Number,
    overallImprovement: Number
  },

  // Metadata
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  gradedAt: {
    type: Date
  },
  
  // Flags
  isCompleted: {
    type: Boolean,
    default: false
  },
  isGraded: {
    type: Boolean,
    default: false
  },
  needsReview: {
    type: Boolean,
    default: false
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

// Virtual for completion time
progressSchema.virtual('completionTime').get(function() {
  if (this.submittedAt && this.startedAt) {
    const diff = this.submittedAt - this.startedAt;
    return Math.round(diff / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for grade points
progressSchema.virtual('gradePoints').get(function() {
  const gradeMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeMap[this.grade] || 0.0;
});

// Compound indexes for better query performance
progressSchema.index({ user: 1, exercise: 1, attemptNumber: 1 }, { unique: true });
progressSchema.index({ user: 1, createdAt: -1 });
progressSchema.index({ exercise: 1, isCompleted: 1 });
progressSchema.index({ overallScore: -1 });
progressSchema.index({ isGraded: 1, needsReview: 1 });

// Pre-save middleware to update timestamps
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-mark as completed if submitted
  if (this.submittedAt && !this.isCompleted) {
    this.isCompleted = true;
  }
  
  // Auto-mark as graded if overall score exists
  if (this.overallScore !== undefined && !this.isGraded) {
    this.isGraded = true;
    this.gradedAt = Date.now();
  }
  
  next();
});

// Method to calculate overall score from individual scores
progressSchema.methods.calculateOverallScore = function(exerciseWeights) {
  const scores = this.scores;
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  // Use exercise weights if provided, otherwise equal weights
  const weights = exerciseWeights || {
    grammar: 20,
    vocabulary: 20,
    structure: 20,
    creativity: 20,
    clarity: 20
  };
  
  Object.keys(weights).forEach(criterion => {
    if (scores[criterion] && scores[criterion].score !== undefined) {
      totalWeightedScore += scores[criterion].score * weights[criterion];
      totalWeight += weights[criterion];
    }
  });
  
  if (totalWeight === 0) return 0;
  
  this.overallScore = Math.round(totalWeightedScore / totalWeight);
  return this.overallScore;
};

// Method to determine grade based on score
progressSchema.methods.calculateGrade = function() {
  const score = this.overallScore;
  
  if (score >= 97) this.grade = 'A+';
  else if (score >= 93) this.grade = 'A';
  else if (score >= 90) this.grade = 'A-';
  else if (score >= 87) this.grade = 'B+';
  else if (score >= 83) this.grade = 'B';
  else if (score >= 80) this.grade = 'B-';
  else if (score >= 77) this.grade = 'C+';
  else if (score >= 73) this.grade = 'C';
  else if (score >= 70) this.grade = 'C-';
  else if (score >= 67) this.grade = 'D+';
  else if (score >= 60) this.grade = 'D';
  else this.grade = 'F';
  
  return this.grade;
};

// Method to calculate improvement from previous attempts
progressSchema.methods.calculateImprovement = async function() {
  const previousAttempt = await this.constructor.findOne({
    user: this.user,
    exercise: this.exercise,
    attemptNumber: this.attemptNumber - 1,
    isCompleted: true
  });
  
  if (!previousAttempt) return;
  
  this.improvements = {
    grammarImprovement: this.scores.grammar?.score - (previousAttempt.scores.grammar?.score || 0),
    vocabularyImprovement: this.scores.vocabulary?.score - (previousAttempt.scores.vocabulary?.score || 0),
    structureImprovement: this.scores.structure?.score - (previousAttempt.scores.structure?.score || 0),
    creativityImprovement: this.scores.creativity?.score - (previousAttempt.scores.creativity?.score || 0),
    clarityImprovement: this.scores.clarity?.score - (previousAttempt.scores.clarity?.score || 0),
    overallImprovement: this.overallScore - (previousAttempt.overallScore || 0)
  };
};

// Static method to get user's progress summary
progressSchema.statics.getUserProgressSummary = async function(userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isCompleted: true } },
    {
      $group: {
        _id: null,
        totalExercises: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        totalTimeSpent: { $sum: '$response.timeSpent' },
        totalWords: { $sum: '$response.wordCount' },
        bestScore: { $max: '$overallScore' },
        recentScores: { $push: '$overallScore' }
      }
    }
  ]);
};

// Static method to get exercise statistics
progressSchema.statics.getExerciseStats = async function(exerciseId) {
  return await this.aggregate([
    { $match: { exercise: new mongoose.Types.ObjectId(exerciseId), isCompleted: true } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        completionRate: { $avg: { $cond: ['$isCompleted', 1, 0] } },
        averageTimeSpent: { $avg: '$response.timeSpent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema); 