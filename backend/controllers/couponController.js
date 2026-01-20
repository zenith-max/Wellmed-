const Coupon = require('../models/Coupon');

const normalizeCode = (code) => (code || '').trim().toUpperCase();

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiresAt, isActive } = req.body;
    const normalizedCode = normalizeCode(code);
    const discount = Number(discountPercent);

    if (!normalizedCode) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({ success: false, message: 'Discount percent must be between 0 and 100' });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountPercent: discount,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return res.status(201).json({ success: true, coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating coupon' });
  }
};

exports.listCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching coupons' });
  }
};

exports.toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);
    coupon.updatedAt = new Date();
    await coupon.save();
    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error updating coupon' });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const code = normalizeCode(req.params.code);
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon' });
    if (!coupon.isActive) return res.status(400).json({ success: false, message: 'Coupon is inactive' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    return res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        expiresAt: coupon.expiresAt,
        isActive: coupon.isActive
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error validating coupon' });
  }
};
