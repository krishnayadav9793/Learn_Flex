import express, { json } from 'express'
import cors from 'cors'
import "./jobs/Scheduler.js";
import { configDotenv } from 'dotenv';
import authRoute from './routes/authRoute.js';
import leaderRoutes from './routes/leaderBoardRoute.js';
import cookieParser from 'cookie-parser';
import { connectNeon } from './util/neonConnect.js';
import quizRoute from './routes/quizRoute.js';
import DailyRoute from './routes/DailyChallenge.js'

const app=express();

configDotenv();

app.use(cors(
    {
  origin: "http://localhost:5173", 
  credentials: true               
}
));
app.use(express.json())
app.use(cookieParser())

app.use("/user",authRoute)
app.use("/api",leaderRoutes)
app.use("/quiz",quizRoute);
app.use("/dc",DailyRoute)

await connectNeon();

app.get("/",(req,res,next)=>{
    res.send("Server is working ✅")
})


app.listen(3000,()=>{
    console.log("Server is running on 3000 port");
})