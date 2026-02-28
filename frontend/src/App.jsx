import React from "react"
import { Routes, Route, Link, BrowserRouter } from "react-router-dom"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import Profile from "./components/profile/Profile"
import LeaderBoard from "./Pages/LeaderBoard.jsx"
import QuizPage from "./Pages/QuizPage.jsx"
import QuizQuestions from "./Pages/QuizQuestions.jsx"
function App() {
  return (
    <Routes>
      <Route path="/login" Component={Login} />
      <Route path="/signup" Component={Signup} />
      <Route path="/profile" Component={Profile}/>
      <Route path="/LeaderBoard" Component={LeaderBoard}/>
      <Route path="/Quiz" Component={QuizPage}/>
      <Route path="/Quiz/:id" Component={QuizQuestions}/>
    </Routes>
  )
}

export default App
