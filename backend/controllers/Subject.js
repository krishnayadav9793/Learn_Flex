import { sql } from "../util/neonConnect.js";
export const getSubject = async (req, res) => {
  try {

    const subject = await sql`
      SELECT e.exam_id, e.exam_name, s.subject_name
      FROM "Exam" e
      LEFT JOIN "Subject" s
      ON e.exam_id = s.exam_id
    `;

    res.json(subject);

  } catch (error) {

    console.log(error.message);
    res.status(500).json({ error: error.message });

  }
};