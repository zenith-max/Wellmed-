// ============== ADMIN PAGE ==============

let allAdminProducts = [];
let allAdminOrders = [];
let salesChart = null;
let dashboardOrders = [];
let salesChartRange = 14;
let salesChartType = 'bar';
let salesChartGrouping = 'day';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is admin
  if (!isAdmin()) {
    alert('Admin access required');
    window.location.href = 'admin-login.html';
    return;
  }

  // Wire chart controls
  const groupingSelect = document.getElementById('salesGroupingSelect');
  const rangeSelect = document.getElementById('salesRangeSelect');
  const typeSelect = document.getElementById('salesChartTypeSelect');

  const updateRangeOptions = (grouping, keepCurrent) => {
    if (!rangeSelect) return;
    const opts = grouping === 'day' ? [7, 14, 30] : [3, 6, 12];
    let nextRange = keepCurrent && opts.includes(salesChartRange)
      ? salesChartRange
      : grouping === 'day' ? 14 : 6;

    rangeSelect.innerHTML = opts
      .map(v => {
        const label = grouping === 'day' ? `Last ${v} days` : `Last ${v} months`;
        const selected = v === nextRange ? 'selected' : '';
        return `<option value="${v}" ${selected}>${label}</option>`;
      })
      .join('');

    salesChartRange = nextRange;
  };

  if (groupingSelect) {
    salesChartGrouping = groupingSelect.value || 'day';
    groupingSelect.addEventListener('change', (e) => {
      salesChartGrouping = e.target.value || 'day';
      updateRangeOptions(salesChartGrouping, false);
      renderSalesChart(dashboardOrders);
    });
  }

  if (rangeSelect) {
    updateRangeOptions(salesChartGrouping, true);
    salesChartRange = Number(rangeSelect.value) || salesChartRange;
    rangeSelect.addEventListener('change', (e) => {
      salesChartRange = Number(e.target.value) || salesChartRange;
      renderSalesChart(dashboardOrders);
    });
  }

  if (typeSelect) {
    salesChartType = typeSelect.value || 'bar';
    typeSelect.addEventListener('change', (e) => {
      salesChartType = e.target.value || 'bar';
      renderSalesChart(dashboardOrders);
    });
  }

  // Load initial data
  loadDashboard();
  loadAdminProducts();
  loadAdminOrders();
  loadShippingCharge();
});

