import React from "react";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  examData,
  selectedExam,
  setSelectedExam,
  isDropdownOpen,
  setIsDropdownOpen
}) => {
  const navigate = useNavigate();
  
  // Safely check if a user is logged in
  const userName = localStorage.getItem("name");

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("name");
    // Optionally redirect to login page after logging out
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur-md border-b border-[#E5E1D3] px-6 py-3 flex items-center justify-between shadow-sm">
      
      <div className="flex items-center gap-10">
        
        {/* --- BRAND NAME WITH BOOK ICON --- */}
        <div onClick={() => navigate("/HomePage")} className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-[#001F3F] p-1.5 rounded-lg group-hover:rotate-[-10deg] transition-transform duration-300">
            {/* Simple Book Icon SVG */}
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-[1000] tracking-tighter flex items-center">
            <span className="text-blue-500">LEARN</span>
            <span className="text-[#001F3F] ml-0.5 relative">
              FLEX
              {/* Subtle underline accent */}
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600/20 rounded-full"></span>
            </span>
          </h1>
        </div>

        {/* --- EXAM SELECTOR --- */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white border border-[#E5E1D3] pl-4 pr-3 py-2 rounded-2xl hover:border-blue-600 hover:shadow-md transition-all group"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Goal</span>
              <span className="text-sm font-bold text-[#001F3F] uppercase tracking-tight">
                {selectedExam || "Select Exam"}
              </span>
            </div>
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
              className={`text-blue-600 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute top-full mt-3 w-64 bg-white border border-[#E5E1D3] rounded-[1.5rem] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                Choose your focus
              </div>
              <div className="max-h-72 overflow-y-auto">
                {Object.keys(examData).map((exam) => (
                  <button
                    key={exam}
                    onClick={() => {
                      setSelectedExam(exam);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 text-sm flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors ${
                      selectedExam === exam
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {exam}
                    {selectedExam === exam && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT SIDE: ACTIONS & USER --- */}
      <div className="flex items-center gap-6">
        
        <div className="flex items-center gap-4 pl-4 border-l border-[#E5E1D3]">
          {userName ? (
            /* --- LOGGED IN VIEW --- */
            <>
              {/* Logout Button (Positioned to the left of the profile) */}
              <button 
                onClick={handleLogout}
                className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                Logout
              </button>

              {/* Profile Section */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Elite Member</p>
                  <p className="text-xs font-bold text-[#001F3F]">{userName.toUpperCase()}</p>
                </div>
                <div
                  onClick={() => navigate("/profile")}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#001F3F] to-blue-800 flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-white hover:scale-105 transition-transform cursor-pointer"
                >
                  {userName[0].toUpperCase()}
                </div>
              </div>
            </>
          ) : (
            /* --- LOGGED OUT VIEW --- */
            <button 
              onClick={() => navigate("/login")}
              className="bg-[#001F3F] hover:bg-blue-900 text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors shadow-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;