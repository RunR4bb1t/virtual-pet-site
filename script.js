document.addEventListener('DOMContentLoaded', () => {
  console.log("Script loaded and running!");

  // --- Element References ---
  const actionButtons = document.querySelectorAll('.action-button');
  const progressBarFills = document.querySelectorAll('.progress-bar-fill');
  const petImage = document.querySelector('.pet-image');

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
  const feedProgressFill = progressBarFills[1];

  const playButton = actionButtons[2];
  const playProgressFill = progressBarFills[2];


  // --- Function to Update Progress Bars ---
  function updateProgressBars(stats) {
      if (stats.love !== undefined) {
          loveProgressFill.style.width = Math.max(0, Math.min(100, stats.love)) + '%';
      }
      if (stats.hunger !== undefined) {
          feedProgressFill.style.width = Math.max(0, Math.min(100, stats.hunger)) + '%';
      }
      if (stats.energy !== undefined) {
          playProgressFill.style.width = Math.max(0, Math.min(100, stats.energy)) + '%';
      }
  }


  // --- Function to Fetch and Update Pet Stats ---
  async function fetchAndUpdatePetStats() {
    console.log("Fetching initial pet stats...");
    try {
      const response = await fetch('/api/pet-stats');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const currentStats = await response.json();
      console.log("Received stats from server:", currentStats);
      updateProgressBars(currentStats);
      petImage.src = defaultImageSrc;
    } catch (error) {
      console.error("Could not fetch pet stats:", error);
      loveProgressFill.style.width = '0%';
      feedProgressFill.style.width = '0%';
      playProgressFill.style.width = '0%';
      petImage.src = defaultImageSrc;
    }
  }


  // --- Event Listeners ---

  // *** PET Button Listener - MODIFIED ***
  petButton.addEventListener('click', async () => { // Added async
    console.log("PET button clicked!");

    // --- Check if full based on CURRENT display ---
    const currentWidthStr = loveProgressFill.style.width;
    let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;
    if (currentWidthPercent >= 100) {
      console.log("Pet stat is already full! (Frontend check)");
      return; // Stop if already full
    }
    // --- End of Check ---

    console.log("Sending request to server...");
    const previousImageSrc = petImage.src;
    petImage.src = happyImageSrc; // Change image immediately
    const imageTimeout = setTimeout(() => { // Set timer to revert
      if (petImage.src.includes(happyImageSrc)) {
        petImage.src = previousImageSrc;
      }
    }, 2000);

    try {
      // Send POST request to the server endpoint
      const response = await fetch('/api/pet-pet', { method: 'POST' }); // Use the new endpoint

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // Get updated stats from server response
      const updatedStats = await response.json();
      console.log("Received updated stats after petting:", updatedStats);

      // Update UI from server response
      updateProgressBars(updatedStats);

    } catch (error) {
      console.error('Error petting pet:', error);
      clearTimeout(imageTimeout); // Stop scheduled revert on error
      petImage.src = previousImageSrc; // Revert image now
    }
  });
  // *** END OF MODIFIED PET Button Listener ***


  feedButton.addEventListener('click', async () => {
    console.log("FEED button clicked!");
    const currentWidthStr = feedProgressFill.style.width;
    let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;
    if (currentWidthPercent >= 100) {
      console.log("Feed stat is already full! (Frontend check)");
      return;
    }

    console.log("Sending request to server...");
    const previousImageSrc = petImage.src;
    petImage.src = eatingImageSrc;
    const imageTimeout = setTimeout(() => {
        if (petImage.src.includes(eatingImageSrc)) {
            petImage.src = previousImageSrc;
        }
    }, 2000);

    try {
      const response = await fetch('/api/feed-pet', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const updatedStats = await response.json();
      console.log("Received updated stats after feeding:", updatedStats);
      updateProgressBars(updatedStats);
    } catch (error) {
      console.error('Error feeding pet:', error);
      clearTimeout(imageTimeout);
      petImage.src = previousImageSrc;
    }
  });


  playButton.addEventListener('click', () => {
     // *** NOTE: This button still needs the backend connection added ***
    console.log("PLAY button clicked! (Frontend Only Logic)");
    const currentWidthStr = playProgressFill.style.width;
    let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;

    if (currentWidthPercent >= 100) {
      console.log("Play stat is already full!");
      return;
    }

    // *** TEMPORARY: We will replace this with backend call soon ***
    let newWidthPercent = Math.min(currentWidthPercent + 20, 100);
    playProgressFill.style.width = newWidthPercent + '%';
    console.log("TEMP: PLAY progress bar width set to:", newWidthPercent + '%');
    // *** END OF TEMPORARY ***

    const previousImageSrc = petImage.src;
    petImage.src = playingImageSrc;
    setTimeout(() => {
      if (petImage.src.includes(playingImageSrc)) petImage.src = previousImageSrc;
    }, 2000);
  });

  // --- Initial Load ---
  fetchAndUpdatePetStats();

}); // End of DOMContentLoaded