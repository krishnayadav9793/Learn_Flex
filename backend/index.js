import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoute from "./routes/authRoute.js";
import leaderRoutes from "./routes/leaderBoardRoute.js";
import quizRoute from "./routes/quizRoute.js";
import practiceRoute from "./routes/practiceRoute.js";

import { connectNeon } from "./util/neonConnect.js";
import { hasMongoConfig } from "./util/envFlags.js";

configDotenv();

const app = express();

/*
  Middleware
*/
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/*
  Routes
*/
app.use("/user", authRoute);
app.use("/api", leaderRoutes);
app.use("/quiz", quizRoute);
app.use("/practice", practiceRoute);

/*
  Default JWT fallback
*/
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("your_jwt_secret")) {
  process.env.JWT_SECRET = "demo-jwt-secret";
  console.log("JWT_SECRET missing, using demo secret");
}

/*
  MongoDB connection
*/
if (hasMongoConfig()) {
  mongoose
    .connect(process.env.MONGO_DB_URI, { dbName: "LearnFlex" })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
} else {
  console.log("Mongo URI missing, running with demo auth store");
}

/*
  Neon connection
*/
await connectNeon();

/*
  Default route
*/
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

/*
  Start server
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});