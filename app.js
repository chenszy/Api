require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Request body:', req.body);
    next();
});

// Импортируем базу данных для инициализации
require('./database/database');

// ОТЛАДКА ИМПОРТОВ - добавьте этот блок
console.log('=== DEBUG: Starting route imports ===');
try {
    const authRoutes = require('./routes/auth');
    console.log('✅ Auth routes imported successfully');
    const productRoutes = require('./routes/product');
     console.log('✅ product  successfully');
    const userRoutes = require('./routes/users');
    console.log('✅ User routes imported successfully');
    const orderRoutes = require('./routes/orders');
     console.log('✅ order routes successfully');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    console.log('✅ Routes mounted successfully');
    
} catch (error) {
    console.error('❌ Error importing routes:', error);
    process.exit(1);
}
console.log('=== DEBUG: Route imports completed ===');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SQLite Auth System is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Endpoint not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requested: `${req.method} ${req.originalUrl}`
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  res.status(status).json({
    success: false,
    message: message,
    errors: error.errors || undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 SQLite database: ${process.env.DB_PATH}`);
});