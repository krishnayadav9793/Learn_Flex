import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import quizLists from "../controllers/quizDetail.js";
import questionsQuiz from "../controllers/quizQuestion.js";
const quizRoute = Router();


quizRoute.get("/list",protect,quizLists)
quizRoute.get("/question/:quizId",questionsQuiz);

export default quizRoute;