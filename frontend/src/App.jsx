import React from "react"
import { Routes, Route,  Navigate, Link, BrowserRouter } from "react-router-dom"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import Profile from "./components/profile/Profile"
import LeaderBoard from "./Pages/LeaderBoard.jsx"
import QuizPage from "./Pages/QuizPage.jsx"
import QuizQuestions from "./Pages/QuizQuestions.jsx"
import QuestionPage from "./components/quiz/QuestionPage.jsx"
import DailyChallengePage from "./Pages/DailyChalllenge.jsx"
import HomePage from "./Pages/HomePage.jsx"
import PracticeMode from "./Pages/PracticeMode.jsx"


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/LeaderBoard" element={<LeaderBoard />} />
      <Route path="/WeeklyQuiz" element={<QuizPage />} />
      <Route path="/Quiz/:id" element={<QuizQuestions />} />
      <Route path="/Quiz/:id/:id1" element={<QuestionPage />} />
      <Route path="/DailyChallenge" element={<DailyChallengePage />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/practice" element={<PracticeMode />} />


    </Routes>
  )                                                                                  
}

export default App
