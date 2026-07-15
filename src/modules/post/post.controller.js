import { validationResult } from "express-validator";
import cloudinary from "../../config/cloudinary.js";
import { createPost, getAllPosts, getAllPostsWithComments, getLikesByPost, toggleLike } from "./post.model.js";

export async function createPostHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { text, visibility } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    let imageUrl = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const post = await createPost({
      userId,
      text,
      imageUrl,
      visibility,
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
}

export async function getAllPostsHandler(req, res) {
  try {
    const currentUserId = req.user?.id || null;
    const includeComments = req.query.includeComments === "true";
    const posts = includeComments
      ? await getAllPostsWithComments(currentUserId)
      : await getAllPosts(currentUserId);
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load posts" });
  }
}
export async function toggleLikeHandler(req, res) {
  const userId = req.user?.id;
  const postId = Number(req.params.postId);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!postId) return res.status(400).json({ message: "Invalid post id" });

  try {
    const result = await toggleLike(postId, userId);
    if (result.liked) {
      return res.json({ success: true, liked: true, message: "Post liked" });
    }
    return res.json({ success: true, liked: false, message: "Post unliked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle like" });
  }
}

export async function getPostLikesHandler(req, res) {
  const postId = Number(req.params.postId);
  if (!postId) return res.status(400).json({ message: "Invalid post id" });

  try {
    const users = await getLikesByPost(postId);
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load post likes" });
  }
}
