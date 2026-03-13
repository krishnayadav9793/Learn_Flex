import { sql } from "../util/neonConnect.js";
export const getExams = async (req, res) => {
  try {

    const exams = await sql`
      SELECT exam_id, exam_name
      FROM "Exam"
      ORDER BY exam_id
    `;

    res.status(200).json(exams);

  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};