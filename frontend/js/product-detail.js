// ============== PRODUCT DETAIL PAGE ==============

let cart = [];
let currentProduct = null;
let currentProductId = null;

const getDiscountedPrice = (product) => {
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPercent) || 0;
  const discounted = price * (1 - discount / 100);
  return Math.max(0, Number(discounted.toFixed(2)));
};

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  loadProductDetail();
  setupEventListeners();
});

const setupEventListeners = () => {
  document.getElementById('cartIcon').addEventListener('click', showCart);
  document.getElementById('userMenu').addEventListener('click', goToProfile);
};

// Get product ID from URL
const getProductIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

// Load product details
const loadProductDetail = async () => {
  const productId = getProductIdFromURL();
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }
  currentProductId = productId;

  const container = document.getElementById('productDetailContainer');
  
  try {
    const response = await productsAPI.getById(productId);
    const apiProduct = response.product;
    const storedReviews = getStoredReviews(productId);
    const mergedReviews = mergeReviews(apiProduct.reviews, storedReviews);
    currentProduct = { ...apiProduct, reviews: mergedReviews };
    renderProductDetail(currentProduct);
  } catch (error) {
    container.innerHTML = '<p class="error-message">Error loading product details. <a href="index.html">Go back</a></p>';
    console.error('Error loading product:', error);
  }
};

// Render product detail
const renderProductDetail = (product) => {
  const container = document.getElementById('productDetailContainer');
  const galleryImages = (product.images && product.images.length ? product.images : [product.imageUrl]).filter(Boolean);
  const mainImage = galleryImages[0] || 'https://via.placeholder.com/500x500?text=Image+Not+Available';
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const ratingValue = computeAverageRating(reviews, product.rating);
  const ratingLabel = ratingValue ? ratingValue.toFixed(1) : 'No ratings yet';

  container.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-media">
        <div class="product-detail-thumbs">
          ${galleryImages.map((img, idx) => `
            <button class="product-detail-thumb ${idx === 0 ? 'active' : ''}" data-img="${img}" aria-label="View image ${idx + 1}">
              <img src="${img}" alt="${product.name} thumbnail ${idx + 1}" onerror="this.src='https://via.placeholder.com/200x200?text=Image'">
            </button>
          `).join('')}
        </div>
        <div class="product-detail-image">
          <img id="productMainImage" src="${mainImage}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500x500?text=Image+Not+Available'">
        </div>
      </div>
      
      <div class="product-detail-info">
        <div class="product-detail-header">
          <h1>${product.name}</h1>
          <div class="product-badge">${product.category}</div>
          <div class="product-rating-summary">
            <span class="rating-stars">${ratingValue ? '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue)) : '☆☆☆☆☆'}</span>
            <span class="rating-value">${ratingLabel}</span>
            ${reviews.length ? `<span class="rating-count">(${reviews.length} review${reviews.length === 1 ? '' : 's'})</span>` : ''}
          </div>
        </div>
        
        <div class="product-detail-price">
          <span class="price-label">Price:</span>
          ${Number(product.discountPercent || 0) > 0
            ? `<div class="price-stack"><span class="price-new">₹${getDiscountedPrice(product).toFixed(2)}</span><span class="price-old">₹${product.price.toFixed(2)}</span><span class="discount-chip">Save ₹${(product.price - getDiscountedPrice(product)).toFixed(2)} (${product.discountPercent}% off)</span></div>`
            : `<span class="price-value">₹${product.price.toFixed(2)}</span>`}
        </div>
        
        <div class="product-detail-stock">
          <span class="stock-label">Availability:</span>
          <span class="stock-value ${product.stock < 10 ? 'low-stock' : ''}">
            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </span>
        </div>

        <div class="product-detail-description">
          <h3>Description</h3>
          <p>${product.description}</p>
        </div>
        
        <div class="product-detail-actions">
          <button class="btn btn-primary btn-large" 
                  onclick="addToCartFromDetail('${product._id}', '${product.name}', ${getDiscountedPrice(product)})"
                  ${product.stock === 0 ? 'disabled' : ''}>
            ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button class="btn btn-secondary btn-large" onclick="window.location.href='index.html'">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>

    <div class="product-reviews">
      <div class="reviews-header">
        <h3>Customer Reviews</h3>
        <button class="btn btn-secondary btn-small" id="showReviewFormBtn">Add Review</button>
      </div>
      <div id="reviewList"></div>
      <form id="reviewForm" class="review-form" style="display:none;">
        <div class="form-row">
          <div class="form-group">
            <label for="reviewName">Name</label>
            <input type="text" id="reviewName" required placeholder="Your name">
          </div>
          <div class="form-group">
            <label for="reviewRating">Rating</label>
            <select id="reviewRating" required>
              <option value="">Select</option>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="reviewComment">Review</label>
          <textarea id="reviewComment" rows="3" required placeholder="Share your experience"></textarea>
        </div>
        <div class="form-buttons" style="margin-top:0;">
          <button type="submit" class="btn btn-primary">Submit Review</button>
          <button type="button" class="btn btn-secondary" id="cancelReviewBtn">Cancel</button>
        </div>
      </form>
    </div>
  `;

  wireGalleryClicks();
  renderReviews(reviews);
  wireReviewForm();
};

const wireGalleryClicks = () => {
  const mainImg = document.getElementById('productMainImage');
  const thumbs = document.querySelectorAll('.product-detail-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-img');
      if (url) {
        mainImg.src = url;
      }
      thumbs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
};

const renderReviews = (reviews) => {
  const list = document.getElementById('reviewList');
  if (!list) return;
  if (!reviews || reviews.length === 0) {
    list.innerHTML = '<p class="muted">No reviews yet.</p>';
    return;
  }

  list.innerHTML = reviews
    .map((rev) => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${rev.author || 'Anonymous'}</span>
          ${rev.rating ? `<span class="review-stars">${'★'.repeat(Math.round(rev.rating))}${'☆'.repeat(5 - Math.round(rev.rating))}</span>` : ''}
        </div>
        <p class="review-text">${rev.comment || ''}</p>
      </div>
    `)
    .join('');
};

