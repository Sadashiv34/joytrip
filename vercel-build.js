const fs = require('fs');
const path = require('path');

console.log('Running build script for JoyTrips...');

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// List of files and directories to copy
const filesToCopy = [
  'index.html',
  'landing.html',
  'login.html',
  'signup.html',
  'map.html',
  'css',
  'js',
  'images'
];

// Copy files to public directory
filesToCopy.forEach(item => {
  const src = path.join(process.cwd(), item);
  const dest = path.join(publicDir, item);
  
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      // Copy directory
      copyDirSync(src, dest);
    } else {
      // Copy file
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }
  }
});

console.log('Build complete');

// Helper function to copy directories
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
