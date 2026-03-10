import { useState, useEffect } from "react";
import Navbar from "../components/quiz/Navbar.jsx";

export default function LearnFlex() {

  const dummyQuestions = [
  {
    id: 1,
    topic: "DSA",
    difficulty: "Easy",
    question: "What is the time complexity of Binary Search?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correct: 1
  },
  {
    id: 2,
    topic: "DBMS",
    difficulty: "Medium",
    question: "Which normal form removes transitive dependency?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correct: 2
  },
  {
    id: 3,
    topic: "OS",
    difficulty: "Easy",
    question: "Which scheduling algorithm uses time slices?",
    options: ["FCFS", "SJF", "Round Robin", "Priority"],
    correct: 2
  },
  {
    id: 4,
    topic: "CN",
    difficulty: "Medium",
    question: "Which layer handles routing?",
    options: ["Transport", "Network", "Data Link", "Session"],
    correct: 1
  }
];

  const exam = "GATE"; 

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [streak,setStreak]=useState(0);
  const [lastSolvedDate,setLastSolvedDate]=useState(null);
  
  useEffect(()=>{
    const today=new Date().toISOString().split("T")[0];

     if (lastSolvedDate) {

    const last = new Date(lastSolvedDate);
    const current = new Date(today);

    const diffDays = Math.floor(
      (current - last) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 1) {
      setStreak(0);
    }
  }

    const fetchDailyQuiz= async()=>{
      try{
        // const res = await fetch(`http://localhost:3000/daily-quiz/${exam}`);
        // const data = await res.json();
        // setQuestions(data);
        setQuestions(dummyQuestions);
      }
      catch(error) {
        console.error("Error fetching quiz:", error);
    }
  }
  fetchDailyQuiz();
},[exam,lastSolvedDate])

  const selectOption = (qid, index) => {
    if (status[qid]==="correct") return;
    setAnswers({
      ...answers,
      [qid]: index
    });
  };

  const submitQuetion = (q) => {
    const selected=answers[q.id]
    if (selected === undefined) return;

    if (selected === q.correct) {

      setStatus(prev => ({
        ...prev,
        [q.id]: "correct"
      }));
      checkStreak();

    } else {
      setStatus(prev => ({
        ...prev,
        [q.id]: "wrong"
      }));

    }
  };
  const reattempt = (qid) => {

    setStatus(prev => ({
      ...prev,
      [qid]: "pending"
    }));

  };
const checkStreak = () => {

    const allSolved = questions.every(q =>
      (status[q.id] === "correct") ||
      (answers[q.id] === q.correct)
    );

    if (allSolved) {
      const today = new Date().toISOString().split("T")[0];
      setStreak(prev => prev + 1);
      setLastSolvedDate(today);

    }
  };
  return (
    <div className="min-h-screen bg-white text-gray-800 text-sm">

      <Navbar streak={streak} />

      <div className="max-w-2xl mx-auto px-6 py-10">

        <h2 className="text-lg font-semibold mb-6">
          {exam} Daily Challenge ({questions.length} Questions)
        </h2>

        {questions.map((q, qIndex) => (

          <div key={q.id} className="border border-gray-200 rounded-lg p-6 mb-6">

            <div className="flex gap-3 mb-4">

              <span className="text-xs border border-gray-300 rounded px-2 py-1">
                {q.topic}
              </span>

              <span className="text-xs border border-green-400 text-green-600 rounded px-2 py-1">
                {q.difficulty}
              </span>

            </div>

            <h3 className="font-semibold mb-4">
              Q{qIndex + 1}. {q.question}
            </h3>

            <div className="space-y-2">

              {q.options.map((opt, optIndex) => {

                let style = "border border-gray-200 hover:border-gray-400";

                if (status[q.id] === "correct" && optIndex === q.correct)
                  style = "border border-green-500 bg-green-50 text-green-700";

                else if (status[q.id] === "wrong" && answers[q.id] === optIndex)
                  style = "border border-red-400 bg-red-50 text-red-600";

                else if (answers[q.id] === optIndex)
                  style = "border border-gray-700 bg-gray-50";

                return (
                  <button
                    key={optIndex}
                    onClick={() => selectOption(q.id, optIndex)}
                    className={`w-full text-left px-4 py-2 rounded ${style}`}
                  >
                    {String.fromCharCode(65 + optIndex)}. {opt}
                  </button>
                );

              })}

            </div>

            <div className="mt-4 flex gap-3">

              {status[q.id] !== "correct" && (
                <button
                  onClick={() => submitQuestion(q)}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Submit
                </button>
              )}

              {status[q.id] === "wrong" && (
                <button
                  onClick={() => reattempt(q.id)}
                  className="px-4 py-2 border rounded"
                >
                  Reattempt
                </button>
              )}

              {status[q.id] === "correct" && (
                <span className="text-green-600 font-semibold">
                  ✔ Correct
                </span>
              )}

            </div>

          </div>

        ))}

      </div>
    </div>
  );
}