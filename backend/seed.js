// ============== SEED DATABASE WITH SAMPLE DATA ==============
// Run this file once to populate your database with sample products and users
// Usage: node seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected for seeding'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@wellmed.com',
    password: 'admin123456',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@medwell.com',
    password: 'customer123456',
    role: 'customer'
  },
  {
    name: 'Jane Smith',
    email: 'jane@medwell.com',
    password: 'customer123456',
    role: 'customer'
  }
];

const sampleProducts = [
  {
    name: 'Latex Surgical Gloves',
    description: 'Premium quality latex gloves for surgical procedures. Powder-free, sterile, and individually packaged.',
    price: 45.99,
    category: 'surgical-gloves',
    stock: 500,
    imageUrl: 'https://via.placeholder.com/300?text=Latex+Gloves',
    rating: 4.8,
    reviews: []
  },
  {
    name: 'Nitrile Examination Gloves',
    description: 'Durable nitrile gloves for medical examinations. Available in multiple sizes.',
    price: 38.50,
    category: 'surgical-gloves',
    stock: 750,
    imageUrl: 'https://via.placeholder.com/300?text=Nitrile+Gloves',
    rating: 4.6,
    reviews: []
  },
  {
    name: 'N95 Protective Masks',
    description: 'NIOSH-approved N95 masks with 5-layer protection. Perfect for healthcare workers.',
    price: 12.99,
    category: 'masks',
    stock: 2000,
    imageUrl: 'https://via.placeholder.com/300?text=N95+Masks',
    rating: 4.9,
    reviews: []
  },
  {
    name: 'Surgical Face Masks',
    description: 'Disposable 3-ply surgical masks with elastic ear loops.',
    price: 8.50,
    category: 'masks',
    stock: 3000,
    imageUrl: 'https://via.placeholder.com/300?text=Surgical+Masks',
    rating: 4.5,
    reviews: []
  },
  {
    name: 'Sterile Medical Syringes (10ml)',
    description: 'Individually wrapped sterile syringes. Package of 100 units.',
    price: 65.00,
    category: 'syringes',
    stock: 200,
    imageUrl: 'https://via.placeholder.com/300?text=Syringes+10ml',
    rating: 4.7,
    reviews: []
  },
  {
    name: 'Insulin Syringes (1ml)',
    description: 'Sterile insulin syringes for diabetes management. Ultra-thin needle.',
    price: 45.00,
    category: 'syringes',
    stock: 300,
    imageUrl: 'https://via.placeholder.com/300?text=Insulin+Syringes',
    rating: 4.8,
    reviews: []
  },
  {
    name: 'Elastic Bandages (5cm)',
    description: 'High-quality elastic bandages for wound care and support.',
    price: 25.00,
    category: 'bandages',
    stock: 600,
    imageUrl: 'https://via.placeholder.com/300?text=Elastic+Bandages',
    rating: 4.4,
    reviews: []
  },
  {
    name: 'Sterile Gauze Pads',
    description: 'Sterile gauze pads for dressing and wound care. Box of 200 units.',
    price: 35.99,
    category: 'bandages',
    stock: 400,
    imageUrl: 'https://via.placeholder.com/300?text=Gauze+Pads',
    rating: 4.6,
    reviews: []
  },
  {
    name: 'Surgical Instrument Set',
    description: 'Complete set of surgical instruments including scissors, forceps, and more.',
    price: 299.99,
    category: 'instruments',
    stock: 50,
    imageUrl: 'https://via.placeholder.com/300?text=Surgical+Instruments',
    rating: 4.9,
    reviews: []
  },
  {
    name: 'Autoclave Sterilization Bags',
    description: 'Self-sealing sterilization bags for autoclave processing.',
    price: 55.00,
    category: 'sterilization',
    stock: 800,
    imageUrl: 'https://via.placeholder.com/300?text=Sterilization+Bags',
    rating: 4.7,
    reviews: []
  },
  {
    name: 'Full-Body Protective Suit',
    description: 'Disposable protective suit with hood and elastic cuffs.',
    price: 85.00,
    category: 'protective-wear',
    stock: 300,
    imageUrl: 'https://via.placeholder.com/300?text=Protective+Suit',
    rating: 4.8,
    reviews: []
  },
  {
    name: 'Face Shield',
    description: 'Reusable face shield for additional facial protection.',
    price: 15.50,
    category: 'protective-wear',
    stock: 500,
    imageUrl: 'https://via.placeholder.com/300?text=Face+Shield',
    rating: 4.5,
    reviews: []
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) [${user.role}]`);
    });

    // Create products
    const products = await Product.insertMany(sampleProducts);
    console.log(`\n✅ Created ${products.length} products`);
    products.forEach(product => {
      console.log(`   - ${product.name} (₹${product.price}) - Stock: ${product.stock}`);
    });

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: 0 (will be created when customers place orders)\n`);

    console.log('🔐 Test Credentials:');
    console.log('   Admin:');
    console.log('   - Email: admin@medwell.com');
    console.log('   - Password: admin123456');
    console.log('\n   Customer:');
    console.log('   - Email: john@medwell.com');
    console.log('   - Password: customer123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
