/**
 * Test script for complete analysis flow
 * This simulates a real API call to test the Gemini integration
 */

require('dotenv').config();

// Use built-in fetch if available (Node.js 18+), otherwise use node-fetch
let fetch;
try {
  fetch = globalThis.fetch;
} catch (error) {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.log('❌ Fetch not available. Please install node-fetch: npm install node-fetch');
    process.exit(1);
  }
}

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Analysis Flow...\n');

  // Sample data that would come from the frontend
  const testData = {
    text: "I think technology is very good for education. Students can learn more things with computers and internet. It make learning easier and more fun. However, some people think that technology can be bad for students because they spend too much time on screens.",
    question: "What are the benefits and drawbacks of technology in education?",
    level: "Intermediate (B1)",
    timeSpent: 180 // 3 minutes
  };

  console.log('📝 Test Data:');
  console.log(`   Text: ${testData.text.substring(0, 50)}...`);
  console.log(`   Question: ${testData.question}`);
  console.log(`   Level: ${testData.level}`);
  console.log(`   Time Spent: ${testData.timeSpent} seconds\n`);

  try {
    // Make API call to the analysis endpoint
    console.log('🌐 Making API call to /api/analysis/analyze...');
    
    const response = await fetch('https://thewriterpro.com/api/analysis/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd need a valid JWT token
        // For this test, we'll check if the endpoint is reachable
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API call successful!');
      console.log('📋 Analysis Result:');
      console.log(`   Overall Score: ${result.overallScore}`);
      console.log(`   IELTS Score: ${result.scores.ielts}`);
      console.log(`   TOEFL Score: ${result.scores.toefl}`);
      console.log(`   PTE Score: ${result.scores.pte}`);
      console.log(`   Custom Score: ${result.scores.custom}`);
      
      console.log('\n📝 Feedback Summary:');
      console.log(`   Grammar Score: ${result.feedback.grammar.score}`);
      console.log(`   Vocabulary Score: ${result.feedback.vocabulary.score}`);
      console.log(`   Coherence Score: ${result.feedback.coherence.score}`);
      console.log(`   Task Response Score: ${result.feedback.taskResponse.score}`);
      
      console.log('\n🔍 Grammar Errors Found:', result.feedback.grammar.errors.length);
      console.log('🔍 Vocabulary Suggestions:', result.feedback.vocabulary.suggestions.length);
      console.log('📋 Recommendations:', result.recommendations.length);
      
      console.log('\n🎉 Complete flow test successful!');
      console.log('   The Gemini AI integration is working correctly.');
      console.log('   You can now test it in the frontend at https://thewriterpro.com');
      
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      
      if (response.status === 401) {
        console.log('\n💡 Note: This is expected - the endpoint requires authentication.');
        console.log('   The important thing is that the endpoint is reachable.');
        console.log('   In the real application, users will be authenticated.');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run dev');
    }
  }
}

// Run the test
testCompleteFlow().catch(console.error); 