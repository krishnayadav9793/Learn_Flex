// import { data } from "react-router-dom";
import Banner from "../components/quiz/banner.jsx";
import React, { useEffect, useState } from 'react'
import socket from "../socket.js";
// import { data } from "react-router-dom";
function QuizPage() {
  const [quizList, setQuizList] = useState();
  // socket.on("connect",()=>{
  //       console.log("connected",socket.id);
  //   })
  //   socket.on("message",(data)=>{
  //     console.log(data.message)
  //   })
  //   socket.on("quiz",(data)=>{
  //     console.log(data.quizData)
  //   })
  useEffect(() => {
    
    
    const fetchQuiz = async () => {
      const res = await fetch("http://localhost:3000/quiz/list", {
        method: "GET",
        credentials: "include"
      })

      const data = await res.json();
      setQuizList(data)
      console.log(data);
    }
    fetchQuiz();
  }, [])
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Quizs</h1>
        <div className=""> {quizList?.map((quiz) => {
          return <Banner data={quiz} key={quiz.test_id} />
        })}</div>
        
      </div>
    </div>
  )
}

export default QuizPage
