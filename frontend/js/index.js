// ============== GLOBAL VARIABLES ==============
let allProducts = [];
let filteredProducts = [];
let cart = [];

const getDiscountedPrice = (product) => {
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPercent) || 0;
  const discounted = price * (1 - discount / 100);
  return Math.max(0, Number(discounted.toFixed(2)));
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateUserMenu();
  loadCart();
  setupEventListeners();
});

// ============== FILTER DROPDOWN ==============
const toggleFilters = () => {
  const filterDropdown = document.getElementById('filterDropdown');
  filterDropdown.classList.toggle('active');
};

const closeFilters = () => {
  const filterDropdown = document.getElementById('filterDropdown');
  filterDropdown.classList.remove('active');
};

const applyFilters = () => {
  // Apply category filter
  const selectedCategory = document.querySelector('input[name="category"]:checked').value;
  if (selectedCategory) {
    filteredProducts = allProducts.filter(p => p.category === selectedCategory);
  } else {
    filteredProducts = [...allProducts];
  }
  
  // Apply price filter
  const maxPrice = parseInt(document.getElementById('priceRange').value);
  filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  
  // Render results and close dropdown
  renderProducts();
  closeFilters();
};

// ============== EVENT LISTENERS ==============
const setupEventListeners = () => {
  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      searchProducts(query);
    } else {
      loadProducts();
    }
  });

  // Category filter - removed auto-apply
  // Price range slider update display only
  document.getElementById('priceRange').addEventListener('input', (e) => {
    document.getElementById('priceValue').textContent = e.target.value;
  });

  // Filter toggle button
  document.getElementById('filterToggle').addEventListener('click', toggleFilters);

  // Cart icon click
  document.getElementById('cartIcon').addEventListener('click', showCart);

  // Profile icon click -> go to profile or login
  document.getElementById('userMenu').addEventListener('click', goToProfile);

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const filterDropdown = document.getElementById('filterDropdown');
    const userMenu = document.getElementById('userMenu');
    const filterToggle = document.getElementById('filterToggle');

    if (!dropdown.contains(e.target) && !userMenu.contains(e.target)) {
      dropdown.style.display = 'none';
    }

    if (!filterDropdown.contains(e.target) && !filterToggle.contains(e.target)) {
      filterDropdown.classList.remove('active');
    }
  });
};

// ============== LOAD PRODUCTS ==============
const loadProducts = async () => {
  try {
    const response = await productsAPI.getAll();
    allProducts = response.products || [];
    filteredProducts = [...allProducts];
    renderProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('productsGrid').innerHTML =
      '<p class="error-message">Failed to load products. Please try again.</p>';
  }
};

// ============== SEARCH PRODUCTS ==============
const searchProducts = async (query) => {
  try {
    const response = await productsAPI.search(query);
    filteredProducts = response.products || [];
    renderProducts();
  } catch (error) {
    console.error('Error searching products:', error);
    filteredProducts = [];
    renderProducts();
  }
};

// ============== FILTER BY CATEGORY ==============
const filterByCategory = (e) => {
  const category = e.target.value;
  if (category) {
    filteredProducts = allProducts.filter(p => p.category === category);
  } else {
    filteredProducts = [...allProducts];
  }
  filterByPrice();
};

// ============== FILTER BY PRICE ==============
const filterByPrice = () => {
  const maxPrice = parseInt(document.getElementById('priceRange').value);
  filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  renderProducts();
};

// ============== RENDER PRODUCTS ==============
const renderProducts = () => {
  const grid = document.getElementById('productsGrid');

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p class="no-products">No products found.</p>';
    return;
  }

  grid.innerHTML = filteredProducts
    .map(product => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23eee%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E'">
          <div class="product-badge">${product.category}</div>
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description.substring(0, 60)}...</p>
          <div class="product-footer">
            ${Number(product.discountPercent || 0) > 0
              ? `<div class="price-wrap"><span class="price-new">₹${getDiscountedPrice(product).toFixed(2)}</span><span class="price-old">₹${product.price.toFixed(2)}</span></div><span class="discount-chip">Save ₹${(product.price - getDiscountedPrice(product)).toFixed(2)} (${product.discountPercent}% off)</span>`
              : `<span class="price">₹${product.price.toFixed(2)}</span>`}
            ${product.stock === 0
              ? '<span class="stock-chip stock-out">Out of stock</span>'
              : product.stock < 10
                ? '<span class="stock-chip stock-low">Low stock</span>'
                : ''}
          </div>
          <div class="product-actions">
            <button class="btn btn-secondary btn-small" onclick="viewProductDetails('${product._id}')">
              View Details
            </button>
            <button class="btn btn-primary btn-small" onclick="addToCart('${product._id}', '${product.name}', ${getDiscountedPrice(product)})"
                    ${product.stock === 0 ? 'disabled' : ''}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `)
    .join('');
};

// ============== ADD TO CART ==============
const addToCart = (productId, productName, price) => {
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

// ============== VIEW PRODUCT DETAILS ==============
const viewProductDetails = (productId) => {
  window.location.href = `product-detail.html?id=${productId}`;
};

// ============== CART FUNCTIONS ==============
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
              <button onclick="removeFromCart(${index})" class="btn-danger">Delete</button>
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

const updateCartQuantity = (index, change) => {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    setCart(cart);
    updateCartCount();
    showCart();
  }
};

const removeFromCart = (index) => {
  cart.splice(index, 1);
  setCart(cart);
  updateCartCount();
  showCart();
};

const closeCart = () => {
  document.getElementById('cartModal').style.display = 'none';
};

const checkout = () => {
  if (!isLoggedIn()) {
    alert('Please login to proceed with checkout');
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'checkout.html';
};

// ============== USER MENU ==============
const updateUserMenu = () => {
  const userLoggedIn = document.getElementById('userLoggedIn');
  const userLoggedOut = document.getElementById('userLoggedOut');
  const user = getUser();

  if (isLoggedIn() && user) {
    userLoggedOut.style.display = 'none';
    userLoggedIn.style.display = 'block';
    document.getElementById('userName').textContent = `Welcome, ${user.name}!`;
  } else {
    userLoggedOut.style.display = 'block';
    userLoggedIn.style.display = 'none';
  }
};

const goToProfile = () => {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'profile.html';
};

const goToOrders = () => {
  window.location.href = 'orders.html';
};

const goToAdmin = () => {
  if (!isAdmin()) {
    alert('Admin access required');
    return;
  }
  window.location.href = 'admin.html';
};

const logout = () => {
  removeToken();
  removeUser();
  setCart([]);
  alert('Logged out successfully');
  window.location.href = 'index.html';
};

// ============== UTILITY FUNCTIONS ==============
const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};
