require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Simple server is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple POST test
app.post('/api/test-post', (req, res) => {
  res.json({
    success: true,
    received: req.body
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
});