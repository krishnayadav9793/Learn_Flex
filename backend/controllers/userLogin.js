import bcyrpt from 'bcrypt'
import User from '../models/user.js';
import { getToken } from '../util/generateToken.js';
import { hasMongoConfig } from '../util/envFlags.js';
import { demoUsers, getPublicUser } from '../util/demoStore.js';
const userLogin = async (req,res)=>{
    try{
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ msg: "Email and password are required" });

        if (!hasMongoConfig()) {
          const user = demoUsers.find((u) => u.email === email.toLowerCase());
          if (!user) return res.status(400).json({ msg: "Invalid email" });
          const isMatch = await bcyrpt.compare(password, user.password);
          if (!isMatch) return res.status(400).json({ msg: "Wrong password" });
          const publicUser = getPublicUser(user);
          const token = getToken(user._id, publicUser);

          res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
          });

          return res.json(publicUser);
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid email" });
        console.log(user)
        const isMatch = await bcyrpt.compare(password,user.password);
        if (!isMatch) return res.status(400).json({ msg: "Wrong password" });
        const publicUser = getPublicUser(user);
        const token=getToken(user._id, publicUser)
      
       res.cookie("token", token, {
        httpOnly: true,       
        secure: false,       
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json(publicUser);
    }catch(err){
         res.status(500).json({ error: err.message });
    }

    // res.send("from login")
}


export default userLogin;
