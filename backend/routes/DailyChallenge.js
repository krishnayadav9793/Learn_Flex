import {Router} from  "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDailyChallenge } from "../controllers/DailyChallenge.js"; 


const router=Router();
router.get("/dailyChallenge/:exam",protect,getDailyChallenge);
export default router;

;

