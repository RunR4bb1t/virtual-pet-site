const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = process.env.DATABASE_PATH || './pets.db';
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error(err.message);
  else console.log(`Connected to database at ${dbPath}`);
});

// Initialize tables
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
);`);
db.run(`CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  hunger INTEGER DEFAULT 50,
  happiness INTEGER DEFAULT 50,
  energy INTEGER DEFAULT 50,
  FOREIGN KEY(user_id) REFERENCES users(id)
);`);

// Sign up
app.post('/api/users/signup', (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, hashed],
    function (err) {
      if (err) return res.status(400).json({ message: 'Username already taken.' });
      db.run(
        `INSERT INTO pets (user_id, name) VALUES (?, ?)`,
        [this.lastID, 'Fluffy'],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error creating pet.' });
          res.json({ message: 'User and pet created!' });
        }
      );
    }
  );
});

// Login
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(400).json({ message: 'Invalid credentials.' });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Auth middleware
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token.' });
  const token = auth.split(' ')[1];
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token.' });
    req.userId = decoded.userId;
    next();
  });
};

// Get pet
app.get('/api/user/pet', authenticate, (req, res) => {
  db.get(`SELECT * FROM pets WHERE user_id = ?`, [req.userId], (err, pet) => {
    if (err || !pet) return res.status(404).json({ message: 'Pet not found.' });
    res.json(pet);
  });
});

// Update pet (feed/play)
app.post('/api/user/pet', authenticate, (req, res) => {
  const { action } = req.body;
  let field;
  if (action === 'feed') field = 'hunger';
  else if (action === 'play') field = 'happiness';
  else return res.status(400).json({ message: 'Invalid action.' });
  db.run(
    `UPDATE pets SET ${field} = MIN(100, ${field} + 10) WHERE user_id = ?`,
    [req.userId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error updating pet.' });
      res.json({ message: 'Pet updated!' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});