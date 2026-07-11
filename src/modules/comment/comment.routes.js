import express from "express";
import { body } from "express-validator";
import { authenticate } from "../auth/auth.middleware.js";
import {
  addCommentHandler,
  getCommentsHandler,
  toggleCommentLikeHandler,
  getCommentLikesHandler,
  addReplyHandler,
  getRepliesHandler,
  toggleReplyLikeHandler,
  getReplyLikesHandler,
} from "./comment.controller.js";

const router = express.Router();

// Comments on posts
router.get("/posts/:postId/comments", authenticate, getCommentsHandler);
router.post(
  "/posts/:postId/comments",
  authenticate,
  [body("text").notEmpty().withMessage("Text required")],
  addCommentHandler
);

// Comment likes
router.post("/comments/:commentId/like", authenticate, toggleCommentLikeHandler);
router.get("/comments/:commentId/likes", authenticate, getCommentLikesHandler);

// Replies
router.get("/comments/:commentId/replies", authenticate, getRepliesHandler);
router.post(
  "/comments/:commentId/replies",
  authenticate,
  [body("text").notEmpty().withMessage("Text required")],
  addReplyHandler
);

// Reply likes
router.post("/replies/:replyId/like", authenticate, toggleReplyLikeHandler);
router.get("/replies/:replyId/likes", authenticate, getReplyLikesHandler);

export default router;
