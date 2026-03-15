import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { hasMongoConfig } from '../util/envFlags.js';
import { demoUsers, getPublicUser } from '../util/demoStore.js';

export const protect=async(req,res,next)=>{
    try{
        const token = req.cookies.token;

        if (!token) return res.status(401).json({ msg: "No token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.user) {
            req.user = decoded.user;
            return next();
        }

        if (!hasMongoConfig()) {
            const demoUser = demoUsers.find((u) => String(u._id) === String(decoded.id));
            if (!demoUser) return res.status(401).json({ msg: "Invalid token" });
            req.user = getPublicUser(demoUser);
            return next();
        }

        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ msg: "Invalid token" });

        next();
    }catch(err){
         res.status(401).json({ msg: "Invalid token" });
    }
}
