import { sql } from "../util/neonConnect.js";

const quizLists = async (req,res) => {
    try {
        const users = await sql`SELECT * FROM "Quiz"`;
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching quizzes" });
    }
}

export default quizLists;
