const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const multer = require('multer');
const path = require('path');

// Configure Multer to store in backend/uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname || '');
		cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext || '.jpg'}`);
	}
});

const upload = multer({ storage });

// Public routes - anyone can view products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/search/:query', productController.searchProducts);

// Private routes - admin only for CRUD operations
router.post('/', auth, adminCheck, upload.single('image'), productController.createProduct);
router.put('/:id', auth, adminCheck, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, adminCheck, productController.deleteProduct);

module.exports = router;
