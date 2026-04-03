import express from "express"
import { getUser } from "../controllers/leaderBoard.js";
import { protect } from "../middleware/authMiddleware.js";

const leaderBoardrouter = express.Router();
leaderBoardrouter.get('/:id',protect,getUser);

export default leaderBoardrouter;
