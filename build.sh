#!/bin/bash

echo "Running build script for GitHub Pages..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy all HTML files
cp *.html public/ 2>/dev/null || :

# Copy CSS files
cp *.css public/ 2>/dev/null || :

# Copy JavaScript directory
cp -r js/ public/ 2>/dev/null || :

# Copy any existing images directory
if [ -d "images" ]; then
    cp -r images/ public/
fi

# Copy any existing assets
if [ -d "assets" ]; then
    cp -r assets/ public/
fi

# Copy any existing public directory contents (but don't overwrite)
if [ -d "public" ]; then
    find public -maxdepth 1 -type f -exec cp {} public/ \; 2>/dev/null || :
fi

echo "Build complete for GitHub Pages"
