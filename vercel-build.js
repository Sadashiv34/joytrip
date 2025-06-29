// This file tells Vercel how to build your application
// Since this is a static site with a Node.js backend, we'll just ensure dependencies are installed

const { execSync } = require('child_process');

console.log('Running build script for JoyTrip...');

// Install dependencies if package.json exists
try {
  console.log('Installing dependencies...');
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}
