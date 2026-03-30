import { sql } from "../util/neonConnect.js";

export async function fetch1v1Questions(examId){
    try{
        const res = await sql`
            SELECT *
            FROM "Questions"
            WHERE "Exam_id" = ${examId}
            ORDER BY RANDOM()
            LIMIT 10
        `;
        // console.log(res);
        return res;
    }catch(e){
        console.log("error:", e);
    }
}