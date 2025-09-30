const db = require('../database/database');

// Создание заказа
const createOrder = async (orderData) => {
    try {
        const { user_id, products, total_amount, status } = orderData;
        
        const result = await db.runAsync(
            `INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)`,
            [user_id, total_amount, status || 'pending']
        );
        
        const orderId = result.lastID;
        
        // Добавляем продукты в заказ
        for (const product of products) {
            await db.runAsync(
                `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, product.product_id, product.quantity, product.price]
            );
        }
        
        return await getOrderById(orderId);
    } catch (error) {
        throw error;
    }
};

// Получение заказа по ID
const getOrderById = async (id) => {
    try {
        const order = await db.getAsync(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [id]);
        
        if (!order) return null;
        
        // Получаем товары заказа
        const items = await db.allAsync(`
            SELECT oi.*, p.name as product_name, p.category 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        `, [id]);
        
        return {
            ...order,
            items
        };
    } catch (error) {
        throw error;
    }
};

// Получение заказов пользователя
const getUserOrders = async (userId) => {
    try {
        const orders = await db.allAsync(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.user_id = ? 
            ORDER BY o.created_at DESC
        `, [userId]);
        
        // Для каждого заказа получаем товары
        for (let order of orders) {
            const items = await db.allAsync(`
                SELECT oi.*, p.name as product_name, p.category 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            
            order.items = items;
        }
        
        return orders;
    } catch (error) {
        throw error;
    }
};

// Получение всех заказов (для админа)
const getAllOrders = async () => {
    try {
        const orders = await db.allAsync(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        
        // Для каждого заказа получаем товары
        for (let order of orders) {
            const items = await db.allAsync(`
                SELECT oi.*, p.name as product_name, p.category 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            
            order.items = items;
        }
        
        return orders;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders
};