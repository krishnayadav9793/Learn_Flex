import { sql } from "../util/neonConnect.js";

export async function handleSubmition(req, res) {
    const { data } = req.body;
    const user_id = req.user?.id || 1;

    try {
        // ✅ Case: No data
        if (!data || Object.keys(data).length === 0) {
            await sql`
                INSERT INTO "Weekly_Test_Submission" (user_id)
                VALUES (${user_id})
            `;
            return res.status(400).json({
                error: "No answers submitted"
            });
        }

        // ✅ Prepare rows
        const rows = [];

        for (const ques_id in data) {
            const { answer_marked, test_id } = data[ques_id];

            if (!answer_marked || answer_marked < '1' || answer_marked > '4') {
                return res.status(400).json({
                    error: `Invalid answer for question ${ques_id}`
                });
            }

            if (!test_id) {
                return res.status(400).json({
                    error: `Missing test_id for question ${ques_id}`
                });
            }
            // console.log(typeof(ques_id),typeof(user_id),typeof(answer_marked),typeof(test_id));
            rows.push([
                ques_id,
                user_id,
                String(answer_marked),
                test_id
            ]);
        }

        // ✅ ✅ CORRECT TRANSACTION USAGE
        await sql.begin(async (tx) => {

            for (const row of rows) {
                console.log(typeof(row[2]));
                await tx`
                    INSERT INTO "Weekly_Test_Submission"
                    (ques_id, user_id, answer_marked, test_id)
                    VALUES (${row[0]}, ${row[1]}, ${row[2]}, ${row[3]})
                `;
                // console.log("yaha tak")
            }

        });

        return res.json({
            message: "Submission successful ✅",
            totalQuestions: rows.length
        });

    } catch (error) {
        console.error("Submission Error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}