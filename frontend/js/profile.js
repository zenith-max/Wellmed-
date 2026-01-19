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

    profileInfo.innerHTML = `
      <div class="profile-row"><strong>Name:</strong> <span>${user.name}</span></div>
      <div class="profile-row"><strong>Email:</strong> <span>${user.email}</span></div>
      <div class="profile-row"><strong>Role:</strong> <span>${user.role}</span></div>
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
      return;
    }

    ordersList.innerHTML = orders.map(order => renderOrder(order)).join('');
  } catch (error) {
    ordersList.innerHTML = `<p class="error-message">Unable to load orders.</p>`;
    console.error('Orders load error:', error);
  }
};

// Render single order block
const renderOrder = (order) => {
  const date = new Date(order.createdAt).toLocaleString();
  const items = order.items.map(item => `
    <li>${item.productName || 'Item'} x${item.quantity} — ₹${item.price}</li>
  `).join('');

  return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${date}</p>
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
