// ============== EMAIL VERIFICATION PAGE ==============

const statusMessage = document.getElementById('statusMessage');
const emailInput = document.getElementById('email');
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

resendButton.addEventListener('click', async () => {
  setStatus('');
  const email = emailInput.value.trim();

  if (!email) {
    setStatus('Enter your email to resend the link.');
    return;
  }

  try {
    const response = await authAPI.resendVerification({ email });
    if (response.success) {
      setStatus(response.message || 'Verification link resent.', false);
      localStorage.setItem('pendingVerificationEmail', email);
    } else {
      setStatus(response.message || 'Could not resend link.');
    }
  } catch (error) {
    setStatus(error.message || 'Could not resend link.');
    console.error('Resend verification error:', error);
  }
});
