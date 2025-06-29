const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable gzip compression
app.use(compression());

// Serve static files with cache control
const staticOptions = {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      // No cache for HTML files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
};

// Serve static files from the root directory
app.use(express.static(__dirname, staticOptions));

// Serve static files from the 'public' directory if it exists
try {
  const fs = require('fs');
  if (fs.existsSync(path.join(__dirname, 'public'))) {
    app.use(express.static(path.join(__dirname, 'public'), staticOptions));
  }
} catch (err) {
  console.error('Error accessing public directory:', err);
}

// API routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle SPA routing - serve index.html for all other GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Make sure to access the app at http://localhost:${PORT}/landing.html`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
