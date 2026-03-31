import { sql } from "../util/neonConnect.js";

export async function isValidSubmission(req,res,next){
    try{
        const  data  = req.user;
        const isAlreadyExsist = await sql`SELECT count(*) from "Weekly_Test_Submission" where user_id=${data.id} and test_id=${req.params.quizId}`
        if(isAlreadyExsist[0].count!=0)return res.json({msg:"already participated"})
        next();
        // const isAlreadyExsist = await sql`SELECT count(*) from "Weekly_Test_Submission" where user_id=${} and test_id=${data.}`
    }catch(e){
        
    }
}