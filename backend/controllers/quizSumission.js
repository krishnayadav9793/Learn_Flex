import { sql } from "../util/neonConnect.js";

export async function handleSubmition(req, res) {
    const { data } = req.body;
    const user_id = req.user?.id || 1; 
    console.log(user_id)
    
    if (!data || Object.keys(data).length === 0) {
        await sql `INSERT INTO "Weekly_Test_Submission" ( user_id )
      VALUES ${user_id}`
        return res.status(400).json({ error: "No answers submitted" });
    }

    try {
        const values = [];
        const params = [];
        let paramIndex = 1;

        for (const ques_id in data) {
            const { answer_marked, test_id } = data[ques_id];

            // validation
            if (answer_marked < 1 || answer_marked > 4) {
                return res.status(400).json({ error: "Invalid answer" });
            }

            values.push(
                `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
            );

            params.push(ques_id, user_id, answer_marked, test_id);
        }

        const query = `
      INSERT INTO "Weekly_Test_Submission"
      (ques_id, user_id, answer_marked, test_id)
      VALUES ${values.join(", ")}
    `;

        
        await sql.query(query, params);

        res.json({ message: "Submission successful ✅" });

    } catch (e) {
        console.log("error:", e);
        res.status(500).json({ error: "Server error" });
    }
}