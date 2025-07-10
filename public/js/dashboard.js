/**
 * dashboard.js – handles dashboard functionality, including pet stats and actions.
 */

// --- Constants ---
const API_BASE_URL = '/api/pet'; // Assuming an API endpoint for pet interactions
const AUTH_API_URL = '/api/users/logout'; // Assuming an API endpoint for logout

// --- DOM Elements (initialized later for safety) ---
let hungerStatElement;
let happinessStatElement;
let energyStatElement;
let feedButton;
let playButton;
let logoutButton;
let everwynClockElement; // From dashboard.html for the clock

/**
 * Helper function to update pet stats display.
 * @param {object} stats - An object containing hunger, happiness, and energy.
 */
const updatePetStatsDisplay = (stats) => {
  if (hungerStatElement) hungerStatElement.textContent = stats.hunger;
  if (happinessStatElement) happinessStatElement.textContent = stats.happiness;
  if (energyStatElement) energyStatElement.textContent = stats.energy;
};

/**
 * Fetches the current pet stats from the backend.
 * @returns {Promise<object|null>} Pet stats object on success, null on error.
 */
const fetchPetStats = async () => {
  const token = localStorage.getItem('jwtToken'); // Get JWT token from login.js
  if (!token) {
    console.warn('No authentication token found. Redirecting to login.');
    window.location.href = 'login.html'; // Redirect if no token
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Send the token in the Authorization header
      }
    });

    if (response.ok) {
      const stats = await response.json();
      updatePetStatsDisplay(stats); // Update the UI immediately
      return stats;
    } else if (response.status === 401) {
      // Token expired or invalid
      console.warn('Authentication failed. Redirecting to login.');
      localStorage.removeItem('jwtToken');
      window.location.href = 'login.html';
    } else {
      console.error('Failed to fetch pet stats:', response.status, response.statusText);
      // Optionally show a message to the user
    }
  } catch (error) {
    console.error('Network error fetching pet stats:', error);
  }
  return null;
};

/**
 * Sends an action to the pet (feed/play).
 * @param {string} actionType - 'feed' or 'play'.
 */
const performPetAction = async (actionType) => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    console.warn('No authentication token found for action. Redirecting to login.');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Disable buttons to prevent spamming
    if (feedButton) feedButton.disabled = true;
    if (playButton) playButton.disabled = true;

    const response = await fetch(`${API_BASE_URL}/${actionType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({}) // Send an empty body or any specific action data
    });

    if (response.ok) {
      const updatedStats = await response.json();
      updatePetStatsDisplay(updatedStats);
      console.log(`Pet ${actionType}ed successfully!`);
      // Optionally provide more visual feedback, e.g., a temporary message
    } else if (response.status === 401) {
      console.warn('Authentication failed for action. Redirecting to login.');
      localStorage.removeItem('jwtToken');
      window.location.href = 'login.html';
    } else {
      const errorData = await response.json();
      console.error(`Failed to ${actionType} pet:`, errorData.message || response.statusText);
      // Show user-friendly error message
    }
  } catch (error) {
    console.error(`Network error during ${actionType} action:`, error);
  } finally {
    // Re-enable buttons regardless of success or failure
    if (feedButton) feedButton.disabled = false;
    if (playButton) playButton.disabled = false;
  }
};

/**
 * Handles user logout.
 */
const handleLogout = async () => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    try {
      // Optionally send a request to backend to invalidate token
      await fetch(AUTH_API_URL, {
        method: 'POST', // Or 'GET' depending on your backend logout implementation
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error during backend logout (might already be logged out):', error);
    }
    localStorage.removeItem('jwtToken'); // Clear token from client-side storage
  }
  window.location.href = 'login.html'; // Redirect to login page
};

// --- Everwyn Clock Update (assuming time.js might be merged or simplified here) ---
const updateEverwynClock = () => {
  if (everwynClockElement) {
    const now = new Date();
    // Example of a simple custom time display
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    everwynClockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
};


// --- Initialization on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM element references
  hungerStatElement = document.getElementById('hunger-stat');
  happinessStatElement = document.getElementById('happiness-stat');
  energyStatElement = document.getElementById('energy-stat');
  feedButton = document.getElementById('feed-button');
  playButton = document.getElementById('play-button');
  logoutButton = document.getElementById('logout-button');
  everwynClockElement = document.getElementById('everwyn-clock'); // Get clock element

  // Check for presence of elements before adding listeners
  if (feedButton) {
    feedButton.addEventListener('click', () => performPetAction('feed'));
  }
  if (playButton) {
    playButton.addEventListener('click', () => performPetAction('play'));
  }
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  // Initial fetch of pet stats
  fetchPetStats();

  // Set up Everwyn clock (if time.js is no longer a separate file)
  if (everwynClockElement) {
    updateEverwynClock(); // Initial clock display
    setInterval(updateEverwynClock, 1000); // Update every second
  }
});