import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getExams } from "../controllers/Exam.js";
import { getSubject } from "../controllers/Subject.js";

const router = Router();
router.get("/exams", protect, getExams);
router.get("/subjects", protect, getSubject);
export default router;