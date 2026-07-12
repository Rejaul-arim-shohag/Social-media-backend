import express from "express";
import { getUserByIdHandler, getCurrentUserHandler } from "./user.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = express.Router();

// Protected: get current logged-in user
router.get("/me", authenticate, getCurrentUserHandler);

// Public: get user by id
router.get("/:id", getUserByIdHandler);

export default router;
