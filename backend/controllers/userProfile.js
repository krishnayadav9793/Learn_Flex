const userProfile = (req,res)=>{
    res.json(req.user)
}

export default userProfile