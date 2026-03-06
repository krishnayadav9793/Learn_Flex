import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

function QuizQuestions() {

  const [questionList , setQuestionList] = useState([]);
  const data = useParams();
  const navigate = useNavigate();

  useEffect(()=>{
    const fetchQustions = async ()=>{
      const res = await fetch(`http://localhost:3000/quiz/question/${data.id}`)
      const list = await res.json();
      setQuestionList(list);
      console.log(list)
    }
    fetchQustions();
  },[])

  const nevigateToQues = (quesid)=>{
    navigate(`${quesid}`,{ state: { questionList } });
  }

  return (
    <div className='flex flex-row justify-center items-center min-h-screen gap-5'>
      {questionList.map((ques)=>(
        <button 
          key={ques.Ques_id} 
          onClick={()=>nevigateToQues(ques.Ques_id)}
        >
          {ques.Ques_id}
        </button>
      ))}
    </div>
  )
}

export default QuizQuestions