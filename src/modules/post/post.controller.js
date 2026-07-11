import { validationResult } from "express-validator";
import cloudinary from "../../config/cloudinary.js";
import { createPost, getAllPosts } from "./post.model.js";

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
    const posts = await getAllPosts();
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load posts" });
  }
}
