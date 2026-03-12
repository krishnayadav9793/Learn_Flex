import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/DailyChallenge/SideBar.jsx";
import Navbar from "../components/DailyChallenge/Navbar.jsx";
import QuizQuestion from "../components/DailyChallenge/QuizQuestion.jsx"
import ResultScreen from "../components/DailyChallenge/Result.jsx";

const MOCK = [ { id: 1, question: "Which data structure uses LIFO ordering?", option1: "Queue", option2: "Stack", option3: "Deque", option4: "Heap", correct: 1, subject: "Data Structures", difficulty: "Easy" }, { id: 2, question: "Worst-case time complexity of QuickSort?", option1: "O(n log n)", option2: "O(n)", option3: "O(n²)", option4: "O(log n)", correct: 2, subject: "Algorithms", difficulty: "Medium" }, { id: 3, question: "Which normal form eliminates transitive dependencies?", option1: "1NF", option2: "2NF", option3: "3NF", option4: "BCNF", correct: 2, subject: "DBMS", difficulty: "Medium" }, { id: 4, question: "Which OSI layer handles end-to-end error recovery?", option1: "Network", option2: "Data Link", option3: "Session", option4: "Transport", correct: 3, subject: "Networks", difficulty: "Medium" }, { id: 5, question: "What does the 'volatile' keyword do in C?", option1: "Prevents compiler optimisation on the variable", option2: "Makes variable thread-safe", option3: "Allocates on heap", option4: "Declares a constant", correct: 0, subject: "C Programming", difficulty: "Hard" }, { id: 6, question: "Which scheduling algorithm can lead to starvation?", option1: "Round Robin", option2: "FCFS", option3: "Priority Scheduling", option4: "SRTF", correct: 2, subject: "OS", difficulty: "Easy" }, ];
const OPTION_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY_STYLES = {
  Easy:   "bg-green-50 text-green-700",
  Medium: "bg-yellow-50 text-yellow-700",
  Hard:   "bg-red-50 text-red-600",
};

function Loading() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading your quiz…</p>
    </div>
  );
}

export default function LearnFlex() {
  
  const [exam ,setExam]=useState("JeeMains")
  const [questions,setQuestions]  = useState([]);
  const [answers,setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const TOTAL_TIME = questions[0]?.time_limit || 1200;

  const [timeLeft,setTimeLeft] = useState(TOTAL_TIME);


  const computeAndFinish = useCallback((qs, ans) => {
    let correct = 0;
    qs.forEach(q => { if (ans[q.id] === q.correct) correct++; });
    setScore(correct);
    setShowResult(true);
  }, []);

  //Api Call
  useEffect(() => {
    const fetchQuestions=async () => {
      try {
        const res = await fetch(`http://localhost:3000/dc/dailyChallenge/${exam}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data=res.json();
        setQuestions(data);
      }
       catch(error){
        console.error(error.message)
        setQuestions(MOCK);
      }
    };
    fetchQuestions();
  }, [exam]);

  useEffect(() => {
    if (!questions.length) return;
    if (timeLeft <= 0) { computeAndFinish(questions, answers); return; }
    const timer = setInterval(() => setTimeLeft(n => n - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions.length]);

  
  const selectOption = (qid, idx) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const prevQuestion = () => {
      setCurrent(c => c - 1); 
  };

  const nextQuestion = () => {
    if (current === questions.length - 1) {
      computeAndFinish(questions, answers);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setAnswers({});
    setCurrent(0);
    setTimeLeft(TOTAL_TIME);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) return <ResultScreen score={score} total={questions.length} onRetry={reset} />;
  if (!questions.length) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar
        exam={exam}
        timeLeft={timeLeft}
        totalTime={TOTAL_TIME}
        formatTime={formatTime}
        answered={Object.keys(answers).length}
        total={questions.length}
      />

    
      <div className="flex max-w-5xl mx-auto">
        <main className="flex-1 p-8 min-w-0">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Daily Challenge</h2>
            <p className="text-sm text-gray-500 mt-0.5">{exam} · {questions.length} questions · 15 minutes</p>
          </div>

          <QuizQuestion
            question={questions[current]}
            index={current}
            total={questions.length}
            selectOption={selectOption}
            selected={answers[questions[current]?.id]}
            nextQuestion={nextQuestion}
            prevQuestion={prevQuestion}
          />
        </main>
        <Sidebar
          questions={questions}
          answers={answers}
          current={current}
          setCurrent={setCurrent}
          onSubmit={() => computeAndFinish(questions, answers)}
        />

      </div>
    </div>
  );
}