import { Router } from "express";
import userSignUp from "../controllers/userSignup.js";
import userLogin from "../controllers/userLogin.js";
import {protect} from '../middleware/authMiddleware.js'
import userProfile from "../controllers/userProfile.js";
import { sendOTP } from "../controllers/sendOTP.js";
import { verifyEmail } from "../middleware/forgetPassword.js";
import { changePassword } from "../controllers/resetPassword.js";
const authRoute = Router();

authRoute.get("/",(req,res)=>{
    res.send("from auth router")
})
authRoute.get("/profile",protect,userProfile);
authRoute.post("/forgetpassword",verifyEmail,sendOTP);
authRoute.post("/resetpassword",changePassword)
authRoute.post("/signup",userSignUp);
authRoute.post("/login",userLogin);

export default authRoute;