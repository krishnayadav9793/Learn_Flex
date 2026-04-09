import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/DailyChallenge/SideBar.jsx";
import Navbar from "../components/DailyChallenge/Navbar.jsx";
import QuizQuestion from "../components/DailyChallenge/QuizQuestion.jsx";
import ResultScreen from "../components/DailyChallenge/Result.jsx";
import { useParams } from "react-router-dom";

const MOCK = [
  { id: 1, question: "Which data structure uses LIFO ordering?", option1: "Queue", option2: "Stack", option3: "Deque", option4: "Heap", correct: 1, subject: "Data Structures", difficulty: "Easy" },
  { id: 2, question: "Worst-case time complexity of QuickSort?", option1: "O(n log n)", option2: "O(n)", option3: "O(n²)", option4: "O(log n)", correct: 2, subject: "Algorithms", difficulty: "Medium" },
  { id: 3, question: "Which normal form eliminates transitive dependencies?", option1: "1NF", option2: "2NF", option3: "3NF", option4: "BCNF", correct: 2, subject: "DBMS", difficulty: "Medium" },
  { id: 4, question: "Which OSI layer handles end-to-end error recovery?", option1: "Network", option2: "Data Link", option3: "Session", option4: "Transport", correct: 3, subject: "Networks", difficulty: "Medium" },
  { id: 5, question: "What does the 'volatile' keyword do in C?", option1: "Prevents compiler optimisation on the variable", option2: "Makes variable thread-safe", option3: "Allocates on heap", option4: "Declares a constant", correct: 0, subject: "C Programming", difficulty: "Hard" },
  { id: 6, question: "Which scheduling algorithm can lead to starvation?", option1: "Round Robin", option2: "FCFS", option3: "Priority Scheduling", option4: "SRTF", correct: 2, subject: "OS", difficulty: "Easy" },
];

function Loading() {
  return (
    // Applied Light Cream background. Light Blue & Dark Blue spinner.
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-5">
      <div className="w-10 h-10 border-4 border-[#E1EFFF] border-t-[#0B2447] rounded-full animate-spin shadow-sm" />
      <p className="text-sm text-[#0B2447]/70 font-bold uppercase tracking-widest">Loading your quiz…</p>
    </div>
  );
}

export default function LearnFlex() {
  const { exam_id } = useParams();
  const [exam, setExam] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const TOTAL_TIME = questions[0]?.time_limit || 1200;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [unattempted, setUnattempted] = useState(0);
  const [challengeId, setChallengeId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:3000/dc/dailyChallenge/${exam_id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const q = Array.isArray(data) ? data : [data];
        setQuestions(q);

        if (q.length > 0) {
          setExam(q[0].exam_name);
          setCorrect(q[0].correct_marks);
          setWrong(q[0].wrong_marks);
          setUnattempted(q[0].unattempted_marks);
          setChallengeId(q[0].challenge_id);
        }
      } catch (error) {
        console.error(error.message);
        setQuestions(MOCK);
      }
    };
    fetchQuestions();
  }, [exam_id]);

  useEffect(() => {
    if (!questions.length) return;
    if (timeLeft <= 0) { computeAndFinish(questions, answers); return; }
    const timer = setInterval(() => setTimeLeft(n => n - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions.length]);

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

  const computeAndFinish = useCallback(async (qs, ans) => {
    if (submitted) return;
    setSubmitted(true);

    let totalScore = 0;
    qs.forEach(q => {
      const selected = ans[q.id];
      if (selected === undefined) {
        totalScore += unattempted;
        return;
      }
      if (Number(selected) + 1 === Number(q.correct)) {
        totalScore += correct;
      } else {
        totalScore += wrong;
      }
    });

    setScore(totalScore);
    setShowResult(true);

    try {
      const attempts = qs.map(q => ({
        challenge_id: Number(challengeId),
        ques_id: q.id,
        marked_option: ans[q.id] !== undefined ? ans[q.id]+1 : null,
        attempt_at: new Date().toISOString(),
      }));

      const res = await fetch("http://localhost:3000/dc/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(attempts),
      });
      
      if (!res.ok) throw new Error("Failed to save attempt");
    } catch (err) {
      console.error("Attempt insert failed:", err.message);
    }
  }, [submitted, correct, wrong, unattempted, challengeId]);

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setSubmitted(false);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(TOTAL_TIME*60);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) return <ResultScreen score={score} total={questions.length * correct} onRetry={reset} />;
  if (!questions.length) return <Loading />;

  return (
    // Base wrapper with Light Cream (#FAF8F5) background and Dark Blue text default
    <div className="min-h-screen bg-[#FAF8F5] text-[#0B2447] font-sans selection:bg-[#E1EFFF] selection:text-[#0B2447]">

      <Navbar
        exam={exam}
        timeLeft={timeLeft}
        totalTime={TOTAL_TIME}
        formatTime={formatTime}
        answered={Object.keys(answers).length}
        total={questions.length}
      />

      <div className="flex min-h-[calc(100vh-60px)] max-w-[1600px] mx-auto w-full">

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 lg:px-16 xl:px-24 py-10 flex flex-col items-center gap-8 relative">
          
          {/* Decorative subtle top-border accent using Light Blue */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E1EFFF] via-[#0B2447] to-[#E1EFFF] opacity-20"></div>

          {/* Header */}
          <div className="w-full max-w-4xl pt-4">
            <h2 className="text-3xl font-black text-[#0B2447] tracking-tight">Daily Challenge</h2>
            
            <div className="flex items-center gap-3 mt-3">
              {/* Badge: Light Blue background with Dark Blue text */}
              <span className="text-[11px] font-bold px-3 py-1.5 bg-[#E1EFFF] text-[#0B2447] rounded border border-[#0B2447]/10 uppercase tracking-widest shadow-sm">
                {exam}
              </span>
              
              <div className="flex items-center gap-2 text-sm font-medium text-[#0B2447]/60">
                <span>{questions.length} questions</span>
                <span className="w-1 h-1 rounded-full bg-[#0B2447]/30"></span>
                <span>{Math.floor(TOTAL_TIME / 60)} minutes</span>
              </div>
            </div>
          </div>

          {/* Question Component Wrapper */}
          <div className="w-full max-w-4xl">
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

        {/* Sidebar — Very light airy blue background to contrast with the cream main section */}
       <aside className="sticky top-0 h-screen overflow-y-auto w-80 xl:w-[340px] hidden lg:flex flex-col gap-6 px-6 xl:px-8 py-10 border-l-2 border-[#0B2447]/5 bg-gradient-to-b from-[#F4F9FF]/50 to-white shrink-0 shadow-[-12px_0_40px_#0B244708] z-10 scrollbar-hide">
  
  {/* Subtle decorative gradient at the top right to anchor it */}
  <div className="absolute top-0 right-0 w-full h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0B2447]/[0.02] to-transparent pointer-events-none" />

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