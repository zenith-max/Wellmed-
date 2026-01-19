# 🏥 MEDWELL - E-Commerce Platform for Surgical Materials

## 🎯 Quick Navigation

Choose your starting point:

### 📖 For First-Time Setup
👉 **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- Simple step-by-step instructions
- Test credentials included
- Quick troubleshooting

### 🔧 For Detailed Installation
👉 **[INSTALLATION.md](INSTALLATION.md)** - Complete walkthrough
- Prerequisites checklist
- Backend setup with explanations
- Frontend setup options
- Verification procedures
- Comprehensive troubleshooting

### 📚 For Complete Documentation
👉 **[README.md](README.md)** - Full project documentation
- Features overview
- API documentation
- Database schemas
- Security features
- Deployment guide

### 📊 For Project Overview
👉 **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete overview
- Project structure
- Feature checklist
- File statistics
- Technology stack
- Code organization

---

## ⚡ 60-Second Overview

**Medwell** is a complete e-commerce platform where:

### 👥 Customers can:
✅ Register & login  
✅ Browse surgical products  
✅ Search & filter by category/price  
✅ Add items to cart  
✅ Place orders with shipping details  
✅ Track order status  

### 👨‍💼 Admins can:
✅ Manage product catalog  
✅ Upload product images  
✅ View all orders  
✅ Update order status  
✅ Monitor inventory  

### 🛠️ Built with:
- **Frontend:** HTML, CSS, Vanilla JavaScript (No frameworks)
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Images:** Cloudinary
- **Auth:** JWT + bcrypt

---

## 📦 Project Structure

```
Medwell/
├── backend/
│   ├── models/          → Database schemas
│   ├── controllers/     → Business logic
│   ├── routes/          → API endpoints
│   ├── middleware/      → Auth & validation
│   ├── server.js        → Main server
│   ├── seed.js          → Sample data
│   ├── db-init.js       → DB manager
│   └── package.json
├── frontend/
│   ├── *.html           → 6 HTML pages
│   ├── css/             → Styling
│   └── js/              → JavaScript logic
├── README.md            → Full documentation
├── QUICKSTART.md        → 5-minute setup
└── INSTALLATION.md      → Detailed guide
```

---

## 🚀 Get Started Now

### Option 1: Quick Start (5 minutes)
```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
python -m http.server 8000

# Open browser
http://localhost:8000
```

See **[QUICKSTART.md](QUICKSTART.md)** for details.

### Option 2: Detailed Setup
Follow **[INSTALLATION.md](INSTALLATION.md)** step-by-step with explanations.

---

## 🔑 Test Accounts (after seeding)

```
Admin:
  Email: admin@medwell.com
  Password: admin123456

Customer:
  Email: john@medwell.com
  Password: customer123456
```

Or create your own by registering!

---

## 📋 Key Features

- ✅ **Full Authentication** - Register, login, JWT tokens
- ✅ **Product Management** - CRUD with image uploads
- ✅ **Shopping Cart** - Add/remove items, persistent storage
- ✅ **Order System** - Place orders, track status
- ✅ **Admin Dashboard** - Manage products & orders
- ✅ **Image Upload** - Via Cloudinary integration
- ✅ **Responsive Design** - Works on all devices
- ✅ **Security** - Password hashing, role-based access

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Products
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/search/:query
POST   /api/products           [Admin]
PUT    /api/products/:id       [Admin]
DELETE /api/products/:id       [Admin]
```

### Orders
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/single/:id
DELETE /api/orders/:id
GET    /api/orders/admin/all   [Admin]
PUT    /api/orders/:id         [Admin]
```

See **[README.md](README.md)** for complete API documentation.

---

## 📱 Pages

- **index.html** - Product listing & shopping
- **login.html** - Customer login
- **register.html** - Customer registration
- **admin.html** - Admin dashboard
- **orders.html** - Order history
- **checkout.html** - Checkout process

---

## 🔒 Security Features

- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT authentication (7-day tokens)
- ✅ Role-based access control
- ✅ Input validation & sanitization
- ✅ CORS protection
- ✅ Secure headers

---

## 🗄️ Database

Three collections:
- **Users** - Customers & admins
- **Products** - Catalog with images
- **Orders** - Customer transactions

MongoDB with Mongoose ORM.

---

## 📊 File Count & Stats

| Component | Count | LOC |
|-----------|-------|-----|
| Backend Files | 9 | ~1000 |
| Frontend HTML | 6 | ~850 |
| Frontend JS | 7 | ~1200 |
| Frontend CSS | 2 | ~1600 |
| Documentation | 4 | ~1500 |
| **Total** | **28** | **~6150** |

---

## ✨ Tech Stack

**Frontend:**
- HTML5, CSS3
- Vanilla JavaScript (ES6+)
- Fetch API
- LocalStorage

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Multer (uploads)
- Cloudinary (images)
- JWT (auth)
- bcryptjs (security)

---

## 📖 Documentation Map

1. **START HERE:** This file (index)
2. **QUICK SETUP:** [QUICKSTART.md](QUICKSTART.md)
3. **DETAILED SETUP:** [INSTALLATION.md](INSTALLATION.md)
4. **FULL DOCS:** [README.md](README.md)
5. **PROJECT OVERVIEW:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🆘 Help & Support

### Having issues?
1. Check [QUICKSTART.md](QUICKSTART.md) troubleshooting
2. Check [INSTALLATION.md](INSTALLATION.md) troubleshooting
3. Check [README.md](README.md) troubleshooting
4. View server logs
5. Check browser console (F12)

### Need help with...
- **Installation?** → See [INSTALLATION.md](INSTALLATION.md)
- **Getting started?** → See [QUICKSTART.md](QUICKSTART.md)
- **API usage?** → See [README.md](README.md)
- **Project structure?** → See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🎯 Checklist for Getting Started

- [ ] Read this file (you're here!)
- [ ] Follow [QUICKSTART.md](QUICKSTART.md)
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:8000
- [ ] Register a customer account
- [ ] Browse products
- [ ] Add to cart & place order
- [ ] Login as admin
- [ ] Add a new product
- [ ] View all orders

---

## 🚀 What's Next?

1. **Try it out** - Follow [QUICKSTART.md](QUICKSTART.md)
2. **Customize** - Edit styles in `frontend/css/`
3. **Add features** - Extend APIs in `backend/`
4. **Deploy** - Follow deployment guide in [README.md](README.md)
5. **Share** - Build with it!

---

## 💡 Pro Tips

- **Install Postman** to test APIs directly
- **Install MongoDB Compass** to view database
- **Install VS Code Live Server** for better frontend development
- **Read comments in code** - Every file is documented
- **Check console logs** - Debug issues easily

---

## 📝 Project Features Summary

### ✅ Implemented
- Full authentication (register, login, JWT)
- Product CRUD operations
- Image upload to Cloudinary
- Shopping cart functionality
- Order creation & tracking
- Admin dashboard
- Order status management
- Category & price filtering
- Product search
- Responsive design
- Error handling
- Database validation
- Security features

### 🔮 Ready for Enhancement
- Payment gateway integration
- Advanced analytics
- Email notifications
- Review & rating system
- Wishlist feature
- Bulk discount codes
- Real-time notifications

---

## 🎉 You're All Set!

Everything is ready to go. Start with:

👉 **[QUICKSTART.md](QUICKSTART.md)** for immediate setup

or

👉 **[INSTALLATION.md](INSTALLATION.md)** for detailed walkthrough

---

## 📞 Quick Reference

| Need | File |
|------|------|
| 5-min setup | QUICKSTART.md |
| Detailed setup | INSTALLATION.md |
| Full docs | README.md |
| Project overview | PROJECT_SUMMARY.md |
| This index | START HERE |

---

**Built with ❤️ for surgical material suppliers**

*Happy coding! 🚀*
