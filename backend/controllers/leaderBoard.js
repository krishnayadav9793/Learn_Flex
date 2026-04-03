import { sql } from "../util/neonConnect.js";

export const getUser = async (req, res) => {
  const quiz_id = req.params.id.toString();

  try {
    const users = await sql `
WITH submission_stats AS (
    SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        wt.test_id,
        wt."totalQuestions",

        COUNT(
            CASE 
                WHEN wts.answer_marked = q."Answer" THEN 1 
            END
        ) AS correct_count,

        COUNT(
            CASE 
                WHEN wts.answer_marked IS NOT NULL 
                     AND wts.answer_marked != q."Answer" THEN 1 
            END
        ) AS wrong_count,

        COUNT(wts."ques_id") AS attempted

    FROM "Weekly_Test_Submission" wts   -- ✅ MAIN TABLE

    JOIN "User" u 
        ON u.id = wts.user_id

    JOIN "Weekly_Test" wt 
        ON wt.test_id::text = ${quiz_id}
        AND wts.test_id::text = wt.test_id::text

    LEFT JOIN "Questions" q
        ON q."Ques_id"::text = wts."ques_id"::text

    GROUP BY 
        u.id, u.name, u.email, wt.test_id, wt."totalQuestions"
)

SELECT 
    user_id,
    name,
    email,
    correct_count,
    wrong_count,
    ("totalQuestions" - attempted) AS not_attempted,

    (correct_count * 4) AS rating,

    RANK() OVER (
        ORDER BY correct_count DESC, wrong_count ASC
    ) AS rank

FROM submission_stats

ORDER BY rank;
`;

    // console.log(users);
    res.json({data:users,userId:req.user});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};