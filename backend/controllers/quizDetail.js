import { sql } from "../util/neonConnect.js";

const quizLists = async (req,res) => {
    try {
        if (!sql) {
            return res.json([
                {
                    Quiz_id: "DEMO-QUIZ-1",
                    Start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    Duration: 60,
                    Description: "Demo quiz (backend is running without Neon DB)",
                    Number_of_questions: 3
                }
            ]);
        }
        const users = await sql`SELECT * FROM "Questions"`;
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching quizzes" });
    }
}

export default quizLists;
