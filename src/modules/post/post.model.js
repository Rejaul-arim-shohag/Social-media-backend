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
export async function getAllPosts() {
    const [rows] = await pool.execute(
        `SELECT p.id,
            p.user_id AS userId,
            p.text,
            p.image_url AS imageUrl,
            p.visibility,
            p.created_at AS createdAt,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.email
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.visibility = 'public'
     ORDER BY p.created_at DESC`,
    );

    return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        text: row.text,
        imageUrl: row.imageUrl,
        visibility: row.visibility,
        createdAt: row.createdAt,
        author: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
        },
    }));
}
