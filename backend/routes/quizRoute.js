import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import quizLists from "../controllers/quizDetail.js";
import questionsQuiz from "../controllers/quizQuestion.js";
import { handleSubmition } from "../controllers/quizSumission.js";
import { isValidSubmission } from "../middleware/weeklyQuiz.js";
const quizRoute = Router();


quizRoute.get("/list/:id",protect,quizLists)
quizRoute.get("/question/:quizId",[protect,isValidSubmission],questionsQuiz);
quizRoute.post("/submit", protect, handleSubmition);

export default quizRoute;