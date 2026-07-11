import { validationResult } from "express-validator";
import {
  addComment,
  getCommentsByPost,
  toggleCommentLike,
  getCommentLikes,
  addReply,
  getRepliesByComment,
  toggleReplyLike,
  getReplyLikes,
} from "./comment.model.js";

export async function addCommentHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const postId = Number(req.params.postId);
  const userId = req.user?.id;
  const { text } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!postId) return res.status(400).json({ message: "Invalid post id" });

  try {
    const comment = await addComment({ postId, userId, text });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add comment" });
  }
}

export async function getCommentsHandler(req, res) {
  const postId = Number(req.params.postId);
  if (!postId) return res.status(400).json({ message: "Invalid post id" });

  try {
    const comments = await getCommentsByPost(postId);
    res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load comments" });
  }
}

export async function toggleCommentLikeHandler(req, res) {
  const userId = req.user?.id;
  const commentId = Number(req.params.commentId);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!commentId) return res.status(400).json({ message: "Invalid comment id" });

  try {
    const result = await toggleCommentLike(commentId, userId);
    res.json({ success: true, liked: result.liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle comment like" });
  }
}

export async function getCommentLikesHandler(req, res) {
  const commentId = Number(req.params.commentId);
  if (!commentId) return res.status(400).json({ message: "Invalid comment id" });

  try {
    const users = await getCommentLikes(commentId);
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load comment likes" });
  }
}

// Replies handlers
export async function addReplyHandler(req, res) {
  const commentId = Number(req.params.commentId);
  const userId = req.user?.id;
  const { text } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!commentId) return res.status(400).json({ message: "Invalid comment id" });

  try {
    const reply = await addReply({ commentId, userId, text });
    res.status(201).json({ success: true, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add reply" });
  }
}

export async function getRepliesHandler(req, res) {
  const commentId = Number(req.params.commentId);
  if (!commentId) return res.status(400).json({ message: "Invalid comment id" });

  try {
    const replies = await getRepliesByComment(commentId);
    res.json({ success: true, replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load replies" });
  }
}

export async function toggleReplyLikeHandler(req, res) {
  const userId = req.user?.id;
  const replyId = Number(req.params.replyId);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!replyId) return res.status(400).json({ message: "Invalid reply id" });

  try {
    const result = await toggleReplyLike(replyId, userId);
    res.json({ success: true, liked: result.liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle reply like" });
  }
}

export async function getReplyLikesHandler(req, res) {
  const replyId = Number(req.params.replyId);
  if (!replyId) return res.status(400).json({ message: "Invalid reply id" });

  try {
    const users = await getReplyLikes(replyId);
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load reply likes" });
  }
}
