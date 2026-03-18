import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import authRoute from "./routes/authRoute.js";
import leaderRoutes from "./routes/leaderBoardRoute.js";
import quizRoute from "./routes/quizRoute.js";
import practiceRoute from "./routes/practiceRoute.js";
import ExamRoute from "./routes/ExamRoute.js"
import http from 'http'
import { connectNeon } from "./util/neonConnect.js";
import { hasMongoConfig } from "./util/envFlags.js";
import dailyRouter from "./routes/DailyChallenge.js"
// import socket from "../frontend/src/socket.js";
configDotenv();

const app = express();
// const server=http.createServer(app);
// const io=new Server(server,{
//   cors: {
//     origin:"http://localhost:5173",
//     credentials: true,
//   },
// })

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/user", authRoute);
app.use("/api", leaderRoutes);
app.use("/quiz", quizRoute);
app.use("/practice", practiceRoute);
app.use("/exam",ExamRoute)
app.use("/dc",dailyRouter)

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("your_jwt_secret")) {
  process.env.JWT_SECRET = "demo-jwt-secret";
  console.log("JWT_SECRET missing, using demo secret");
}


if (hasMongoConfig()) {
  mongoose
    .connect(process.env.MONGO_DB_URI, { dbName: "LearnFlex" })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
} else {
  console.log("Mongo URI missing, running with demo auth store");
}


await connectNeon();

app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

// io.on("connection",(socket)=>{
//   console.log("connected:",socket.id)
//   socket.emit("message",{message:"hello from backend"})
//   socket.emit("quiz",{quizData:"new quiz"})
//   // socket.
// })


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// server.listen(3000,()=>{
//   console.log("Server for io is running")
// })