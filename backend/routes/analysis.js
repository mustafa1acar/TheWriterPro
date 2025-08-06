const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const { initializeGemini } = require('../config/gemini');
const { generateAnalysisPrompt } = require('../config/prompts');

// Initialize Gemini AI
const genAI = initializeGemini();

/**
 * Analyze text using Gemini AI
 */
async function analyzeTextWithGemini(text, question, level, timeSpent) {
  // Check if Gemini AI is available
  if (!genAI) {
    console.log('⚠️ Gemini AI not available, using mock analysis');
    return generateMockAnalysis(text, level, timeSpent);
  }
  
  console.log('🤖 Using Gemini AI for analysis...');
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = generateAnalysisPrompt(text, question, level, timeSpent);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Clean the response to extract only JSON
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!analysisResult.overallScore || !analysisResult.scores || !analysisResult.feedback) {
      throw new Error('Incomplete analysis result from Gemini API');
    }
    
    console.log('🎉 Gemini AI analysis successful!');
    return analysisResult;
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback to mock analysis if Gemini API fails
    console.log('Falling back to mock analysis due to API error');
    return generateMockAnalysis(text, level, timeSpent);
  }
}

/**
 * Generate mock analysis data for development
 * Remove this function when integrating with real Gemini API
 */
function generateMockAnalysis(text, level, timeSpent) {
  const wordCount = text.trim().split(/\s+/).length;
  const hasComplexSentences = text.includes(',') || text.includes(';') || text.includes('because') || text.includes('although');
  const hasVariedVocabulary = new Set(text.toLowerCase().split(/\s+/)).size / wordCount > 0.7;
  
  // Calculate base scores based on text analysis
  let grammarScore = 70;
  let vocabularyScore = 65;
  let coherenceScore = 75;
  let taskResponseScore = 70;
  
  // Adjust scores based on level and text quality
  if (hasComplexSentences) grammarScore += 10;
  if (hasVariedVocabulary) vocabularyScore += 15;
  if (wordCount > 150) taskResponseScore += 10;
  if (wordCount > 250) taskResponseScore += 5;
  
  // Level adjustments
  const levelMultipliers = {
    'Beginner (A1-A2)': 0.8,
    'Intermediate (B1)': 0.9,
    'Upper-Intermediate (B2)': 1.0,
    'Advanced (C1-C2)': 1.1
  };
  
  const multiplier = levelMultipliers[level] || 0.9;
  grammarScore = Math.min(100, Math.round(grammarScore * multiplier));
  vocabularyScore = Math.min(100, Math.round(vocabularyScore * multiplier));
  coherenceScore = Math.min(100, Math.round(coherenceScore * multiplier));
  taskResponseScore = Math.min(100, Math.round(taskResponseScore * multiplier));
  
  const overallScore = Math.round((grammarScore + vocabularyScore + coherenceScore + taskResponseScore) / 4);
  
  // Generate sample errors and suggestions
  const grammarErrors = [
    {
      type: "Subject-Verb Agreement",
      original: "The people was walking",
      corrected: "The people were walking",
      explanation: "Plural subject 'people' requires plural verb 'were'"
    },
    {
      type: "Article Usage",
      original: "I went to school yesterday",
      corrected: "I went to the school yesterday",
      explanation: "Use definite article 'the' when referring to a specific school"
    }
  ].slice(0, Math.floor(Math.random() * 2) + 1);

  const vocabularySuggestions = [
    {
      word: "good",
      alternatives: ["excellent", "outstanding", "remarkable"],
      context: "Consider using more sophisticated vocabulary"
    },
    {
      word: "very",
      alternatives: ["extremely", "exceptionally", "tremendously"],
      context: "Avoid overusing basic intensifiers"
    }
  ].slice(0, Math.floor(Math.random() * 2) + 1);

  return {
    overallScore,
    scores: {
      ielts: Math.round((overallScore / 100 * 9) * 10) / 10,
      toefl: Math.round(overallScore / 100 * 120),
      pte: Math.round(overallScore / 100 * 90),
      custom: overallScore
    },
    feedback: {
      grammar: {
        score: grammarScore,
        errors: grammarErrors,
        strengths: hasComplexSentences ? 
          ["Good use of complex sentences", "Varied sentence structure"] : 
          ["Clear simple sentences", "Basic structure maintained"]
      },
      vocabulary: {
        score: vocabularyScore,
        suggestions: vocabularySuggestions,
        strengths: hasVariedVocabulary ? 
          ["Good vocabulary range", "Appropriate word choice"] : 
          ["Basic vocabulary used correctly", "Clear expression"]
      },
      coherence: {
        score: coherenceScore,
        feedback: wordCount > 200 ? 
          "Good organization and flow. Consider using more linking words for better coherence." :
          "Basic organization present. Try to expand ideas and use more connecting words.",
        strengths: ["Clear paragraph structure", "Logical flow"],
        improvements: ["Add more transitional phrases", "Strengthen connections between ideas"]
      },
      taskResponse: {
        score: taskResponseScore,
        feedback: wordCount > 200 ? 
          "Good response to the question with relevant content." :
          "Addresses the question but could be more detailed and comprehensive.",
        strengths: ["Relevant content", "Stays on topic"],
        improvements: wordCount < 150 ? 
          ["Provide more detailed examples", "Expand on main points"] :
          ["Add more specific examples", "Strengthen conclusion"]
      }
    },
    recommendations: [
      "Practice using more varied vocabulary",
      "Focus on complex sentence structures",
      "Use linking words to improve coherence",
      "Provide specific examples to support your points",
      "Expand your writing to meet length requirements"
    ].slice(0, 4)
  };
}

