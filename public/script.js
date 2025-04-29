// --- Configuration ---
// Updated with your actual Render backend URL
const BACKEND_URL = 'https://virtual-pet-game-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Script loaded and running!");

  // --- Element References ---
  const actionButtons = document.querySelectorAll('.action-button');
  const progressBarFills = document.querySelectorAll('.progress-bar-fill');
  const petImage = document.querySelector('.pet-image');
  const petNameElement = document.querySelector('.pet-name'); // Assuming you have an element with class "pet-name"

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
  const hungerProgressFill = progressBarFills[1]; // Corrected variable name likely intended

  const playButton = actionButtons[2];
  const energyProgressFill = progressBarFills[2]; // Corrected variable name likely intended


  // --- Function to Update UI (Progress Bars and Name) ---
  function updateUI(stats) {
    console.log("Updating UI with stats:", stats);
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
        petNameElement.textContent = stats.name; // Update pet name if element exists
    }
  }


  // --- Function to Fetch and Update Pet Stats ---
  async function fetchAndUpdatePetStats() {
    console.log(`Workspaceing initial pet stats from ${BACKEND_URL}/api/pet-stats...`);
    // Clear bars initially or show loading state? For now, clear.
    loveProgressFill.style.width = '0%';
    hungerProgressFill.style.width = '0%';
    energyProgressFill.style.width = '0%';
    if (petNameElement) petNameElement.textContent = 'Loading...';
    petImage.src = defaultImageSrc; // Set default image

    try {
      // *** USES LIVE URL ***
      const response = await fetch(`${BACKEND_URL}/api/pet-stats`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const currentStats = await response.json();
      console.log("Received stats from server:", currentStats);
      updateUI(currentStats); // Update UI with fetched stats
      // Image might change based on stats later, for now, keep default after load
    } catch (error) {
      console.error("Could not fetch pet stats:", error);
      // Keep bars at 0%, show error name?
      if (petNameElement) petNameElement.textContent = 'Error';
    }
  }

  // --- Function to Handle Actions (Reduces repetition) ---
  async function handlePetAction(button, progressBar, endpoint, actionImageSrc) {
    const actionName = endpoint.split('-')[1]; // e.g., 'pet', 'feed', 'play'
    console.log(`${actionName.toUpperCase()} button clicked!`);

    // Check if full based on CURRENT display
    const currentWidthStr = progressBar.style.width;
    let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;
    if (currentWidthPercent >= 100) {
        console.log(`${actionName} stat is already full! (Frontend check)`);
        return; // Stop if already full
    }

    console.log(`Sending request to ${BACKEND_URL}${endpoint}...`);
    const previousImageSrc = petImage.src;
    petImage.src = actionImageSrc; // Change image immediately

    // Use a timeout to revert the image *only if* the action doesn't complete quickly
    // or if there's an error. We clear this if the fetch succeeds.
    const imageTimeout = setTimeout(() => {
        if (petImage.src === actionImageSrc) { // Revert only if it's still the action image
            console.log("Reverting image due to timeout");
            petImage.src = previousImageSrc;
        }
    }, 2500); // Slightly longer timeout

    try {
        // *** USES LIVE URL ***
        const response = await fetch(`${BACKEND_URL}${endpoint}`, { method: 'POST' });

        clearTimeout(imageTimeout); // Action completed, cancel the revert timeout

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const updatedStats = await response.json();
        console.log(`Received updated stats after ${actionName}:`, updatedStats);

        updateUI(updatedStats); // Update UI from server response

        // Set image back to default *after* successful action and UI update
        petImage.src = defaultImageSrc;

    } catch (error) {
        console.error(`Error ${actionName}ing pet:`, error);
        clearTimeout(imageTimeout); // Also cancel timeout on error
        petImage.src = previousImageSrc; // Revert image immediately on error
        // Maybe show an error message to the user?
    }
  }


  // --- Event Listeners ---
  petButton.addEventListener('click', () => handlePetAction(petButton, loveProgressFill, '/api/pet-pet', happyImageSrc));
  feedButton.addEventListener('click', () => handlePetAction(feedButton, hungerProgressFill, '/api/feed-pet', eatingImageSrc));
  playButton.addEventListener('click', () => handlePetAction(playButton, energyProgressFill, '/api/play-pet', playingImageSrc));


  // --- Initial Load ---
  fetchAndUpdatePetStats();

}); // End of DOMContentLoaded