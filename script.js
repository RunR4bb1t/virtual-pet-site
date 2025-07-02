// --- 1. GET OUR HTML ELEMENTS ---
// Find the button and the hunger stat display in the HTML
const feedButton = document.querySelector('.pet-actions button:first-child');
const hungerStatElement = document.querySelector('#hunger-stat');
const playButton = document.querySelector('.pet-actions button:first-child');
const happinessStatElement = document.querySelector('#happiness-stat');


// --- 2. DEFINE OUR PET'S DATA ---
// Let's create an object to hold our pet's stats.
// This is much cleaner than having loose variables.
let pet = {
    hunger: 85
};
let pet = {
    happiness: 85
};

// --- 3. WRITE THE FUNCTIONALITY ---
// This function will be called when the feed button is clicked
function feedPet() {
    // Logic: Increase hunger, but don't let it go over 100
    if (pet.hunger < 100) {
        pet.hunger += 10; // Add 10 to the hunger value
        if (pet.hunger > 100) {
            pet.hunger = 100; // Cap it at 100
        }
    }

    // Update the text on the page to show the new hunger value
    updateHungerStat();

    // Log a message to the console for debugging
    console.log("Fed the pet! New hunger:", pet.hunger);
}

function playPet() {
    if (pet.happiness < 100) {
        pet.happiness += 10;
        if (pet.happiness > 100) {
            pet.happiness = 100;
        }
    }

    // Update the text on the page to show the new hunger value
    updateHappinessStat();

    // Log a message to the console for debugging
    console.log("Play with the pet! New happiness:", pet.happiness);
}

// A separate function to just update the display. This is good practice.
function updateHungerStat() {
    hungerStatElement.textContent = `${pet.hunger} / 100`;
}
function updateHappinessStat() {
    happinessStatElement.textContent = `${pet.happiness} / 100`;
}

// --- 4. ATTACH THE EVENT LISTENER ---
// Tell the button to run our feedPet function when it's clicked
feedButton.addEventListener('click', feedPet);
playButton.addEventListener('click', playPet);