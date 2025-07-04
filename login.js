// --- SIGNUP FORM LOGIC ---
const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    // CORRECTED URL FOR SIGNUP
    fetch('https://everwyn.fly.dev/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            signupMessage.textContent = 'Signup successful! You can now log in.';
            signupMessage.style.color = 'green';
            signupForm.reset();
        } else {
            signupMessage.textContent = `Error: ${data.error}`;
            signupMessage.style.color = 'red';
        }
    });
});


// --- LOGIN FORM LOGIC ---
const loginForm = document.getElementById('login-form');
const loginButton = document.querySelector('#login-form button');
const loginMessage = document.createElement('p');
loginMessage.className = 'message';
loginForm.appendChild(loginMessage);

loginButton.disabled = false;
loginButton.textContent = 'Login';

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    // CORRECTED URL FOR LOGIN
    fetch('https://everwyn.fly.dev/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('pet_token', data.token);
            window.location.href = 'index.html';
        } else {
            loginMessage.textContent = `Error: ${data.error}`;
            loginMessage.style.color = 'red';
        }
    });
});