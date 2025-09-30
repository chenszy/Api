const db = require('../database/database');
const bcrypt = require('bcryptjs');

// Создание пользователя
const create = async (userData) => {
    try {
        const { username, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const result = await db.runAsync(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        return await findById(result.lastID);
    } catch (error) {
        throw error;
    }
};

// Поиск пользователя по ID
const findById = async (id) => {
    try {
        return await db.getAsync(
            'SELECT id, username, email, isActive, role, createdAt FROM users WHERE id = ?', 
            [id]
        );
    } catch (error) {
        throw error;
    }
};

// Поиск пользователя по email
const findByEmail = async (email) => {
    try {
        return await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
        throw error;
    }
};

// Поиск пользователя по username
const findByUsername = async (username) => {
    try {
        return await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);
    } catch (error) {
        throw error;
    }
};

// Получение всех пользователей
const findAll = async () => {
    try {
        return await db.allAsync(
            'SELECT id, username, email, isActive, role, createdAt FROM users ORDER BY id DESC'
        );
    } catch (error) {
        throw error;
    }
};

// Сравнение пароля
const comparePassword = async (email, password) => {
    try {
        const user = await findByEmail(email);
        if (!user) return false;
        
        return await bcrypt.compare(password, user.password);
    } catch (error) {
        throw error;
    }
};

// Обновление пользователя
const update = async (id, updates) => {
    try {
        const fields = [];
        const values = [];
        
        if (updates.username !== undefined) {
            fields.push('username = ?');
            values.push(updates.username);
        }
        if (updates.email !== undefined) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.isActive !== undefined) {
            fields.push('isActive = ?');
            values.push(updates.isActive ? 1 : 0);
        }
        if (updates.role !== undefined) {
            fields.push('role = ?');
            values.push(updates.role);
        }
        
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        
        await db.runAsync(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        return await findById(id);
    } catch (error) {
        throw error;
    }
};

// Удаление пользователя
const deleteUser = async (id) => {
    try {
        const user = await findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        
        await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
        return user;
    } catch (error) {
        throw error;
    }
};

// Поиск пользователя по токену (для аутентификации)
const findByToken = async (token) => {
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await findById(decoded.id);
    } catch (error) {
        throw error;
    }
};

// Активация/деактивация пользователя
const setActiveStatus = async (id, isActive) => {
    try {
        return await update(id, { isActive });
    } catch (error) {
        throw error;
    }
};

// Изменение роли пользователя
const setRole = async (id, role) => {
    try {
        return await update(id, { role });
    } catch (error) {
        throw error;
    }
};

// Получение статистики пользователей
const getStats = async () => {
    try {
        const stats = await db.getAsync(`
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeUsers,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminUsers
            FROM users
        `);
        return stats;
    } catch (error) {
        throw error;
    }
};

// Поиск пользователей с фильтрацией
const findWithFilters = async (filters = {}) => {
    try {
        let query = 'SELECT id, username, email, isActive, role, createdAt FROM users WHERE 1=1';
        const values = [];
        
        if (filters.isActive !== undefined) {
            query += ' AND isActive = ?';
            values.push(filters.isActive ? 1 : 0);
        }
        
        if (filters.role) {
            query += ' AND role = ?';
            values.push(filters.role);
        }
        
        if (filters.search) {
            query += ' AND (username LIKE ? OR email LIKE ?)';
            values.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        
        query += ' ORDER BY createdAt DESC';
        
        return await db.allAsync(query, values);
    } catch (error) {
        throw error;
    }
};

// Экспортируем все функции
module.exports = {
    create,
    findById,
    findByEmail,
    findByUsername,
    findAll,
    comparePassword,
    update,
    deleteUser,
    findByToken,
    setActiveStatus,
    setRole,
    getStats,
    findWithFilters
};