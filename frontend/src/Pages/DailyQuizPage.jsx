import { useState, useEffect } from "react";
import Navbar from "../components/quiz/Navbar.jsx";

export default function LearnFlex() {

 
  const exam = "GATE"; 

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({});
  const [streak,setStreak]=useState(0);
  const [lastSolvedDate,setLastSolvedDate]=useState(null);
  
  useEffect(()=>{
    const fetchuser = async()=>{
      try{
        const res= await fetch(`http://localhost:3000/user/profile/${id}`);
         const user = await res.json();
        
         setExam(user.exam);
          setStreak(user.streak);
           setLastSolvedDate(user.lastSolvedDate);
      }
      catch(error) {
        console.error("Error fetching User:", error);
    }}
      fetchuser();
    },[]);

 useEffect(()=>{
  
     if (!exam) return;  

    const fetchDailyQuiz= async()=>{
      try{
        const res = await fetch(`http://localhost:3000/daily-quiz/${exam}`);
        const data = await res.json();
        const formatted = data.map(q => ({
            ...q,
          options: [q.option1, q.option2, q.option3, q.option4]
        }));
       setQuestions(formatted);
        
      }
      catch(error) {
        console.error("Error fetching quiz:", error);
    }
  }
  fetchDailyQuiz();
},[exam])

  const selectOption = (qid, index) => {
    if (status[qid]==="correct") return;
    setAnswers({
      ...answers,
      [qid]: index
    });
  };

  const submitQuestion =(q) => {
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
      let newStreak=1;
      const today = new Date().toISOString().split("T")[0];
      if(lastSolvedDate){
      const last=newDate(lastSolvedDate )
      const diff=(today-last)/(1000 * 60 * 60 * 24)
       if(diff==0)return;
       else if (diff>1){
        newStreak=1;
       }
       else if(diff===1){
        newStreak=streak+1;
       }
    }
    setStreak(newStreak);
    lastSolvedDate(today);


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