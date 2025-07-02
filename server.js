// 1. Import Express and Cors
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 3. "IN-MEMORY" DATABASE
let petData = {
    hunger: 50,
    happiness: 60,
    energy: 75
};

// 4. API ROUTES

// --- GET the current pet data ---
app.get('/api/pet', (req, res) => {
    console.log("GET request received for pet data!");
    res.json(petData);
});

// --- POST (update) the pet data ---
app.post('/api/pet/update', (req, res) => {
    const newData = req.body;
    console.log("POST request received! New data:", newData);

    if (newData.hunger !== undefined) {
        petData.hunger = newData.hunger;
    }
    if (newData.happiness !== undefined) {
        petData.happiness = newData.happiness;
    }

    // Send back a success response
    res.json({ success: true, message: "Pet data updated successfully." });
});


// 5. Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});