// ============== CONFIGURATION ==============
// API Base URL - Change this to match your backend server
// ============== CONFIGURATION ==============
// API Base URL - points to the deployed backend reverse-proxied at /api
const API_BASE_URL = 'https://wellmed-ufey.onrender.com';
  
// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// Cart management
const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

const setCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

// Check if user is logged in
const isLoggedIn = () => !!getToken();

// Check if user is admin
const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};
