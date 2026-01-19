# Medwell Development Helpers

This folder contains helpful utilities and scripts for development.

## 📋 Available Scripts

### Backend Scripts

#### 1. `npm start` - Start the server
```bash
cd backend
npm start
```
Starts the Express server on port 5000.

#### 2. `npm run dev` - Start with hot reload
```bash
cd backend
npm run dev
```
Starts with Nodemon (auto-reload on file changes).

#### 3. `node seed.js` - Populate database
```bash
cd backend
node seed.js
```
Creates sample users and products for testing.

#### 4. `node db-init.js` - Interactive database manager
```bash
cd backend
node db-init.js
```
Interactive menu to manage database:
- Connect to MongoDB
- Clear data
- Seed data
- Create admin user
- Check status

### Frontend Scripts

#### 1. Python HTTP Server
```bash
cd frontend
python -m http.server 8000
```

#### 2. Node HTTP Server
```bash
cd frontend
npx http-server
```

#### 3. VS Code Live Server
Right-click `index.html` → Open with Live Server

---

## 🔍 Testing

### Test Customer Flow
1. Go to `/register.html`
2. Create account
3. Browse products at `/index.html`
4. Add to cart
5. Checkout
6. View orders at `/orders.html`

### Test Admin Flow
1. Go to `/login.html`
2. Login with admin credentials
3. Access `/admin.html`
4. Manage products & orders

### Test API with Curl

```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123456"}'
```

---

## 🛠️ Development Tips

### VS Code Extensions
Recommended for better development:
- REST Client - Test APIs from VS Code
- MongoDB for VS Code - Browse MongoDB
- Live Server - Local web server
- Prettier - Code formatter
- ESLint - Code linter

### Browser DevTools
Press F12 in browser for:
- **Console** - Check JavaScript errors
- **Network** - Monitor API calls
- **Storage** - View localStorage
- **Application** - Debug

### Environment Variables
If you change `.env`:
1. Restart the server
2. Changes take effect immediately

### Disable CORS Errors (Development)
CORS is already enabled in the backend.
If you still get errors:
1. Check browser console for actual error
2. Verify API_BASE_URL in `frontend/js/config.js`
3. Ensure backend is running

---

## 📊 Database Management

### Using MongoDB Compass
1. Download MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Browse databases, collections, documents

### Using mongosh (CLI)
```bash
# Start mongosh
mongosh

# Select database
use medwell

# View users
db.users.find()

# View products
db.products.find()

# View orders
db.orders.find()

# Update user role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

# Delete all orders
db.orders.deleteMany({})
```

---

## 🐛 Debugging Guide

### Backend Errors

**Error: Cannot connect to MongoDB**
```bash
# Check if MongoDB is running
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
```

**Error: EADDRINUSE - Port already in use**
```bash
# Windows: Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Error: Invalid Cloudinary credentials**
- Check `.env` file
- Verify no extra spaces or quotes
- Get fresh credentials from Cloudinary dashboard
- Restart server

### Frontend Errors

**CORS error in browser**
- Check browser console for actual error message
- Verify API_BASE_URL in `config.js`
- Ensure backend is running

**Images not loading**
- Check Cloudinary URLs in products
- Verify internet connection
- Check Cloudinary account is active

**Cart not saving**
- Check if localStorage is enabled
- Clear browser storage: DevTools > Application > Clear site data

---

## 📈 Performance Tips

### Backend
- Use indexes in MongoDB for frequent queries
- Cache frequently accessed data
- Use pagination for large datasets
- Monitor server logs for errors

### Frontend
- Minimize localStorage usage
- Load images from Cloudinary CDN
- Cache API responses where possible
- Use fetch() efficiently

---

## 🚀 Deployment Checklist

Before deploying:
- [ ] Change JWT_SECRET to random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Set up proper MongoDB backups
- [ ] Configure Cloudinary for production
- [ ] Add rate limiting
- [ ] Enable request validation
- [ ] Set up error logging
- [ ] Test all features
- [ ] Security audit

---

## 📚 Quick Reference

### File Structure
```
backend/
  server.js           - Start here
  package.json        - Dependencies
  .env               - Configuration
  seed.js            - Sample data
  db-init.js         - DB manager

frontend/
  index.html         - Products page
  login.html         - Login page
  admin.html         - Admin panel
  js/config.js       - Configuration
  css/style.css      - Main styles
```

### Key URLs
- Frontend: http://localhost:8000
- Backend: http://localhost:5000
- API: http://localhost:5000/api
- MongoDB: localhost:27017

### Default Ports
- Frontend: 8000 (or 5500 with Live Server)
- Backend: 5000
- MongoDB: 27017

---

## 💡 Best Practices

### Code Organization
- Keep controllers focused
- Separate concerns into different files
- Use middleware for reusable logic
- Document complex functions

### Security
- Never commit `.env` file
- Use environment variables for secrets
- Validate all user input
- Hash passwords with bcrypt
- Use HTTPS in production

### Testing
- Test APIs with Postman/REST Client
- Test frontend in multiple browsers
- Test responsive design
- Check console for errors

---

## 🤝 Contributing

To add features:
1. Create a branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Commit with descriptive messages

---

## 📞 Support

For help:
1. Check README.md
2. Check browser console (F12)
3. Check server logs
4. Review documentation files

---

**Happy developing! 🎉**
