require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Needed for login password comparison too

// --- Database Connection Pool ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test Database Connection
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
app.use(cors({
    origin: 'https://my-cool-pet-game.onrender.com' // Your frontend origin
}));
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.static('public')); // Serve static files

// --- API Endpoints ---

// GET Pet Stats (Needs user context later)
app.get('/api/pet-stats', async (req, res) => {
    console.log("Received request for /api/pet-stats");
    try {
        // TODO: Modify for logged-in user
        const result = await pool.query('SELECT * FROM pets WHERE id = 1;');
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error querying for pet stats:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST Feed Pet (Needs user context later)
app.post('/api/feed-pet', async (req, res) => {
    console.log("Received request to /api/feed-pet");
    try {
        // TODO: Modify for logged-in user
        const sql = `UPDATE pets SET hunger = LEAST(hunger + 15, 100), updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *;`;
        const result = await pool.query(sql);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating hunger:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST Pet Pet (Needs user context later)
app.post('/api/pet-pet', async (req, res) => {
     console.log("Received request to /api/pet-pet");
    try {
        // TODO: Modify for logged-in user
        const sql = `UPDATE pets SET love = LEAST(love + 20, 100), updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *;`;
        const result = await pool.query(sql);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating love:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST Play Pet (Needs user context later)
app.post('/api/play-pet', async (req, res) => {
    console.log("Received request to /api/play-pet");
    try {
        // TODO: Modify for logged-in user
        const sql = `UPDATE pets SET energy = LEAST(energy + 20, 100), updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *;`;
        const result = await pool.query(sql);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating energy:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST User Registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const saltRounds = 10;
    try {
        const checkUserSql = "SELECT id FROM users WHERE username = $1";
        const existingUser = await pool.query(checkUserSql, [username]);
        if (existingUser.rows.length > 0) return res.status(409).json({ error: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const insertUserSql = `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id;`;
        const newUser = await pool.query(insertUserSql, [username, hashedPassword]);

        res.status(201).json({ message: "User created successfully", userId: newUser.rows[0].id });
    } catch (err) {
        console.error('Error during registration:', err.stack);
        res.status(500).json({ error: 'Registration failed due to server error' });
    }
});


// --- NEW User Login Route ---
app.post('/api/login', async (req, res) => {
    // 1. Get username and password from request body
    const { username, password } = req.body;

    // 2. Basic Validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // 3. Find the user by username in the database
        //    Select the id and the hashed password
        const findUserSql = "SELECT id, username, password_hash FROM users WHERE username = $1";
        const result = await pool.query(findUserSql, [username]);

        // 4. Check if user exists
        if (result.rows.length === 0) {
            // User not found - send back 401 Unauthorized
            // Use a generic message for security - don't reveal if username exists or not
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // User was found, get their data
        const user = result.rows[0]; // Contains user.id, user.username, user.password_hash

        // 5. Compare submitted password with the stored hash
        //    bcrypt.compare automatically handles the salt and hashing comparison
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        // 6. Check if passwords match
        if (!isValidPassword) {
            // Password doesn't match - send back 401 Unauthorized
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 7. Login successful! Passwords match.
        // *** TODO: Implement session/token creation here later ***
        // For now, just send back a success message and user info
        console.log(`User login successful: ${user.username} (ID: ${user.id})`);
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username
                // DO NOT send back the password hash!
            }
        });

    } catch (err) {
        console.error('Error during login:', err.stack);
        res.status(500).json({ error: 'Login failed due to server error' });
    }
});
// --- End of Login Route ---


// --- Stat Decay Logic ---
const decayInterval = 1000;
const decayAmount = 4;
console.log(`Starting stat decay: -${decayAmount} points every ${decayInterval}ms`);
setInterval(async () => {
    try {
        const sql = `UPDATE pets SET love = GREATEST(0, love - $1), hunger = GREATEST(0, hunger - $1), energy = GREATEST(0, energy - $1), updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING id;`;
        await pool.query(sql, [decayAmount]);
    } catch (err) {
        console.error('Error during stat decay interval:', err.stack);
    }
}, decayInterval);


// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});