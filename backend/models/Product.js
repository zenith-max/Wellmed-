const mongoose = require('mongoose');

// Product Schema for surgical materials
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide product description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0
  },
  category: {
    type: String,
    enum: ['surgical-gloves', 'masks', 'syringes', 'bandages', 'sterilization', 'instruments', 'protective-wear'],
    required: [true, 'Please provide product category']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String, // Store Cloudinary URL
    required: [true, 'Please provide product image']
  },
  imagePublicId: {
    type: String // Store for deletion from Cloudinary
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      comment: String,
      rating: Number,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
