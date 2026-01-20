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

let checkoutState = {
  subtotal: 0,
  shipping: 50,
  discount: 0,
  coupon: null
};

const loadCheckoutData = async () => {
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

  // Fetch shipping charge (fallback to 50 on error)
  let shipping = 50;
  try {
    const response = await settingsAPI.getShipping();
    if (response && response.success && typeof response.shippingCharge === 'number') {
      shipping = response.shippingCharge;
    }
  } catch (err) {
    console.warn('Unable to load shipping charge, using default 50', err.message || err);
  }

  checkoutState = { subtotal, shipping, discount: 0, coupon: null };
  updateTotals();

  // Prefill user details if available
  const user = getUser();
  if (user && user.name) {
    document.getElementById('fullName').value = user.name;
  }
};

const updateTotals = () => {
  const { subtotal, shipping, discount } = checkoutState;
  const total = subtotal - discount + shipping;
  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('shipping').textContent = shipping.toFixed(2);
  document.getElementById('discountAmount').textContent = discount.toFixed(2);
  document.getElementById('discountRow').style.display = discount > 0 ? 'block' : 'none';
  document.getElementById('checkoutTotal').textContent = total.toFixed(2);
};

const applyCoupon = async () => {
  const input = document.getElementById('couponCodeInput');
  const message = document.getElementById('couponMessage');
  if (!input) return;
  const code = (input.value || '').trim();
  if (!code) {
    if (message) message.textContent = 'Enter a coupon code';
    return;
  }

  try {
    if (message) {
      message.textContent = 'Checking...';
      message.style.color = '#0f4c81';
    }
    const res = await couponsAPI.validate(code);
    if (res && res.success && res.coupon) {
      const discount = checkoutState.subtotal * (Number(res.coupon.discountPercent) || 0) / 100;
      checkoutState.discount = discount;
      checkoutState.coupon = res.coupon.code;
      updateTotals();
      if (message) {
        message.textContent = `Applied ${res.coupon.discountPercent}% off`;
        message.style.color = '#0f4c81';
      }
    } else {
      checkoutState.discount = 0;
      checkoutState.coupon = null;
      updateTotals();
      if (message) {
        message.textContent = res.message || 'Invalid coupon';
        message.style.color = '#c0392b';
      }
    }
  } catch (error) {
    checkoutState.discount = 0;
    checkoutState.coupon = null;
    updateTotals();
    if (message) {
      message.textContent = error.message || 'Invalid coupon';
      message.style.color = '#c0392b';
    }
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
      paymentMethod,
      couponCode: checkoutState.coupon
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
