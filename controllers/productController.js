const Product = require('../models/Product');

// 🔹 Get Products (с фильтрацией)
const getProducts = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        
        const filters = {};
        if (category) filters.category = category;
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
        if (search) filters.search = search;

        const products = await Product.getAllProducts(filters); // ← getAllProducts

        res.json({
            success: true,
            count: products.length,
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            products: products.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                created_at: product.created_at,
                updated_at: product.updated_at
            }))
        });
    } catch (error) {
        next(error);
    }
};

// 🔹 Get Product by ID
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            const error = new Error('Invalid product ID');
            error.status = 400;
            return next(error);
        }

        const product = await Product.getProductById(id); // ← getProductById

        if (!product) {
            const error = new Error('Product not found');
            error.status = 404;
            return next(error);
        }

        res.json({
            success: true,
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                created_at: product.created_at,
                updated_at: product.updated_at
            }
        });
    } catch (error) {
        next(error);
    }
};

// 🔹 Create Product
const createProduct = async (req, res, next) => {
    try {
        const { name, price, category } = req.body;

        // Валидация обязательных полей
        if (!name || !price || !category) {
            const error = new Error('Name, price and category are required');
            error.status = 400;
            return next(error);
        }

        if (price < 0) {
            const error = new Error('Price cannot be negative');
            error.status = 400;
            return next(error);
        }

        const productData = {
            name,
            price: parseFloat(price),
            category
        };

        const product = await Product.createProduct(productData); // ← createProduct

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                created_at: product.created_at
            }
        });
    } catch (error) {
        next(error);
    }
};

// 🔹 Update Product
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, category } = req.body;

        if (isNaN(id)) {
            const error = new Error('Invalid product ID');
            error.status = 400;
            return next(error);
        }

        // Проверяем существование продукта
        const existingProduct = await Product.getProductById(id); // ← getProductById
        if (!existingProduct) {
            const error = new Error('Product not found');
            error.status = 404;
            return next(error);
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (price !== undefined) {
            if (price < 0) {
                const error = new Error('Price cannot be negative');
                error.status = 400;
                return next(error);
            }
            updates.price = parseFloat(price);
        }
        if (category !== undefined) updates.category = category;

        if (Object.keys(updates).length === 0) {
            const error = new Error('No fields to update');
            error.status = 400;
            return next(error);
        }

        const updatedProduct = await Product.updateProduct(id, updates); // ← updateProduct

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: {
                id: updatedProduct.id,
                name: updatedProduct.name,
                price: updatedProduct.price,
                category: updatedProduct.category,
                updated_at: updatedProduct.updated_at
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct
};