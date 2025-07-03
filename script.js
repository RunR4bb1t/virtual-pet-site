// --- 1. INITIAL AUTHENTICATION CHECK ---
const token = localStorage.getItem('pet_token');
if (!token) {
    // If no token is found, redirect the user to the login page
    window.location.href = 'login.html';
}

// --- 2. GET OUR HTML ELEMENTS ---
const feedButton = document.querySelector('.pet-actions button:first-child');
const playButton = document.querySelector('.pet-actions button:last-child');
const logoutButton = document.getElementById('logout-button');
const hungerStatElement = document.querySelector('#hunger-stat');
const happinessStatElement = document.querySelector('#happiness-stat');

let pet;

// --- 3. FETCH USER-SPECIFIC DATA FROM THE SERVER ---
function getPetData() {
    fetch('http://localhost:3000/api/user/pet', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Include the token in the request
        }
    })
    .then(response => {
        if (response.status === 403 || response.status === 401) {
            // If token is invalid or expired, force logout
            logout();
        }
        return response.json();
    })
    .then(data => {
        if (data.error) throw new Error(data.error);
        pet = data;
        updateAllStats();
        feedButton.disabled = false;
        playButton.disabled = false;
    })
    .catch(error => {
        console.error("Fatal error fetching pet data:", error);
        document.querySelector('.pet-stats').innerHTML = "<h3>Could not load pet data. Please try again.</h3>";
    });
}

// --- 4. FUNCTIONS TO HANDLE USER ACTIONS ---
function feedPet() { /* ... no changes needed ... */ }
function playWithPet() { /* ... no changes needed ... */ }

function feedPet() {
    if (pet.hunger >= 100) return;
    pet.hunger = Math.min(100, pet.hunger + 10);
    updateHungerStat();
    updatePetOnServer();
}

function playWithPet() {
    if (pet.happiness >= 100) return;
    pet.happiness = Math.min(100, pet.happiness + 5);
    updateHappinessStat();
    updatePetOnServer();
}

// --- 5. FUNCTION TO SEND UPDATES TO THE SERVER ---
function updatePetOnServer() {
    fetch('http://localhost:3000/api/user/pet/update', { // Use the new protected route
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send the token with the update
        },
        body: JSON.stringify(pet),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) console.log("Server confirmed update.");
        else console.error("Server returned an error on update.");
    });
}

// --- 6. NEW LOGOUT FUNCTIONALITY ---
function logout() {
    localStorage.removeItem('pet_token'); // Remove the token
    window.location.href = 'login.html';  // Redirect to login page
}

// --- 7. UPDATE DISPLAY FUNCTIONS (No changes needed) ---
function updateHungerStat() { hungerStatElement.textContent = `${pet.hunger} / 100`; }
function updateHappinessStat() { happinessStatElement.textContent = `${pet.happiness} / 100`; }
function updateAllStats() {
    updateHungerStat();
    updateHappinessStat();
}

// --- 8. ATTACH EVENT LISTENERS ---
feedButton.addEventListener('click', feedPet);
playButton.addEventListener('click', playWithPet);
logoutButton.addEventListener('click', logout);

// --- 9. KICK EVERYTHING OFF ---
getPetData();