import { sql } from "../util/neonConnect.js";

export async function isValidSubmission(req,res,next){
    try{
        const { data } = req.body;
        console.log(data);
        // const isAlreadyExsist = await sql`SELECT count(*) from "Weekly_Test_Submission" where user_id=${} and test_id=${data.}`
    }catch(e){
        
    }
}