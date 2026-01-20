const express = require('express');
const router = express.Router();
const { getShippingCharge, updateShippingCharge } = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Public: fetch current shipping charge
router.get('/shipping', getShippingCharge);

// Admin: update shipping charge
router.put('/shipping', auth, adminCheck, updateShippingCharge);

module.exports = router;
