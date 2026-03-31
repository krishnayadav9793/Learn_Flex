import { sql } from "../util/neonConnect.js";

export async function verifyEmail(req,res,next){
    const {email}=req.body;
    try{
        const isValidEmail = await sql `SELECT * from "User" where email=${email}`
        if(isValidEmail.length ==0)return res.json({msg:"user not exsist"})
        next();
    }catch(e){
        return res.status(500);
    }
}