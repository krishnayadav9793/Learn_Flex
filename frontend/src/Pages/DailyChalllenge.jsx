import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/DailyChallenge/SideBar.jsx";
import Navbar from "../components/DailyChallenge/Navbar.jsx";
import QuizQuestion from "../components/DailyChallenge/QuizQuestion.jsx"
import ResultScreen from "../components/DailyChallenge/Result.jsx";

const MOCK = [ { id: 1, question: "Which data structure uses LIFO ordering?", option1: "Queue", option2: "Stack", option3: "Deque", option4: "Heap", correct: 1, subject: "Data Structures", difficulty: "Easy" }, { id: 2, question: "Worst-case time complexity of QuickSort?", option1: "O(n log n)", option2: "O(n)", option3: "O(n²)", option4: "O(log n)", correct: 2, subject: "Algorithms", difficulty: "Medium" }, { id: 3, question: "Which normal form eliminates transitive dependencies?", option1: "1NF", option2: "2NF", option3: "3NF", option4: "BCNF", correct: 2, subject: "DBMS", difficulty: "Medium" }, { id: 4, question: "Which OSI layer handles end-to-end error recovery?", option1: "Network", option2: "Data Link", option3: "Session", option4: "Transport", correct: 3, subject: "Networks", difficulty: "Medium" }, { id: 5, question: "What does the 'volatile' keyword do in C?", option1: "Prevents compiler optimisation on the variable", option2: "Makes variable thread-safe", option3: "Allocates on heap", option4: "Declares a constant", correct: 0, subject: "C Programming", difficulty: "Hard" }, { id: 6, question: "Which scheduling algorithm can lead to starvation?", option1: "Round Robin", option2: "FCFS", option3: "Priority Scheduling", option4: "SRTF", correct: 2, subject: "OS", difficulty: "Easy" }, ];

const DIFFICULTY_STYLES = {
  Easy:   "bg-blue-50 text-blue-700 border border-blue-100",
  Medium: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  Hard:   "bg-slate-100 text-slate-700 border border-slate-200",
};

function Loading() {
  return (
  
    <div className="min-h-screen bg-[#eef5ff] flex flex-col items-center justify-center gap-4">
     
      <div className="w-9 h-9 border-4 border-white border-t-[#0B2447] rounded-full animate-spin" />
      <p className="text-sm text-slate-600 font-medium">Loading your quiz…</p>
    </div>
  );
}

export default function LearnFlex() {
  
  const [exam ,setExam]=useState("")
  const [questions,setQuestions]  = useState([]);
  const [answers,setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const TOTAL_TIME = questions[0]?.time_limit || 1200;
  const [timeLeft,setTimeLeft] = useState(TOTAL_TIME);

  useEffect(() => {
    const fetchQuestions=async () => {
      try {
        const res=await fetch(`http://localhost:3000/dc/dailyChallenge`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data=await res.json();
        const q = Array.isArray(data) ? data : [data];
        setQuestions(q);
        if (q.length > 0) setExam(q[0].exam_name);
      }
      catch(error){
        console.error(error.message)
        setQuestions(MOCK);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!questions.length) return;
    if (timeLeft <= 0) { computeAndFinish(questions, answers); return; }
    const timer = setInterval(() => setTimeLeft(n => n - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions.length]);

  const computeAndFinish = useCallback((qs, ans) => {
    let correct = 0;
    qs.forEach(q => {
      if (Number(ans[q.id]) + 1 === Number(q.correct)) correct++;
    });
    setScore(correct);
    setShowResult(true);
  }, []);

  const selectOption = (qid, idx) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const prevQuestion = () => setCurrent(c => c - 1); 

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
   
    <div className="min-h-screen bg-[#eef5ff]">

      <Navbar
        exam={exam}
        timeLeft={timeLeft}
        totalTime={TOTAL_TIME}
        formatTime={formatTime}
        answered={Object.keys(answers).length}
        total={questions.length}
      />

      <div className="flex max-w-6xl mx-auto">
        <main className="flex-1 p-8 min-w-0">
          <div className="mb-8">
    
            <h2 className="text-2xl font-bold text-[#0B2447] tracking-tight">Daily Challenge</h2>
            <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded uppercase tracking-wider">{exam}</span>
                 <p className="text-sm text-slate-500">{questions.length} questions · {Math.floor(TOTAL_TIME/60)} minutes</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <QuizQuestion
                question={questions[current]}
                index={current}
                total={questions.length}
                selectOption={selectOption}
                selected={answers[questions[current]?.id]}
                nextQuestion={nextQuestion}
                prevQuestion={prevQuestion}
            />
          </div>
        </main>

        <aside className="w-80 p-8 hidden lg:block">
            <Sidebar
                questions={questions}
                answers={answers}
                current={current}
                setCurrent={setCurrent}
                onSubmit={() => computeAndFinish(questions, answers)}
            />
        </aside>

      </div>
    </div>
  );
}