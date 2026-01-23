// ============== VERIFY VIA LINK PAGE ==============

const verifyStatus = document.getElementById('verifyStatus');

const setStatus = (message, isError = true) => {
  verifyStatus.textContent = message;
  verifyStatus.style.color = isError ? '#d9534f' : '#0b7a0b';
};

(async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email'); // optional, but not required

  if (!token) {
    setStatus('Verification link is missing a token. Please request a new link.', true);
    return;
  }

  try {
    const response = await authAPI.verifyEmail({ email, token });

    if (response.success) {
      setToken(response.token);
      setUser(response.user);
      localStorage.removeItem('pendingVerificationEmail');
      setStatus('Email verified! Redirecting...', false);
      setTimeout(() => {
        if (response.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 700);
      return;
    }

    setStatus(response.message || 'Verification failed. Please request a new link.', true);
  } catch (error) {
    setStatus(error.message || 'Verification failed. Please request a new link.', true);
    console.error('Verify link error:', error);
  }
})();
