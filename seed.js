/**
 * Seed script for MySQL Database
 * Run with: npm run seed
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Sample seed data
const usersData = [
  { name: 'Demo User', email: 'demo@farminvest.com', password: 'password123' },
  { name: 'John Admin', email: 'admin@farminvest.com', password: 'password123' }
];

const investmentsData = [
  { farmer_name: 'John Doe', amount: 5000.00, crop: 'Wheat', created_at: '2025-12-01 10:00:00' },
  { farmer_name: 'Jane Smith', amount: 7500.50, crop: 'Rice', created_at: '2025-12-05 14:30:00' },
  { farmer_name: 'Robert Johnson', amount: 3200.00, crop: 'Corn', created_at: '2025-12-10 09:15:00' },
  { farmer_name: 'Emily Davis', amount: 10000.00, crop: 'Soybeans', created_at: '2025-12-15 16:45:00' },
  { farmer_name: 'Michael Brown', amount: 4500.75, crop: 'Cotton', created_at: '2025-12-18 11:20:00' },
  { farmer_name: 'Sarah Wilson', amount: 6800.00, crop: 'Sugarcane', created_at: '2025-12-20 08:00:00' },
  { farmer_name: 'David Lee', amount: 2500.00, crop: 'Potatoes', created_at: '2025-12-22 13:10:00' },
  { farmer_name: 'Lisa Anderson', amount: 8900.25, crop: 'Tomatoes', created_at: '2025-12-25 15:55:00' },
  { farmer_name: 'James Taylor', amount: 5500.00, crop: 'Onions', created_at: '2025-12-28 10:30:00' },
  { farmer_name: 'Jennifer Martinez', amount: 12000.00, crop: 'Grapes', created_at: '2025-12-30 17:00:00' }
];

async function seedDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'farminvestlite',
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL');

    // Clear existing data
    await connection.execute('DELETE FROM investments');
    await connection.execute('DELETE FROM users');
    console.log('🗑️  Cleared existing data');

    // Seed users
    for (const user of usersData) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [user.name, user.email, hashedPassword]
      );
    }
    console.log(`✅ Seeded ${usersData.length} users`);

    // Seed investments
    for (const inv of investmentsData) {
      await connection.execute(
        'INSERT INTO investments (farmer_name, amount, crop, created_at) VALUES (?, ?, ?, ?)',
        [inv.farmer_name, inv.amount, inv.crop, inv.created_at]
      );
    }
    console.log(`✅ Seeded ${investmentsData.length} investments`);

    // Show seeded data
    const [users] = await connection.execute('SELECT id, name, email FROM users');
    console.log('\n👤 Users in database:');
    users.forEach(u => console.log(`   - ${u.name} (${u.email})`));

    const [investments] = await connection.execute('SELECT * FROM investments ORDER BY created_at DESC');
    console.log('\n📊 Investments in database:');
    investments.forEach(inv => {
      console.log(`   - ${inv.farmer_name}: $${inv.amount} (${inv.crop})`);
    });

    console.log('\n✅ Database seeding complete!');
    console.log('\n📝 Test Login Credentials:');
    console.log('   Email: demo@farminvest.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

seedDatabase();
