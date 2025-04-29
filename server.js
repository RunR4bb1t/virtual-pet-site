require('dotenv').config(); // Make sure this is at the very top
const express = require('express');
const { Pool } = require('pg');

// --- Create Database Connection Pool ---
// (Only create ONE pool)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Keep SSL for Render
});

// --- Test Database Connection (Optional but OK) ---
// (Only connect ONCE to test)
pool.connect((err, client, release) => {
  if (err) {
    // Log error but don't necessarily stop the server from trying to start
    return console.error('Error acquiring database client on startup test:', err.stack);
  }
  console.log('Database connection test successful!');
  release(); // Release the client back to the pool
});
// -----------------------------------

// --- Create Express App ---
// (Only create ONE app)
const app = express();

// --- Middleware ---
// Tell Express to serve static files from the 'public' directory
app.use(express.static('public'));

// --- API Endpoints ---

// GET endpoint to retrieve pet stats FROM DATABASE
app.get('/api/pet-stats', async (req, res) => {
  console.log("Received request for /api/pet-stats");
  try {
    // Assuming pet ID 1 for now for simplicity
    const result = await pool.query('SELECT * FROM pets WHERE id = 1;');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    const fetchedPetData = result.rows[0];
    console.log("Sending pet data from DB:", fetchedPetData);
    res.json(fetchedPetData);
  } catch (err) {
    console.error('Error querying database for pet stats:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for FEED action - updates DATABASE
app.post('/api/feed-pet', async (req, res) => {
  console.log("Received request to /api/feed-pet");
  try {
    const sql = `
      UPDATE pets
      SET
        hunger = LEAST(hunger + 15, 100),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *;`;
    const result = await pool.query(sql);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found to update' });
    const updatedPetData = result.rows[0];
    console.log("Updated petData (from DB):", updatedPetData);
    res.json(updatedPetData);
  } catch (err) {
    console.error('Error updating hunger in database:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for PET action - updates DATABASE
app.post('/api/pet-pet', async (req, res) => {
  console.log("Received request to /api/pet-pet");
  try {
    const sql = `
      UPDATE pets
      SET
        love = LEAST(love + 20, 100), -- Update love column
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *;`; // Return the updated row
    const result = await pool.query(sql);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found to update' });
    const updatedPetData = result.rows[0];
    console.log("Updated petData (from DB):", updatedPetData);
    res.json(updatedPetData); // Send updated data back
  } catch (err) {
    console.error('Error updating love in database:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for PLAY action - updates DATABASE
app.post('/api/play-pet', async (req, res) => {
  console.log("Received request to /api/play-pet");
  try {
    const sql = `
      UPDATE pets
      SET
        energy = LEAST(energy + 20, 100), -- Update energy column
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *;`; // Return the updated row
    const result = await pool.query(sql);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found to update' });
    const updatedPetData = result.rows[0];
    console.log("Updated petData (from DB):", updatedPetData);
    res.json(updatedPetData); // Send updated data back
  } catch (err) {
    console.error('Error updating energy in database:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Start Server ---
// (Define port and start listening ONCE)
const PORT = process.env.PORT || 3000; // Correctly use Render's port

// --- Stat Decay Logic ---
const decayInterval = 1000; // milliseconds (1000ms = 1 second)
const decayAmount = 4;      // Decrease each stat by this amount per interval

console.log(`Starting stat decay: -${decayAmount} points every ${decayInterval}ms`);

// Use setInterval to run the decay function repeatedly
setInterval(async () => {
  // Use try...catch inside setInterval to prevent decay errors from crashing the server
  try {
    // SQL to decrease stats, ensuring they don't go below 0
    const sql = `
      UPDATE pets
      SET
        love   = GREATEST(0, love - $1),   -- GREATEST(0, ...) prevents negative values
        hunger = GREATEST(0, hunger - $1),
        energy = GREATEST(0, energy - $1),
        updated_at = CURRENT_TIMESTAMP     -- Keep timestamp fresh
      WHERE id = 1                         -- Apply only to pet ID 1 for now
      RETURNING id, love, hunger, energy;  -- Optional: Log the new values
    `;

    // Execute the query with the decayAmount as a parameter
    const result = await pool.query(sql, [decayAmount]);

    if (result.rows.length > 0) {
      // You can comment this log out later if it gets too noisy
      // console.log('Decay applied:', result.rows[0]);
    } else {
      // This shouldn't happen if pet ID 1 exists
      console.warn('Pet ID 1 not found during decay update.');
    }

  } catch (err) {
    console.error('Error during stat decay interval:', err.stack);
  }
}, decayInterval); // Run the async function every 'decayInterval' milliseconds
// ------------------------

app.listen(PORT, () => {
  // Updated log message slightly
  console.log(`Server is running and listening on port ${PORT}`);
});