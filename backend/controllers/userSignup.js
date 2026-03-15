import User from "../models/user.js";
import bcrypt from 'bcrypt'
import { getToken } from "../util/generateToken.js";
import { hasMongoConfig } from "../util/envFlags.js";
import { demoUsers, getPublicUser } from "../util/demoStore.js";
const userSignUp= async (req,res)=>{
    try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!hasMongoConfig()) {
      const exists = demoUsers.find((u) => u.email === email.toLowerCase());
      if (exists) return res.status(400).json({ msg: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, Number(process.env.HASHING_SALT) || 10);
      const user = {
        _id: String(Date.now()),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        rating: 0,
        questions: 0
      };
      demoUsers.push(user);
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

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, Number(process.env.HASHING_SALT) || 10);
    const user = await User.create({ name, email, password:hashedPassword });
    const publicUser = getPublicUser(user);

    const token=getToken(user._id, publicUser)
      
       res.cookie("token", token, {
        httpOnly: true,       
        secure: false,       
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json(publicUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default userSignUp;
