import React from "react";
import { ChevronDown, Star, Bell } from "lucide-react";

const Navbar = ({
  examData,
  selectedExam,
  setSelectedExam,
  isDropdownOpen,
  setIsDropdownOpen
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      
      <div className="flex items-center gap-8">
        
        {/* Logo */}
        <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">
          Learn<span className="text-slate-900">Flex</span>
        </h1>

        {/* Exam Dropdown */}
        <div className="relative">
          
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-slate-200 transition-all font-semibold text-sm"
          >
            <span className="text-slate-500 uppercase text-[10px] tracking-widest">
              EXAM
            </span>

            <div className="flex items-center gap-1.5">
              {selectedExam}

              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">

              <div className="p-2 text-xs font-bold text-slate-400 uppercase">
                Select your Exam
              </div>

              {Object.keys(examData).map((exam) => (
                <button
                  key={exam}
                  onClick={() => {
                    setSelectedExam(exam);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-indigo-50 ${
                    selectedExam === exam
                      ? "bg-indigo-50 text-indigo-600 font-bold"
                      : "text-slate-700"
                  }`}
                >
                  {exam}

                  {selectedExam === exam && (
                    <Star size={16} className="text-indigo-500" fill="currentColor" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5 text-sm font-semibold text-slate-600">

        <button className="relative text-slate-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50">
          <Bell size={20} />
         
        </button>

        <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-slate-200">
          AD
        </div>

      </div>

    </nav>
  );
};

export default Navbar;