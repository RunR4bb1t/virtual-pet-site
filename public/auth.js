// Define the backend URL (same as in script.js, ideally you might centralize this later)
const BACKEND_URL = 'https://virtual-pet-game-backend.onrender.com';

// Wait for the HTML document to be fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageArea = document.getElementById('message-area');

    // Make sure the form actually exists on this page before adding listener
    if (registerForm) {
        console.log("Register form found, attaching listener.");

        // Add listener for when the form is submitted
        registerForm.addEventListener('submit', async (event) => {
            // Prevent the default browser form submission (which causes a page refresh)
            event.preventDefault();
            console.log("Register form submitted.");

            // Clear any previous messages
            messageArea.textContent = '';
            messageArea.style.color = 'inherit'; // Reset color

            // Get the values from the input fields and remove extra whitespace
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            // --- Basic Client-Side Validation ---
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
            // --- End Validation ---

            // --- Send data to the backend API ---
            console.log(`Sending registration request for user: ${username}`);
            try {
                const response = await fetch(`${BACKEND_URL}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Tell server we're sending JSON
                    },
                    // Convert the JavaScript object to a JSON string for the body
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                // Get the response data from the server (even for errors)
                const data = await response.json();

                // Check if the request was successful (status code 2xx)
                if (response.ok) { // Checks for status 200-299
                    console.log("Registration successful:", data);
                    messageArea.textContent = data.message || 'Registration successful!';
                    messageArea.style.color = 'green';
                    // Maybe disable the form or redirect after success?
                    // Example: Redirect to a login page after 2 seconds
                    // setTimeout(() => {
                    //    window.location.href = '/login.html'; // Redirect to login page (create later)
                    // }, 2000);
                     registerForm.reset(); // Clear the form fields

                } else {
                    // Handle errors returned by the server (like username taken, validation failed)
                    console.error("Registration failed (server error):", data);
                    messageArea.textContent = data.error || 'Registration failed. Please try again.';
                    messageArea.style.color = 'red';
                }

            } catch (error) {
                // Handle network errors (couldn't reach the server)
                console.error("Registration failed (network/fetch error):", error);
                messageArea.textContent = 'Registration failed. Could not connect to server.';
                messageArea.style.color = 'red';
            }
            // --- End API call ---
        });
    } else {
         // This might run on other pages if auth.js is loaded globally
         // console.log("Register form not found on this page.");
    }

    // --- Add Login form logic here later ---
    // const loginForm = document.getElementById('login-form');
    // if (loginForm) { ... }

});