const mongoose = require('mongoose');

const completedQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner (A1-A2)', 'Intermediate (B1)', 'Upper-Intermediate (B2)', 'Advanced (C1-C2)']
  },
  questionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  // Store the analysis result for reference
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only complete each question once per level
completedQuestionSchema.index({ userId: 1, level: 1, questionIndex: 1 }, { unique: true });

// Static method to get completed questions for a user and level
completedQuestionSchema.statics.getCompletedQuestions = async function(userId, level) {
  const completed = await this.find({ userId, level })
    .sort({ questionIndex: 1 })
    .select('questionIndex completedAt analysisId');
  
  return completed.map(item => item.questionIndex);
};

// Static method to check if a question is completed
completedQuestionSchema.statics.isQuestionCompleted = async function(userId, level, questionIndex) {
  const completed = await this.findOne({ userId, level, questionIndex });
  return !!completed;
};

// Static method to mark a question as completed
completedQuestionSchema.statics.markAsCompleted = async function(userId, level, questionIndex, analysisId) {
  try {
    const completed = new this({
      userId,
      level,
      questionIndex,
      analysisId
    });
    await completed.save();
    return true;
  } catch (error) {
    if (error.code === 11000) {
      // Question already completed
      return false;
    }
    throw error;
  }
};

module.exports = mongoose.model('CompletedQuestion', completedQuestionSchema); 