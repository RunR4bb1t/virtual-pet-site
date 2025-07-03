// --- SIGNUP FORM LOGIC ---
const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch('http://localhost:3000/api/users/signup', {
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


// --- NEW: LOGIN FORM LOGIC ---
const loginForm = document.getElementById('login-form');
const loginButton = document.querySelector('#login-form button');
const loginMessage = document.createElement('p'); // Create a new element for login messages
loginMessage.className = 'message';
loginForm.appendChild(loginMessage);

// Enable the login button now
loginButton.disabled = false;
loginButton.textContent = 'Login';

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If login is successful, SAVE THE TOKEN!
            console.log('Received token:', data.token);
            localStorage.setItem('pet_token', data.token); // Save the token to browser's local storage

            // Redirect to the main pet page
            window.location.href = 'index.html';
        } else {
            loginMessage.textContent = `Error: ${data.error}`;
            loginMessage.style.color = 'red';
        }
    });
});