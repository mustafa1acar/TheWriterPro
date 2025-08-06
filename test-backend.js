const fetch = require('node-fetch');

async function testBackend() {
  console.log('🔍 Testing backend connectivity...\n');
  
  const endpoints = [
    'https://thewriterpro.com/api/health',
    'https://thewriterpro.com/',
    'https://thewriterpro.com/api/auth/register'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`Response: ${data.substring(0, 100)}...`);
      } else {
        console.log(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---');
  }
}

testBackend(); 