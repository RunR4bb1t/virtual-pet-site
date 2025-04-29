// --- Configuration ---
// Uses your actual Render backend URL
const BACKEND_URL = 'https://virtual-pet-game-backend.onrender.com';
// How often the frontend asks for updated stats (in milliseconds)
const UI_POLLING_INTERVAL = 5000; // 5 seconds

document.addEventListener('DOMContentLoaded', () => {
  console.log("Script loaded and running!");

  // --- Element References ---
  const actionButtons = document.querySelectorAll('.action-button');
  const progressBarFills = document.querySelectorAll('.progress-bar-fill');
  const petImage = document.querySelector('.pet-image');
  const petNameElement = document.querySelector('.pet-name'); // Assuming class="pet-name"

  // --- Image Paths ---
  const defaultImageSrc = 'images/bunny-neutral.png';
  const happyImageSrc = 'images/bunny-happy.png';
  const eatingImageSrc = 'images/bunny-eating.png';
  const playingImageSrc = 'images/bunny-playing.png';

  // Check if essential elements exist
  if (!petImage || actionButtons.length < 3 || progressBarFills.length < 3) {
    console.error("Essential elements (pet image, buttons, or progress bars) not found!");
    return;
  }

  // --- Get Specific Elements ---
  const petButton = actionButtons[0];
  const loveProgressFill = progressBarFills[0];

  const feedButton = actionButtons[1];
  const hungerProgressFill = progressBarFills[1];

  const playButton = actionButtons[2];
  const energyProgressFill = progressBarFills[2];

  // --- Function to Update UI (Progress Bars and Name) ---
  function updateUI(stats) {
    // Avoid logging this every 5 seconds unless debugging
    // console.log("Updating UI with stats:", stats);
    if (stats.love !== undefined) {
        loveProgressFill.style.width = Math.max(0, Math.min(100, stats.love)) + '%';
    }
    if (stats.hunger !== undefined) {
        hungerProgressFill.style.width = Math.max(0, Math.min(100, stats.hunger)) + '%';
    }
    if (stats.energy !== undefined) {
        energyProgressFill.style.width = Math.max(0, Math.min(100, stats.energy)) + '%';
    }
    if (stats.name && petNameElement) {
        // Only update name if it's different? Or just set it.
        if (petNameElement.textContent !== stats.name) {
            petNameElement.textContent = stats.name;
        }
    }
  }


  // --- Function to Fetch and Update Pet Stats ---
  // This will now be called periodically by setInterval AND on initial load
  async function fetchAndUpdatePetStats() {
    // Avoid logging this every 5 seconds unless debugging
    // console.log(`Workspaceing pet stats from ${BACKEND_URL}/api/pet-stats...`);

    try {
      const response = await fetch(`${BACKEND_URL}/api/pet-stats`);
      // Check if response is ok before processing
      if (!response.ok) {
          // Log specific HTTP error status if fetch fails
          console.error(`HTTP error fetching stats! status: ${response.status}`);
          // Decide if you want to reset UI on error or leave it as is
          // if (petNameElement) petNameElement.textContent = 'Error';
          // loveProgressFill.style.width = '0%'; // Example reset
          // hungerProgressFill.style.width = '0%';
          // energyProgressFill.style.width = '0%';
          return; // Exit function if fetch failed
      }
      const currentStats = await response.json();
      // console.log("Received stats from server:", currentStats); // Debug log
      updateUI(currentStats); // Update UI with fetched stats
    } catch (error) {
      // Log network errors or JSON parsing errors
      console.error("Could not fetch or process pet stats:", error);
      // Optionally update UI to show an error state
      // if (petNameElement) petNameElement.textContent = 'Network Error';
    }
  }

  // --- Function to Handle Actions ---
  async function handlePetAction(button, progressBar, endpoint, actionImageSrc) {
    const actionName = endpoint.split('-')[1];
    console.log(`${actionName.toUpperCase()} button clicked!`);

    // Check if full based on CURRENT display
    const currentWidthStr = progressBar.style.width;
    let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;
    if (currentWidthPercent >= 100) {
        console.log(`${actionName} stat is already full! (Frontend check)`);
        return;
    }

    console.log(`Sending request to ${BACKEND_URL}${endpoint}...`);
    const previousImageSrc = petImage.src;
    petImage.src = actionImageSrc;

    const imageTimeout = setTimeout(() => {
        if (petImage.src === actionImageSrc) {
            console.log("Reverting image due to timeout");
            petImage.src = previousImageSrc;
        }
    }, 2500);

    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, { method: 'POST' });
        clearTimeout(imageTimeout);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const updatedStats = await response.json();
        console.log(`Received updated stats after ${actionName}:`, updatedStats);
        updateUI(updatedStats);
        petImage.src = defaultImageSrc; // Revert to default after successful action

    } catch (error) {
        console.error(`Error ${actionName}ing pet:`, error);
        clearTimeout(imageTimeout);
        petImage.src = previousImageSrc;
    }
  }


  // --- Event Listeners ---
  petButton.addEventListener('click', () => handlePetAction(petButton, loveProgressFill, '/api/pet-pet', happyImageSrc));
  feedButton.addEventListener('click', () => handlePetAction(feedButton, hungerProgressFill, '/api/feed-pet', eatingImageSrc));
  playButton.addEventListener('click', () => handlePetAction(playButton, energyProgressFill, '/api/play-pet', playingImageSrc));


  // --- Initial Load ---
  // Fetch stats immediately when the page loads
  fetchAndUpdatePetStats();

  // --- Start Polling ---
  // Set an interval to automatically fetch stats periodically AFTER the initial load
  console.log(`Starting periodic UI updates every ${UI_POLLING_INTERVAL}ms`);
  setInterval(fetchAndUpdatePetStats, UI_POLLING_INTERVAL);
  // Note: For a more complex app, you might want to clear this interval
  // if the user navigates away from the page, but this is fine for now.

}); // End of DOMContentLoaded