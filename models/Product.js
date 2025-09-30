const db = require('../database/database');

// Создание продукта
const createProduct = async (productData) => {
    try {
        const { name, price, category } = productData;
        
        const result = await db.runAsync(
            `INSERT INTO products (name, price, category) VALUES (?, ?, ?)`,
            [name, price, category]
        );
        
        return await getProductById(result.lastID);
    } catch (error) {
        throw error;
    }
};

// Поиск продукта по ID
const getProductById = async (id) => {
    try {
        return await db.getAsync('SELECT * FROM products WHERE id = ?', [id]);
    } catch (error) {
        throw error;
    }
};

// Получение всех продуктов с фильтрацией
const getAllProducts = async (filters = {}) => {
    try {
        let query = 'SELECT * FROM products WHERE 1=1';
        const values = [];

        if (filters.category) {
            query += ' AND category = ?';
            values.push(filters.category);
        }

        if (filters.minPrice) {
            query += ' AND price >= ?';
            values.push(filters.minPrice);
        }

        if (filters.maxPrice) {
            query += ' AND price <= ?';
            values.push(filters.maxPrice);
        }

        if (filters.search) {
            query += ' AND name LIKE ?';
            values.push(`%${filters.search}%`);
        }

        query += ' ORDER BY created_at DESC';

        return await db.allAsync(query, values);
    } catch (error) {
        throw error;
    }
};

// Обновление продукта
const updateProduct = async (id, updates) => {
    try {
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.price !== undefined) {
            fields.push('price = ?');
            values.push(updates.price);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.runAsync(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await getProductById(id);
    } catch (error) {
        throw error;
    }
};

// Убедитесь что ВСЕ методы экспортируются!
module.exports = {
    createProduct,
    getProductById,      
    getAllProducts,     
    updateProduct        
};