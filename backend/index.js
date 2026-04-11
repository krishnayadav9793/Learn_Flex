import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";

import authRoute from "./routes/authRoute.js";
import leaderRoutes from "./routes/leaderBoardRoute.js";
import quizRoute from "./routes/quizRoute.js";
import practiceRoute from "./routes/practiceRoute.js";
import ExamRoute from "./routes/ExamRoute.js";
import dailyRouter from "./routes/DailyChallenge.js";
import { initIO } from "./socket/index.js";
import leaderBoardrouter from "./routes/leaderBoardRoute.js";
import { connectNeon } from "./util/neonConnect.js";

configDotenv();

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "https://learn-flex-yw72.vercel.app",
    credentials: true,
  },
});


app.use(
  cors({
    origin: "https://learn-flex-yw72.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/user", authRoute);
app.use("/lb", leaderRoutes);
app.use("/quiz", quizRoute);
app.use("/practice", practiceRoute);
app.use("/exam", ExamRoute);
app.use("/dc", dailyRouter);
app.use("/leaderboard",leaderBoardrouter)

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("your_jwt_secret")) {
  process.env.JWT_SECRET = "demo-jwt-secret";
  console.log("JWT_SECRET missing, using demo secret");
}


await connectNeon();

app.get("/", (req, res) => {
  res.send("Server running ✅");
});

initIO(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});