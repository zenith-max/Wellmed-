const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Public routes - anyone can view products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/search/:query', productController.searchProducts);

// Private routes - admin only for CRUD operations
router.post('/', auth, adminCheck, productController.createProduct);
router.put('/:id', auth, adminCheck, productController.updateProduct);
router.delete('/:id', auth, adminCheck, productController.deleteProduct);

module.exports = router;
