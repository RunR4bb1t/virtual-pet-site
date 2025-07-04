require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const saltRounds = 10;
// In a real production app, this secret key should be stored securely and not be in the code.
const JWT_SECRET = 'default_secret_for_local_dev';

// --- DATABASE CONNECTION ---
const dbPath = process.env.DATABASE_PATH || './pets.db';
const db = new sqlite3.Database('./pets.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error("Error connecting to the database:", err.message);
    console.log('Server connected to the pets.db database.');
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// ====================================================================
// --- AUTHENTICATION ROUTES ---

// Route for user signup
app.post('/api/users/signup', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (user) return res.status(400).json({ error: "Username already taken." });

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).json({ error: "Error hashing password." });
            const insertUserSql = `INSERT INTO users (username, password) VALUES (?, ?)`;
            db.run(insertUserSql, [username, hashedPassword], function(err) {
                if (err) return res.status(500).json({ error: "Error creating user." });
                const newUserId = this.lastID;
                const insertPetSql = `INSERT INTO pets (user_id, hunger, happiness, energy) VALUES (?, ?, ?, ?)`;
                db.run(insertPetSql, [newUserId, 100, 100, 100], (err) => {
                    if (err) return res.status(500).json({ error: "Error creating pet." });
                    res.status(201).json({ success: true, message: "User and pet created successfully!" });
                });
            });
        });
    });
});

// Route for user login
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, user) => {
        if (err) return res.status(500).json({ error: "Server error." });
        if (!user) return res.status(400).json({ error: "Invalid username or password." });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "Server error during password comparison." });
            if (isMatch) {
                const payload = { userId: user.id, username: user.username };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
                res.json({ success: true, message: "Login successful!", token: token });
            } else {
                res.status(400).json({ error: "Invalid username or password." });
            }
        });
    });
});

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- PROTECTED PET DATA ROUTES ---
app.get('/api/user/pet', authenticateToken, (req, res) => {
    const sql = `SELECT * FROM pets WHERE user_id = ?`;
    db.get(sql, [req.user.userId], (err, pet) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!pet) return res.status(404).json({ error: "No pet found for this user." });
        res.json(pet);
    });
});

app.post('/api/user/pet/update', authenticateToken, (req, res) => {
    const newData = req.body;
    const sql = `UPDATE pets SET hunger = ?, happiness = ? WHERE user_id = ?`;
    const params = [newData.hunger, newData.happiness, req.user.userId];
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Pet data updated successfully." });
    });
});
// ====================================================================

// --- PET STAT DECAY ---
function decayStats() {
    const sql = `UPDATE pets SET hunger = MAX(0, hunger - 1), happiness = MAX(0, happiness - 2)`;
    db.run(sql, [], (err) => {
        if (err) console.error("Error decaying stats:", err.message);
    });
}
setInterval(decayStats, 30000);

// --- START THE SERVER ---
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});