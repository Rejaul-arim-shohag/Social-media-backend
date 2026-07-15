import pool from "../../config/database.js";

export async function addComment({ postId, userId, text }) {
  const [result] = await pool.execute(
    `INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`,
    [postId, userId, text]
  );
  return { id: result.insertId, postId, userId, text };
}

export async function getCommentsByPost(postId) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.post_id AS postId, c.user_id AS userId, c.text, c.created_at AS createdAt,
            u.first_name AS firstName, u.last_name AS lastName, u.email,
            COALESCE(l.like_count,0) AS likeCount
     FROM comments c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN (
       SELECT comment_id, COUNT(*) AS like_count FROM comment_likes GROUP BY comment_id
     ) l ON l.comment_id = c.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [postId]
  );

  return rows.map((r) => ({
    id: r.id,
    postId: r.postId,
    userId: r.userId,
    text: r.text,
    createdAt: r.createdAt,
    likeCount: r.likeCount,
    author: { firstName: r.firstName, lastName: r.lastName, email: r.email },
  }));
}

export async function addCommentLike(commentId, userId) {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO comment_likes (comment_id, user_id) VALUES (?, ?)`,
    [commentId, userId]
  );
  return result.affectedRows > 0;
}

export async function removeCommentLike(commentId, userId) {
  const [result] = await pool.execute(`DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`, [commentId, userId]);
  return result.affectedRows > 0;
}

export async function getCommentLikes(commentId) {
  const [rows] = await pool.execute(
    `SELECT u.id AS userId, u.first_name AS firstName, u.last_name AS lastName, u.email
     FROM comment_likes cl
     JOIN users u ON u.id = cl.user_id
     WHERE cl.comment_id = ?
     ORDER BY cl.created_at DESC`,
    [commentId]
  );
  return rows.map((r) => ({ userId: r.userId, firstName: r.firstName, lastName: r.lastName, email: r.email }));
}

export async function toggleCommentLike(commentId, userId) {
  const added = await addCommentLike(commentId, userId);
  if (added) return { liked: true };
  const removed = await removeCommentLike(commentId, userId);
  return { liked: removed ? false : false };
}

// Replies
export async function addReply({ commentId, userId, text }) {
  const [result] = await pool.execute(
    `INSERT INTO replies (comment_id, user_id, text) VALUES (?, ?, ?)`,
    [commentId, userId, text]
  );
  return { id: result.insertId, commentId, userId, text };
}

export async function getRepliesByComment(commentId) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.comment_id AS commentId, r.user_id AS userId, r.text, r.created_at AS createdAt,
            u.first_name AS firstName, u.last_name AS lastName, u.email,
            COALESCE(l.like_count,0) AS likeCount
     FROM replies r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN (
       SELECT reply_id, COUNT(*) AS like_count FROM reply_likes GROUP BY reply_id
     ) l ON l.reply_id = r.id
     WHERE r.comment_id = ?
     ORDER BY r.created_at ASC`,
    [commentId]
  );

  return rows.map((r) => ({
    id: r.id,
    commentId: r.commentId,
    userId: r.userId,
    text: r.text,
    createdAt: r.createdAt,
    likeCount: r.likeCount,
    author: { firstName: r.firstName, lastName: r.lastName, email: r.email },
  }));
}

export async function addReplyLike(replyId, userId) {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO reply_likes (reply_id, user_id) VALUES (?, ?)`,
    [replyId, userId]
  );
  return result.affectedRows > 0;
}

export async function removeReplyLike(replyId, userId) {
  const [result] = await pool.execute(`DELETE FROM reply_likes WHERE reply_id = ? AND user_id = ?`, [replyId, userId]);
  return result.affectedRows > 0;
}

export async function getReplyLikes(replyId) {
  const [rows] = await pool.execute(
    `SELECT u.id AS userId, u.first_name AS firstName, u.last_name AS lastName, u.email
     FROM reply_likes rl
     JOIN users u ON u.id = rl.user_id
     WHERE rl.reply_id = ?
     ORDER BY rl.created_at DESC`,
    [replyId]
  );
  return rows.map((r) => ({ userId: r.userId, firstName: r.firstName, lastName: r.lastName, email: r.email }));
}

export async function toggleReplyLike(replyId, userId) {
  const added = await addReplyLike(replyId, userId);
  if (added) return { liked: true };
  const removed = await removeReplyLike(replyId, userId);
  return { liked: removed ? false : false };
}

// Nested replies (replies to replies)
export async function addNestedReply({ replyId, userId, text }) {
  const [result] = await pool.execute(
    `INSERT INTO nested_replies (reply_id, user_id, text) VALUES (?, ?, ?)`,
    [replyId, userId, text]
  );
  return { id: result.insertId, replyId, userId, text };
}

export async function getNestedRepliesByReply(replyId) {
  const [rows] = await pool.execute(
    `SELECT nr.id, nr.reply_id AS replyId, nr.user_id AS userId, nr.text, nr.created_at AS createdAt,
            u.first_name AS firstName, u.last_name AS lastName, u.email,
            COALESCE(l.like_count,0) AS likeCount
     FROM nested_replies nr
     JOIN users u ON u.id = nr.user_id
     LEFT JOIN (
       SELECT nested_reply_id, COUNT(*) AS like_count FROM nested_reply_likes GROUP BY nested_reply_id
     ) l ON l.nested_reply_id = nr.id
     WHERE nr.reply_id = ?
     ORDER BY nr.created_at ASC`,
    [replyId]
  );

  return rows.map((r) => ({
    id: r.id,
    replyId: r.replyId,
    userId: r.userId,
    text: r.text,
    createdAt: r.createdAt,
    likeCount: r.likeCount,
    author: { firstName: r.firstName, lastName: r.lastName, email: r.email },
  }));
}

export async function addNestedReplyLike(nestedReplyId, userId) {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO nested_reply_likes (nested_reply_id, user_id) VALUES (?, ?)`,
    [nestedReplyId, userId]
  );
  return result.affectedRows > 0;
}

export async function removeNestedReplyLike(nestedReplyId, userId) {
  const [result] = await pool.execute(`DELETE FROM nested_reply_likes WHERE nested_reply_id = ? AND user_id = ?`, [nestedReplyId, userId]);
  return result.affectedRows > 0;
}

export async function getNestedReplyLikes(nestedReplyId) {
  const [rows] = await pool.execute(
    `SELECT u.id AS userId, u.first_name AS firstName, u.last_name AS lastName, u.email
     FROM nested_reply_likes nrl
     JOIN users u ON u.id = nrl.user_id
     WHERE nrl.nested_reply_id = ?
     ORDER BY nrl.created_at DESC`,
    [nestedReplyId]
  );
  return rows.map((r) => ({ userId: r.userId, firstName: r.firstName, lastName: r.lastName, email: r.email }));
}

export async function toggleNestedReplyLike(nestedReplyId, userId) {
  const added = await addNestedReplyLike(nestedReplyId, userId);
  if (added) return { liked: true };
  const removed = await removeNestedReplyLike(nestedReplyId, userId);
  return { liked: removed ? false : false };
}
