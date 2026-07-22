import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./routes/userRoute.js";

// App config

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares

app.use(cors());
app.use(express.json());

// Database connection

connectDB();

// Health check route

app.get("/", (req, res) => {
  res.send("API is Working");
});

// Routes

app.use("/api/users", userRouter);

// Global error handling middleware

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
