#!/bin/bash

echo "Running build script..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy necessary files to public directory
cp -r index.html landing.html login.html signup.html map.html css/ js/ images/ public/ 2>/dev/null || :

echo "Build complete"
