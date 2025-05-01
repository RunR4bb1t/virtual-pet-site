require('dotenv').config(); // Load environment variables first
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt'); // <--- ADDED: For password hashing

// --- Database Connection Pool ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Keep SSL for Render
});

// Test Database Connection (Optional but OK)
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring database client on startup test:', err.stack);
    }
    console.log('Database connection test successful!');
    release();
});

// --- Create Express App ---
const app = express();

// --- Middleware ---

// Enable CORS specifically for your actual frontend origin
app.use(cors({
    origin: 'https://my-cool-pet-game.onrender.com' // <--- CORRECTED ORIGIN
}));

// ** ADDED/ENSURE THIS IS PRESENT **
// Middleware to parse JSON request bodies (needed for registration data)
// Must come BEFORE routes that expect JSON bodies
app.use(express.json());

// Middleware to serve static files from the 'public' directory
// (Should come AFTER CORS and JSON middleware, but before specific API routes)
app.use(express.static('public'));


// --- API Endpoints ---

// GET endpoint to retrieve pet stats (Will need user context later)
app.get('/api/pet-stats', async (req, res) => {
    console.log("Received request for /api/pet-stats");
    try {
        // *** TODO: Modify to get pet for logged-in user ***
        const result = await pool.query('SELECT * FROM pets WHERE id = 1;'); // Still uses ID 1 for now
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error querying database for pet stats:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint for FEED action (Will need user context later)
app.post('/api/feed-pet', async (req, res) => {
    console.log("Received request to /api/feed-pet");
    try {
         // *** TODO: Modify to update pet for logged-in user ***
        const sql = `
            UPDATE pets SET hunger = LEAST(hunger + 15, 100), updated_at = CURRENT_TIMESTAMP
            WHERE id = 1 RETURNING *;`; // Still uses ID 1
        const result = await pool.query(sql);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found to update' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating hunger in database:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint for PET action (Will need user context later)
app.post('/api/pet-pet', async (req, res) => {
    console.log("Received request to /api/pet-pet");
    try {
         // *** TODO: Modify to update pet for logged-in user ***
        const sql = `
            UPDATE pets SET love = LEAST(love + 20, 100), updated_at = CURRENT_TIMESTAMP
            WHERE id = 1 RETURNING *;`; // Still uses ID 1
        const result = await pool.query(sql);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found to update' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating love in database:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint for PLAY action (Will need user context later)
app.post('/api/play-pet', async (req, res) => {
    console.log("Received request to /api/play-pet");
    try {
         // *** TODO: Modify to update pet for logged-in user ***
        const sql = `
            UPDATE pets SET energy = LEAST(energy + 20, 100), updated_at = CURRENT_TIMESTAMP
            WHERE id = 1 RETURNING *;`; // Still uses ID 1
        const result = await pool.query(sql);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found to update' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating energy in database:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- NEW User Registration Route ---
app.post('/api/register', async (req, res) => {
    // 1. Get username and password from request body
    const { username, password } = req.body;

    // 2. Basic Validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 8) { // Example: Enforce minimum password length
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const saltRounds = 10; // Cost factor for hashing - 10 is a good default

    try {
        // 3. Check if username already exists
        const checkUserSql = "SELECT id FROM users WHERE username = $1";
        const existingUser = await pool.query(checkUserSql, [username]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username already exists' }); // 409 Conflict
        }

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 5. Insert the new user
        const insertUserSql = `
            INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            RETURNING id;`; // $1, $2 are placeholders for security
        const newUser = await pool.query(insertUserSql, [username, hashedPassword]);

        // 6. Return success response
        res.status(201).json({ // 201 Created
            message: "User created successfully",
            userId: newUser.rows[0].id // Send back the new user's ID
        });

    } catch (err) {
        console.error('Error during registration:', err.stack);
        res.status(500).json({ error: 'Registration failed due to server error' });
    }
    // Note: Database connection is handled by the pool automatically, no manual closing needed here
});
// --- End of Registration Route ---


// --- Stat Decay Logic ---
const decayInterval = 1000;
const decayAmount = 4;
console.log(`Starting stat decay: -${decayAmount} points every ${decayInterval}ms`);
setInterval(async () => {
    try {
        const sql = `
      UPDATE pets SET
        love   = GREATEST(0, love - $1),
        hunger = GREATEST(0, hunger - $1),
        energy = GREATEST(0, energy - $1),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1 RETURNING id;`; // Still affects only pet ID 1
        await pool.query(sql, [decayAmount]);
    } catch (err) {
        console.error('Error during stat decay interval:', err.stack);
    }
}, decayInterval);


// --- Start Server ---
const PORT = process.env.PORT || 3000; // Use Render's port or 3000 locally
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});