// ============== SECTION NAVIGATION ==============
const showSection = (sectionId) => {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all links
  document.querySelectorAll('.admin-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show selected section
  document.getElementById(sectionId).classList.add('active');

  // Add active class to clicked link
  event.target.classList.add('active');

  // Reload section data
  if (sectionId === 'products') {
    loadAdminProducts();
  } else if (sectionId === 'orders') {
    loadAdminOrders();
  }
};

// ============== SETTINGS (SHIPPING) ==============
const loadShippingCharge = async () => {
  const input = document.getElementById('shippingChargeInput');
  const message = document.getElementById('shippingMessage');
  if (!input) return;

  try {
    const res = await settingsAPI.getShipping();
    if (res && res.success && typeof res.shippingCharge === 'number') {
      input.value = res.shippingCharge;
      if (message) {
        message.textContent = `Current shipping charge: ₹${res.shippingCharge}`;
      }
    }
  } catch (error) {
    if (message) {
      message.textContent = 'Could not load shipping charge. Using default.';
      message.style.color = '#c0392b';
    }
  }
};

const updateShippingCharge = async (event) => {
  event.preventDefault();
  const input = document.getElementById('shippingChargeInput');
  const message = document.getElementById('shippingMessage');
  if (!input) return;

  const value = Number(input.value);
  if (!Number.isFinite(value) || value < 0) {
    if (message) {
      message.textContent = 'Enter a valid non-negative amount.';
      message.style.color = '#c0392b';
    }
    return;
  }

  try {
    if (message) {
      message.textContent = 'Saving...';
      message.style.color = '#0f4c81';
    }
    const res = await settingsAPI.updateShipping(value);
    if (res && res.success) {
      if (message) {
        message.textContent = `Shipping charge updated to ₹${res.shippingCharge}`;
        message.style.color = '#0f4c81';
      }
    }
  } catch (error) {
    if (message) {
      message.textContent = error.message || 'Failed to update shipping charge';
      message.style.color = '#c0392b';
    }
  }
};

// ============== DASHBOARD ==============
const loadDashboard = async () => {
  try {
    // Load products for stats
    const productsResponse = await productsAPI.getAll();
    const products = productsResponse.products || [];

    // Load orders for stats
    const ordersResponse = await ordersAPI.getAllOrders();
    const orders = ordersResponse.orders || [];
    dashboardOrders = orders;

    // Calculate stats
    const lowStockCount = products.filter(p => p.stock < 10).length;

    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('lowStockItems').textContent = lowStockCount;

    renderSalesChart(dashboardOrders);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
};

// ============== SALES CHART ==============
const renderSalesChart = (orders) => {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;

  // Exclude cancelled orders from revenue stats
  const sourceOrders = Array.isArray(orders)
    ? orders.filter(o => (o.status || '').toLowerCase() !== 'cancelled')
    : [];

  // Group revenue by day or month
  const now = new Date();
  const buckets = [];

  if (salesChartGrouping === 'day') {
    const days = Math.max(1, Math.min(90, Number(salesChartRange) || 14));
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      buckets.push({ key, label, total: 0 });
    }
  } else {
    const months = Math.max(1, Math.min(12, Number(salesChartRange) || 6));
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${d.toLocaleString('en', { month: 'short' })} '${String(d.getFullYear()).slice(-2)}`;
      buckets.push({ key, label, total: 0 });
    }
  }

  sourceOrders.forEach(order => {
    if (!order.createdAt || order.totalPrice == null) return;
    const d = new Date(order.createdAt);
    let key;
    if (salesChartGrouping === 'day') {
      d.setHours(0, 0, 0, 0);
      key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    } else {
      key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    }
    const bucket = buckets.find(b => b.key === key);
    if (bucket) {
      bucket.total += Number(order.totalPrice) || 0;
    }
  });

  const labels = buckets.map(b => b.label);
  const data = buckets.map(b => Number(b.total.toFixed(2)));

  const titleEl = document.getElementById('salesChartTitle');
  if (titleEl) {
    const span = salesChartGrouping === 'day' ? salesChartRange : buckets.length;
    const unit = salesChartGrouping === 'day' ? 'day' : 'month';
    titleEl.textContent = `Sales (last ${span} ${unit}${span === 1 ? '' : 's'})`;
  }

  // Recreate chart if type changed
  if (salesChart && salesChart.config.type !== salesChartType) {
    salesChart.destroy();
    salesChart = null;
  }

  if (salesChart) {
    salesChart.data.labels = labels;
    salesChart.data.datasets[0].data = data;
    salesChart.update();
    return;
  }

  salesChart = new Chart(ctx, {
    type: salesChartType,
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data,
          backgroundColor: 'rgba(15, 76, 129, 0.2)',
          borderColor: '#0f4c81',
          borderWidth: 2,
          borderRadius: 6,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `₹${ctx.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `₹${value}`
          }
        }
      }
    }
  });
};

// ============== PRODUCTS MANAGEMENT ==============
const loadAdminProducts = async () => {
  try {
    const response = await productsAPI.getAll();
    allAdminProducts = response.products || [];
    renderProductsTable();
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('productsTableBody').innerHTML =
      '<tr><td colspan="6" class="text-center">Error loading products</td></tr>';
  }
};

const renderProductsTable = () => {
  const tbody = document.getElementById('productsTableBody');

  if (allAdminProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = allAdminProducts
    .map(product => `
      <tr>
        <td>
          <img src="${product.imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        </td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>₹${product.price.toFixed(2)}</td>
        <td><span class="${product.stock < 10 ? 'low-stock' : ''}">${product.stock}</span></td>
        <td>
          <button class="btn btn-secondary btn-small" onclick="editProduct('${product._id}')">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteProduct('${product._id}')">Delete</button>
        </td>
      </tr>
    `)
    .join('');
};

const showAddProductForm = () => {
  document.getElementById('productForm').style.display = 'block';
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('productId').value = '';
  document.querySelector('#productForm form').reset();
  const imgUrlInput = document.getElementById('productImageUrl');
  if (imgUrlInput) imgUrlInput.value = '';
  document.getElementById('imagePreview').innerHTML = '';
};

const hideAddProductForm = () => {
  document.getElementById('productForm').style.display = 'none';
};

const editProduct = async (productId) => {
  try {
    const response = await productsAPI.getById(productId);
    const product = response.product;

    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category;
    const imgUrlInput = document.getElementById('productImageUrl');
    if (imgUrlInput) imgUrlInput.value = product.imageUrl || '';

    // Show image preview
    document.getElementById('imagePreview').innerHTML = `
      <img src="${product.imageUrl}" style="max-width: 200px; margin-top: 10px;">
    `;

    document.getElementById('productForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Edit Product';
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product');
  }
};

const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    await productsAPI.delete(productId);
    alert('Product deleted successfully');
    loadAdminProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product: ' + error.message);
  }
};

const handleProductSubmit = async (event) => {
  event.preventDefault();
  const formError = document.getElementById('formError');
  formError.textContent = '';

  const productId = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const stock = document.getElementById('productStock').value;
  const category = document.getElementById('productCategory').value;
  const imageUrl = document.getElementById('productImageUrl').value.trim();

  const payload = { name, description, price, stock, category, imageUrl };

  try {
    let response;
    if (productId) {
      response = await productsAPI.update(productId, payload);
      alert('Product updated successfully');
    } else {
      response = await productsAPI.create(payload);
      alert('Product created successfully');
    }

    hideAddProductForm();
    loadAdminProducts();
  } catch (error) {
    formError.textContent = error.message || 'Failed to save product';
    console.error('Error saving product:', error);
  }
};

// Image preview for Cloudinary URL
document.addEventListener('input', function(e) {
  if (e.target.id === 'productImageUrl') {
    const url = e.target.value.trim();
    if (url) {
      document.getElementById('imagePreview').innerHTML = `<img src="${url}" style="max-width: 200px;">`;
    } else {
      document.getElementById('imagePreview').innerHTML = '';
    }
  }
});

// ============== ORDERS MANAGEMENT ==============
const loadAdminOrders = async () => {
  try {
    const response = await ordersAPI.getAllOrders();
    allAdminOrders = response.orders || [];
    renderOrdersTable();
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('ordersTableBody').innerHTML =
      '<tr><td colspan="6" class="text-center">Error loading orders</td></tr>';
  }
};

const renderOrdersTable = () => {
  const tbody = document.getElementById('ordersTableBody');

  if (allAdminOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = allAdminOrders
    .map(order => `
      <tr>
        <td>${order._id.substring(0, 8)}...</td>
        <td>${order.userId?.name || 'Unknown'}</td>
        <td>₹${order.totalPrice.toFixed(2)}</td>
        <td>
          <select onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-secondary btn-small" onclick="viewOrderDetails('${order._id}')">View</button>
        </td>
      </tr>
    `)
    .join('');
};

const updateOrderStatus = async (orderId, status) => {
  try {
    await ordersAPI.updateStatus(orderId, status);
    alert('Order status updated');
    loadAdminOrders();
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to update order status');
  }
};

const viewOrderDetails = async (orderId) => {
  try {
    const response = await ordersAPI.getById(orderId);
    const order = response.order;

    let itemsHtml = order.items
      .map(item => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const html = `
      <div class="order-details">
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${order.userId?.name || 'Unknown'}</p>
        <p><strong>Email:</strong> ${order.userId?.email || 'N/A'}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalPrice.toFixed(2)}</p>

        <h4>Items Ordered</h4>
        <table class="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <h4>Shipping Address</h4>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
          ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
          Phone: ${order.shippingAddress.phone}
        </p>

        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>
    `;

    document.getElementById('orderDetailsContent').innerHTML = html;
    document.getElementById('orderModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading order details:', error);
    alert('Failed to load order details');
  }
};

const closeOrderModal = () => {
  document.getElementById('orderModal').style.display = 'none';
};

// Logout
const logout = () => {
  if (confirm('Are you sure you want to logout?')) {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
  }
};
