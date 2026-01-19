// ============== ADMIN LOGIN PAGE ==============

document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn() && isAdmin()) {
    window.location.href = 'admin.html';
  }
});

const handleAdminLogin = async (event) => {
  event.preventDefault();
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await authAPI.login({ email, password });

    if (!response.success) {
      errorDiv.textContent = response.message || 'Login failed';
      return;
    }

    if (response.user.role !== 'admin') {
      errorDiv.textContent = 'Admin access required';
      return;
    }

    setToken(response.token);
    setUser(response.user);
    window.location.href = 'admin.html';
  } catch (error) {
    errorDiv.textContent = error.message || 'An error occurred during login';
    console.error('Admin login error:', error);
  }
};
