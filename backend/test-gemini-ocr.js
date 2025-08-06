const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Test Gemini OCR functionality
async function testGeminiOCR() {
  try {
    console.log('🧪 Testing Gemini OCR functionality...');
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      console.log('Please set GEMINI_API_KEY in your .env file');
      return;
    }
    
    console.log('✅ GEMINI_API_KEY found');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test different models
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
    
    for (const modelName of models) {
      try {
        console.log(`\n🔍 Testing model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Test with a simple text prompt first
        const textResult = await model.generateContent('Hello, this is a test.');
        const textResponse = await textResult.response;
        
        console.log(`✅ ${modelName} text generation works: "${textResponse.text().substring(0, 50)}..."`);
        
        // Test with a simple image (base64 encoded small test image)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 pixel PNG
        
        const imagePart = {
          inlineData: {
            data: testImageBase64,
            mimeType: 'image/png'
          }
        };
        
        const imageResult = await model.generateContent(['What do you see in this image?', imagePart]);
        const imageResponse = await imageResult.response;
        
        console.log(`✅ ${modelName} image processing works: "${imageResponse.text().substring(0, 100)}..."`);
        
        console.log(`🎉 ${modelName} is working correctly!`);
        
      } catch (error) {
        console.error(`❌ ${modelName} failed:`, error.message);
      }
    }
    
    console.log('\n📝 Test Summary:');
    console.log('- Check the output above to see which models work');
    console.log('- Use a working model in your OCR route');
    console.log('- Make sure your API key has access to the model you choose');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGeminiOCR(); 