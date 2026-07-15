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
export async function getAllPosts(currentUserId) {
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
            l.user_id AS likerId,
            lu.first_name AS likerFirstName,
            lu.last_name AS likerLastName,
            lu.email AS likerEmail
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN likes l ON l.post_id = p.id
     LEFT JOIN users lu ON lu.id = l.user_id
     WHERE p.visibility = 'public'
     ORDER BY p.created_at DESC`,
    );

    const posts = [];
    const postMap = new Map();

    for (const row of rows) {
        let post = postMap.get(row.id);
        if (!post) {
            post = {
                id: row.id,
                userId: row.userId,
                text: row.text,
                imageUrl: row.imageUrl,
                visibility: row.visibility,
                createdAt: row.createdAt,
                likedByCurrentUser: false,
                likers: [],
                likeCount: 0,
                author: {
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                },
            };
            postMap.set(row.id, post);
            posts.push(post);
        }

        if (row.likerId) {
            post.likers.push({
                userId: row.likerId,
                firstName: row.likerFirstName,
                lastName: row.likerLastName,
                email: row.likerEmail,
            });
            post.likeCount = post.likers.length;
            if (currentUserId && row.likerId === currentUserId) {
                post.likedByCurrentUser = true;
            }
        }
    }

    return posts;
}

export async function getAllPostsWithComments(currentUserId) {
    const posts = await getAllPosts(currentUserId);
    if (posts.length === 0) return posts;

    const postIds = posts.map((post) => post.id);
    const postPlaceholders = postIds.map(() => "?").join(",");
    const [commentRows] = await pool.execute(
        `SELECT c.id,
                c.post_id AS postId,
                c.user_id AS userId,
                c.text,
                c.created_at AS createdAt,
                u.first_name AS firstName,
                u.last_name AS lastName,
                u.email,
                COALESCE(l.like_count, 0) AS likeCount
         FROM comments c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN (
             SELECT comment_id, COUNT(*) AS like_count FROM comment_likes GROUP BY comment_id
         ) l ON l.comment_id = c.id
         WHERE c.post_id IN (${postPlaceholders})
         ORDER BY c.created_at ASC`,
        postIds
    );

    const commentsByPost = new Map();
    const commentIds = [];
    for (const row of commentRows) {
        const comment = {
            id: row.id,
            postId: row.postId,
            userId: row.userId,
            text: row.text,
            createdAt: row.createdAt,
            likeCount: row.likeCount,
            author: {
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
            },
            replies: [],
        };
        commentIds.push(row.id);
        const list = commentsByPost.get(row.postId) || [];
        list.push(comment);
        commentsByPost.set(row.postId, list);
    }

    const repliesByComment = new Map();
    const replyIds = [];
    if (commentIds.length > 0) {
        const commentPlaceholders = commentIds.map(() => "?").join(",");
        const [replyRows] = await pool.execute(
            `SELECT r.id,
                    r.comment_id AS commentId,
                    r.user_id AS userId,
                    r.text,
                    r.created_at AS createdAt,
                    u.first_name AS firstName,
                    u.last_name AS lastName,
                    u.email,
                    COALESCE(l.like_count, 0) AS likeCount
             FROM replies r
             JOIN users u ON u.id = r.user_id
             LEFT JOIN (
                 SELECT reply_id, COUNT(*) AS like_count FROM reply_likes GROUP BY reply_id
             ) l ON l.reply_id = r.id
             WHERE r.comment_id IN (${commentPlaceholders})
             ORDER BY r.created_at ASC`,
            commentIds
        );

        for (const row of replyRows) {
            const reply = {
                id: row.id,
                commentId: row.commentId,
                userId: row.userId,
                text: row.text,
                createdAt: row.createdAt,
                likeCount: row.likeCount,
                author: {
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                },
                nestedReplies: [],
            };
            replyIds.push(row.id);
            const list = repliesByComment.get(row.commentId) || [];
            list.push(reply);
            repliesByComment.set(row.commentId, list);
        }
    }

    if (replyIds.length > 0) {
        const replyPlaceholders = replyIds.map(() => "?").join(",");
        const [nestedRows] = await pool.execute(
            `SELECT nr.id,
                    nr.reply_id AS replyId,
                    nr.user_id AS userId,
                    nr.text,
                    nr.created_at AS createdAt,
                    u.first_name AS firstName,
                    u.last_name AS lastName,
                    u.email,
                    COALESCE(l.like_count, 0) AS likeCount
             FROM nested_replies nr
             JOIN users u ON u.id = nr.user_id
             LEFT JOIN (
                 SELECT nested_reply_id, COUNT(*) AS like_count FROM nested_reply_likes GROUP BY nested_reply_id
             ) l ON l.nested_reply_id = nr.id
             WHERE nr.reply_id IN (${replyPlaceholders})
             ORDER BY nr.created_at ASC`,
            replyIds
        );

        const nestedByReply = new Map();
        for (const row of nestedRows) {
            const nestedReply = {
                id: row.id,
                replyId: row.replyId,
                userId: row.userId,
                text: row.text,
                createdAt: row.createdAt,
                likeCount: row.likeCount,
                author: {
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                },
            };
            const list = nestedByReply.get(row.replyId) || [];
            list.push(nestedReply);
            nestedByReply.set(row.replyId, list);
        }

        for (const replies of repliesByComment.values()) {
            for (const reply of replies) {
                reply.nestedReplies = nestedByReply.get(reply.id) || [];
            }
        }
    }

    const commentsWithRepliesByPost = new Map();
    for (const [postId, comments] of commentsByPost.entries()) {
        const enrichedComments = comments.map((comment) => ({
            ...comment,
            replyCount: repliesByComment.get(comment.id)?.length || 0,
            replies: repliesByComment.get(comment.id) || [],
        }));
        commentsWithRepliesByPost.set(postId, enrichedComments);
    }

    return posts.map((post) => ({
        ...post,
        commentCount: commentsWithRepliesByPost.get(post.id)?.length || 0,
        comments: commentsWithRepliesByPost.get(post.id) || [],
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
