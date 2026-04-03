import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/quiz/banner.jsx";
import Navbar from "../components/Home/Navbar.jsx";
import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

function QuizPage(){
  const navigate = useNavigate();
  const [quizList, setQuizList] = useState([]);
  const [examData, setExamData] = useState({});
  const [selectedExam, setSelectedExam] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const params = useLocation();

  // ---------------- FETCH EXAMS ----------------
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:3000/exam/subjects`);
        if (!res.ok) throw new Error("Failed to Fetch");

        const data = await res.json();

        const formatted = {};
        data.forEach((row) => {
          if (!formatted[row.exam_name]) {
            formatted[row.exam_name] = {
              id: row.exam_id,
              subjects: [],
            };
          }

          if (
            row.subject_name &&
            !formatted[row.exam_name].subjects.includes(row.subject_name)
          ) {
            formatted[row.exam_name].subjects.push(row.subject_name);
          }
        });

        setExamData(formatted);

        const savedExamId = localStorage.getItem("examId");

        const examName =
          Object.keys(formatted).find(
            (key) => formatted[key].id == savedExamId
          ) || Object.keys(formatted)[0];

        if (examName) setSelectedExam(examName);
      } catch (error) {
        console.log("Fetch error:", error.message);
      }
    };

    fetchExam();
  }, []);

  // ---------------- FETCH QUIZ ----------------
  useEffect(() => {
    const examId =
      params?.state?.exam_id ||
      Object.values(examData).find(
        (exam) => exam.id == localStorage.getItem("examId")
      )?.id;

    if (!examId) return;

    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/quiz/list/${examId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        console.log(data[0])
        setQuizList(data);
      } catch (err) {
        console.log("Quiz fetch error:", err.message);
      }
    };

    fetchQuiz();
  }, [examData, params]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#1E293B] font-sans">

      <Navbar
        examData={examData}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />

      <main className="max-w-7xl mx-auto pt-24 px-6 md:px-10 pb-16">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-[#001F3F] via-[#002e5c] to-[#003a70] px-12 py-16 text-white shadow-2xl">

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-4 text-blue-200">
              <Sparkles size={18}/>
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

          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_60%)]"></div>
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
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {quizList.length > 0 ? (
            quizList.map((quiz) => (
              <div
              key={quiz.test_id}
              className="group relative rounded-[2.2rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10"
              >
                <Banner data={quiz} />
              </div>
            ))
          ) : (

            <>
              {[1,2,3].map((i)=>(
                <div
                  key={i}
                  className="h-[260px] rounded-[2rem] bg-white border border-slate-200 animate-pulse"
                />
              ))}
            </>

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