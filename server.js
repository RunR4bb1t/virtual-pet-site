/**
 * server.js - Main Express server for the Everwyn virtual pet site.
 * Handles API routes for user authentication, pet management, and serves static files.
 */

// --- Module Imports ---
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
require('dotenv').config(); // Loads environment variables from a .env file

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || './pets.db';
const JWT_SECRET = process.env.JWT_SECRET; // JWT Secret should be a strong, randomly generated string.
const BCRYPT_SALT_ROUNDS = 10; // Recommended salt rounds for bcrypt

// Ensure JWT_SECRET is set in environment variables (e.g., in a .env file)
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.');
  process.exit(1); // Exit the process if critical environment variable is missing
}

// --- Middleware Setup ---
app.use(cors()); // Enable CORS for all routes - adjust options for specific origins in production
app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body
// Serve static files from the 'public' directory
app.use(express.static('public'));

// --- Database Connection ---
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(`Error connecting to database at ${DB_PATH}:`, err.message);
    process.exit(1); // Exit if database connection fails
  } else {
    console.log(`Connected to SQLite database at ${DB_PATH}`);
    initializeDatabase(); // Initialize tables only after successful connection
  }
});

/**
 * Initializes database tables if they do not exist.
 */
const initializeDatabase = () => {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `, (err) => {
      if (err) console.error("Error creating 'users' table:", err.message);
      else console.log("'users' table checked/created.");
    });

    // Create pets table
    db.run(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL, -- Pet is unique per user
        name TEXT NOT NULL DEFAULT 'My Pet',
        hunger INTEGER DEFAULT 50 CHECK(hunger >= 0 AND hunger <= 100),
        happiness INTEGER DEFAULT 50 CHECK(happiness >= 0 AND happiness <= 100),
        energy INTEGER DEFAULT 50 CHECK(energy >= 0 AND energy <= 100),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `, (err) => {
      if (err) console.error("Error creating 'pets' table:", err.message);
      else console.log("'pets' table checked/created.");
    });
  });
};

// --- Authentication Middleware ---
/**
 * Middleware to authenticate requests using JWT.
 * Attaches decoded user ID to req.userId if token is valid.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Check if Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ message: 'Token format is "Bearer <token>".' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Handle different JWT errors (e.g., token expired, invalid signature)
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.userId = decoded.userId; // Attach userId to the request object
    next(); // Proceed to the next middleware/route handler
  });
};

// --- API Routes ---

// User Signup
app.post('/api/users/signup', async (req, res) => {
  const { username, password } = req.body;

  // Basic input validation
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({ message: 'Username must be at least 3 characters and password at least 6 characters.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
      if (err) {
        // Handle unique username constraint violation
        if (err.message.includes('UNIQUE constraint failed: users.username')) {
          return res.status(409).json({ message: 'Username already exists. Please choose another.' });
        }
        console.error('Error during signup:', err.message);
        return res.status(500).json({ message: 'Error registering user.' });
      }

      const userId = this.lastID; // Get the ID of the newly inserted user
      // Create a default pet for the new user
      db.run(`INSERT INTO pets (user_id, name) VALUES (?, ?)`, [userId, 'Fluffy'], (petErr) => {
        if (petErr) {
          console.error('Error creating default pet:', petErr.message);
          // Decide whether to rollback user creation or just log the error
          return res.status(500).json({ message: 'User registered, but failed to create a pet.' });
        }
        res.status(201).json({ message: 'User registered and pet created successfully!' });
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) {
      console.error('Error during login query:', err.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful!', token });
    } catch (error) {
      console.error('Error comparing passwords or generating token:', error);
      res.status(500).json({ message: 'Internal server error during login.' });
    }
  });
});

// User Logout (optional, JWTs are typically client-side invalidated by removing the token)
app.post('/api/users/logout', authenticateToken, (req, res) => {
  // For JWTs, logout is primarily client-side.
  // If you had server-side session management or refresh tokens, you'd invalidate them here.
  res.status(200).json({ message: 'Logged out successfully.' });
});

// Get User's Pet
app.get('/api/user/pet', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, hunger, happiness, energy FROM pets WHERE user_id = ?`, [req.userId], (err, pet) => {
    if (err) {
      console.error('Error fetching pet:', err.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found for this user.' });
    }
    res.json(pet);
  });
});

// Perform Pet Action (Feed/Play)
app.post('/api/user/pet/action', authenticateToken, (req, res) => {
  const { action } = req.body; // 'feed' or 'play'
  const userId = req.userId;

  if (!action || (action !== 'feed' && action !== 'play')) {
    return res.status(400).json({ message: 'Invalid pet action specified.' });
  }

  let fieldToUpdate;
  let increaseAmount;
  let cooldownField; // If you plan to add cooldowns

  switch (action) {
    case 'feed':
      fieldToUpdate = 'hunger';
      increaseAmount = 10; // Example: increase hunger by 10
      // cooldownField = 'lastFed';
      break;
    case 'play':
      fieldToUpdate = 'happiness';
      increaseAmount = 15; // Example: increase happiness by 15
      // cooldownField = 'lastPlayed';
      break;
    default:
      return res.status(400).json({ message: 'Unsupported action.' });
  }

  db.serialize(() => {
    // Start a transaction for atomicity if more complex operations
    // db.run('BEGIN TRANSACTION;');

    // Update the pet's stat, ensuring it stays within 0-100 bounds
    db.run(`
      UPDATE pets
      SET ${fieldToUpdate} = MIN(100, ${fieldToUpdate} + ?)
      WHERE user_id = ?;
    `, [increaseAmount, userId], function (updateErr) {
      if (updateErr) {
        console.error(`Error updating pet ${fieldToUpdate}:`, updateErr.message);
        // db.run('ROLLBACK;');
        return res.status(500).json({ message: `Failed to ${action} pet.` });
      }

      // After updating, re-fetch the current pet stats to send back to client
      db.get(`SELECT id, name, hunger, happiness, energy FROM pets WHERE user_id = ?`, [userId], (fetchErr, updatedPet) => {
        if (fetchErr) {
          console.error('Error fetching updated pet stats:', fetchErr.message);
          // db.run('ROLLBACK;');
          return res.status(500).json({ message: 'Failed to retrieve updated pet stats.' });
        }
        // db.run('COMMIT;');
        res.json(updatedPet);
      });
    });
  });
});


// --- Error Handling Middleware ---
// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// General error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      // In production, avoid sending stack traces to the client
      stack: process.env.NODE_ENV === 'development' ? error.stack : {}
    }
  });
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});