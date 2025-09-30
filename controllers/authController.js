const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

// Регистрация пользователя
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Проверяем существование пользователя
        const existingUserByEmail = await User.findByEmail(email);
        const existingUserByUsername = await User.findByUsername(username);
        
        if (existingUserByEmail) {
            const error = new Error('User already exists with this email');
            error.status = 400;
            return next(error);
        }
        
        if (existingUserByUsername) {
            const error = new Error('User already exists with this username');
            error.status = 400;
            return next(error);
        }

        // Создаем пользователя
        const user = await User.create({ username, email, password });

        // Генерируем токены
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Вход пользователя
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Проверяем пользователя
        const user = await User.findByEmail(email);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            return next(error);
        }

        if (!user.isActive) {
            const error = new Error('Account is deactivated');
            error.status = 401;
            return next(error);
        }

        // Проверяем пароль
        const isPasswordValid = await User.comparePassword(email, password);
        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            return next(error);
        }

        // Генерируем токены
        const { accessToken, refreshToken } = generateTokens(user);

        res.json({
            success: true,
            message: 'Login successful',
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Получение текущего пользователя
exports.getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                isActive: req.user.isActive,
                role: req.user.role,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// Обновление токена
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            const error = new Error('Refresh token is required');
            error.status = 400;
            return next(error);
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || !user.isActive) {
                const error = new Error('Invalid refresh token');
                error.status = 401;
                return next(error);
            }

            const { accessToken } = generateTokens(user);

            res.json({
                success: true,
                token: accessToken
            });
        } catch (error) {
            const authError = new Error('Invalid refresh token');
            authError.status = 401;
            return next(authError);
        }
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        // Получаем токен из запроса
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
        
            console.log(`🔒 User ${req.user.id} logged out. Token: ${token.substring(0, 20)}...`);
        }
        
        // Очищаем user из request (важно!)
        req.user = null;

        res.json({
            success: true,
            message: 'Logout successful - token should be discarded client-side'
        });
    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};
// Проверка токена
exports.verifyToken = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Token is valid',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                isActive: req.user.isActive,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
};