import { sql } from "../util/neonConnect.js";

const questionsQuiz = async (req, res) => {
    const quizId = req.params.quizId;
    console.log(req.params)
    try {
        const questions = await sql`
SELECT 
    q1."Ques_id",
    q1."Qusetion_Statement",
    q1."Option_1",
    q1."Option_2",
    q1."Option_3",
    q1."Option_4",
    q1."Image",
    q1."Answer"
FROM "Questions" q1
JOIN "QuizQuestions" q2 
ON q1."Ques_id" = q2."Ques_id"
WHERE q2."Quiz_id" = ${quizId}
`;

        res.send(questions)
    } catch (e) {
        console.log(e);
    }
}

export default questionsQuiz;