import { sql } from "../util/neonConnect.js";
import bcrypt from 'bcrypt'

export async function changePassword(req,res){
    const {email,newPassword}=req.body;
    // console.log(password)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // console.log(hashedPassword)
    try{
        const user= await sql `update "User" set password=${hashedPassword} where email=${email}`
        return res.json({msg:"password reset successful"})
    }catch(e){
        return res.status(500);
    }
}