const Setting = require('../models/Setting');

const DEFAULT_SHIPPING_CHARGE = Number(process.env.DEFAULT_SHIPPING_CHARGE || 50);

const getShippingChargeValue = async () => {
  let setting = await Setting.findOne({ key: 'shippingCharge' });
  if (!setting) {
    setting = await Setting.create({ key: 'shippingCharge', value: DEFAULT_SHIPPING_CHARGE });
  }
  const value = Number(setting.value);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_SHIPPING_CHARGE;
};

exports.getShippingCharge = async (_req, res) => {
  try {
    const shippingCharge = await getShippingChargeValue();
    return res.status(200).json({ success: true, shippingCharge });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping charge',
      error: error.message
    });
  }
};

exports.updateShippingCharge = async (req, res) => {
  try {
    const { shippingCharge } = req.body;
    const value = Number(shippingCharge);

    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid shipping charge (number >= 0)'
      });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'shippingCharge' },
      { value },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Shipping charge updated',
      shippingCharge: Number(setting.value)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update shipping charge',
      error: error.message
    });
  }
};

exports.getShippingChargeValue = getShippingChargeValue;
