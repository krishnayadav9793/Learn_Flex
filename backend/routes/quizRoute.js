import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import quizLists from "../controllers/quizDetail.js";
const quizRoute = Router();


quizRoute.get("/list",protect,quizLists)


export default quizRoute;