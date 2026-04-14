import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPracticeSession,
  getPracticeHistory,
  getPracticeQuestionImage,
  getPracticeMeta,
  getPracticeSession,
  getActiveSession,
  submitPracticeSession,
  getSubmissionDetails,
  updateSessionAnswers,
  discardActiveSession
} from "../controllers/practiceController.js";

const practiceRoute = Router();

practiceRoute.get("/meta", protect, getPracticeMeta);
practiceRoute.get("/active", protect, getActiveSession);
practiceRoute.get("/history", protect, getPracticeHistory);
practiceRoute.get("/submission/:submissionId", protect, getSubmissionDetails);
practiceRoute.post("/session", protect, createPracticeSession);
practiceRoute.get("/session/:sessionId", protect, getPracticeSession);
practiceRoute.put("/session/:sessionId/answers", protect, updateSessionAnswers);
practiceRoute.post("/session/:sessionId/submit", protect, submitPracticeSession);
practiceRoute.delete("/active", protect, discardActiveSession);
practiceRoute.get("/image/:sessionId/:questionId", getPracticeQuestionImage);

export default practiceRoute;
