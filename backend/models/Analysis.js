const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner (A1-A2)', 'Intermediate (B1)', 'Upper-Intermediate (B2)', 'Advanced (C1-C2)']
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
    min: 0
  },
  wordCount: {
    type: Number,
    required: true,
    min: 0
  },
  result: {
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scores: {
      ielts: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      },
      toefl: {
        type: Number,
        required: true,
        min: 0,
        max: 120
      },
      pte: {
        type: Number,
        required: true,
        min: 0,
        max: 90
      },
      custom: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    },
    feedback: {
      grammar: {
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        errors: [{
          type: {
            type: String,
            required: true
          },
          original: {
            type: String,
            required: true
          },
          corrected: {
            type: String,
            required: true
          },
          explanation: {
            type: String,
            required: true
          }
        }],
        strengths: [{
          type: String,
          required: true
        }]
      },
      vocabulary: {
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        suggestions: [{
          word: {
            type: String,
            required: true
          },
          alternatives: [{
            type: String,
            required: true
          }],
          context: {
            type: String,
            required: true
          }
        }],
        strengths: [{
          type: String,
          required: true
        }]
      },
      coherence: {
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        feedback: {
          type: String,
          required: true
        },
        strengths: [{
          type: String,
          required: true
        }],
        improvements: [{
          type: String,
          required: true
        }]
      },
      taskResponse: {
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        feedback: {
          type: String,
          required: true
        },
        strengths: [{
          type: String,
          required: true
        }],
        improvements: [{
          type: String,
          required: true
        }]
      }
    },
    recommendations: [{
      type: String,
      required: true
    }]
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

// Index for efficient queries
AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ userId: 1, level: 1 });
AnalysisSchema.index({ 'result.overallScore': -1 });

// Virtual for formatted date
AnalysisSchema.virtual('formattedDate').get(function() {
  if (!this.createdAt) {
    return 'Unknown date';
  }
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for time spent in minutes
AnalysisSchema.virtual('timeSpentMinutes').get(function() {
  if (!this.timeSpent) {
    return 0;
  }
  return Math.round(this.timeSpent / 60);
});

// Temporarily disable virtuals to avoid serialization issues
// AnalysisSchema.set('toJSON', { virtuals: true });
// AnalysisSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Analysis', AnalysisSchema); 