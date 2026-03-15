import React, { useState ,useEffect} from 'react';
import { BookOpen, Trophy, Target, Users, ChevronDown, Zap, Search, Bell, Star } from 'lucide-react';
import Navbar from '../components/Home/Navbar.jsx';
import Footer from '../components/Home/Footer.jsx';

const LearnFlexHome = () => {
  const [examData, setExamData]=useState({})
  const [selectedExam, setSelectedExam] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentTopics = examData[selectedExam] || [];

useEffect(()=>{
  const fetchExam = async()=>{
   try {
        const res=await fetch(`http://localhost:3000/exam/subjects`)
        if (!res.ok) throw new Error("Failed to fetch");
        const data=await res.json();
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      <Navbar
      examData={examData}
      selectedExam={selectedExam}
      setSelectedExam={setSelectedExam}
      isDropdownOpen={isDropdownOpen}
      setIsDropdownOpen={setIsDropdownOpen}/>
       
    
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-10">

  {/* Hero Section */}
  <section className="bg-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
    <div className="relative z-10 max-w-2xl">

      <h2 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tighter leading-tight">
        Master {selectedExam || "your exam"} with personalized AI mock tests.
      </h2>

      <p className="text-indigo-100 text-lg mb-8 max-w-lg">
        Get detailed insights on your weak areas and predict your rank among thousands of peers.
      </p>

    </div>

    {/* Decorative text */}
    <div className="absolute right-10 bottom-[-30px] opacity-10 text-[200px] font-black tracking-tighter select-none">
      {selectedExam ? selectedExam.split(" ")[0] : ""}
    </div>

    <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-500 opacity-30 blur-3xl"></div>
  </section>

  {/* Daily + Weekly */}
  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Daily Challenge */}
    <div className="group bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-amber-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">

      <div className="flex justify-between items-start mb-5">
        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
          <Zap size={28} fill="currentColor" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-1">Daily Challenge</h3>

      <p className="text-slate-500 text-sm mb-6 flex-grow">
        10 Rapid-fire questions tailored for {selectedExam}.
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-400">
          +1.2k students active
        </span>

        <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors">
          Solve Now
        </button>
      </div>

    </div>

    {/* Weekly Quiz */}
    <div className="group bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">

      <div className="flex justify-between items-start mb-5">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Trophy size={28} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-1">Weekly Mega Quiz</h3>

      <p className="text-slate-500 text-sm mb-6 flex-grow">
        Full length {selectedExam} mock test. Compete for the leaderboard.
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400">
          45 Questions • 60 Mins
        </span>

        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
          Start Quiz
        </button>
      </div>

    </div>

  </section>

  {/* Practice + Battle */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

    {/* Subjects */}
    <div className="lg:col-span-8 space-y-6">

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">
          Practice by Subject
        </h3>

        <span className="text-indigo-600 bg-indigo-50 px-4 py-1 rounded-full text-xs font-bold">
          {currentTopics?.length || 0} Subjects
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">

        {currentTopics?.map((topic, index) => (
          <div
            key={index}
            className="group bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
          >

            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
              <BookOpen size={22} className="text-slate-500 group-hover:text-indigo-600" />
            </div>

            <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">
              {topic}
            </h4>

            <p className="text-xs text-slate-400 mt-1">
              120+ Chapters • 3k+ Qs
            </p>

          </div>
        ))}

      </div>

    </div>

    {/* 1v1 Arena */}
    <div className="lg:col-span-4 sticky top-24">

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden">

        <div className="relative z-10 text-center flex flex-col items-center">

          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 bg-slate-700 rounded-full border-2 border-slate-600 flex items-center justify-center text-xl font-bold">
              You
            </div>

            <span className="text-3xl font-black text-rose-400 italic">VS</span>

            <div className="h-14 w-14 bg-slate-700 rounded-full border-2 border-slate-600 flex items-center justify-center text-xl font-bold opacity-60">
              ?
            </div>
          </div>

          <h4 className="text-xl font-bold mb-2">1vs1 Challenge</h4>

          <p className="text-slate-400 text-sm mb-7 max-w-xs">
            Instantly match with another {selectedExam} aspirant.
          </p>

          <button className="w-full bg-[#aa2f38] text-white py-4 rounded-2xl font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/50">
            Find an Opponent
          </button>

        </div>

        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-600/30 rounded-full blur-3xl"></div>

      </div>

    </div>

  </div>

</main>
      
      
<Footer/>

    </div>
  );
};

export default LearnFlexHome;