const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Private routes - require authentication
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getMyOrders);
router.get('/single/:id', auth, orderController.getOrderById);
router.delete('/:id', auth, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', auth, adminCheck, orderController.getAllOrders);
router.put('/:id', auth, adminCheck, orderController.updateOrderStatus);

module.exports = router;
