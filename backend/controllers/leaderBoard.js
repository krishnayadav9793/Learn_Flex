import { sql } from "../util/neonConnect.js";

export const getUser = async (req, res) => {
  try {
    let users;

    if (req.query.sort === "questions") {
      users = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          l.rating,
          l.total_solved,
          l.rank
        FROM "User" u
        JOIN "Leaderboard" l
        ON u.id = l.id
        ORDER BY l.total_solved DESC
        LIMIT 100
      `;
    } 
    else {
      users = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          l.rating,
          l.total_solved,
          l.rank
        FROM "User" u
        JOIN "Leaderboard" l
        ON u.id = l.id
        ORDER BY l.rating DESC
        LIMIT 100
      `;
    }
    res.json(users);
  }
  catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};