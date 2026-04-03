import {Router} from  "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDailyChallenge ,addAttempts} from "../controllers/DailyChallenge.js"; 
import {getHeatMap} from "../controllers/userProfile.js"

const router=Router();
router.get("/dailyChallenge/:exam_id",protect,getDailyChallenge);
router.get("/heatmap",protect,getHeatMap);
router.post("/attempt",protect,addAttempts)
export default router;

;

