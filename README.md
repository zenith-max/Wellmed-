# Medwell - E-Commerce Platform for Surgical Materials

A full-stack Amazon-like e-commerce platform for selling surgical materials built with **Node.js + Express**, **MongoDB**, **Vanilla JavaScript**, and **Cloudinary** for image management.

## 📋 Project Structure

```
Medwell/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (Admin & Customer)
│   │   ├── Product.js       # Product schema
│   │   └── Order.js         # Order schema
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product CRUD operations
│   │   └── orderController.js   # Order management
│   ├── routes/
│   │   ├── authRoutes.js    # Auth endpoints
│   │   ├── productRoutes.js # Product endpoints
│   │   └── orderRoutes.js   # Order endpoints
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── adminCheck.js    # Admin role verification
│   ├── server.js            # Main server file
│   ├── package.json         # Dependencies
│   └── .env.example         # Environment variables template
└── frontend/
    ├── index.html           # Products listing
    ├── login.html           # Customer login
    ├── register.html        # Customer registration
    ├── admin.html           # Admin dashboard
    ├── orders.html          # Order history
    ├── checkout.html        # Checkout page
    ├── css/
    │   ├── style.css        # Main styles
    │   └── responsive.css   # Mobile responsive styles
    └── js/
        ├── config.js        # Configuration & auth helpers
        ├── api.js          # API calls
        ├── index.js        # Products page logic
        ├── auth.js         # Authentication page logic
        ├── admin.js        # Admin panel logic
        ├── orders.js       # Orders page logic
        └── checkout.js     # Checkout logic
```

## 🚀 Features

### Authentication
- ✅ Separate registration & login for customers
- ✅ Admin login with role-based access
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt

### Customer Features
- ✅ View all products
- ✅ Search products
- ✅ Filter by category
- ✅ Filter by price range
- ✅ Add to cart
- ✅ Place orders with shipping details
- ✅ View order history
- ✅ Cancel pending orders

### Admin Features
- ✅ Dashboard with statistics
- ✅ Add products with image upload
- ✅ Edit product details
- ✅ Delete products
- ✅ Image management via Cloudinary
- ✅ View all orders
- ✅ Update order status
- ✅ Low stock alerts

### Technical Features
- ✅ REST API with Express.js
- ✅ MongoDB with Mongoose ORM
- ✅ JWT authentication middleware
- ✅ Admin authorization middleware
- ✅ Cloudinary image storage
- ✅ Multer for file uploads
- ✅ Responsive design (Mobile-first)
- ✅ Error handling & validation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account
- npm or yarn

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Update `.env` with your credentials:**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/medwell
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medwell

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

4. **Get Cloudinary Credentials:**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Go to Dashboard
   - Copy Cloud Name, API Key, and API Secret

5. **Start MongoDB:**
```bash
# Windows (if using local MongoDB)
net start MongoDB

# Or use MongoDB Atlas (cloud)
```

6. **Start the server:**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Update API URL in `frontend/js/config.js`:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

2. **Start a local server:**
```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js (install http-server)
npm install -g http-server
http-server frontend

# Option 3: Using VS Code Live Server extension
```

Access the app at `http://localhost:8000`

## 🔐 Authentication Flow

### Customer Registration
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Customer Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Admin Login
Use the same login endpoint with admin email/password. The system will detect the role from the database.

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@medwell.com",
    "role": "admin"
  }
}
```

## 📱 API Endpoints

### Auth Endpoints
```
POST   /api/auth/register          # Register customer
POST   /api/auth/login             # Login (customer or admin)
GET    /api/auth/me                # Get current user (requires auth)
```

### Product Endpoints
```
GET    /api/products               # Get all products
GET    /api/products/:id           # Get product by ID
GET    /api/products/search/:query # Search products
POST   /api/products               # Create product (admin only)
PUT    /api/products/:id           # Update product (admin only)
DELETE /api/products/:id           # Delete product (admin only)
```

### Order Endpoints
```
POST   /api/orders                 # Create order (customer)
GET    /api/orders                 # Get customer's orders
GET    /api/orders/single/:id      # Get order details
DELETE /api/orders/:id             # Cancel order
GET    /api/orders/admin/all       # Get all orders (admin)
PUT    /api/orders/:id             # Update order status (admin)
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'customer',
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  imageUrl: String (Cloudinary URL),
  imagePublicId: String (for deletion),
  rating: Number,
  reviews: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId,
      productName: String,
      price: Number,
      quantity: Number
    }
  ],
  totalPrice: Number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Sample Admin Account

