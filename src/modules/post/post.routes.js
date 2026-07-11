import express from "express";
import { body } from "express-validator";
import { authenticate } from "../auth/auth.middleware.js";
import upload from "../../middleware/upload.js";
import {
  createPostHandler,
  getAllPostsHandler,
  toggleLikeHandler,
  getPostLikesHandler,
} from "./post.controller.js";

const router = express.Router();

router.get("/", authenticate, getAllPostsHandler);
router.get("/:postId/likes", authenticate, getPostLikesHandler);
router.post("/:postId/like", authenticate, toggleLikeHandler);

router.post(
  "/",
  authenticate,
  upload.single("image"),
  [
    body("text").optional().isString(),
    body("visibility").optional().isIn(["public", "private"]),
  ],
  createPostHandler
);

export default router;
