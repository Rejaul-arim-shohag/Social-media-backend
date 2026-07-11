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
            u.email,
            COALESCE(l.like_count, 0) AS likeCount
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN (
       SELECT post_id, COUNT(*) AS like_count
       FROM likes
       GROUP BY post_id
     ) l ON l.post_id = p.id
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
        likeCount: row.likeCount,
        author: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
        },
    }));
}

export async function addLike(postId, userId) {
    const [result] = await pool.execute(
        `INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)`,
        [postId, userId]
    );
    return result.affectedRows > 0;
}

export async function removeLike(postId, userId) {
    const [result] = await pool.execute(
        `DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
        [postId, userId]
    );
    return result.affectedRows > 0;
}

export async function getLikesByPost(postId) {
    const [rows] = await pool.execute(
        `SELECT u.id AS userId, u.first_name AS firstName, u.last_name AS lastName, u.email
         FROM likes l
         JOIN users u ON u.id = l.user_id
         WHERE l.post_id = ?
         ORDER BY l.created_at DESC`,
        [postId]
    );
    return rows.map((row) => ({
        userId: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
    }));
}

export async function toggleLike(postId, userId) {
    const added = await addLike(postId, userId);
    if (added) return { liked: true };

    const removed = await removeLike(postId, userId);
    return { liked: removed ? false : false };
}
