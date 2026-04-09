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
        const res = await fetch(`http://localhost:3000/exam/subjects`, {
          method: "GET",
          credentials: "include"
        });
        
        console.log("res_maa", res);
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
        setAnalysis(data); // 🔥 Save the raw data for the analysis section

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

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#001F3F] via-[#002b59] to-[#001F3F] p-10 md:p-16 text-[#FFFDF5] shadow-2xl shadow-blue-900/30">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">{selectedExam || "your exam"}</span>
            </h2>
            <p className="text-blue-100/70 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
              Unlock personalized mock tests, real-time rank predictions, and deep performance analytics.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate(`/practice/${encodeURIComponent(selectedExam.replace(/\s+/g, ''))}`)}
                className="bg-white text-[#001F3F] px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                Start Practice <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Large Background Text Decoration */}
          <div className="absolute right-[20px] bottom-[-40px] opacity-10 text-[240px] font-black tracking-tighter select-none pointer-events-none">
            {selectedExam ? selectedExam.split(" ")[0] : "GOAL"}
          </div>
        </section>

        {/* Daily + Weekly Challenges */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Daily Challenge */}
          <div className="group relative bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-500 flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-amber-100 transition-colors" />
            
            <div className="relative z-10">
              <div className="p-4 w-fit bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-[#001F3F] group-hover:text-white transition-all duration-300 mb-6">
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-3xl font-bold text-[#001F3F] mb-2">Daily Challenge</h3>
              <p className="text-slate-500 text-base mb-8 max-w-[250px]">
                10 high-impact questions to keep your {selectedExam} prep sharp.
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  if (!selectedExam) {
                    alert("⚠️ Please select an exam first");
                    return;
                  }
                  navigate(`/DailyChallenge/${selectedExamId}`);
                }}
                className="bg-[#001F3F] text-white px-7 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
              >
                Solve Now
              </button>
            </div>
          </div>

          {/* Weekly Quiz */}
          <div className="group relative bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors" />

            <div className="relative z-10">
              <div className="p-4 w-fit bg-blue-50 rounded-2xl text-[#001F3F] group-hover:bg-[#001F3F] group-hover:text-white transition-all duration-300 mb-6">
                <Trophy size={32} />
              </div>
              <h3 className="text-3xl font-bold text-[#001F3F] mb-2">Mega Mock</h3>
              <p className="text-slate-500 text-base mb-8 max-w-[250px]">
                Full length {selectedExam} test with AIR ranking.
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                className="bg-white border-2 border-[#001F3F] text-[#001F3F] px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#001F3F] hover:text-white transition-all"
                onClick={() => {
                  if(!selectedExam){
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
          <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] rounded-[3rem] p-12 shadow-2xl text-[#FFFDF5] relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-4 md:gap-12 mb-8">
                <div className="group relative">
                   <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                   <div className="relative h-20 w-20 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center font-bold text-xl backdrop-blur-sm">You</div>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-4xl font-black text-amber-400 italic drop-shadow-lg">VS</span>
                   <div className="h-1 w-12 bg-amber-400/30 rounded-full mt-1"></div>
                </div>
                <div className="h-20 w-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center font-bold text-2xl opacity-40">?</div>
              </div>

              <h4 className="text-3xl font-bold mb-3 tracking-tight">Arena 1v1</h4>
              <p className="text-blue-100/60 text-base mb-10 max-w-sm mx-auto">
                Real-time battle with other {selectedExam} aspirants. Winner takes the streak!
              </p>

              <button 
                className="bg-amber-400 text-[#001F3F] px-10 py-4 rounded-2xl font-extrabold shadow-xl shadow-amber-900/20 hover:bg-amber-300 hover:-translate-y-1 transition-all active:scale-95" 
                onClick={() => navigate("/v")}
              >
                Find an Opponent
              </button>
            </div>
          </div>
        </section>

        {/* Practice by Subject */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-[#001F3F]">Practice by Subject</h3>
              <p className="text-slate-400 text-sm mt-1">Deep dive into specific topics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {currentTopics.length > 0 ? (
              currentTopics.map((topic, index) => (
                <div
                  key={index}
                  className="group bg-white border border-slate-200 p-7 rounded-[2rem] hover:bg-[#001F3F] hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-900/20"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/10 group-hover:rotate-6 transition-all">
                    <BookOpen size={26} className="text-[#001F3F] group-hover:text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-[#001F3F] group-hover:text-white transition-colors mb-2">
                    {topic}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-grow bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#001F3F] w-1/3 group-hover:bg-blue-300"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-200">30%</span>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-[2rem] animate-pulse" />
              ))
            )}
          </div>
        </section>

       

      </main>
    </div>
  );
};

export default LearnFlexHome;