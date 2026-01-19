// ============== ORDERS PAGE ==============

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  loadMyOrders();
});

const loadMyOrders = async () => {
  try {
    const response = await ordersAPI.getMyOrders();
    const orders = response.orders || [];

    const container = document.getElementById('ordersContainer');

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a href="index.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders
      .map(order => `
        <div class="order-card">
          <div class="order-header">
            <h3>Order #${order._id.substring(0, 8)}</h3>
            <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
          </div>
          <div class="order-details">
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Total: ₹${order.totalPrice.toFixed(2)}</p>
            <p>Items: ${order.items.length}</p>
          </div>
          <div class="order-actions">
            <button class="btn btn-secondary" onclick="viewOrderDetails('${order._id}')">View Details</button>
            ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
              <button class="btn btn-danger" onclick="cancelOrder('${order._id}')">Cancel Order</button>
            ` : ''}
          </div>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('ordersContainer').innerHTML =
      '<p class="error-message">Failed to load orders</p>';
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
          <td>₹${item.price.toFixed(2)}</td>
          <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const html = `
      <div class="order-details-content">
        <h3>Order #${order._id}</h3>
        <p class="order-status ${order.status}">Status: ${order.status.toUpperCase()}</p>

        <h4>Items</h4>
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
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
          Phone: ${order.shippingAddress.phone}
        </p>

        <div class="order-summary">
          <p>Payment Method: ${order.paymentMethod}</p>
          <p><strong>Total Amount: ₹${order.totalPrice.toFixed(2)}</strong></p>
        </div>
      </div>
    `;

    document.getElementById('orderDetailsContent').innerHTML = html;
    document.getElementById('orderDetailsModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading order details:', error);
    alert('Failed to load order details');
  }
};

const cancelOrder = async (orderId) => {
  if (!confirm('Are you sure you want to cancel this order?')) {
    return;
  }

  try {
    await ordersAPI.cancel(orderId);
    alert('Order cancelled successfully');
    loadMyOrders();
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert('Failed to cancel order: ' + error.message);
  }
};

const closeOrderDetails = () => {
  document.getElementById('orderDetailsModal').style.display = 'none';
};
