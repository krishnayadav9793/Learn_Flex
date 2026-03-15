import React from "react"
import { Routes, Route, Link, BrowserRouter } from "react-router-dom"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import Profile from "./components/profile/Profile"
import LeaderBoard from "./Pages/LeaderBoard.jsx"
import QuizPage from "./Pages/QuizPage.jsx"
import QuizQuestions from "./Pages/QuizQuestions.jsx"
import QuestionPage from "./components/quiz/QuestionPage.jsx"
import PracticeMode from "./Pages/PracticeMode.jsx"
function App() {
  return (
    <Routes>
      <Route path="/login" Component={Login} />
      <Route path="/signup" Component={Signup} />
      <Route path="/profile" Component={Profile}/>
      <Route path="/LeaderBoard" Component={LeaderBoard}/>
      <Route path="/Quiz" Component={QuizPage}/>
      <Route path="/Quiz/:id" Component={QuizQuestions}/>
      <Route path="/Quiz/:id/:id1" Component={QuestionPage}/>
      <Route path="/practice" Component={PracticeMode}/>
    </Routes>
  )
}

export default App
