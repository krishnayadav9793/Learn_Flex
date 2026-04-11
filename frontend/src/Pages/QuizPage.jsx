import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Banner from "../components/quiz/banner.jsx";
import { Sparkles, Brain } from "lucide-react";

// ── Inline Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur-md border-b border-[#E5E1D3] px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-[#001F3F] p-1.5 rounded-lg group-hover:rotate-[-10deg] transition-transform duration-300">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-[1000] tracking-tighter flex items-center">
            <span className="text-blue-500">LEARN</span>
            <span className="text-[#001F3F] ml-0.5 relative">
              FLEX
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600/20 rounded-full"></span>
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E1D3]">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Elite Member</p>
            <p className="text-xs font-bold text-[#001F3F]">
              {localStorage.getItem("name")?.toUpperCase()}
            </p>
          </div>
          <div
            onClick={() => navigate("/profile")}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#001F3F] to-blue-800 flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-white hover:scale-105 transition-transform cursor-pointer"
          >
            {localStorage.getItem("name")?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
};

// ── QuizPage ───────────────────────────────────────────────────────────────────
function QuizPage() {
  const navigate = useNavigate();
  const params = useLocation();
  const [quizList, setQuizList] = useState([]);

  // exam_id is passed from HomePage via navigate state
  const examId = params?.state?.exam_id || localStorage.getItem("examId");

  // ---------------- FETCH QUIZ ----------------
  useEffect(() => {
    if (!examId) return;

    const fetchQuiz = async () => {
      try {
        const res = await fetch(`https://learn-flex-2.onrender.com/quiz/list/${examId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        console.log(data[0]);
        setQuizList(data);
      } catch (err) {
        console.log("Quiz fetch error:", err.message);
      }
    };

    fetchQuiz();
  }, [examId]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#1E293B] font-sans">

      <Navbar />

      <main className="max-w-7xl mx-auto pt-24 px-6 md:px-10 pb-16">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-[#001F3F] via-[#002e5c] to-[#003a70] px-12 py-16 text-white shadow-2xl">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-4 text-blue-200">
              <Sparkles size={18} />
              <span className="text-xs font-bold tracking-widest uppercase">
                Practice Arena
              </span>
            </div>

            <h1 className="text-5xl font-black mb-5 tracking-tight">
              Quiz Arena
            </h1>

            <p className="text-blue-100/70 text-lg leading-relaxed">
              Attempt curated quizzes designed to test your knowledge,
              sharpen accuracy and track performance in real-time.
            </p>

            <button
              onClick={() => navigate("/HomePage")}
              className="mt-6 inline-flex items-center gap-2 bg-white text-[#001F3F] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-blue-50 transition"
            >
              ← Back to Home
            </button>
          </div>

          {/* Background decoration */}
          <div className="absolute right-10 bottom-[-50px] opacity-10 text-[220px] font-black select-none">
            QUIZ
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_60%)]" />
        </section>

        {/* SECTION HEADER */}
        <div className="mt-16 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#001F3F]">
              Available Quizzes
            </h2>
            <p className="text-slate-500 text-sm">
              Choose a quiz and begin your challenge.
            </p>
          </div>
          <div className="text-xs bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-semibold">
            {quizList.length} Quizzes
          </div>
        </div>

        {/* QUIZ GRID */}
        <section className="flex flex-col gap-4">
  {quizList.length > 0 ? (
    quizList.map((quiz) => (
      <div key={quiz.test_id}>
        <Banner data={quiz} />
      </div>
    ))
  ) : (
    [1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-[120px] rounded-[22px] bg-white border border-slate-200 animate-pulse"
      />
    ))
  )}
</section>

        {/* EMPTY STATE */}
        {quizList.length === 0 && (
          <div className="mt-16 text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-[#001F3F]">
              No quizzes available
            </h3>
            <p className="text-slate-500 mt-2 text-sm">
              New quizzes will appear here once they are scheduled.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

export default QuizPage;