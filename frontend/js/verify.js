// ============== EMAIL VERIFICATION PAGE ==============

const statusMessage = document.getElementById('statusMessage');
const emailInput = document.getElementById('email');
const codeInput = document.getElementById('code');
const verifyForm = document.getElementById('verifyForm');
const resendButton = document.getElementById('resendButton');

const setStatus = (message, isError = true) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#d9534f' : '#0b7a0b';
};

// Prefill email from query string or saved value
(() => {
  const params = new URLSearchParams(window.location.search);
  const queryEmail = params.get('email');
  const storedEmail = localStorage.getItem('pendingVerificationEmail');

  if (queryEmail) {
    emailInput.value = queryEmail;
  } else if (storedEmail) {
    emailInput.value = storedEmail;
  }
})();

verifyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');

  const email = emailInput.value.trim();
  const code = codeInput.value.trim();

  if (code.length !== 6) {
    setStatus('Please enter the 6-digit code we sent.', true);
    return;
  }

  try {
    const response = await authAPI.verifyEmail({ email, code });

    if (response.success) {
      // Save session and redirect
      setToken(response.token);
      setUser(response.user);
      localStorage.removeItem('pendingVerificationEmail');
      window.location.href = 'index.html';
      return;
    }

    setStatus(response.message || 'Verification failed.');
  } catch (error) {
    setStatus(error.message || 'Verification failed.');
    console.error('Verification error:', error);
  }
});

resendButton.addEventListener('click', async () => {
  setStatus('');
  const email = emailInput.value.trim();

  if (!email) {
    setStatus('Enter your email to resend the code.');
    return;
  }

  try {
    const response = await authAPI.resendVerification({ email });
    if (response.success) {
      setStatus(response.message || 'Verification code resent.', false);
      localStorage.setItem('pendingVerificationEmail', email);
    } else {
      setStatus(response.message || 'Could not resend code.');
    }
  } catch (error) {
    setStatus(error.message || 'Could not resend code.');
    console.error('Resend verification error:', error);
  }
});
