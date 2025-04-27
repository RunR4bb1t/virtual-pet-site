// script.js

// IMPORTANT: Wait for the HTML content to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Let's check if the script is running (Look in browser's developer console)
    console.log("Script loaded and running!"); 

    // --- Get References to HTML Elements ---
    const actionButtons = document.querySelectorAll('.action-button'); 
    const progressBarFills = document.querySelectorAll('.progress-bar-fill');

    // --- Make the FIRST button (PET) interactive ---

    if (actionButtons.length > 0 && progressBarFills.length > 0) {
        const petButton = actionButtons[0]; 
        const petProgressBarFill = progressBarFills[0]; 

        // --- Add Click Listener ---
        petButton.addEventListener('click', () => {
            console.log("PET button clicked!"); // Check console

            // 1. Get the current width style (e.g., "20%")
            const currentWidthStr = petProgressBarFill.style.width;

            let currentWidthPercent = parseInt(currentWidthStr, 10);
            //    If the width wasn't set or is invalid, default to 0
            if (isNaN(currentWidthPercent)) {
                currentWidthPercent = 0;
            }
            // 3. Calculate the new width (increase by 20 for 1/5 steps)
            let newWidthPercent = currentWidthPercent + 20;

            // 4. Don't let the width go over 100%
            if (newWidthPercent > 100) {
                newWidthPercent = 100;
            }
            petProgressBarFill.style.width = newWidthPercent + '%'; 

            console.log("PET progress bar width set to:", newWidthPercent + '%'); // Check console
        });

    } else {
        // If we couldn't find the elements, log an error
        console.error("Could not find action buttons or progress bar fills!");
    }
});