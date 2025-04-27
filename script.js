document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and running!"); 

    const actionButtons = document.querySelectorAll('.action-button'); 
    const progressBarFills = document.querySelectorAll('.progress-bar-fill');

    if (actionButtons.length > 0 && progressBarFills.length > 0) {
        
        const petButton = actionButtons[0]; 
        const petProgressBarFill = progressBarFills[0]; 

        petButton.addEventListener('click', () => {
            console.log("PET button clicked!");
            const currentWidthStr = petProgressBarFill.style.width;
            let currentWidthPercent = parseInt(currentWidthStr, 10);
            if (isNaN(currentWidthPercent)) {
                currentWidthPercent = 0;
            }
            let newWidthPercent = currentWidthPercent + 20;
            if (newWidthPercent > 100) {
                newWidthPercent = 100;
            }
            petProgressBarFill.style.width = newWidthPercent + '%'; 
            console.log("PET progress bar width set to:", newWidthPercent + '%');
        });

        if (actionButtons.length > 1 && progressBarFills.length > 1) { 
            const feedButton = actionButtons[1];
            const feedProgressBarFill = progressBarFills[1];

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
        }

        if (actionButtons.length > 2 && progressBarFills.length > 2) {
            const playButton = actionButtons[2]; 
            const playProgressBarFill = progressBarFills[2];

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
        }

    } else {
        console.error("Could not find action buttons or progress bar fills!");
    }
});