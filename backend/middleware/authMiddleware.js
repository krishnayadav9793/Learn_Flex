import jwt from "jsonwebtoken";
import { sql } from "../util/neonConnect.js";

export const protect = async (req, res, next) => {
  try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded , "thtis is jwt decoded");

    const result = await sql`
      SELECT id, name, email
      FROM "User"
      WHERE email = ${decoded.id}
    `;

    if (result.length === 0) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = result[0];

    next();

  } catch (err) {

    return res.status(401).json({ msg: "Invalid token" });

  }
};