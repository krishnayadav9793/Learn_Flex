import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Target, Users, ChevronDown, Zap, Search, Bell, Star } from 'lucide-react';
import Navbar from '../components/Home/Navbar.jsx';
import Footer from '../components/Home/Footer.jsx';

const LearnFlexHome = () => {
  const [examData, setExamData] = useState({});
  const [selectedExam, setSelectedExam] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentTopics = examData[selectedExam] || [];

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:3000/exam/subjects`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const formatted = {};

        data.forEach((row) => {
          if (!formatted[row.exam_name]) {
            formatted[row.exam_name] = [];
          }
          if (!formatted[row.exam_name].includes(row.subject_name)) {
            formatted[row.exam_name].push(row.subject_name);
          }
        });

        setExamData(formatted);
        const firstExam = Object.keys(formatted)[0];
        if (firstExam) setSelectedExam(firstExam);
      } catch (error) {
        console.log("Fetch error:", error.message);
      }
    };
    fetchExam();
  }, []);

  return (
    /* Warm Cream Background */
    <div className="min-h-screen bg-[#FFFDF5] text-[#1E293B] font-sans">
      <Navbar
        examData={examData}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-10">
        
        {/* Hero Section - Deep Navy Blue */}
        <section className="bg-[#001F3F] rounded-3xl p-10 text-[#FFFDF5] relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tighter leading-tight">
              Master {selectedExam || "your exam"} with personalized AI mock tests.
            </h2>
            <p className="text-blue-100/80 text-lg mb-8 max-w-lg">
              Detailed insights and rank prediction tailored for your success.
            </p>
          </div>
          {/* Decorative text */}
          <div className="absolute right-7 bottom-[-30px] opacity-10 text-[200px] font-black tracking-tighter select-none text-white">
            {selectedExam ? selectedExam.split(" ")[0] : ""}
          </div>
        </section>

        {/* Daily + Weekly */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Challenge - Cream Card with Dark Borders */}
          <div className="group bg-white border border-[#E5E1D3] p-6 rounded-[2rem] hover:border-[#001F3F] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-[#001F3F] group-hover:text-white transition-colors">
                <Zap size={28} fill="currentColor" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#001F3F] mb-1">Daily Challenge</h3>
            <p className="text-[#64748b] text-sm mb-6 flex-grow">
              10 Rapid-fire questions tailored for {selectedExam}.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-[#F5F1E3]">
              <span className="text-xs font-medium text-slate-400">+1.2k students active</span>
              <button className="bg-[#001F3F] text-[#FFFDF5] px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors">
                Solve Now
              </button>
            </div>
          </div>

          {/* Weekly Quiz */}
          <div className="group bg-white border border-[#E5E1D3] p-6 rounded-[2rem] hover:border-[#001F3F] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 bg-blue-50 rounded-2xl text-[#001F3F] group-hover:bg-[#001F3F] group-hover:text-white transition-colors">
                <Trophy size={28} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#001F3F] mb-1">Weekly Mega Quiz</h3>
            <p className="text-[#64748b] text-sm mb-6 flex-grow">Full length {selectedExam} mock test.</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#F5F1E3]">
              <span className="text-xs font-semibold text-slate-400">45 Questions • 60 Mins</span>
              <button className="bg-white border-2 border-[#001F3F] text-[#001F3F] px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#001F3F] hover:text-white transition-all">
                Start Quiz
              </button>
            </div>
          </div>
        </section>

        {/* Practice + Battle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Subjects */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-[#001F3F]">Practice by Subject</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {currentTopics?.map((topic, index) => (
                <div key={index} className="group bg-white border border-[#E5E1D3] p-6 rounded-2xl hover:bg-[#001F3F] transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-[#F5F1E3] rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-800 transition-colors">
                    <BookOpen size={22} className="text-[#001F3F] group-hover:text-white" />
                  </div>
                  <h4 className="font-bold text-[#001F3F] group-hover:text-white transition-colors">{topic}</h4>
                  <p className="text-xs text-slate-400 mt-1 group-hover:text-blue-100">120+ Chapters</p>
                </div>
              ))}
            </div>
          </div>

          {/* 1v1 Arena - Dark Blue Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-[#001F3F] rounded-[2rem] p-8 shadow-xl text-[#FFFDF5] relative overflow-hidden">
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-white/10 rounded-full border border-white/20 flex items-center justify-center font-bold">You</div>
                  <span className="text-2xl font-black text-amber-400 italic">VS</span>
                  <div className="h-14 w-14 bg-white/10 rounded-full border border-white/20 flex items-center justify-center font-bold opacity-50">?</div>
                </div>
                <h4 className="text-xl font-bold mb-2">1vs1 Challenge</h4>
                <p className="text-blue-100/60 text-sm mb-7 max-w-xs">Instantly match with another {selectedExam} aspirant.</p>
               <button className="w-full bg-white text-[#080422] py-4 rounded-2xl font-bold shadow-md transition-all duration-200 hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1">
                    Find an Opponent
                  </button>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LearnFlexHome;