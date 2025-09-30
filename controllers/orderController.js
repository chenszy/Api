const Order = require('../models/Order');
const Product = require('../models/Product');

// 🔹 Create Order
const createOrder = async (req, res, next) => {
    try {
        const { products } = req.body;
        const user_id = req.user.id;

        // Валидация
        if (!products || !Array.isArray(products) || products.length === 0) {
            const error = new Error('Products array is required and cannot be empty');
            error.status = 400;
            return next(error);
        }

        let total_amount = 0;
        const orderProducts = [];

        // Проверяем каждый продукт и рассчитываем общую сумму
        for (const item of products) {
            if (!item.product_id || !item.quantity) {
                const error = new Error('Each product must have product_id and quantity');
                error.status = 400;
                return next(error);
            }

            if (item.quantity <= 0) {
                const error = new Error('Quantity must be greater than 0');
                error.status = 400;
                return next(error);
            }

            // Получаем информацию о продукте
            const product = await Product.getProductById(item.product_id);
            if (!product) {
                const error = new Error(`Product with ID ${item.product_id} not found`);
                error.status = 404;
                return next(error);
            }

            const itemTotal = product.price * item.quantity;
            total_amount += itemTotal;

            orderProducts.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Создаем заказ
        const orderData = {
            user_id,
            products: orderProducts,
            total_amount,
            status: 'pending'
        };

        const order = await Order.createOrder(orderData);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: order.id,
                user_id: order.user_id,
                total_amount: order.total_amount,
                status: order.status,
                created_at: order.created_at,
                items: order.items.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

// 🔹 Get User Orders
const getUserOrders = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const orders = await Order.getUserOrders(user_id);

        res.json({
            success: true,
            count: orders.length,
            orders: orders.map(order => ({
                id: order.id,
                total_amount: order.total_amount,
                status: order.status,
                created_at: order.created_at,
                items: order.items.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                }))
            }))
        });
    } catch (error) {
        next(error);
    }
};

// 🔹 Get All Orders (для админа)
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.getAllOrders();

        res.json({
            success: true,
            count: orders.length,
            orders: orders.map(order => ({
                id: order.id,
                user_id: order.user_id,
                username: order.username,
                email: order.email,
                total_amount: order.total_amount,
                status: order.status,
                created_at: order.created_at,
                items: order.items.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                }))
            }))
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders
};