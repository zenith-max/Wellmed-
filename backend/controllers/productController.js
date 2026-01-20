const Product = require('../models/Product');
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

    // Normalize image URLs so frontend gets absolute paths
    const normalized = products.map((p) => {
      const obj = p.toObject();
      if (obj.imageUrl && !/^https?:\/\//i.test(obj.imageUrl)) {
        obj.imageUrl = `${PUBLIC_BASE_URL}${obj.imageUrl.startsWith('/') ? '' : '/'}${obj.imageUrl}`;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      products: normalized
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
    const { name, description, price, category, stock, imageUrl, imagePublicId } = req.body;

    // Validation
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a Cloudinary image URL'
      });
    }

    const normalizedUrl = imageUrl.trim();
    const isCloudinary = /cloudinary\.com/i.test(normalizedUrl);
    if (!isCloudinary) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a Cloudinary URL'
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl: normalizedUrl,
      imagePublicId: imagePublicId || null
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
    const { name, description, price, category, stock, imageUrl, imagePublicId } = req.body;
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

    // Update image URL if provided (must be Cloudinary)
    if (imageUrl) {
      if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a non-empty string'
        });
      }
      const normalizedUrl = imageUrl.trim();
      const isCloudinary = /cloudinary\.com/i.test(normalizedUrl);
      if (!isCloudinary) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a Cloudinary URL'
        });
      }
      product.imageUrl = normalizedUrl;
      if (imagePublicId !== undefined) {
        product.imagePublicId = imagePublicId || null;
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
