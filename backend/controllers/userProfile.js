import { sql } from "../util/neonConnect.js";

const userProfile = (req, res) => {
  res.json(req.user);
};

export const getHeatMap = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("cookie",userId)
    const heatmap = await sql`
      SELECT
        submission_date,
        count
      FROM "submission_log"
      WHERE user_id = ${userId}
      ORDER BY submission_date;
    `;

    const profile = await sql`
      SELECT
        rating,
        total_solved
      FROM "User_Profile"
      WHERE "User_id" = ${userId}
      LIMIT 1;
    `;

    res.status(200).json({
      heatmap,
      rating: profile[0]?.rating || 0,
      total_solved: profile[0]?.total_solved || 0
    });

  } catch (err) {
    console.error("Heatmap Error:", err);
    res.status(500).json({ error: "Failed to fetch heatmap" });
  }
};

export default userProfile;