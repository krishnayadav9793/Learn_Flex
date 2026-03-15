import { sql } from "../util/neonConnect.js";

const questionsQuiz = async (req, res) => {
  const quizId = req.params.quizId;

  try {
    const questions = await sql`
      SELECT 
        "Ques_id",
        "Question_Statement",
        "Option_1",
        "Option_2",
        "Option_3",
        "Option_4",
        "Image",
        "Answer"
      FROM "Questions"
      WHERE "Ques_id" = ${quizId}
    `;

    console.log("Quiz Questions:", questions);
    res.status(200).json(questions);

  } catch (err) {
    console.error("Error fetching quiz questions:", err);
    res.status(500).json({ message: "Error fetching quiz questions" });
  }
};

export default questionsQuiz;