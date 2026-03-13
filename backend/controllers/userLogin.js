import bcyrpt from 'bcrypt'
import { sql } from '../util/neonConnect.js';
import { getToken } from '../util/generateToken.js';
const userLogin = async (req,res)=>{
    try{
        const { email, password } = req.body;

        const user = await sql`SELECT * from "User" where email=${email}`;
        if (user.length==0) return res.status(400).json({ msg: "Invalid email" });
        console.log(user)
        const isMatch = await bcyrpt.compare(password,user.password);
        if (!isMatch) return res.status(400).json({ msg: "Wrong password" });
        const token=getToken(user.email)
      
       res.cookie("token", token, {
        httpOnly: true,       
        secure: false,       
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
      name: user.name,
      email: user.email
    });
    }
    catch(err){
         res.status(500).json({ error: err.message });
    }
}


export default userLogin;