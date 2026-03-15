import { sql } from "../util/neonConnect.js";

const practiceQuestion = async (req, res) => {
  try {
    const subject = req.params.subject;

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
      WHERE "Subject" = ${subject}
      ORDER BY "Ques_id"
    `;

    console.log("Practice Questions:", questions);

    res.send(questions);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching practice questions" });
  }
};

export default practiceQuestion;