const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // We will use this library for password security

// We'll hash a dummy password for our test user
const saltRounds = 10;
const dummyPassword = 'password123';

const db = new sqlite3.Database('./data/pets.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) return console.error("Error connecting to database:", err.message);
    console.log('Connected to the pets.db SQLite database.');
});

db.serialize(() => {
    // 1. Create the new 'users' table
    const createUsersTableSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )
    `;
    db.run(createUsersTableSql, (err) => {
        if (err) return console.error("Error creating users table:", err.message);
        console.log('Users table created or already exists.');
    });

    // 2. Create the 'pets' table with a link to the user
    const createPetsTableSql = `
        CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            hunger INTEGER,
            happiness INTEGER,
            energy INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `;
    db.run(createPetsTableSql, (err) => {
        if (err) return console.error("Error creating pets table:", err.message);
        console.log('Pets table created or already exists.');
    });

    // 3. Create a test user for development
    bcrypt.hash(dummyPassword, saltRounds, (err, hashedPassword) => {
        if (err) return console.error("Error hashing password:", err.message);

        const checkUserSql = `SELECT * FROM users WHERE username = ?`;
        db.get(checkUserSql, ['testuser'], (err, user) => {
            if (err) return console.error("Error checking for user:", err.message);
            if (!user) {
                const insertUserSql = `INSERT INTO users (username, password) VALUES (?, ?)`;
                db.run(insertUserSql, ['testuser', hashedPassword], function(err) {
                    if (err) return console.error("Error inserting user:", err.message);
                    console.log('Created testuser.');
                    
                    // 4. Create a pet for the new test user
                    const checkPetSql = `SELECT * FROM pets WHERE user_id = ?`;
                    db.get(checkPetSql, [this.lastID], (err, pet) => {
                        if (err) return console.error("Error checking for pet:", err.message);
                        if (!pet) {
                            const insertPetSql = `INSERT INTO pets (user_id, hunger, happiness, energy) VALUES (?, ?, ?, ?)`;
                            db.run(insertPetSql, [this.lastID, 50, 60, 75], (err) => {
                                if (err) return console.error("Error inserting pet:", err.message);
                                console.log('Created a pet for testuser.');
                                closeDbConnection();
                            });
                        }
                    });
                });
            } else {
                console.log('Testuser already exists.');
                closeDbConnection();
            }
        });
    });
});

function closeDbConnection() {
    db.close((err) => {
        if (err) return console.error("Error closing database:", err.message);
        console.log('Closed the database connection successfully.');
    });
}