import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import App from './Page'
function Profile() {
  const navigate=useNavigate();
  const [ userDetail, setUserDetail ] = useState("Loading")
  useEffect(() => {
    const dataFetch = async () => {
      try {
        console.log("isnerted")
        const data = await fetch("http://localhost:3000/user/profile", {
          credentials: "include"
        })
        const res=await data.json();
        if(res.msg==="No token")navigate("/login")
        console.log(res)
        setUserDetail(res)
      } catch (err) {
        
        console.log(err)
      }

    }
    dataFetch();
  }, [])
  return (
    <div>
      <App user={userDetail} />
    </div>
  )
}

export default Profile
