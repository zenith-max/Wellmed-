const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Admin management
router.post('/', auth, adminCheck, couponController.createCoupon);
router.get('/', auth, adminCheck, couponController.listCoupons);
router.put('/:id', auth, adminCheck, couponController.toggleCoupon);

// Public validation
router.get('/validate/:code', couponController.validateCoupon);

module.exports = router;
