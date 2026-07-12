import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes.js";
import postRouter from "./modules/post/post.routes.js";
import commentRouter from "./modules/comment/comment.routes.js";
import userRouter from "./modules/user/user.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running",
    });
});

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1", commentRouter);
app.use("/api/v1/users", userRouter);

// Global error handler
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
