// Simple script to run only the server part of the application
// Use this for troubleshooting when the Vite configuration is causing issues

// Set environment variables
process.env.NODE_ENV = 'development';

// Run the server using tsx directly
const { execSync } = require('child_process');

try {
  console.log('Starting server in standalone mode...');
  execSync('npx tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}