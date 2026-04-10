import jwt from "jsonwebtoken";
import { sql } from "../util/neonConnect.js";

export const protect = async (req, res, next) => {
  try {
    // console.log(req.cookies)
    const token = req.cookies?.token||null;
    // console.log(token)
    // console.log("middleware 1")
    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   //console.log(decoded , "this is jwt decoded");

    const result = await sql`
      SELECT u.id, u.name, u.email, 
      p.total_solved as questions, 0 as streak, p.rating
      FROM "User" u
      LEFT JOIN "User_Profile" p ON u.id = p."User_id"
      WHERE u.email = ${decoded.id}
    `;

    if (result.length === 0) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = result[0];
    // console.log(req.user);
    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
};