// @route   POST /api/analysis/analyze
// @desc    Analyze user's writing text using Gemini AI
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const { text, question, level, timeSpent } = req.body;

    // Validation
    if (!text || !question || !level) {
      return res.status(400).json({ 
        error: 'Text, question, and level are required' 
      });
    }

    if (text.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Text is too short for analysis. Please write at least 10 characters.' 
      });
    }

    // Get user ID from authenticated request
    const userId = req.user._id;

    // Analyze text with Gemini (or mock function)
    console.log('🔍 Starting analysis for:', { textLength: text.length, question, level, timeSpent });
    const analysisResult = await analyzeTextWithGemini(text, question, level, timeSpent || 0);
    console.log('✅ Analysis completed with score:', analysisResult.overallScore);
    console.log('📊 Analysis scores:', analysisResult.scores);

    // Calculate word count
    const wordCount = text.trim().split(/\s+/).length;

    // Save the analysis to database
    const analysis = new Analysis({
      userId,
      text,
      question,
      level,
      timeSpent: timeSpent || 0,
      wordCount,
      result: analysisResult
    });
    
    await analysis.save();

    // Update user metrics
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      console.log('📊 Updating user metrics...');
      console.log('Before update - Exercises:', user.exercisesCompleted, 'Words:', user.totalWords, 'Streak:', user.streakDays);
      
      // Update exercises completed
      user.exercisesCompleted += 1;
      
      // Update total words written
      user.totalWords += wordCount;
      
      // Update streak
      user.updateStreak();
      
      // Update skills based on analysis results
      if (analysisResult.feedback) {
        const { grammar, vocabulary, coherence, taskResponse } = analysisResult.feedback;
        
        // Update user skills with weighted average
        if (grammar && grammar.score) {
          user.skills.grammar = Math.round((user.skills.grammar * 0.8) + (grammar.score * 0.2));
        }
        if (vocabulary && vocabulary.score) {
          user.skills.vocabulary = Math.round((user.skills.vocabulary * 0.8) + (vocabulary.score * 0.2));
        }
        if (coherence && coherence.score) {
          user.skills.structure = Math.round((user.skills.structure * 0.8) + (coherence.score * 0.2));
        }
        if (taskResponse && taskResponse.score) {
          user.skills.clarity = Math.round((user.skills.clarity * 0.8) + (taskResponse.score * 0.2));
        }
        
        // Recalculate overall score
        user.calculateOverallScore();
      }
      
      await user.save();
      console.log('✅ After update - Exercises:', user.exercisesCompleted, 'Words:', user.totalWords, 'Streak:', user.streakDays);
      console.log('📊 User skills:', user.skills);
      console.log('📊 User overall score:', user.overallScore);
    } else {
      console.log('❌ User not found for ID:', userId);
    }

    res.json(analysisResult);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Server error during text analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analysis/history
// @desc    Get user's analysis history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    console.log('🔍 User object:', req.user);
    console.log('🔍 User _id:', req.user._id);
    console.log('🔍 User id:', req.user.id);
    
    const { page = 1, limit = 10, level } = req.query;
    const skip = (page - 1) * limit;

    // Build query - try both _id and id
    const userId = req.user._id || req.user.id;
    const query = { userId: userId };
    if (level) {
      query.level = level;
    }

    // Get analyses with pagination (including text for display in results page)
    console.log('🔍 Query for analyses:', query);
    const analyses = await Analysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() to avoid virtual field issues
    
    console.log('🔍 Found analyses:', analyses.length);

    // Get total count for pagination
    const total = await Analysis.countDocuments(query);

    // Get summary statistics (level-specific if level is selected)
    const statsMatch = { userId: userId };
    if (level) {
      statsMatch.level = level;
    }
    
    console.log('🔍 Level filter:', level);
    console.log('🔍 Stats match query:', statsMatch);
    
    const stats = await Analysis.aggregate([
      { $match: statsMatch },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          averageScore: { $avg: '$result.overallScore' },
          averageIelts: { $avg: '$result.scores.ielts' },
          averageToefl: { $avg: '$result.scores.toefl' },
          averagePte: { $avg: '$result.scores.pte' },
          bestScore: { $max: '$result.overallScore' },
          totalWords: { $sum: '$wordCount' },
          totalTime: { $sum: '$timeSpent' },
          // Skills averages
          avgGrammar: { $avg: '$result.feedback.grammar.score' },
          avgVocabulary: { $avg: '$result.feedback.vocabulary.score' },
          avgCoherence: { $avg: '$result.feedback.coherence.score' },
          avgTaskResponse: { $avg: '$result.feedback.taskResponse.score' }
        }
      }
    ]);

    console.log('📈 Analysis stats:', stats[0]);

    // Debug: Let's also check what analyses exist
    const debugMatch = { userId: userId };
    if (level) {
      debugMatch.level = level;
    }
    const allAnalyses = await Analysis.find(debugMatch).select('result.overallScore result.scores wordCount timeSpent level').lean();
    console.log(`🔍 Analyses for user at level ${level || 'ALL'}:`, allAnalyses.length);
    if (allAnalyses.length > 0) {
      console.log('🔍 Sample analysis:', allAnalyses[0]);
    }

    // Get level distribution
    const levelStats = await Analysis.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          averageScore: { $avg: '$result.overallScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      analyses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAnalyses: total,
        hasNextPage: skip + analyses.length < total,
        hasPrevPage: page > 1
      },
      stats: stats[0] || {
        totalAnalyses: 0,
        averageScore: 0,
        bestScore: 0,
        totalWords: 0,
        totalTime: 0
      },
      levelStats
    });

  } catch (error) {
    console.error('Error fetching analysis history:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analysis/:id
// @desc    Get a specific analysis by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/analysis/:id
// @desc    Delete a specific analysis
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 