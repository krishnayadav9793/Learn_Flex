import { sql } from "../util/neonConnect.js";

const quizLists = async (req, res) => {
    try {
        const users = await sql` SELECT 
    "time_limit",
    test_id,
    exam_id,
    "Start_Time" AT TIME ZONE 'Asia/Kolkata' as "Start_Time"
FROM "Weekly_Test" `;

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching quizzes" });
    }
}

export default quizLists;
