require('dotenv').config();
const db = require('./database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        console.log('👨💻 Creating admin user...');
        
        const adminPassword = await bcrypt.hash('Admin123!', 12);
        
        // Создаем админа
        const result = await db.runAsync(
            `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
            ['admin', 'admin@example.com', adminPassword, 'admin']
        );
        
        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin credentials:');
        console.log('   Email: admin@example.com');
        console.log('   Password: Admin123!');
        console.log('   Role: admin');
        console.log('   ID:', result.lastID);
        
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    }
}

async function createTestUsers() {
    try {
        console.log('👥 Creating test users...');
        
        const userPassword = await bcrypt.hash('User123!', 12);
        
        const testUsers = [
            { username: 'john_doe', email: 'john@example.com', password: userPassword },
            { username: 'jane_smith', email: 'jane@example.com', password: userPassword },
            { username: 'mike_wilson', email: 'mike@example.com', password: userPassword },
            { username: 'sara_jones', email: 'sara@example.com', password: userPassword },
            { username: 'tom_brown', email: 'tom@example.com', password: userPassword }
        ];

        for (const user of testUsers) {
            await db.runAsync(
                `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
                [user.username, user.email, user.password]
            );
            console.log(`   Created user: ${user.username} (${user.email})`);
        }
        
        console.log('✅ Test users created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
    }
}

async function main() {
    try {
        console.log('🎯 Starting database seeding...');
        console.log('================================');
        
        await createAdmin();
        console.log('--------------------------------');
        await createTestUsers();
        console.log('--------------------------------');
        
        // Показываем всех пользователей
        const users = await db.allAsync(`
            SELECT id, username, email, role, isActive 
            FROM users 
            ORDER BY role DESC, id ASC
        `);
        
        console.log('📊 Database summary:');
        console.log('   Total users:', users.length);
        console.log('   Admin users:', users.filter(u => u.role === 'admin').length);
        console.log('   Regular users:', users.filter(u => u.role === 'user').length);
        
        console.log('--------------------------------');
        console.log('👤 All users:');
        users.forEach(user => {
            console.log(`   ${user.id}. ${user.username} (${user.email}) - ${user.role} - ${user.isActive ? 'active' : 'inactive'}`);
        });
        
        console.log('================================');
        console.log('🎉 Database seeding completed!');
        console.log('🚀 You can now start the server: npm run dev');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        // Закрываем соединение с базой
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('🔌 Database connection closed');
            }
            process.exit(0);
        });
    }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
    main();
}

module.exports = { createAdmin, createTestUsers };