import { sql } from "../util/neonConnect.js";

export const getDailyChallenge = async (req, res) => {
  const examId = req.params.exam_id;
  try {

    const result = await sql`
   SELECT 
    q."Ques_id" AS id,
    q."Question_Statement" AS question,
    q."Option_1" AS option1,
    q."Option_2" AS option2,
    q."Option_3" AS option3,
    q."Option_4" AS option4,
    q."Answer" AS correct,
    q.subject_id,
    q."Image" AS image,
    dc.time_limit,
    e.exam_name,
    em.correct_marks,
    em.wrong_marks,
    em.unattempted_marks,
    dc.challenge_id
    

FROM "DailyChallenge" dc

JOIN "Exam" e 
    ON dc.exam_id = e.exam_id

JOIN "Exam_Marking" em
    ON e.exam_id = em.exam_id

JOIN "DailyChallengeQuestions" dcq
    ON dc.challenge_id = dcq.challenge_id

JOIN "Questions" q
    ON q."Ques_id" = dcq.ques_id

WHERE dc.challenge_date = CURRENT_DATE
AND dc.exam_id = ${examId};
    `;

    if (!result.length) {
      return res.status(404).json({
        message: "No daily challenge found"
      });
    }
    
    res.json(result);

  } catch (error) {
    console.error("Daily Challenge Error:", error);
    res.status(500).json({
      error: "Failed to fetch daily challenge"
    });

  }
};
export const addAttempts = async (req, res) => {
  try {
    const attempts = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = req.user.id;

    if (!attempts || attempts.length === 0) {
      return res.status(400).json({
        error: "No attempt provided"
      });
    }

    console.log("Incoming attempts:", attempts);

    for (const a of attempts) {
      await sql`
        INSERT INTO "DailyChallengeAttempt"
        (user_id, challenge_id, ques_id, marked_option, attempt_at)
        VALUES
        (${user_id}, ${a.challenge_id}, ${a.ques_id}, ${a.marked_option}, ${a.attempt_at})
        
      `;
    }

    return res.status(200).json({
      message: "Attempts saved successfully"
    });

  } catch (error) {
    console.error("🔥 FULL ERROR:", error);
    return res.status(500).json({
      error: error.message
    });
  }
};