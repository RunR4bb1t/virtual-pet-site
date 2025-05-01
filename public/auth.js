// Define the backend URL
const BACKEND_URL = 'https://virtual-pet-game-backend.onrender.com';

// Wait for the HTML document to be fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // --- Get Common Elements (used by both forms) ---
    // Note: IDs need to be consistent on both register.html and login.html
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageArea = document.getElementById('message-area');

    // --- Registration Form Logic ---
    const registerForm = document.getElementById('register-form');
    if (registerForm && usernameInput && passwordInput && messageArea) {
        console.log("Register form found, attaching listener.");
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log("Register form submitted.");
            messageArea.textContent = ''; // Clear previous messages
            messageArea.style.color = 'inherit';

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            // Client-Side Validation
            if (!username || !password) {
                messageArea.textContent = 'Please enter both username and password.';
                messageArea.style.color = 'red';
                return;
            }
            if (password.length < 8) {
                messageArea.textContent = 'Password must be at least 8 characters long.';
                messageArea.style.color = 'red';
                return;
            }

            console.log(`Sending registration request for user: ${username}`);
            try {
                const response = await fetch(`${BACKEND_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, password: password })
                });
                const data = await response.json();

                if (response.ok) {
                    console.log("Registration successful:", data);
                    messageArea.textContent = data.message || 'Registration successful! You can now log in.';
                    messageArea.style.color = 'green';
                    registerForm.reset(); // Clear form
                    // Optional: Redirect to login after a delay
                    // setTimeout(() => { window.location.href = '/login.html'; }, 2000);
                } else {
                    console.error("Registration failed (server error):", data);
                    messageArea.textContent = data.error || 'Registration failed. Please try again.';
                    messageArea.style.color = 'red';
                }
            } catch (error) {
                console.error("Registration failed (network/fetch error):", error);
                messageArea.textContent = 'Registration failed. Could not connect to server.';
                messageArea.style.color = 'red';
            }
        });
    } // --- End of Registration Form Logic ---


    // --- Login Form Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm && usernameInput && passwordInput && messageArea) {
        console.log("Login form found, attaching listener.");
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log("Login form submitted.");
            messageArea.textContent = ''; // Clear previous messages
            messageArea.style.color = 'inherit';

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            // Basic Client-Side Validation
            if (!username || !password) {
                messageArea.textContent = 'Please enter both username and password.';
                messageArea.style.color = 'red';
                return;
            }

            console.log(`Sending login request for user: ${username}`);
            try {
                const response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, password: password })
                });
                const data = await response.json();

                if (response.ok) { // Status 200 OK
                    console.log("Login successful:", data);
                    messageArea.textContent = data.message || 'Login successful! Redirecting...';
                    messageArea.style.color = 'green';

                    // *** TODO: Store login state (token/session info) from 'data' here later ***
                    // For now, just log the user info received
                    console.log("Logged in user info:", data.user);

                    // Redirect to the pet page after successful login
                    setTimeout(() => {
                       window.location.href = '/pet.html'; // Go to the pet page
                    }, 1000); // Wait 1 second before redirecting

                } else { // Handle errors like 401 Unauthorized or 500
                    console.error("Login failed (server error):", data);
                    messageArea.textContent = data.error || 'Login failed. Please try again.';
                    messageArea.style.color = 'red';
                }
            } catch (error) {
                console.error("Login failed (network/fetch error):", error);
                messageArea.textContent = 'Login failed. Could not connect to server.';
                messageArea.style.color = 'red';
            }
        });
    } // --- End of Login Form Logic ---

}); // End of DOMContentLoaded