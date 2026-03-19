import { sql } from "../util/neonConnect.js";

export const getUser = async (req, res) => {
  try {
  
     const users = await sql`
        SELECT 
        u.name,
        e.exam_name,
        COUNT(ws.ques_id) AS total_solved,
        COUNT(ws.ques_id) * 10 AS rating,
         RANK() OVER (
        PARTITION BY e.exam_id 
        ORDER BY COUNT(ws.ques_id) DESC
        ) AS rank
       FROM "Weekly_Test_Submission" ws

      JOIN  "User" u 
          ON u.id = ws.user_id

      JOIN "Weekly_test_ques" wqq 
          ON wqq.ques_id = ws.ques_id

      JOIN "Weekly_Test" wq 
          ON wq.test_id = wqq.test_id

      JOIN "Exam" e 
          ON e.exam_id = wq.exam_id

      WHERE ws.answer_marked = 'correct'   -- or your condition

      GROUP BY u.id, u.name, e.exam_id, e.exam_name

      ORDER BY e.exam_name, rating DESC
  `;
    res.json(users);
  }
  catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};