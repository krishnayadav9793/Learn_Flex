import express from "express"
import { getUser } from "../controllers/leaderBoard.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get('/leaderboard',protect,getUser);

export default router;
