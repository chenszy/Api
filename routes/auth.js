const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const authController = require('../controllers/authController');

// Импортируем middleware
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Регистрация
router.post('/register', (req, res, next) => {
    validateRegistration(req, res, (err) => {
        if (err) return next(err);
        authController.register(req, res, next);
    });
});

// Вход
router.post('/login', (req, res, next) => {
    validateLogin(req, res, (err) => {
        if (err) return next(err);
        authController.login(req, res, next);
    });
});

// Обновление токена
router.post('/refresh', (req, res, next) => {
    authController.refreshToken(req, res, next);
});

// Выход
router.post('/logout', (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        authController.logout(req, res, next);
    });
});

// Получение текущего пользователя
router.get('/me', (req, res, next) => {
    auth(req, res, (err) => {
        if (err) return next(err);
        authController.getMe(req, res, next);
    });
});

module.exports = router;