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
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
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

  create: (formData) =>
    fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    }),

  update: (id, formData) =>
    fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    }),

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
