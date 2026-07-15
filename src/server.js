
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

        // Ensure posts table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                text TEXT,
                image_url VARCHAR(500),
                visibility ENUM('public','private') DEFAULT 'public',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure likes table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_like (post_id, user_id),
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure comments table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure comment_likes table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comment_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                comment_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_comment_like (comment_id, user_id),
                FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure replies table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                comment_id INT NOT NULL,
                user_id INT NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure reply_likes table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reply_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reply_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_reply_like (reply_id, user_id),
                FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure nested_replies table exists (replies to replies)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS nested_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reply_id INT NOT NULL,
                user_id INT NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Ensure nested_reply_likes table exists (likes for nested replies)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS nested_reply_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nested_reply_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_nested_reply_like (nested_reply_id, user_id),
                FOREIGN KEY (nested_reply_id) REFERENCES nested_replies(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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