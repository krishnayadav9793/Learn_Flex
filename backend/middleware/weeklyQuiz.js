import { sql } from "../util/neonConnect";

export async function isValidSubmission(req,res,next){
    try{
        const { data } = req.body;
        console.log(data);
        const isAlreadyExsist = await sql`SELECT count(*) from `
    }catch(e){
        
    }
}