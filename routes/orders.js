const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const orderController = require('../controllers/orderController');

// Импортируем middleware
const { auth, adminAuth } = require('../middleware/auth');

// 🔹 Create Order (требует аутентификации)
router.post('/', (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        orderController.createOrder(req, res, next);
    });
});

// 🔹 Get User Orders (требует аутентификации)
router.get('/my-orders', (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        orderController.getUserOrders(req, res, next);
    });
});

// 🔹 Get All Orders (только для админов)
router.get('/admin/all', (req, res, next) => {
    adminAuth(req, res, (err) => {
        if (err) return next(err);
        orderController.getAllOrders(req, res, next);
    });
});

module.exports = router;