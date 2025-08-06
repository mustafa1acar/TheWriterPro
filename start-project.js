const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting WriterPro Project...\n');

// Function to start a process
const startProcess = (command, args, cwd, name) => {
  console.log(`📦 Starting ${name}...`);
  
  const process = spawn(command, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`❌ Error starting ${name}:`, error);
  });

  process.on('close', (code) => {
    console.log(`🔚 ${name} process exited with code ${code}`);
  });

  return process;
};

// Start backend server
console.log('🔧 Starting backend server...');
const backendProcess = startProcess('npm', ['start'], './backend', 'Backend Server');

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('🎨 Starting frontend server...');
  const frontendProcess = startProcess('npm', ['start'], './', 'Frontend Server');
  
  // Handle cleanup on exit
  const cleanup = () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 3000);

console.log('\n✅ Startup script running...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('🔌 Backend will be available at: http://localhost:5000');
console.log('⏹️  Press Ctrl+C to stop all servers\n');
