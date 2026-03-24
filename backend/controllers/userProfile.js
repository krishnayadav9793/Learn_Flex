import { sql } from "../util/neonConnect.js";

const userProfile = (req,res)=>{
    res.json(req.user)
}

export const getHeatMap= async (req,res)=>{
     const userId = req.user_id;
try{
const result =await sql `
      SELECT dc.challenge_date
      FROM "DailyChallengeAttempt" uda
      JOIN "DailyChallenge" dc
      ON uda.challenge_id = dc.challenge_id
      WHERE uda.user_id = ${userId}
`
 res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heatmap" });
  }
};
export default userProfile