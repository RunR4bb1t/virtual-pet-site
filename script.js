document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and running!");

    const actionButtons = document.querySelectorAll('.action-button');
    const progressBarFills = document.querySelectorAll('.progress-bar-fill');
    const petImage = document.querySelector('.pet-image');

    const defaultImageSrc = 'images/bunny-neutral.png';
    const happyImageSrc = 'images/bunny-happy.png';
    const eatingImageSrc = 'images/bunny-eating.png';   // Remember to set your actual eating image path
    const playingImageSrc = 'images/bunny-playing.png';  // Remember to set your actual playing image path

    if (petImage) {
        petImage.src = defaultImageSrc;
    } else {
        console.error("Pet image element not found!");
        return;
    }

    if (actionButtons.length >= 3 && progressBarFills.length >= 3) {

        const petButton = actionButtons[0];
        const petProgressBarFill = progressBarFills[0];

        const feedButton = actionButtons[1];
        const feedProgressBarFill = progressBarFills[1];

        const playButton = actionButtons[2];
        const playProgressBarFill = progressBarFills[2];

        petButton.addEventListener('click', () => {
            console.log("PET button clicked!");
            const currentWidthStr = petProgressBarFill.style.width;
            let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;

            if (currentWidthPercent >= 100) {
                console.log("Pet stat is already full!");
                return;
            }

            let newWidthPercent = Math.min(currentWidthPercent + 20, 100);
            petProgressBarFill.style.width = newWidthPercent + '%';
            console.log("PET progress bar width set to:", newWidthPercent + '%');

            const previousImageSrc = petImage.src;
            petImage.src = happyImageSrc;
            console.log("Changed image to happy");

            setTimeout(() => {
                if (petImage.src.includes(happyImageSrc)) {
                     petImage.src = previousImageSrc;
                     console.log("Changed image back from happy");
                }
            }, 2000);
        });

        feedButton.addEventListener('click', () => {
            console.log("FEED button clicked!");
            const currentWidthStr = feedProgressBarFill.style.width;
            let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;

            if (currentWidthPercent >= 100) {
                console.log("Feed stat is already full!");
                return;
            }

            let newWidthPercent = Math.min(currentWidthPercent + 20, 100);
            feedProgressBarFill.style.width = newWidthPercent + '%';
            console.log("FEED progress bar width set to:", newWidthPercent + '%');

            const previousImageSrc = petImage.src;
            petImage.src = eatingImageSrc;
            console.log("Changed image to eating");

            setTimeout(() => {
                if (petImage.src.includes(eatingImageSrc)) {
                    petImage.src = previousImageSrc;
                    console.log("Changed image back from eating");
                }
            }, 2000);
        });

        playButton.addEventListener('click', () => {
            console.log("PLAY button clicked!");
            const currentWidthStr = playProgressBarFill.style.width;
            let currentWidthPercent = parseInt(currentWidthStr, 10) || 0;

            if (currentWidthPercent >= 100) {
                console.log("Play stat is already full!");
                return;
            }

            let newWidthPercent = Math.min(currentWidthPercent + 20, 100);
            playProgressBarFill.style.width = newWidthPercent + '%';
            console.log("PLAY progress bar width set to:", newWidthPercent + '%');

            const previousImageSrc = petImage.src;
            petImage.src = playingImageSrc;
            console.log("Changed image to playing");

            setTimeout(() => {
                if (petImage.src.includes(playingImageSrc)) {
                     petImage.src = previousImageSrc;
                     console.log("Changed image back from playing");
                }
            }, 2000);
        });

    } else {
        console.error("Could not find all required action buttons or progress bar fills! Need at least 3 of each.");
    }
});