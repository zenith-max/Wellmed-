# 📦 INSTALLATION GUIDE - MEDWELL

This guide walks you through every step to get the Medwell e-commerce platform running on your machine.

---

## ✅ Prerequisites

Before you start, make sure you have installed:

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB** (Community Edition)
   - Download: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (Cloud): https://www.mongodb.com/cloud/atlas

3. **Cloudinary Account** (for image uploads)
   - Sign up: https://cloudinary.com/
   - Get credentials: Dashboard → Settings

4. **Code Editor** (VS Code recommended)
   - Download: https://code.visualstudio.com/

5. **Git** (Optional, for cloning)
   - Download: https://git-scm.com/

---

## 🗂️ Folder Structure

Your project should look like:
```
Medwell/
├── backend/
├── frontend/
├── README.md
├── QUICKSTART.md
└── INSTALLATION.md
```

---

## 🔧 Step 1: Backend Installation

### 1.1 Navigate to Backend Folder

```bash
cd Medwell/backend
```

### 1.2 Install Dependencies

```bash
npm install
```

This installs:
- express (web framework)
- mongoose (MongoDB ORM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- multer (file uploads)
- cloudinary (image storage)
- cors (cross-origin requests)
- dotenv (environment variables)

### 1.3 Create `.env` File

In the `backend` folder, create a file named `.env` with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/medwell

# JWT Secret (change this to something random)
JWT_SECRET=your_super_secret_jwt_key_12345

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

### 1.4 Setup Cloudinary

1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Go to Dashboard
4. Copy these values:
   - **Cloud Name** → CLOUDINARY_CLOUD_NAME
   - **API Key** → CLOUDINARY_API_KEY
   - **API Secret** → CLOUDINARY_API_SECRET
5. Paste them in `.env`

### 1.5 Setup MongoDB

**Option A: Local MongoDB** (Windows)

1. Install MongoDB Community: https://www.mongodb.com/try/download/community
2. During installation, check "Install MongoDB as a Service"
3. MongoDB automatically starts (or manually: `net start MongoDB`)
4. In `.env`: Keep `MONGODB_URI=mongodb://localhost:27017/medwell`

**Option B: MongoDB Atlas** (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (Choose FREE tier)
4. Add IP address to Network Access (0.0.0.0/0 for development)
5. Create database user
6. Copy connection string
7. In `.env`: Replace with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medwell?retryWrites=true&w=majority
```

### 1.6 Seed Database (Optional)

To populate with sample data:

```bash
node seed.js
```

This creates:
- Admin user: admin@medwell.com / admin123456
- Customer users: john@medwell.com / customer123456
- 12 sample products

### 1.7 Start Backend Server

```bash
npm start
```

or with auto-reload:

```bash
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
🚀 Server is running on port 5000
📊 Environment: development
🔐 JWT configured and ready
☁️ Cloudinary configured for image storage
```

✅ Backend is ready at `http://localhost:5000`

---

## 🌐 Step 2: Frontend Installation

### 2.1 Navigate to Frontend Folder

Open a **NEW** terminal window and run:

```bash
cd Medwell/frontend
```

### 2.2 Configure API URL

Edit `frontend/js/config.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

(Should already be set correctly)

### 2.3 Start Frontend Server

**Option A: Using Python** (Recommended)

```bash
python -m http.server 8000
```

**Option B: Using Node.js**

```bash
npx http-server
```

**Option C: Using VS Code Live Server**

1. Install extension: "Live Server" by Ritwick Dey
2. Right-click on `index.html`
3. Click "Open with Live Server"

✅ Frontend is ready at `http://localhost:8000`

---

## 🧪 Step 3: Test the Application

### 3.1 Open in Browser

Go to: **http://localhost:8000**

You should see the Medwell homepage with products.

### 3.2 Test Customer Flow

1. Click "Register" or go to `/register.html`
2. Fill in details:
   - Name: John Test
   - Email: john@test.com
   - Password: test123456
3. Click "Register"
4. ✅ You're auto-logged in
5. Browse products and add to cart
6. Click cart icon
7. Click "Proceed to Checkout"
8. Fill shipping details
9. Click "Place Order"
10. ✅ Order created! Check `/orders.html`

### 3.3 Test Admin Flow

**If you ran `seed.js`:**

1. Go to `/login.html`
2. Login as:
   - Email: admin@medwell.com
   - Password: admin123456
3. ✅ Redirected to Admin Panel
4. Click "Products"
5. Click "+ Add New Product"
6. Fill form:
   - Name: Test Product
   - Description: A test product
   - Price: 99.99
   - Stock: 50
   - Category: Select one
   - Image: Upload any image
7. Click "Save Product"
8. ✅ Product added!
9. View orders, update status, etc.

---

## 🔍 Verify Installation

### Check Backend is Running

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-17T..."
}
```

### Check Frontend Loads

Open:
```
http://localhost:8000
```

You should see the Medwell homepage with:
- Navigation bar with search
- Product grid
- Filters sidebar
- Footer

### Check Database Connection

1. Install MongoDB Compass (UI tool)
2. Connect to `mongodb://localhost:27017`
3. Database "medwell" should exist
4. Collections: users, products, orders

---

## 🛠️ Troubleshooting

### Problem: "Cannot find module"

**Solution:**
```bash
cd backend
npm install
```

### Problem: "ECONNREFUSED" - MongoDB won't connect

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
brew services start mongodb-community
```

**Or switch to MongoDB Atlas** (no local setup needed)

### Problem: "Invalid Cloudinary credentials"

**Solution:**
1. Check your `.env` file has correct values
2. Verify credentials on Cloudinary Dashboard
3. Ensure no extra spaces or quotes
4. Restart server after updating

### Problem: "CORS error" in browser console

**Solution:**
- Backend already has CORS enabled
- Check API_BASE_URL in `frontend/js/config.js` matches backend URL
- Check browser Network tab for actual error

### Problem: Images not uploading

**Solution:**
1. Ensure file size < 10MB
2. Check Cloudinary API credentials
3. Check folder "medwell-products" exists in Cloudinary
4. View server logs for detailed error

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Option 1: Change PORT in .env
PORT=5001

# Option 2: Kill process using port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### Problem: Form submission shows "undefined error"

**Solution:**
1. Check browser console (F12)
2. Check backend server logs
3. Ensure all required fields filled
4. Verify database connection

---

## 📝 Configuration Files

### `.env` Template

```env
# ============ MONGODB ============
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/medwell

# MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/medwell?retryWrites=true&w=majority

# ============ JWT ============
JWT_SECRET=your_secret_key_here_change_this

# ============ CLOUDINARY ============
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============ SERVER ============
PORT=5000
NODE_ENV=development
```

---

## 📚 File Modifications

### After Installation, Edit These Files:

#### 1. `backend/.env`
- Add your Cloudinary credentials
- Add your MongoDB URI
- Generate random JWT_SECRET

#### 2. `frontend/js/config.js`
- Already set to `http://localhost:5000/api`
- Change if using different backend URL

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
python -m http.server 8000

# Terminal 3 (Optional): Seed database
cd backend
node seed.js
```

---

## ✨ After Installation

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:8000`
3. ✅ MongoDB connected
4. ✅ Cloudinary configured
5. ✅ Test sample products loaded
6. ✅ Admin & customer accounts created

**You're ready to go!** 🎉

Start with: http://localhost:8000

---

## 📖 Next Steps

- Read QUICKSTART.md for usage guide
- Check README.md for API documentation
- Modify sample products in `backend/seed.js`
- Customize styling in `frontend/css/style.css`
- Add more features as needed

---

## 🆘 Still Need Help?

1. Check QUICKSTART.md
2. Check README.md Troubleshooting section
3. View browser DevTools Console (F12)
4. Check backend server logs
5. Verify all `.env` variables are correct

---

**Happy Building! 🏗️**

Next: Read QUICKSTART.md to start using the application
