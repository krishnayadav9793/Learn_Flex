import { sql } from "../util/neonConnect.js";

const quizLists = async (req, res) => {
    const exam_id = req.params.id;
    console.log(exam_id);
    try {
        const users = await sql ` SELECT 
                "time_limit",
                test_id,
                exam_id,
                "Start_Time" AT TIME ZONE 'Asia/Kolkata' as "Start_Time",
                "totalQuestions",
                quizname,
                "description"
                FROM "Weekly_Test" WHERE exam_id=${exam_id}`;

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching quizzes" });
    }
}

export default quizLists;