const wireReviewForm = () => {
  const showBtn = document.getElementById('showReviewFormBtn');
  const form = document.getElementById('reviewForm');
  const cancelBtn = document.getElementById('cancelReviewBtn');
  if (!showBtn || !form || !cancelBtn) return;

  const toggleForm = (show) => {
    form.style.display = show ? 'block' : 'none';
  };

  showBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const rating = Number(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    if (!name || !rating || !comment) return;

    const newReview = {
      author: name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    const existing = Array.isArray(currentProduct.reviews) ? currentProduct.reviews : [];
    const updated = [newReview, ...existing];
    currentProduct.reviews = updated;
    saveReviews(currentProductId, updated);
    renderReviews(updated);
    updateRatingSummary();

    form.reset();
    toggleForm(false);
  });
};

const updateRatingSummary = () => {
  const summaryEl = document.querySelector('.product-rating-summary');
  if (!summaryEl) return;
  const reviews = Array.isArray(currentProduct.reviews) ? currentProduct.reviews : [];
  const ratingValue = computeAverageRating(reviews, currentProduct.rating);
  const ratingLabel = ratingValue ? ratingValue.toFixed(1) : 'No ratings yet';
  summaryEl.innerHTML = `
    <span class="rating-stars">${ratingValue ? '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue)) : '☆☆☆☆☆'}</span>
    <span class="rating-value">${ratingLabel}</span>
    ${reviews.length ? `<span class="rating-count">(${reviews.length} review${reviews.length === 1 ? '' : 's'})</span>` : ''}
  `;
};

const computeAverageRating = (reviews, fallback) => {
  if (reviews && reviews.length) {
    const rated = reviews.filter(r => typeof r.rating === 'number');
    if (rated.length) {
      const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
      return avg;
    }
  }
  return fallback ? Number(fallback) : null;
};

const getStoredReviews = (productId) => {
  try {
    const raw = localStorage.getItem(`reviews_${productId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveReviews = (productId, reviews) => {
  try {
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Unable to save reviews', e);
  }
};

const mergeReviews = (apiReviews, stored) => {
  const base = Array.isArray(apiReviews) ? apiReviews : [];
  const local = Array.isArray(stored) ? stored : [];
  // prepend local reviews so user-added show first
  return [...local, ...base];
};

// Add to cart from detail page
const addToCartFromDetail = (productId, productName, price) => {
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId,
      productName,
      price,
      quantity: 1
    });
  }

  setCart(cart);
  updateCartCount();
  showNotification(`${productName} added to cart!`);
};

// Cart functions
const loadCart = () => {
  cart = getCart();
  updateCartCount();
};

const updateCartCount = () => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
};

const showCart = () => {
  const modal = document.getElementById('cartModal');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalDiv = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="empty-message">Your cart is empty</p>';
    cartTotalDiv.textContent = '0';
    document.getElementById('checkoutBtn').disabled = true;
  } else {
    let total = 0;
    cartItemsDiv.innerHTML = cart
      .map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
          <div class="cart-item">
            <div>
              <h4>${item.productName}</h4>
              <p>₹${item.price} × ${item.quantity} = ₹${itemTotal.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
              <button onclick="updateCartQuantity(${index}, -1)">−</button>
              <span>${item.quantity}</span>
              <button onclick="updateCartQuantity(${index}, 1)">+</button>
              <button class="btn-danger" onclick="removeFromCart(${index})" aria-label="Remove ${item.productName} from cart">Delete</button>
            </div>
          </div>
        `;
      })
      .join('');

    cartTotalDiv.textContent = total.toFixed(2);
    document.getElementById('checkoutBtn').disabled = false;
  }

  modal.style.display = 'block';
};

const closeCart = () => {
  document.getElementById('cartModal').style.display = 'none';
};

const updateCartQuantity = (index, delta) => {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  setCart(cart);
  updateCartCount();
  showCart();
};

const removeFromCart = (index) => {
  cart.splice(index, 1);
  setCart(cart);
  updateCartCount();
  showCart();
};

const checkout = () => {
  if (!isLoggedIn()) {
    alert('Please login to proceed with checkout');
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'checkout.html';
};

const goToProfile = () => {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'profile.html';
};

const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  requestAnimationFrame(() => notification.classList.add('show'));

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 250);
  }, 3000);
};
