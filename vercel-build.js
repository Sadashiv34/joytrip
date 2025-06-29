const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running build script for JoyTrips...');

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy all files to public directory (except node_modules, .git, etc.)
const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(childItemName => {
      if (childItemName !== 'node_modules' && childItemName !== '.git' && childItemName !== '.vercel') {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      }
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

console.log('Copying files to public directory...');
copyRecursiveSync(process.cwd(), publicDir);

console.log('Build complete');
process.exit(0);
