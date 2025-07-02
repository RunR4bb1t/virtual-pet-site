// --- 1. GET OUR HTML ELEMENTS ---
// Get the FIRST button inside the element with class "pet-actions"
const feedButton = document.querySelector('.pet-actions button:first-child');
const hungerStatElement = document.querySelector('#hunger-stat');

// Get the LAST button inside the element with class "pet-actions"
const playButton = document.querySelector('.pet-actions button:last-child');
const happinessStatElement = document.querySelector('#happiness-stat');


// --- 2. DEFINE OUR PET'S DATA ---
let pet = {
    hunger: 85,
    happiness: 95
};

// --- 3. WRITE THE FUNCTIONALITY ---

function feedPet() {
    if (pet.hunger < 100) {
        pet.hunger += 10;
        if (pet.hunger > 100) {
            pet.hunger = 100;
        }
    }
    updateHungerStat();
    console.log("Fed the pet! New hunger:", pet.hunger);
}

function playWithPet() { // Renamed for clarity
    if (pet.happiness < 100) {
        pet.happiness += 5; // Let's make play add a little less than food
        if (pet.happiness > 100) {
            pet.happiness = 100;
        }
    }
    updateHappinessStat();
    console.log("Played with the pet! New happiness:", pet.happiness);
}

// --- 4. UPDATE THE DISPLAY ---

// A separate function to just update the display.
function updateHungerStat() {
    hungerStatElement.textContent = `${pet.hunger} / 100`;
}

// A function to update the happiness display
function updateHappinessStat() {
    happinessStatElement.textContent = `${pet.happiness} / 100`;
}

// --- 5. ATTACH THE EVENT LISTENERS ---

feedButton.addEventListener('click', feedPet);

playButton.addEventListener('click', playWithPet);