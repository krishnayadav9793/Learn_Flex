import jwt from 'jsonwebtoken'

export const getToken=(id,user=null)=>{
    const payload = user ? { id, user } : { id };
    return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}
