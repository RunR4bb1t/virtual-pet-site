const API_BASE_URL = '/api/users';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const loginForm = document.getElementById('login-form');
  const loginMessageElement = document.getElementById('login-message');
  const signupForm = document.getElementById('signup-form');
  const signupMessageElement = document.getElementById('signup-message');

  /**
   * Displays a message to the user in a specified message element.
   * @param {HTMLElement} element - The DOM element to display the message in.
   * @param {string} message - The message text.
   * @param {boolean} isError - True if the message is an error, false otherwise.
   */
  const showMessage = (element, message, isError = false) => {
    if (element) {
      element.textContent = message;
      // Optional: Add/remove a class for styling error messages
      if (isError) {
        element.classList.add('error-message');
      } else {
        element.classList.remove('error-message');
      }
    }
  };

  /**
   * Handles user login.
   * @param {Event} e - The submit event.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get input values directly from the form elements
    const usernameInput = loginForm.elements['login-username']; // Use ID from HTML for clarity
    const passwordInput = loginForm.elements['login-password'];

    const username = usernameInput ? usernameInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    showMessage(loginMessageElement, ''); // Clear previous messages

    if (!username || !password) {
      showMessage(loginMessageElement, 'Please enter both username and password.', true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json(); // Parse JSON response

      if (response.ok) { // Check if the response status is 2xx
        // Assuming your backend sends a 'token' on successful login
        if (data.token) {
          localStorage.setItem('jwtToken', data.token); // Store token (consider secure cookies for production)
          showMessage(loginMessageElement, 'Login successful!', false);
          window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
          showMessage(loginMessageElement, data.message || 'Login failed: No token received.', true);
        }
      } else {
        // Handle server-side errors (e.g., invalid credentials, user not found)
        showMessage(loginMessageElement, data.message || 'Login failed. Please check your credentials.', true);
      }
    } catch (error) {
      // Handle network errors or issues with the fetch request
      console.error('Error during login:', error);
      showMessage(loginMessageElement, 'An unexpected error occurred during login. Please try again.', true);
    }
  };

  /**
   * Handles user signup.
   * @param {Event} e - The submit event.
   */
  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get input values directly from the form elements
    const usernameInput = signupForm.elements['signup-username']; // Use ID from HTML for clarity
    const passwordInput = signupForm.elements['signup-password'];

    const username = usernameInput ? usernameInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    showMessage(signupMessageElement, ''); // Clear previous messages

    if (!username || !password) {
      showMessage(signupMessageElement, 'Please enter both username and password.', true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json(); // Parse JSON response

      if (response.ok) { // Check if the response status is 2xx
        showMessage(signupMessageElement, data.message || 'Signup successful! You can now log in.', false);
        // Optional: Clear form fields after successful signup
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
      } else {
        // Handle server-side errors (e.g., username already taken, validation errors)
        showMessage(signupMessageElement, data.message || 'Signup failed. Please try a different username.', true);
      }
    } catch (error) {
      // Handle network errors or issues with the fetch request
      console.error('Error during signup:', error);
      showMessage(signupMessageElement, 'An unexpected error occurred during signup. Please try again.', true);
    }
  };

  // --- Event Listeners ---
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});