import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

function QuestionPage() {
    const data=useParams();
    console.log(data.id1)
    const location=useLocation();
    const questionList =location.state?.questionList;
    const [statement ,setStatement]=useState();
    useEffect(()=>{
        questionList.forEach(element => {
        console.log(element)
        if(element.Ques_id==data.id1){
            setStatement(element.Qusetion_Statement)
        }
    });
    },[])
    
  return (
    <div>
      <p>statement:{statement}</p>
      <p>options:</p>
    </div>
  )
}

export default QuestionPage
