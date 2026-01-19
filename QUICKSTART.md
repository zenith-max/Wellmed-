# MEDWELL - QUICK START GUIDE

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/medwell
JWT_SECRET=medwell_secret_key_12345
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

Start server:
```bash
npm start
```

✅ Backend running on http://localhost:5000

### Step 2: Frontend Setup

Open another terminal:

```bash
cd frontend
```

Option A - Using Python (Recommended):
```bash
python -m http.server 8000
```

Option B - Using Node.js:
```bash
npx http-server
```

✅ Frontend running on http://localhost:8000

### Step 3: Test the Application

1. **Open Browser:** http://localhost:8000
2. **Register a Customer Account:**
   - Click "Register"
   - Fill in details (name, email, password)
   - Submit
3. **Browse Products:**
   - You should see sample products
   - Try search and filters
4. **Add to Cart:**
   - Click "Add to Cart" on any product
   - Click cart icon
5. **Checkout:**
   - Click "Proceed to Checkout"
   - Fill shipping details
   - Place order

### Step 4: Admin Access

1. **Create Admin Account (Manual):**
   - Register a customer account first
   - Open MongoDB:
   ```javascript
   // In MongoDB shell:
   use medwell
   db.users.updateOne(
     { email: "your_admin_email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Login as Admin:**
   - Go to http://localhost:8000/login.html
   - Login with admin email
   - You'll be redirected to admin panel

3. **Admin Features:**
   - Dashboard: View stats
   - Products: Add/Edit/Delete products (with image upload)
   - Orders: View all orders and update status

## 🔑 Key Credentials

### Test Admin Account
```
Email: admin@medwell.com
Password: admin123456
```

### Test Customer Account
```
Email: customer@medwell.com
Password: customer123456
```

(Create these via registration page)

## 📋 Product Categories

Available categories for products:
- Surgical Gloves
- Masks
- Syringes
- Bandages
- Sterilization
- Instruments
- Protective Wear

## 🖼️ Image Upload

When adding products:
1. Click "Add New Product"
2. Fill all details
3. Select image file
4. Image auto-previews
5. Submit → Image uploads to Cloudinary

## 📊 Database Models

### User
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  role: "admin" | "customer",
  createdAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: "Surgical Gloves",
  description: "Premium latex gloves",
  price: 150,
  category: "surgical-gloves",
  stock: 100,
  imageUrl: "https://res.cloudinary.com/...",
  rating: 4.5,
  reviews: [],
  createdAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      productName: "Surgical Gloves",
      price: 150,
      quantity: 2
    }
  ],
  totalPrice: 350,
  status: "pending",
  shippingAddress: {
    fullName: "John Doe",
    phone: "9876543210",
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001"
  },
  createdAt: Date
}
```

## 🔗 Important URLs

- Frontend: http://localhost:8000
- Backend: http://localhost:5000
- Products API: http://localhost:5000/api/products
- Auth API: http://localhost:5000/api/auth

## 🛠️ Useful Commands

```bash
# Start backend
cd backend && npm start

# Start frontend (Python)
cd frontend && python -m http.server 8000

# View MongoDB data (if installed)
mongosh
use medwell
db.products.find()
db.orders.find()
db.users.find()

# Test API with curl
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products
```

## ⚠️ Common Issues

### "Cannot find module"
```bash
cd backend
npm install
```

### "MongoDB connection failed"
- Ensure MongoDB is running (Windows: `net start MongoDB`)
- Check MONGODB_URI in .env

### "Image upload fails"
- Check Cloudinary credentials
- Ensure CLOUDINARY_* variables are set correctly

### "CORS error"
- Backend is configured to accept all origins
- Check API_BASE_URL in frontend/js/config.js

## 📚 File Structure Quick Reference

```
Medwell/
├── backend/
│   ├── models/          → Database schemas
│   ├── controllers/     → Business logic
│   ├── routes/          → API endpoints
│   ├── middleware/      → Auth & validation
│   ├── server.js        → Start here
│   └── package.json     → Dependencies
└── frontend/
    ├── index.html       → Home/Products
    ├── login.html       → Login page
    ├── register.html    → Register page
    ├── admin.html       → Admin dashboard
    ├── orders.html      → Order history
    ├── checkout.html    → Checkout page
    ├── css/             → Styling
    └── js/              → JavaScript logic
```

## 🎯 Next Steps

1. ✅ Start backend
2. ✅ Start frontend
3. ✅ Register customer account
4. ✅ Test product browsing
5. ✅ Add products to cart
6. ✅ Place test order
7. ✅ Create admin account
8. ✅ Upload test products
9. ✅ View admin dashboard

## 📞 Need Help?

Check the main README.md for:
- Complete API documentation
- Deployment guide
- Troubleshooting section
- Database schema details

---

**Happy Shopping! 🏥🛍️**
