/**
 * database.js - A utility script to initialize the SQLite database
 * and seed it with a test user and pet.
 * This script is intended for development and setup purposes, not for
 * regular application operation.
 */

require('dotenv').config(); // Load environment variables (e.g., DATABASE_PATH)

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// --- Configuration ---
const DB_PATH = process.env.DATABASE_PATH || './pets.db';
const BCRYPT_SALT_ROUNDS = 10;
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'password123'; // This password will be hashed

// --- Database Connection ---
// Use a Promise-based wrapper for better async handling
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(`Error connecting to database at ${DB_PATH}:`, err.message);
        // Do not exit here; handle the error and let the main script decide.
        return; // Exit the callback
    }
    console.log(`Connected to SQLite database at ${DB_PATH} for seeding.`);
    seedDatabase(); // Proceed with seeding only if connection is successful
});

/**
 * Executes a database run command as a Promise.
 * @param {string} sql - The SQL query string.
 * @param {Array} params - Parameters for the SQL query.
 * @returns {Promise<Object>} - Resolves with this.lastID and this.changes.
 */
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

/**
 * Executes a database get command as a Promise.
 * @param {string} sql - The SQL query string.
 * @param {Array} params - Parameters for the SQL query.
 * @returns {Promise<Object|undefined>} - Resolves with the fetched row or undefined.
 */
const getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Closes the database connection.
 */
const closeDbConnection = () => {
    db.close((err) => {
        if (err) {
            console.error("Error closing database connection:", err.message);
        } else {
            console.log('Closed the database connection successfully.');
        }
    });
};

/**
 * Seeds the database with initial tables and a test user/pet.
 */
const seedDatabase = async () => {
    try {
        // 1. Create the 'users' table if it doesn't exist (ensure schema matches server.js)
        await runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `);
        console.log('Users table checked/created.');

        // 2. Create the 'pets' table if it doesn't exist (ensure schema matches server.js)
        await runAsync(`
            CREATE TABLE IF NOT EXISTS pets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                name TEXT NOT NULL DEFAULT 'My Pet',
                hunger INTEGER DEFAULT 50 CHECK(hunger >= 0 AND hunger <= 100),
                happiness INTEGER DEFAULT 50 CHECK(happiness >= 0 AND happiness <= 100),
                energy INTEGER DEFAULT 50 CHECK(energy >= 0 AND energy <= 100),
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('Pets table checked/created.');

        // 3. Check and create a test user
        const existingUser = await getAsync(`SELECT * FROM users WHERE username = ?`, [TEST_USERNAME]);

        if (!existingUser) {
            console.log(`Creating test user '${TEST_USERNAME}'...`);
            const hashedPassword = await bcrypt.hash(TEST_PASSWORD, BCRYPT_SALT_ROUNDS);
            const userResult = await runAsync(`INSERT INTO users (username, password) VALUES (?, ?)`, [TEST_USERNAME, hashedPassword]);
            const userId = userResult.lastID;

            console.log(`Test user '${TEST_USERNAME}' created with ID: ${userId}.`);

            // 4. Create a default pet for the new test user
            await runAsync(`INSERT INTO pets (user_id, name, hunger, happiness, energy) VALUES (?, ?, ?, ?, ?)`,
                [userId, 'Fluffy', 70, 85, 90]); // Example initial pet stats
            console.log(`Created a default pet for '${TEST_USERNAME}'.`);
        } else {
            console.log(`Test user '${TEST_USERNAME}' already exists. Skipping creation.`);
        }

    } catch (error) {
        console.error('Database seeding error:', error.message);
    } finally {
        closeDbConnection(); // Always close the database connection
    }
};