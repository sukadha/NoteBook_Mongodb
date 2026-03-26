import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // React Vite dev server
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "📓 Notebook API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});