import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes.js";

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
        message: "Backend is running 🚀",
    });
});

// Auth routes
app.use("/api/auth", authRouter);

// Global error handler (log and return JSON)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
