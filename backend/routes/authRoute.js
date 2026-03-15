import { Router } from "express";
import userSignUp from "../controllers/userSignup.js";
import userLogin from "../controllers/userLogin.js";
import {protect} from '../middleware/authMiddleware.js'
import userProfile from "../controllers/userProfile.js";
const authRoute = Router();

authRoute.get("/",(req,res)=>{
    res.send("from auth router")
})
authRoute.get("/profile",protect,userProfile);
authRoute.post("/signup",userSignUp);
authRoute.post("/login",userLogin);

export default authRoute;