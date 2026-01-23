// ============== PROFILE PAGE ==============

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  loadProfile();
  loadOrders();
});

// Fetch and render user info
const loadProfile = async () => {
  const profileInfo = document.getElementById('profileInfo');
  try {
    const { user } = await authAPI.getMe();
    setUser(user);

    document.getElementById('profileName').textContent = user.name || 'Customer';
    document.getElementById('profileEmail').textContent = user.email || '';
    document.getElementById('profileRole').textContent = user.role ? user.role : 'Member';

    const avatar = document.getElementById('profileAvatar');
    const initial = (user.name || 'M').charAt(0).toUpperCase();
    avatar.textContent = initial;

    profileInfo.innerHTML = `
      <div class="info-tile">
        <p class="label">Full name</p>
        <p class="value">${user.name || '—'}</p>
      </div>
      <div class="info-tile">
        <p class="label">Email</p>
        <p class="value">${user.email || '—'}</p>
      </div>
      <div class="info-tile">
        <p class="label">Role</p>
        <p class="value">${user.role || 'Customer'}</p>
      </div>
    `;
  } catch (error) {
    profileInfo.innerHTML = `<p class="error-message">Unable to load profile. Please log in again.</p>`;
    console.error('Profile load error:', error);
    setTimeout(() => {
      logout();
    }, 1500);
  }
};

// Fetch and render order history
const loadOrders = async () => {
  const ordersList = document.getElementById('ordersList');
  try {
    const response = await ordersAPI.getMyOrders();
    const orders = response.orders || [];

    if (!orders.length) {
      ordersList.innerHTML = '<p>No orders yet.</p>';
      renderStats([]);
      return;
    }

    renderStats(orders);
    ordersList.innerHTML = orders
      .slice(0, 3)
      .map(order => renderOrder(order))
      .join('');
  } catch (error) {
    ordersList.innerHTML = `<p class="error-message">Unable to load orders.</p>`;
    renderStats([]);
    console.error('Orders load error:', error);
  }
};

// Update stat cards based on orders
const renderStats = (orders) => {
  const stats = document.getElementById('profileStats');
  const total = orders.length;
  const delivered = orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length;
  const inProgress = orders.filter(o => {
    const status = (o.status || '').toLowerCase();
    return ['pending', 'processing', 'shipped'].includes(status);
  }).length;
  const spend = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

  stats.innerHTML = `
    <div class="stat-card">
      <p>Orders</p>
      <h3>${total}</h3>
      <span class="stat-subtext">Lifetime orders</span>
    </div>
    <div class="stat-card">
      <p>In progress</p>
      <h3>${inProgress}</h3>
      <span class="stat-subtext">Processing or shipped</span>
    </div>
    <div class="stat-card">
      <p>Delivered</p>
      <h3>${delivered}</h3>
      <span class="stat-subtext">Completed orders</span>
    </div>
    <div class="stat-card">
      <p>Total spend</p>
      <h3>₹${spend.toFixed(2)}</h3>
      <span class="stat-subtext">Across all orders</span>
    </div>
  `;
};

// Render single order block
const renderOrder = (order) => {
  const date = new Date(order.createdAt).toLocaleString();
  const items = order.items.map(item => `
    <li>${item.productName || 'Item'} x${item.quantity} — ₹${item.price}</li>
  `).join('');

  return `
    <div class="order-card order-card-compact">
      <div class="order-card-header">
        <div>
          <p class="muted">Order #${order._id}</p>
          <p class="order-date">${date}</p>
        </div>
        <div class="order-badges">
          <span class="badge">${order.status}</span>
          <span class="badge badge-secondary">₹${order.totalPrice}</span>
        </div>
      </div>
      <ul class="order-items">${items}</ul>
    </div>
  `;
};

// Logout helper
const logout = () => {
  removeToken();
  removeUser();
  setCart([]);
  window.location.href = 'login.html';
};
