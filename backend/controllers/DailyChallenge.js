import {sql} from "../util/neonConnect.js"

export const getDailyChallenge = async (req, res) => {

  try {
    const { exam } = req.params;

    const result = await sql`
SELECT 
    q."Ques_id" AS id,
    q."Question_Statement" AS question,
    q."Option_1" AS option1,
    q."Option_2" AS option2,
    q."Option_3" AS option3,
    q."Option_4" AS option4,
    q."Answer" AS correct,
    q."difficulty",
    dc.time_limit,
    e.exam_name
FROM "DailyChallenge" dc
JOIN "Exam" e 
    ON dc.exam_id = e.exam_id
JOIN "DailyChallengeQuestions" dcq
    ON dc.challenge_id = dcq.challenge_id
JOIN "Questions" q
    ON q."Ques_id" = dcq.ques_id
WHERE dc.challenge_id = (
    SELECT challenge_id
    FROM "DailyChallenge"
    WHERE exam_id = (
        SELECT exam_id FROM "Exam" WHERE exam_name = ${exam}
    )
    AND challenge_date <= CURRENT_DATE
    ORDER BY challenge_date DESC
    LIMIT 1
)
`;

    res.json(result);

  } catch (error) {

    console.error("Daily Challenge Error:", error);

    res.json({
      message: "Failed to fetch daily challenge"
    });

  }

};