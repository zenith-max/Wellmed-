const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
// Local storage setup
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PUBLIC_BASE_URL = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create new product (Admin only)
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Validation
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    let productImageUrl = imageUrl || 'https://via.placeholder.com/300?text=Product+Image';
    let imagePublicId = null;

    // Save image locally if provided
    if (req.file) {
      const ext = path.extname(req.file.originalname || req.file.filename || '') || '.jpg';
      const localName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
      const destPath = path.join(uploadsDir, localName);
      try {
        fs.renameSync(req.file.path, destPath);
        productImageUrl = `${PUBLIC_BASE_URL}/uploads/${localName}`;
        imagePublicId = localName;
      } catch (fileErr) {
        console.warn('Local upload failed, using placeholder:', fileErr.message);
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }

    // Create product with image URL
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl: productImageUrl,
      imagePublicId
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;

    // Update image if provided
    if (req.file) {
      if (product.imagePublicId) {
        const oldPath = path.join(uploadsDir, product.imagePublicId);
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }

      const ext = path.extname(req.file.originalname || req.file.filename || '') || '.jpg';
      const localName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
      const destPath = path.join(uploadsDir, localName);

      try {
        fs.renameSync(req.file.path, destPath);
        product.imageUrl = `${PUBLIC_BASE_URL}/uploads/${localName}`;
        product.imagePublicId = localName;
      } catch (fileErr) {
        console.warn('Local upload failed, keeping previous image:', fileErr.message);
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }

    product.updatedAt = Date.now();
    product = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete local image if stored
    if (product.imagePublicId) {
      const localPath = path.join(uploadsDir, product.imagePublicId);
      try { fs.unlinkSync(localPath); } catch (_) {}
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};
