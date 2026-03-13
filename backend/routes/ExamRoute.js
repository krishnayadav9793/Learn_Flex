import {Router} from  "express";
import { protect } from "../middleware/authMiddleware.js";
import { getExams } from "../controllers/examController.js";
const router=Router();
router.get("/exams", protect, getExams);
export default router;