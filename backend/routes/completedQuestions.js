const express = require('express');
const router = express.Router();
const CompletedQuestion = require('../models/CompletedQuestion');
const { protect } = require('../middleware/auth');

// Get completed questions for a specific level
router.get('/:level', protect, async (req, res) => {
  try {
    const { level } = req.params;
    const userId = req.user.id;

    // Validate level
    const validLevels = ['Beginner (A1-A2)', 'Intermediate (B1)', 'Upper-Intermediate (B2)', 'Advanced (C1-C2)'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ message: 'Invalid level' });
    }

    const completedQuestions = await CompletedQuestion.getCompletedQuestions(userId, level);
    
    res.json({
      success: true,
      completedQuestions,
      level
    });
  } catch (error) {
    console.error('Error fetching completed questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a question as completed
router.post('/:level/:questionIndex', protect, async (req, res) => {
  try {
    const { level, questionIndex } = req.params;
    const { analysisId } = req.body;
    const userId = req.user.id;

    // Validate level
    const validLevels = ['Beginner (A1-A2)', 'Intermediate (B1)', 'Upper-Intermediate (B2)', 'Advanced (C1-C2)'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ message: 'Invalid level' });
    }

    // Validate question index
    const questionIndexNum = parseInt(questionIndex);
    if (isNaN(questionIndexNum) || questionIndexNum < 0) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    // Validate analysis ID
    if (!analysisId) {
      return res.status(400).json({ message: 'Analysis ID is required' });
    }

    const success = await CompletedQuestion.markAsCompleted(userId, level, questionIndexNum, analysisId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Question marked as completed'
      });
    } else {
      res.status(409).json({
        success: false,
        message: 'Question already completed'
      });
    }
  } catch (error) {
    console.error('Error marking question as completed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if a specific question is completed
router.get('/:level/:questionIndex/status', protect, async (req, res) => {
  try {
    const { level, questionIndex } = req.params;
    const userId = req.user.id;

    // Validate level
    const validLevels = ['Beginner (A1-A2)', 'Intermediate (B1)', 'Upper-Intermediate (B2)', 'Advanced (C1-C2)'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ message: 'Invalid level' });
    }

    // Validate question index
    const questionIndexNum = parseInt(questionIndex);
    if (isNaN(questionIndexNum) || questionIndexNum < 0) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    const isCompleted = await CompletedQuestion.isQuestionCompleted(userId, level, questionIndexNum);
    
    res.json({
      success: true,
      isCompleted,
      level,
      questionIndex: questionIndexNum
    });
  } catch (error) {
    console.error('Error checking question status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 