/**
 * login.js – handles user signup & login
 */

const API_BASE = '/api/users';

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const signupMsg  = document.getElementById('signup-message');
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const { username, password } = e.target.elements;
      try {
        const res = await fetch(`${API_BASE}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            password: password.value
          })
        });
        const data = await res.json();
        signupMsg.textContent = data.message;
      } catch {
        signupMsg.textContent = 'Error signing up.';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  const loginMsg  = document.getElementById('login-message');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const { username, password } = e.target.elements;
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            password: password.value
          })
        });
        const { token } = await res.json();
        localStorage.setItem('token', token);
        window.location.href = 'dashboard.html';
      } catch {
        loginMsg.textContent = 'Invalid credentials.';
      }
    });
  }
});
