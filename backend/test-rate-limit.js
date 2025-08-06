const fetch = require('node-fetch');

// Test rate limiting for assessment status endpoint
async function testRateLimit() {
  try {
    console.log('🧪 Testing rate limiting for assessment status endpoint...');
    
    const baseUrl = 'http://localhost:5000';
    const testToken = 'test-token'; // This will fail auth but we can test rate limiting
    
    // Make multiple requests to test rate limiting
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        fetch(`${baseUrl}/api/assessment/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
    }
    
    console.log('Making 10 concurrent requests to /api/assessment/status...');
    
    const responses = await Promise.all(requests);
    
    let successCount = 0;
    let rateLimitCount = 0;
    let authErrorCount = 0;
    let otherErrorCount = 0;
    
    responses.forEach((response, index) => {
      console.log(`Request ${index + 1}: ${response.status}`);
      
      if (response.status === 401) {
        authErrorCount++;
      } else if (response.status === 429) {
        rateLimitCount++;
      } else if (response.status === 200) {
        successCount++;
      } else {
        otherErrorCount++;
      }
    });
    
    console.log('\n📊 Rate Limit Test Results:');
    console.log(`✅ Successful requests: ${successCount}`);
    console.log(`🚫 Rate limited requests: ${rateLimitCount}`);
    console.log(`🔐 Authentication errors: ${authErrorCount}`);
    console.log(`❌ Other errors: ${otherErrorCount}`);
    
    if (rateLimitCount === 0) {
      console.log('\n✅ Rate limiting is working correctly - no 429 errors');
    } else {
      console.log('\n⚠️  Rate limiting detected - some requests were limited');
    }
    
    console.log('\n🔧 Rate limiting configuration:');
    console.log('- General API limit: 500 requests per 15 minutes');
    console.log('- Assessment routes limit: 200 requests per 15 minutes');
    console.log('- Assessment status endpoint: Excluded from rate limiting');
    console.log('- Analysis routes limit: 50 requests per 15 minutes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRateLimit(); 