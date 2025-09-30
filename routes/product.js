const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// 🔹 Get Products (с фильтрацией) - доступно всем
router.get('/', productController.getProducts);

// 🔹 Get Product by ID - доступно всем
router.get('/:id', productController.getProductById);  // ← ДОБАВЬТЕ ЭТУ СТРОКУ

// 🔹 Create Product - доступно всем
router.post('/', productController.createProduct);

// 🔹 Update Product - доступно всем
router.put('/:id', productController.updateProduct);

module.exports = router;