// ============== API HELPER FUNCTIONS ==============

// Generic fetch function with headers
const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add token to headers if user is logged in
  if (isLoggedIn()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle response
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson ? body.message : body;
      throw new Error(message || `HTTP error! status: ${response.status}`);
    }

    return body;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============== AUTHENTICATION API ==============

const authAPI = {
  register: (data) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  verifyEmail: (data) =>
    apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  resendVerification: (data) =>
    apiCall('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  forgotPassword: (data) =>
    apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  resetPassword: (data) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () =>
    apiCall('/auth/me', {
      method: 'GET'
    })
};

// ============== PRODUCTS API ==============

const productsAPI = {
  getAll: (query = '') =>
    apiCall(`/products${query}`, {
      method: 'GET'
    }),

  getById: (id) =>
    apiCall(`/products/${id}`, {
      method: 'GET'
    }),

  search: (query) =>
    apiCall(`/products/search/${query}`, {
      method: 'GET'
    }),

  create: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const message = isJson ? body.message : body;
      throw new Error(message || 'Failed to create product');
    }
    return body;
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const message = isJson ? body.message : body;
      throw new Error(message || 'Failed to update product');
    }
    return body;
  },

  delete: (id) =>
    apiCall(`/products/${id}`, {
      method: 'DELETE'
    })
};

// ============== ORDERS API ==============

const ordersAPI = {
  create: (data) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMyOrders: () =>
    apiCall('/orders', {
      method: 'GET'
    }),

  getById: (id) =>
    apiCall(`/orders/single/${id}`, {
      method: 'GET'
    }),

  getAllOrders: () =>
    apiCall('/orders/admin/all', {
      method: 'GET'
    }),

  updateStatus: (id, status) =>
    apiCall(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  cancel: (id) =>
    apiCall(`/orders/${id}`, {
      method: 'DELETE'
    })
};

// ============== SETTINGS API ==============

const settingsAPI = {
  getShipping: () =>
    apiCall('/settings/shipping', {
      method: 'GET'
    }),

  updateShipping: (shippingCharge) =>
    apiCall('/settings/shipping', {
      method: 'PUT',
      body: JSON.stringify({ shippingCharge })
    })
};

// ============== COUPONS API ==============

const couponsAPI = {
  create: (data) =>
    apiCall('/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  list: () =>
    apiCall('/coupons', {
      method: 'GET'
    }),

  toggle: (id, isActive) =>
    apiCall(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    }),

  validate: (code) =>
    apiCall(`/coupons/validate/${encodeURIComponent(code)}`, {
      method: 'GET'
    })
};
