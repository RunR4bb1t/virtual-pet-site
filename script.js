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
        // --- Make the SECOND button (FEED) interactive ---
        // Add a check to make sure element at index 1 exists
        if (actionButtons.length > 1 && progressBarFills.length > 1) { 
            const feedButton = actionButtons[1];         // Index 1 for FEED button
            const feedProgressBarFill = progressBarFills[1]; // Index 1 for FEED progress fill

            feedButton.addEventListener('click', () => {
                console.log("FEED button clicked!"); 
                const currentWidthStr = feedProgressBarFill.style.width; 
                let currentWidthPercent = parseInt(currentWidthStr, 10); 
                if (isNaN(currentWidthPercent)) { currentWidthPercent = 0; }
                let newWidthPercent = currentWidthPercent + 20;
                if (newWidthPercent > 100) { newWidthPercent = 100; }
                feedProgressBarFill.style.width = newWidthPercent + '%'; 
                console.log("FEED progress bar width set to:", newWidthPercent + '%'); 
            });
        } // End check for index 1


        // --- Make the THIRD button (PLAY) interactive ---
         // Add a check to make sure element at index 2 exists
        if (actionButtons.length > 2 && progressBarFills.length > 2) {
            const playButton = actionButtons[2];         // Index 2 for PLAY button
            const playProgressBarFill = progressBarFills[2]; // Index 2 for PLAY progress fill

            playButton.addEventListener('click', () => {
                console.log("PLAY button clicked!"); 
                const currentWidthStr = playProgressBarFill.style.width; 
                let currentWidthPercent = parseInt(currentWidthStr, 10); 
                if (isNaN(currentWidthPercent)) { currentWidthPercent = 0; }
                let newWidthPercent = currentWidthPercent + 20;
                if (newWidthPercent > 100) { newWidthPercent = 100; }
                playProgressBarFill.style.width = newWidthPercent + '%'; 
                console.log("PLAY progress bar width set to:", newWidthPercent + '%'); 
            });
        } // End check for index 2


    } else {
        console.error("Could not find action buttons or progress bar fills!");
        });

    } else {
        // If we couldn't find the elements, log an error
        console.error("Could not find action buttons or progress bar fills!");
    }
});