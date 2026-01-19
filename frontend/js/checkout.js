// ============== CHECKOUT PAGE ==============

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  loadCheckoutData();
});

const loadCheckoutData = () => {
  const cart = getCart();

  // Render cart items
  const itemsList = document.getElementById('checkoutItemsList');
  let subtotal = 0;

  itemsList.innerHTML = cart
    .map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return `
        <div class="checkout-item">
          <span>${item.productName}</span>
          <span>${item.quantity} × ₹${item.price.toFixed(2)} = ₹${itemTotal.toFixed(2)}</span>
        </div>
      `;
    })
    .join('');

  // Update totals
  const shipping = 50; // Fixed shipping cost
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('checkoutTotal').textContent = total.toFixed(2);

  // Prefill user details if available
  const user = getUser();
  if (user && user.name) {
    document.getElementById('fullName').value = user.name;
  }
};

const handleCheckout = async (event) => {
  event.preventDefault();
  const errorDiv = document.getElementById('checkoutError');
  errorDiv.textContent = '';

  // Get form data
  const fullName = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  const street = document.getElementById('street').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zipCode = document.getElementById('zipCode').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  const cart = getCart();
  const shippingAddress = {
    fullName,
    phone,
    street,
    city,
    state,
    zipCode
  };

  try {
    const response = await ordersAPI.create({
      items: cart,
      shippingAddress,
      paymentMethod
    });

    if (response.success) {
      // Clear cart
      setCart([]);

      // Show success message
      alert('Order placed successfully!\nOrder ID: ' + response.order._id);

      // Redirect to orders page
      window.location.href = 'orders.html';
    } else {
      errorDiv.textContent = response.message || 'Failed to place order';
    }
  } catch (error) {
    errorDiv.textContent = error.message || 'An error occurred while placing the order';
    console.error('Checkout error:', error);
  }
};
