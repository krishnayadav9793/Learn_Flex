import bcrypt from 'bcrypt'
import { sql } from '../util/neonConnect.js';
import { getToken } from '../util/generateToken.js';
const userLogin = async (req,res)=>{
    try{
        const { email, password } = req.body;

        const user = await sql`SELECT * from "User" where email=${email}`;
        if (user.length==0) return res.status(400).json({ msg: "Invalid email" });
        const isMatch = await bcrypt.compare(password,user[0].password);
        if (!isMatch) return res.status(400).json({ msg: "Wrong password" });
        const token=getToken(user[0].email)
      
       res.cookie("token", token, {
        httpOnly: true,       
        secure: true,       
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
      name: user[0].name,
      email: user[0].email
    });
    }
    catch(err){
      console.log(err)
         res.status(500).json({ error: err.message });
    }
}


export default userLogin;