To create an admin account, use the register endpoint with role: 'admin' (requires database modification) or:

1. Register a customer account
2. Manually update in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@medwell.com" },
  { $set: { role: "admin" } }
)
```

## 🌐 Frontend Pages

### `/index.html` - Product Listing
- Display all products
- Search functionality
- Category filters
- Price range filter
- Add to cart
- Responsive grid layout

### `/login.html` - Customer Login
- Email & password login
- Form validation
- Error handling
- Redirect to products or admin panel based on role

### `/register.html` - Customer Registration
- Full name, email, password
- Password confirmation
- Form validation
- Auto login after registration

### `/admin.html` - Admin Dashboard
- Dashboard with statistics
- Product management (CRUD)
- Order management
- Order status updates
- Product image upload

### `/orders.html` - Order History
- View all customer orders
- Order status tracking
- Cancel pending orders
- Order details view

### `/checkout.html` - Checkout Page
- Order review
- Shipping address form
- Payment method selection
- Place order

## 🎨 Styling Features

- **Responsive Design:** Mobile-first approach
- **Amazon-like Layout:** Product grid, sidebar filters
- **Color Scheme:** Professional blue (#2c3e50, #3498db)
- **Animations:** Smooth transitions and hover effects
- **Icons:** Emoji-based icons for quick recognition
- **Dark Navigation:** Professional navbar with user menu

## 🔒 Security Features

1. **Password Security:**
   - Bcrypt hashing (10 rounds)
   - Min 6 characters required
   - Confirmation validation

2. **Authentication:**
   - JWT tokens (7-day expiry)
   - Token stored in localStorage
   - Bearer token in Authorization header

3. **Authorization:**
   - Role-based access control
   - Admin middleware verification
   - Protected routes

4. **Data Validation:**
   - Email format validation
   - Required field checks
   - Stock availability checks

## 📝 Example Workflows

### Customer: Browse & Purchase
1. Register at `/register.html`
2. Browse products at `/index.html`
3. Search/filter products
4. Add items to cart
5. Click cart icon → Checkout
6. Fill shipping details
7. Place order
8. View order history at `/orders.html`

### Admin: Manage Products
1. Login at `/login.html` with admin credentials
2. Redirected to `/admin.html`
3. Click "Products" tab
4. Click "+ Add New Product"
5. Fill form and upload image
6. View/Edit/Delete products
7. View all orders and update status

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify credentials for Atlas

### Cloudinary Upload Fails
```
Error: Authentication error
```
- Verify CLOUDINARY_API_KEY and SECRET
- Check cloud name spelling
- Ensure folder "medwell-products" exists

### JWT Token Invalid
```
Error: Invalid or expired token
```
- Clear localStorage and re-login
- Check JWT_SECRET matches in .env
- Verify token format: "Bearer <token>"

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
- Backend has CORS enabled for all origins
- Frontend API_BASE_URL must match backend URL
- Check Network tab in DevTools

## 📚 API Documentation

### Complete API Examples

**Create Product (Admin):**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Surgical Gloves" \
  -F "description=Premium latex gloves" \
  -F "price=150" \
  -F "stock=100" \
  -F "category=surgical-gloves" \
  -F "image=@image.jpg"
```

**Place Order (Customer):**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "9876543210",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001"
    },
    "paymentMethod": "credit-card"
  }'
```

## 🚀 Deployment

### Backend (Heroku/Railway)
1. Create account on Heroku
2. Install Heroku CLI
3. Set environment variables
4. Deploy: `git push heroku main`

### Frontend (Netlify/Vercel)
1. Build frontend as static site
2. Upload files to Netlify
3. Update API_BASE_URL to deployed backend

## 📄 License

This project is open source and available for educational purposes.

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Check browser console for errors
- Review server logs

---

**Built with ❤️ for surgical material suppliers**
