const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate Gemini API key
function validateGeminiConfig() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    console.warn('   Analysis will fall back to mock data');
    console.warn('   To enable real AI analysis, set GEMINI_API_KEY in your .env file');
    return false;
  }
  
  if (process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  Please replace the placeholder GEMINI_API_KEY with your actual API key');
    return false;
  }
  
  return true;
}

// Initialize Gemini AI
function initializeGemini() {
  const isValid = validateGeminiConfig();
  
  if (!isValid) {
    return null;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
    return genAI;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return null;
  }
}

module.exports = {
  validateGeminiConfig,
  initializeGemini,
  GoogleGenerativeAI
}; 