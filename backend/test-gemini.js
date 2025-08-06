/**
 * Test script for Gemini AI integration
 * Run with: node test-gemini.js
 */

require('dotenv').config();
const { initializeGemini } = require('./config/gemini');
const { generateAnalysisPrompt } = require('./config/prompts');

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini AI Integration...\n');

  // Test 1: Check API key configuration
  console.log('1. Checking API key configuration...');
  const genAI = initializeGemini();
  
  if (!genAI) {
    console.log('❌ Gemini AI not available - check your API key');
    console.log('   The system will use mock analysis in production\n');
    return;
  }

  console.log('✅ Gemini AI initialized successfully\n');

  // Test 2: Test prompt generation
  console.log('2. Testing prompt generation...');
  const sampleText = "I think technology is very good for education. Students can learn more things with computers and internet. It make learning easier and more fun.";
  const sampleQuestion = "What are the benefits of technology in education?";
  const sampleLevel = "Intermediate (B1)";
  const sampleTimeSpent = 180; // 3 minutes

  const prompt = generateAnalysisPrompt(sampleText, sampleQuestion, sampleLevel, sampleTimeSpent);
  console.log('✅ Prompt generated successfully');
  console.log(`   Text length: ${sampleText.length} characters`);
  console.log(`   Prompt length: ${prompt.length} characters\n`);

  // Test 3: Test API call (if API key is available)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log('3. Testing API call...');
    try {
             const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Use a shorter prompt for testing
      const testPrompt = `
You are an expert English teacher. Analyze this text and return ONLY valid JSON:

Text: "${sampleText}"

Return this exact JSON format:
{
  "overallScore": 70,
  "scores": {
    "ielts": 5.5,
    "toefl": 70,
    "pte": 50,
    "custom": 70
  },
  "feedback": {
    "grammar": {
      "score": 65,
      "errors": [{"type": "test", "original": "test", "corrected": "test", "explanation": "test"}],
      "strengths": ["test"]
    },
    "vocabulary": {
      "score": 70,
      "suggestions": [{"word": "test", "alternatives": ["test"], "context": "test"}],
      "strengths": ["test"]
    },
    "coherence": {
      "score": 75,
      "feedback": "test",
      "strengths": ["test"],
      "improvements": ["test"]
    },
    "taskResponse": {
      "score": 70,
      "feedback": "test",
      "strengths": ["test"],
      "improvements": ["test"]
    }
  },
  "recommendations": ["test"]
}`;

      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const textResponse = response.text();
      
      console.log('✅ API call successful');
      console.log(`   Response length: ${textResponse.length} characters`);
      
      // Try to parse JSON
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parsing successful');
          console.log(`   Overall score: ${parsed.overallScore}`);
        } catch (parseError) {
          console.log('⚠️  JSON parsing failed:', parseError.message);
        }
      } else {
        console.log('⚠️  No JSON found in response');
      }
      
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }
  } else {
    console.log('3. Skipping API call test - no valid API key found');
  }

  console.log('\n🎉 Gemini AI integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Get your API key from https://makersuite.google.com/app/apikey');
  console.log('2. Add it to your .env file: GEMINI_API_KEY=your_actual_key');
  console.log('3. Restart the server and test with real writing analysis');
}

// Run the test
testGeminiIntegration().catch(console.error); 