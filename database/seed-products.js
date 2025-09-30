const db = require('./database');

async function seedProducts() {
    try {
        console.log('📦 Seeding products...');

        const testProducts = [
            { name: 'iPhone 15', price: 999.99, category: 'Electronics' },
            { name: 'MacBook Air', price: 1199.99, category: 'Electronics' },
            { name: 'Coffee Maker', price: 89.99, category: 'Home' },
            { name: 'Running Shoes', price: 129.99, category: 'Sports' },
            { name: 'JavaScript Book', price: 39.99, category: 'Books' },
            { name: 'T-Shirt', price: 19.99, category: 'Clothing' },
            { name: 'Headphones', price: 199.99, category: 'Electronics' },
            { name: 'Desk Lamp', price: 49.99, category: 'Home' }
        ];

        for (const product of testProducts) {
            await db.runAsync(
                `INSERT INTO products (name, price, category) VALUES (?, ?, ?)`,
                [product.name, product.price, product.category]
            );
            console.log(`   Created: ${product.name} - $${product.price}`);
        }

        console.log('✅ Test products created successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
    seedProducts().then(() => {
        console.log('🎉 Products seeding completed!');
        process.exit(0);
    });
}

module.exports = seedProducts;