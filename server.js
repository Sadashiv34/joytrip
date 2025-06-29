const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Set up MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Custom static file serving with proper MIME types
app.use((req, res, next) => {
    const filePath = path.join(__dirname, req.path);
    const extname = path.extname(filePath);
    
    // Set the content type based on file extension
    if (mimeTypes[extname]) {
        res.setHeader('Content-Type', mimeTypes[extname]);
    }
    
    // Log requests for debugging
    console.log(`Request: ${req.method} ${req.path} (${extname || 'no extension'})`);
    
    next();
});

// Serve static files from the project root directory
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        const extname = path.extname(filePath);
        if (mimeTypes[extname]) {
            res.setHeader('Content-Type', mimeTypes[extname]);
        }
    }
}));

// Handle 404 errors
app.use((req, res, next) => {
    console.error(`404: ${req.method} ${req.originalUrl} not found`);
    res.status(404).send('404: Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('500: Internal Server Error');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available pages:');
    console.log(`- Main app: http://localhost:${PORT}/landing.html`);
    console.log(`- Test page: http://localhost:${PORT}/test.html`);
    console.log('\nPress Ctrl+C to stop the server');
});
