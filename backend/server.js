const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const User = require('./models/User');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ============== MIDDLEWARE ==============
// CORS: allow deployed frontend origins (and local file:// for quick testing)
app.use(cors({
  origin: [
    'https://wellmedsurgicals.com',
    'https://www.wellmedsurgicals.com',
    'null' // allows file:// origin during local static testing
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Handle preflight requests explicitly
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the frontend static files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Root route sends the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============== CLOUDINARY CONFIGURATION ==============
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============== MONGODB CONNECTION ==============
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✓ MongoDB connected successfully');
    await ensureAdminUser();
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Ensure at least one admin user exists (and optionally reset credentials)
const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wellmed.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const forceReset = (process.env.ADMIN_FORCE_RESET || 'true').toLowerCase() === 'true';

  try {
    // Migrate legacy admin email if present
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    const legacyAdmin = await User.findOne({ email: 'admin@medwell.com' }).select('+password');

    if (!adminUser && legacyAdmin) {
      legacyAdmin.email = adminEmail;
      legacyAdmin.name = adminName;
      legacyAdmin.role = 'admin';
      legacyAdmin.password = adminPassword; // triggers hash on save
      legacyAdmin.emailVerified = true;
      legacyAdmin.verifiedAt = new Date();
      legacyAdmin.verificationToken = undefined;
      legacyAdmin.verificationTokenExpires = undefined;
      await legacyAdmin.save();
      console.log(`🔑 Legacy admin migrated to ${adminEmail}`);
      return;
    }

    if (adminUser) {
      if (forceReset || adminUser.role !== 'admin') {
        adminUser.name = adminName;
        adminUser.role = 'admin';
        adminUser.password = adminPassword; // triggers hash on save
        adminUser.emailVerified = true;
        adminUser.verifiedAt = new Date();
        adminUser.verificationToken = undefined;
        adminUser.verificationTokenExpires = undefined;
        await adminUser.save();
        console.log(`🔑 Admin credentials refreshed (${adminEmail})`);
      } else {
        console.log(`🔑 Admin user already present (${adminEmail})`);
      }
      return;
    }

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      emailVerified: true,
      verifiedAt: new Date()
    });

    console.log(`🔑 Admin user created (${adminEmail})`);
  } catch (err) {
    console.error('✗ Failed to ensure admin user:', err.message);
  }
};

// ============== ROUTES ==============
// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============== ERROR HANDLING ==============
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 JWT configured and ready`);
  console.log(`☁️ Cloudinary configured for image storage\n`);
});
