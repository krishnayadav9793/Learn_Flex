import { data } from "react-router-dom";
import Banner from "../components/quiz/banner.jsx";
import React,{useEffect,useState} from 'react'

function QuizPage() {
  const[quizList,setQuizList]=useState([]);
  useEffect(()=>{
    const fetchQuiz=async ()=>{
      const res= await fetch("http://localhost:3000/quiz/list",{
        method:"GET",
        credentials:"include"
      })

      const data = await res.json();
      setQuizList(data)
      console.log(data);
    }
    fetchQuiz();
  },[])
  return (
    <div>
      <Banner data={quizList}/>
    </div>
  )
}

export default QuizPage
