const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const UserAssessment = require('../models/UserAssessment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get assessment questions
// @route   GET /api/assessment/questions
// @access  Private
router.get('/questions', protect, async (req, res) => {
  try {
    console.log('Fetching assessment questions for user:', req.user.email);
    
    // Get the latest active assessment
    let assessment = await Assessment.getLatestAssessment();
    console.log('Assessment found:', assessment ? 'Yes' : 'No');
    
    if (!assessment) {
      console.log('📝 No active assessment found. Attempting to seed data...');
      
      // Try to seed assessment data automatically
      try {
        const { seedAssessment } = require('../seeders/assessmentSeeder');
        await seedAssessment();
        assessment = await Assessment.getLatestAssessment();
        console.log('✅ Assessment data seeded successfully!');
      } catch (seedError) {
        console.error('❌ Failed to seed assessment data:', seedError);
        return res.status(404).json({
          error: 'No active assessment found and unable to create one'
        });
      }
      
      if (!assessment) {
        return res.status(404).json({
          error: 'No active assessment found'
        });
      }
    }

    // Remove correct answers and explanations from the questions for security
    const sanitizedQuestions = assessment.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      options: q.options.map(opt => ({
        text: opt.text
        // Don't include isCorrect in the response
      }))
    }));

    res.json({
      success: true,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        questions: sanitizedQuestions,
        totalQuestions: assessment.questions.length
      }
    });

  } catch (error) {
    console.error('Error getting assessment questions:', error);
    res.status(500).json({
      error: 'Server error while fetching assessment'
    });
  }
});

// @desc    Submit assessment answers
// @route   POST /api/assessment/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { assessmentId, responses, timeData } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!assessmentId || !responses || !timeData) {
      return res.status(400).json({
        error: 'Assessment ID, responses, and time data are required'
      });
    }

    // Get the assessment with full data
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found'
      });
    }

    // Process responses and calculate score
    let correctAnswers = 0;
    const processedResponses = [];

    responses.forEach(response => {
      const question = assessment.questions.find(q => q.id === response.questionId);
      if (question) {
        let isCorrect = false;
        
        if (question.type === 'multiple_choice') {
          const selectedOption = question.options.find(opt => opt.text === response.selectedAnswer);
          isCorrect = selectedOption && selectedOption.isCorrect;
        }

        if (isCorrect) {
          correctAnswers++;
        }

        processedResponses.push({
          questionId: response.questionId,
          selectedAnswer: response.selectedAnswer,
          isCorrect: isCorrect,
          timeSpent: response.timeSpent || 0
        });
      }
    });

    // Calculate results
    const totalQuestions = assessment.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const determinedLevel = assessment.calculateLevel(correctAnswers);
    const userFriendlyLevel = assessment.mapLevelToUserFormat(determinedLevel);

    // Create user assessment record
    const userAssessment = new UserAssessment({
      user: userId,
      assessment: assessmentId,
      responses: processedResponses,
      results: {
        totalQuestions,
        correctAnswers,
        totalScore: correctAnswers,
        percentage,
        determinedLevel,
        userFriendlyLevel
      },
      timeData: {
        startedAt: new Date(timeData.startedAt),
        completedAt: new Date(timeData.completedAt),
        totalTimeSpent: timeData.totalTimeSpent
      },
      status: 'completed',
      isLatest: true
    });

    // Calculate skills breakdown
    userAssessment.calculateSkillsBreakdown(assessment);

    // Save the assessment
    await userAssessment.save();

    // Update user profile with assessment completion and new level/skills
    const user = await User.findById(userId);
    if (user) {
      user.hasCompletedAssessment = true;
      user.assessmentCompletedAt = new Date();
      user.level = userFriendlyLevel;
      
      // Update user skills based on assessment results
      const skillsBreakdown = userAssessment.skillsBreakdown;
      user.skills.grammar = skillsBreakdown.grammar.percentage;
      user.skills.vocabulary = skillsBreakdown.vocabulary.percentage;
      user.skills.structure = skillsBreakdown.structure.percentage;
      user.skills.clarity = skillsBreakdown.comprehension.percentage; // Map comprehension to clarity
      
      // Calculate overall score
      user.calculateOverallScore();
      
      await user.save();
    }

    res.json({
      success: true,
      message: 'Assessment completed successfully',
      results: {
        totalQuestions,
        correctAnswers,
        percentage,
        level: determinedLevel,
        userFriendlyLevel,
        skillsBreakdown: userAssessment.skillsBreakdown
      },
      userAssessmentId: userAssessment._id
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      error: 'Server error while processing assessment submission'
    });
  }
});

// @desc    Get user's assessment history
// @route   GET /api/assessment/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const assessments = await UserAssessment.find({ user: userId })
      .populate('assessment', 'title description version')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      assessments
    });

  } catch (error) {
    console.error('Error getting assessment history:', error);
    res.status(500).json({
      error: 'Server error while fetching assessment history'
    });
  }
});

// @desc    Get user's latest assessment results
// @route   GET /api/assessment/latest
// @access  Private
router.get('/latest', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const latestAssessment = await UserAssessment.getLatestByUser(userId);
    
    if (!latestAssessment) {
      return res.status(404).json({
        error: 'No assessment found for this user'
      });
    }

    res.json({
      success: true,
      assessment: latestAssessment
    });

  } catch (error) {
    console.error('Error getting latest assessment:', error);
    res.status(500).json({
      error: 'Server error while fetching latest assessment'
    });
  }
});

// @desc    Check if user has completed assessment
// @route   GET /api/assessment/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('hasCompletedAssessment assessmentCompletedAt level');
    
    res.json({
      success: true,
      hasCompletedAssessment: user.hasCompletedAssessment,
      assessmentCompletedAt: user.assessmentCompletedAt,
      currentLevel: user.level
    });

  } catch (error) {
    console.error('Error checking assessment status:', error);
    res.status(500).json({
      error: 'Server error while checking assessment status'
    });
  }
});

module.exports = router; 