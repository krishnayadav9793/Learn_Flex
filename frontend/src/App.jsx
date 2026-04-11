import React from "react"
import { Routes, Route, Navigate, Link, BrowserRouter } from "react-router-dom"
import Login from "./components/auth/Login.jsx"
import Signup from "./components/auth/Signup.jsx"
import { Profile } from "./components/Profile/Profile.jsx"
import LeaderBoard from "./Pages/LeaderBoard.jsx"
import QuizPage from "./Pages/QuizPage.jsx"
import QuizQuestions from "./Pages/QuizQuestions.jsx"
import ForgotPasswordOTP from "./components/auth/forgetPassword.jsx"
import DailyChallengePage from "./Pages/DailyChalllenge.jsx"
import HomePage from "./Pages/HomePage.jsx"
import PracticeMode from "./Pages/PracticeMode.jsx"
import CompitationPage from "./components/1v1/page.jsx"

function App() {
  // dotenv.config();
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/HomePage" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/LeaderBoard" element={<LeaderBoard />} />
      <Route path="/WeeklyQuiz/" element={<QuizPage />} />
      <Route path="/Quiz/:id" element={<QuizQuestions />} />
      <Route path="/DailyChallenge/:exam_id" element={<DailyChallengePage />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/practice/:exam_name" element={<PracticeMode />} />
      <Route path="/1v1" element={<CompitationPage />} />
      <Route path="/resetPassword" element={<ForgotPasswordOTP />} />
    </Routes>
  )
}

export default App
