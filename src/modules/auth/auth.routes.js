import express from "express";
import { body } from "express-validator";
import { register, login, me } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name required"),
    body("lastName").trim().notEmpty().withMessage("Last name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  login
);

router.get("/me", authenticate, me);

export default router;
