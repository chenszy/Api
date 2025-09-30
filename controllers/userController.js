const User = require('../models/User');

// Получение всех пользователей
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};
// Создание пользователя (админом)
const createUser = async (req, res, next) => {
    try {
        const { username, email, password, role, isActive } = req.body;

        // Проверяем обязательные поля
        if (!username || !email || !password) {
            const error = new Error('Username, email and password are required');
            error.status = 400;
            return next(error);
        }

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

        // Валидация username
        if (username.length < 3 || username.length > 20) {
            const error = new Error('Username must be between 3 and 20 characters');
            error.status = 400;
            return next(error);
        }
        
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            const error = new Error('Username can only contain letters and numbers');
            error.status = 400;
            return next(error);
        }

        // Валидация email
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            const error = new Error('Please provide a valid email address');
            error.status = 400;
            return next(error);
        }

        // Валидация password
        if (password.length < 6) {
            const error = new Error('Password must be at least 6 characters long');
            error.status = 400;
            return next(error);
        }
        
        if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
            const error = new Error('Password must contain at least one letter and one number');
            error.status = 400;
            return next(error);
        }

        // Создаем пользователя
        const userData = {
            username,
            email,
            password,
            role: role || 'user',
            isActive: isActive !== undefined ? isActive : true
        };

        const user = await User.create(userData);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        next(error);
    }
};
// Получение пользователя по ID
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Проверяем что ID является числом
        if (isNaN(id)) {
            const error = new Error('Invalid user ID');
            error.status = 400;
            return next(error);
        }

        const user = await User.findById(id);
        
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// Обновление пользователя
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, isActive, role } = req.body;

        // Проверяем существование пользователя
        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

        // Проверяем уникальность username и email
        if (username && username !== user.username) {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                const error = new Error('Username already taken');
                error.status = 400;
                return next(error);
            }
        }

        if (email && email !== user.email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                const error = new Error('Email already taken');
                error.status = 400;
                return next(error);
            }
        }

        // Обновляем пользователя
        const updatedUser = await User.update(id, {
            username,
            email,
            isActive,
            role
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        next(error);
    }
};

// Удаление пользователя
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Проверяем существование пользователя
        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

        // Не позволяем удалить самого себя
        if (parseInt(id) === req.user.id) {
            const error = new Error('Cannot delete your own account');
            error.status = 400;
            return next(error);
        }

        // Удаляем пользователя
        await User.deleteUser(id);

        res.json({
            success: true,
            message: 'User deleted successfully',
            deletedUser: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
    
};