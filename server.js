require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

// --- Create Database Connection Pool ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- Test Database Connection ---
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring database client', err.stack);
  }
  console.log('Database connected successfully!');
  release();
});
// -----------------------------------

const app = express();

// --- Note: In-memory petData variable removed as we now use the database ---

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

// *** MODIFIED: POST endpoint for PET action - updates DATABASE ***
app.post('/api/pet-pet', async (req, res) => { // Made async
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
// *** END OF MODIFIED PET Endpoint ***

// *** MODIFIED: POST endpoint for PLAY action - updates DATABASE ***
app.post('/api/play-pet', async (req, res) => { // Made async
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
// *** END OF MODIFIED PLAY Endpoint ***

// ---------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});