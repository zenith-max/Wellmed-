// ============== FORGOT PASSWORD PAGE ==============

const requestResetForm = document.getElementById('requestResetForm');
const completeResetForm = document.getElementById('completeResetForm');
const resetStepTwo = document.getElementById('resetStepTwo');
const resetMessage = document.getElementById('resetMessage');
const resetEmailInput = document.getElementById('resetEmail');
const resetCodeInput = document.getElementById('resetCode');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

const setResetMessage = (msg, isError = true) => {
  resetMessage.textContent = msg;
  resetMessage.style.color = isError ? '#d9534f' : '#0b7a0b';
};

// Prefill email from pending verification if present
(() => {
  const storedEmail = localStorage.getItem('pendingVerificationEmail');
  if (storedEmail) {
    resetEmailInput.value = storedEmail;
  }
})();

requestResetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setResetMessage('');

  const email = resetEmailInput.value.trim();
  if (!email) {
    setResetMessage('Please enter your email.');
    return;
  }

  try {
    const response = await authAPI.forgotPassword({ email });
    if (response.success) {
      resetStepTwo.style.display = 'block';
      setResetMessage(response.message || 'If this email is registered, a reset code has been sent.', false);
      localStorage.setItem('pendingResetEmail', email);
    } else {
      setResetMessage(response.message || 'Could not start password reset.');
    }
  } catch (error) {
    setResetMessage(error.message || 'Could not start password reset.');
    console.error('Forgot password error:', error);
  }
});

completeResetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setResetMessage('');

  const email = resetEmailInput.value.trim();
  const code = resetCodeInput.value.trim();
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmNewPasswordInput.value;

  if (!email || !code || !newPassword || !confirmPassword) {
    setResetMessage('Please fill in all fields.');
    return;
  }

  if (newPassword !== confirmPassword) {
    setResetMessage('Passwords do not match.');
    return;
  }

  try {
    const response = await authAPI.resetPassword({ email, code, newPassword, confirmPassword });

    if (response.success) {
      localStorage.removeItem('pendingResetEmail');

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setResetMessage('Password reset successful. Redirecting...', false);
        setTimeout(() => {
          if (response.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 600);
      } else {
        setResetMessage(response.message || 'Password reset successful. Please verify your email to log in.', false);
        setTimeout(() => {
          window.location.href = `verify.html?email=${encodeURIComponent(email)}`;
        }, 800);
      }
      return;
    }

    setResetMessage(response.message || 'Password reset failed.');
  } catch (error) {
    setResetMessage(error.message || 'Password reset failed.');
    console.error('Reset password error:', error);
  }
});
