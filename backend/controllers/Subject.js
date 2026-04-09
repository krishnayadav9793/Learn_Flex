import { sql } from "../util/neonConnect.js";

export const getSubject = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id; 
   // console.log("User",userId)
const subject = await sql`

WITH unified_attempts AS (

  -- DAILY
  SELECT 
    user_id,
    ques_id,
    marked_option::text AS marked_option
  FROM "DailyChallengeAttempt"

  UNION ALL

  -- WEEKLY
  SELECT 
    user_id,
    ques_id,
    answer_marked::text AS marked_option
  FROM "Weekly_Test_Submission"

)

SELECT 
  e.exam_id,
  e.exam_name,
  s.subject_name,

  COUNT(u.ques_id)::int AS attempted,

  COALESCE(
    SUM(
      CASE 
        WHEN u.marked_option = q."Answer" THEN 1 
        ELSE 0 
      END
    ), 0
  )::int AS correct,

  COALESCE(
    ROUND(
      SUM(
        CASE 
          WHEN u.marked_option = q."Answer" THEN 1 
          ELSE 0 
        END
      ) * 100.0 / NULLIF(COUNT(u.ques_id), 0),
    2), 0
  ) AS accuracy

FROM "Exam" e

LEFT JOIN "Questions" q 
  ON q."Exam_id" = e.exam_id

LEFT JOIN "Subject" s 
  ON q.subject_id = s.subject_id

LEFT JOIN unified_attempts u
  ON u.ques_id = q."Ques_id"
  AND u.user_id = ${userId}

GROUP BY e.exam_id, e.exam_name, s.subject_name

ORDER BY e.exam_name;

`;

    res.json(subject);

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

