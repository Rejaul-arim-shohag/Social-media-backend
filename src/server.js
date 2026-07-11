
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL Connected");

        // Ensure users table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        connection.release();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MySQL");
        console.error(error.message);
        process.exit(1);
    }
};

startServer();