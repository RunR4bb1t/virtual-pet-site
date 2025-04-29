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

app.listen(PORT, () => {
  // Updated log message slightly
  console.log(`Server is running and listening on port ${PORT}`);
});