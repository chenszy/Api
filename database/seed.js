const db = require('./database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const adminPassword = await bcrypt.hash('Admin123!', 12);
        
        await db.runAsync(
            `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
            ['admin', 'admin@example.com', adminPassword, 'admin']
        );
        
        console.log('✅ Admin user created:');
        console.log('   Email: admin@example.com');
        console.log('   Password: Admin123!');
        console.log('   Role: admin');
        
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

async function createTestUsers() {
    try {
        const userPassword = await bcrypt.hash('User123!', 12);
        
        const testUsers = [
            { username: 'user1', email: 'user1@example.com', password: userPassword },
            { username: 'user2', email: 'user2@example.com', password: userPassword },
            { username: 'user3', email: 'user3@example.com', password: userPassword }
        ];

        for (const user of testUsers) {
            await db.runAsync(
                `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
                [user.username, user.email, user.password]
            );
        }
        
        console.log('✅ Test users created');
        
    } catch (error) {
        console.error('Error creating test users:', error);
    }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
    async function seed() {
        await createAdmin();
        await createTestUsers();
        console.log('🎉 Seeding completed!');
        process.exit(0);
    }
    
    seed();
}

module.exports = { createAdmin, createTestUsers };