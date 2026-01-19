// ============== AUTHENTICATION PAGE ==============

// Handle Login
const handleLogin = async (event) => {
  event.preventDefault();
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await authAPI.login({ email, password });

    if (response.success) {
      // Save token and user data
      setToken(response.token);
      setUser(response.user);

      // Redirect based on role
      if (response.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      errorDiv.textContent = response.message || 'Login failed';
    }
  } catch (error) {
    errorDiv.textContent = error.message || 'An error occurred during login';
    console.error('Login error:', error);
  }
};

// Handle Register
const handleRegister = async (event) => {
  event.preventDefault();
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = '';

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    return;
  }

  try {
    const response = await authAPI.register({
      name,
      email,
      password,
      confirmPassword
    });

    if (response.success) {
      // Save token and user data
      setToken(response.token);
      setUser(response.user);

      // Redirect to products page
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = response.message || 'Registration failed';
    }
  } catch (error) {
    errorDiv.textContent = error.message || 'An error occurred during registration';
    console.error('Registration error:', error);
  }
};
