import { sql } from "../util/neonConnect.js";
export const getSubject = async (req, res) => {
  try {

    const subject = await sql`
  SELECT DISTINCT 
    e.exam_id, 
    e.exam_name, 
    s.subject_name
  FROM "Exam" e
  LEFT JOIN "Questions" q 
    ON e.exam_id = q."Exam_id"
  LEFT JOIN "Subject" s 
    ON q.subject_id = s.subject_id
  ORDER BY e.exam_id;
`;
    res.json(subject);
  }
  catch(error){
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
