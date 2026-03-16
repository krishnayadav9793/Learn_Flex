import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPracticeSession,
  getPracticeHistory,
  getPracticeQuestionImage,
  getPracticeMeta,
  getPracticeSession,
  submitPracticeSession
} from "../controllers/practiceController.js";

const practiceRoute = Router();

practiceRoute.get("/meta", protect, getPracticeMeta);
practiceRoute.get("/history", protect, getPracticeHistory);
practiceRoute.post("/session", protect, createPracticeSession);
practiceRoute.get("/session/:sessionId", protect, getPracticeSession);
practiceRoute.post("/session/:sessionId/submit", protect, submitPracticeSession);
practiceRoute.get("/image/:sessionId/:questionId", getPracticeQuestionImage);

export default practiceRoute;
