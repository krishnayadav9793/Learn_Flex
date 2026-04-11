import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Target, Users, ChevronDown, Zap, Search, Bell, Star, ArrowRight, PlayCircle, Activity } from 'lucide-react';
import Navbar from '../components/Home/Navbar.jsx';
import { useNavigate } from "react-router-dom";

const LearnFlexHome = () => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState({});
  const [selectedExam, setSelectedExam] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [analysis, setAnalysis] = useState([]); // 🔥 Added analysis state

  const selectedExamId = examData[selectedExam]?.id;
  const currentTopics = examData[selectedExam]?.subjects || [];

  useEffect(() => {
    if (selectedExamId) {
      localStorage.setItem("examId", selectedExamId);
    }
  }, [selectedExamId]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`https://learn-flex-2.onrender.com/exam/subjects`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        
        //console.log("res_maa", res);
        if (!res.ok) navigate("/login");

      const data = await res.json();
      if(data?.msg==="No token"||data?.msg==="User not found"|| data?.msg==="Invalid token")navigate("/login")
      const formatted = {};
      data.forEach((row) => {
        if (!formatted[row.exam_name]) {
          formatted[row.exam_name] = {
            id: row.exam_id,
            subjects: [],
          };
        }

          if(
            row.subject_name &&
            !formatted[row.exam_name].subjects.includes(row.subject_name)
          ){
            formatted[row.exam_name].subjects.push(row.subject_name);
          }
        });

        setExamData(formatted);
        setAnalysis(data); 

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

return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#1E293B] font-sans selection:bg-blue-100">
      <Navbar
        examData={examData}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />
 
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10 space-y-8 md:space-y-12">
 
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#001F3F] via-[#002b59] to-[#001F3F] p-6 sm:p-10 md:p-16 text-[#FFFDF5] shadow-2xl shadow-blue-900/30">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              Master{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                {selectedExam || "your exam"}
              </span>
            </h2>
            <p className="text-blue-100/70 text-base sm:text-lg md:text-xl mb-6 sm:mb-10 leading-relaxed max-w-lg">
              Unlock personalized mock tests, real-time rank predictions, and deep performance analytics.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() =>
                  navigate(`/practice/${encodeURIComponent(selectedExam.replace(/\s+/g, ''))}`)
                }
                className="bg-white text-[#001F3F] px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-sm sm:text-base"
              >
                Start Practice <ArrowRight size={16} />
              </button>
            </div>
          </div>
 
          {/* Background text decoration — hidden on small screens to avoid overflow */}
          <div className=" hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 opacity-10 font-black tracking-tighter select-none pointer-events-none leading-none whitespace-nowrap text-[clamp(80px,15vw,300px)]">
            {selectedExam ? selectedExam.split(" ")[0] : "GOAL"}
          </div>
        </section>
 
        {/* Daily + Weekly Challenges */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Daily Challenge */}
          <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-500 flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-50 rounded-bl-[4rem] sm:rounded-bl-[5rem] -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 group-hover:bg-amber-100 transition-colors" />
 
            <div className="relative z-10">
              <div className="p-3 sm:p-4 w-fit bg-amber-50 rounded-xl sm:rounded-2xl text-amber-600 group-hover:bg-[#001F3F] group-hover:text-white transition-all duration-300 mb-4 sm:mb-6">
                <Zap size={26} fill="currentColor" className="sm:hidden" />
                <Zap size={32} fill="currentColor" className="hidden sm:block" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#001F3F] mb-2">Daily Challenge</h3>
              <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-[220px] sm:max-w-[250px]">
                10 high-impact questions to keep your {selectedExam} prep sharp.
              </p>
            </div>
 
            <div className="mt-auto flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  if (!selectedExam) {
                    alert("⚠️ Please select an exam first");
                    return;
                  }
                  navigate(`/DailyChallenge/${selectedExamId}`);
                }}
                className="bg-[#001F3F] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm hover:bg-[#003366] hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
              >
                Solve Now
              </button>
            </div>
          </div>
 
          {/* Weekly / Mega Mock */}
          <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-50 rounded-bl-[4rem] sm:rounded-bl-[5rem] -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 group-hover:bg-blue-100 transition-colors" />
 
            <div className="relative z-10">
              <div className="p-3 sm:p-4 w-fit bg-blue-50 rounded-xl sm:rounded-2xl text-[#001F3F] group-hover:bg-[#001F3F] group-hover:text-white transition-all duration-300 mb-4 sm:mb-6">
                <Trophy size={26} className="sm:hidden" />
                <Trophy size={32} className="hidden sm:block" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#001F3F] mb-2">Mega Mock</h3>
              <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-[220px] sm:max-w-[250px]">
                Full length {selectedExam} test with AIR ranking.
              </p>
            </div>
 
            <div className="mt-auto flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
              <button
                className="bg-white border-2 border-[#001F3F] text-[#001F3F] px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm hover:bg-[#001F3F] hover:text-white transition-all"
                onClick={() => {
                  if (!selectedExam) {
                    alert("⚠️ Please select an exam first");
                    return;
                  }
                  navigate(`/WeeklyQuiz/`, {
                    state: { exam_id: selectedExamId, exam_name: selectedExam }
                  });
                }}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </section>
 
        {/* 1v1 Arena */}
        <section className="w-full">
          <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-8 sm:p-10 md:p-12 shadow-2xl text-[#FFFDF5] relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
 
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8">
                <div className="group relative">
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 bg-white/10 rounded-xl sm:rounded-2xl border border-white/20 flex items-center justify-center font-bold text-base sm:text-xl backdrop-blur-sm">
                    You
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 italic drop-shadow-lg">VS</span>
                  <div className="h-1 w-10 sm:w-12 bg-amber-400/30 rounded-full mt-1" />
                </div>
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 flex items-center justify-center font-bold text-xl sm:text-2xl opacity-40">
                  ?
                </div>
              </div>
 
              <h4 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 tracking-tight">Arena 1v1</h4>
              <p className="text-blue-100/60 text-sm sm:text-base mb-7 sm:mb-10 max-w-xs mx-auto">
                Real-time battle with other {selectedExam} aspirants. Winner takes the streak!
              </p>
 
              <button
                className="bg-amber-400 text-[#001F3F] px-7 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-extrabold shadow-xl shadow-amber-900/20 hover:bg-amber-300 hover:-translate-y-1 transition-all active:scale-95 text-sm sm:text-base"
                onClick={() => navigate("/1v1")}
              >
                Find an Opponent
              </button>
            </div>
          </div>
        </section>
 
        
 
      </main>
    </div>
  );
};
 
export default LearnFlexHome;