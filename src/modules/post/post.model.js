import pool from "../../config/database.js";

export async function createPost({ userId, text, imageUrl, visibility }) {
  const [result] = await pool.execute(
    `INSERT INTO posts (user_id, text, image_url, visibility) VALUES (?, ?, ?, ?)`,
    [userId, text, imageUrl || null, visibility || "public"]
  );

  return {
    id: result.insertId,
    userId,
    text,
    imageUrl,
    visibility: visibility || "public",
  };
}
