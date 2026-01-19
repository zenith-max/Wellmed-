const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Create Razorpay order
router.post('/create-order', auth, paymentController.createOrder);

module.exports = router;
