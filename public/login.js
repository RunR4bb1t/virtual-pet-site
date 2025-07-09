const API_URL = 'http://localhost:3000/api';

document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault();
  const { username, password } = e.target;
  try {
    const res = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    document.getElementById('signup-message').textContent = data.message;
  } catch (err) {
    document.getElementById('signup-message').textContent = 'Error signing up.';
  }
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const { username, password } = e.target;
  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const { token } = await res.json();
    localStorage.setItem('token', token);
    window.location.href = 'dashboard.html';
  } catch (err) {
    document.getElementById('login-message').textContent = 'Invalid credentials.';
  }
});