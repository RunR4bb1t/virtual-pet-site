// --- 1. GET OUR HTML ELEMENTS ---
const feedButton = document.querySelector('.pet-actions button:first-child');
const playButton = document.querySelector('.pet-actions button:last-child');
const hungerStatElement = document.querySelector('#hunger-stat');
const happinessStatElement = document.querySelector('#happiness-stat');

// --- 2. DEFINE OUR PET'S DATA (THE NEW WAY) ---
let pet;

// --- 3. FETCH INITIAL DATA FROM THE SERVER ---
function getPetData() {
    console.log("Asking the server for the pet data...");
    fetch('http://localhost:3000/api/pet')
        .then(response => response.json())
        .then(data => {
            console.log("Got data from server:", data);
            pet = data;

            updateAllStats();
        });
}

// --- 4. FUNCTIONALITY ---
function feedPet() {
    // First, update the stat locally for instant feedback
    if (pet.hunger < 100) {
        pet.hunger += 10;
        if (pet.hunger > 100) pet.hunger = 100;
    }
    updateHungerStat(); // Update the screen immediately

    // Now, tell the server about the change
    updatePetOnServer();
}

function playWithPet() {
    if (pet.happiness < 100) {
        pet.happiness += 5;
        if (pet.happiness > 100) pet.happiness = 100;
    }
    updateHappinessStat();

    // Also tell the server about this change
    updatePetOnServer();
}

// NEW Function: Send the entire pet object to the server
function updatePetOnServer() {
    console.log("Sending updated pet data to server:", pet);
    fetch('http://localhost:3000/api/pet/update', { // The URL of our new POST endpoint
        method: 'POST', // We're making a POST request
        headers: {
            'Content-Type': 'application/json' // Tell the server we're sending JSON
        },
        body: JSON.stringify(pet) // Convert our JavaScript 'pet' object into a JSON string
    })
    .then(response => response.json())
    .then(data => {
        // Log the server's success message
        console.log('Server response:', data.message);
    });
}

// --- 5. UPDATE THE DISPLAY ---
function updateHungerStat() {
    hungerStatElement.textContent = `${pet.hunger} / 100`;
}

function updateHappinessStat() {
    happinessStatElement.textContent = `${pet.happiness} / 100`;
}

function updateAllStats() {
    updateHungerStat();
    updateHappinessStat();
}

// --- 6. ATTACH THE EVENT LISTENERS ---
feedButton.addEventListener('click', feedPet);
playButton.addEventListener('click', playWithPet);


// --- 7. KICK EVERYTHING OFF ---
getPetData();