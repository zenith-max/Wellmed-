#!/usr/bin/env node

/**
 * Medwell Database Initialization Script
 * 
 * This script helps set up and manage your MongoDB database.
 * It provides options to:
 * - Connect to MongoDB
 * - Clear data
 * - Seed sample data
 * - Create admin user
 * 
 * Usage: node db-init.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const readline = require('readline');

dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user
const prompt = (question) => {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
};

// Sample products
const sampleProducts = [
  {
    name: 'Latex Surgical Gloves',
    description: 'Premium quality latex gloves for surgical procedures. Powder-free, sterile, and individually packaged.',
    price: 45.99,
    category: 'surgical-gloves',
    stock: 500,
    imageUrl: 'https://via.placeholder.com/300?text=Latex+Gloves',
    rating: 4.8
  },
  {
    name: 'Nitrile Examination Gloves',
    description: 'Durable nitrile gloves for medical examinations. Available in multiple sizes.',
    price: 38.50,
    category: 'surgical-gloves',
    stock: 750,
    imageUrl: 'https://via.placeholder.com/300?text=Nitrile+Gloves',
    rating: 4.6
  },
  {
    name: 'N95 Protective Masks',
    description: 'NIOSH-approved N95 masks with 5-layer protection. Perfect for healthcare workers.',
    price: 12.99,
    category: 'masks',
    stock: 2000,
    imageUrl: 'https://via.placeholder.com/300?text=N95+Masks',
    rating: 4.9
  },
  {
    name: 'Surgical Face Masks',
    description: 'Disposable 3-ply surgical masks with elastic ear loops.',
    price: 8.50,
    category: 'masks',
    stock: 3000,
    imageUrl: 'https://via.placeholder.com/300?text=Surgical+Masks',
    rating: 4.5
  },
  {
    name: 'Sterile Medical Syringes (10ml)',
    description: 'Individually wrapped sterile syringes. Package of 100 units.',
    price: 65.00,
    category: 'syringes',
    stock: 200,
    imageUrl: 'https://via.placeholder.com/300?text=Syringes+10ml',
    rating: 4.7
  },
  {
    name: 'Insulin Syringes (1ml)',
    description: 'Sterile insulin syringes for diabetes management. Ultra-thin needle.',
    price: 45.00,
    category: 'syringes',
    stock: 300,
    imageUrl: 'https://via.placeholder.com/300?text=Insulin+Syringes',
    rating: 4.8
  },
  {
    name: 'Elastic Bandages (5cm)',
    description: 'High-quality elastic bandages for wound care and support.',
    price: 25.00,
    category: 'bandages',
    stock: 600,
    imageUrl: 'https://via.placeholder.com/300?text=Elastic+Bandages',
    rating: 4.4
  },
  {
    name: 'Sterile Gauze Pads',
    description: 'Sterile gauze pads for dressing and wound care. Box of 200 units.',
    price: 35.99,
    category: 'bandages',
    stock: 400,
    imageUrl: 'https://via.placeholder.com/300?text=Gauze+Pads',
    rating: 4.6
  },
  {
    name: 'Surgical Instrument Set',
    description: 'Complete set of surgical instruments including scissors, forceps, and more.',
    price: 299.99,
    category: 'instruments',
    stock: 50,
    imageUrl: 'https://via.placeholder.com/300?text=Surgical+Instruments',
    rating: 4.9
  },
  {
    name: 'Autoclave Sterilization Bags',
    description: 'Self-sealing sterilization bags for autoclave processing.',
    price: 55.00,
    category: 'sterilization',
    stock: 800,
    imageUrl: 'https://via.placeholder.com/300?text=Sterilization+Bags',
    rating: 4.7
  },
  {
    name: 'Full-Body Protective Suit',
    description: 'Disposable protective suit with hood and elastic cuffs.',
    price: 85.00,
    category: 'protective-wear',
    stock: 300,
    imageUrl: 'https://via.placeholder.com/300?text=Protective+Suit',
    rating: 4.8
  },
  {
    name: 'Face Shield',
    description: 'Reusable face shield for additional facial protection.',
    price: 15.50,
    category: 'protective-wear',
    stock: 500,
    imageUrl: 'https://via.placeholder.com/300?text=Face+Shield',
    rating: 4.5
  }
];

// Main menu
const showMenu = () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Medwell Database Initialization      ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log('Options:');
  console.log('  1. Connect to database');
  console.log('  2. Clear all data');
  console.log('  3. Seed sample data');
  console.log('  4. Create admin user');
  console.log('  5. Check database status');
  console.log('  6. Exit\n');
};

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    return false;
  }
};

// Clear all data
const clearData = async () => {
  try {
    const confirm = await prompt('⚠️  Are you sure? This will delete ALL data. (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      return;
    }

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Check existing data
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      const confirm = await prompt(`Found ${existingProducts} existing products. Clear first? (yes/no): `);
      if (confirm.toLowerCase() === 'yes') {
        await Product.deleteMany({});
      } else {
        console.log('❌ Cancelled');
        return;
      }
    }

    // Create products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${products.length} sample products!`);

    // List products
    console.log('\n📦 Products created:');
    products.forEach(p => {
      console.log(`   • ${p.name} (₹${p.price})`);
    });
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    const name = await prompt('Admin name: ');
    const email = await prompt('Admin email: ');
    const password = await prompt('Admin password (min 6 chars): ');

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      return;
    }

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ User with this email already exists');
      return;
    }

    // Create admin
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

// Check database status
const checkStatus = async () => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const customers = await User.countDocuments({ role: 'customer' });

    console.log('\n📊 Database Status:');
    console.log(`   Users: ${users} (Admins: ${admins}, Customers: ${customers})`);
    console.log(`   Products: ${products}`);
    console.log(`   Orders: ${orders}`);

    if (products > 0) {
      const avgStock = await Product.aggregate([
        { $group: { _id: null, avg: { $avg: '$stock' } } }
      ]);
      console.log(`   Avg Product Stock: ${Math.round(avgStock[0]?.avg || 0)}`);
    }

    if (orders > 0) {
      const totalSales = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      console.log(`   Total Orders Value: ₹${totalSales[0]?.total.toFixed(2) || 0}`);
    }
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
};

// Main loop
const main = async () => {
  // Check if connected
  let connected = false;

  while (true) {
    showMenu();

    if (!connected) {
      console.log('⚠️  Not connected to database\n');
    }

    const choice = await prompt('Select option (1-6): ');

    switch (choice) {
      case '1':
        connected = await connectDB();
        break;

      case '2':
        if (!connected) {
          console.log('❌ Please connect to database first');
        } else {
          await clearData();
        }
        break;

      case '3':
        if (!connected) {
          console.log('❌ Please connect to database first');
        } else {
          await seedData();
        }
        break;

      case '4':
        if (!connected) {
          console.log('❌ Please connect to database first');
        } else {
          await createAdmin();
        }
        break;

      case '5':
        if (!connected) {
          console.log('❌ Please connect to database first');
        } else {
          await checkStatus();
        }
        break;

      case '6':
        console.log('\n👋 Goodbye!\n');
        process.exit(0);

      default:
        console.log('❌ Invalid option');
    }

    await prompt('Press Enter to continue...');
  }
};

// Start the script
console.log('🚀 Starting Medwell Database Manager...\n');
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
