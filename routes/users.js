const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const userController = require('../controllers/userController');

// Импортируем middleware
const { adminAuth } = require('../middleware/auth');

// Получение всех пользователей
router.get('/', (req, res, next) => {
    adminAuth(req, res, (err) => {
        if (err) return next(err);
        userController.getAllUsers(req, res, next);
    });
});

// Получение пользователя по ID
router.get('/:id', (req, res, next) => {
    adminAuth(req, res, (err) => {
        if (err) return next(err);
        userController.getUserById(req, res, next);
    });
});

// Обновление пользователя
router.put('/:id', (req, res, next) => {
    adminAuth(req, res, (err) => {
        if (err) return next(err);
        userController.updateUser(req, res, next);
    });
});
// Создание пользователя (только для админов)
router.post('/', (req, res, next) => {
    adminAuth(req, res, (err) => {
        if (err) return next(err);
        userController.createUser(req, res, next);
    });
});
// Удаление пользователя
router.delete('/:id', (req, res, next) => {
    adminAuth(req, res, (err) => {
        if (err) return next(err);
        userController.deleteUser(req, res, next);
    });
});

module.exports = router;