import React, { useState } from "react";
import { Brain, Menu, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  examData,
  selectedExam,
  setSelectedExam,
  isDropdownOpen,
  setIsDropdownOpen
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileExamOpen, setIsMobileExamOpen] = useState(false);

  const userName = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.removeItem("name");
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur-md border-b border-[#E5E1D3] px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">

        {/* LEFT: Brand + Exam Selector */}
        <div className="flex items-center gap-4 sm:gap-10 min-w-0">

          {/* Brand */}
          <div
            onClick={() => navigate("/HomePage")}
            className="flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <div className="bg-[#001F3F] p-1.5 rounded-lg group-hover:rotate-[-10deg] transition-transform duration-300">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-[1000] tracking-tighter flex items-center">
              <span className="text-blue-500">LEARN</span>
              <span className="text-[#001F3F] ml-0.5 relative">
                FLEX
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600/20 rounded-full" />
              </span>
            </h1>
          </div>

          {/* Exam Selector — hidden on mobile, shown sm+ */}
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
              <ChevronDown
                className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                strokeWidth={3}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-3 w-64 bg-white border border-[#E5E1D3] rounded-[1.5rem] shadow-2xl overflow-hidden z-50">
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
                      {selectedExam === exam && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Desktop actions + Mobile hamburger */}
        <div className="flex items-center gap-3">

          {/* Desktop: user actions */}
          <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-[#E5E1D3]">
            {userName ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
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
              <button
                onClick={() => navigate("/login")}
                className="bg-[#001F3F] hover:bg-blue-900 text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors shadow-sm"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile: avatar or login shortcut */}
          <div className="flex sm:hidden items-center gap-2">
            {userName ? (
              <div
                onClick={() => navigate("/profile")}
                className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#001F3F] to-blue-800 flex items-center justify-center text-white font-black text-xs shadow ring-2 ring-white cursor-pointer"
              >
                {userName[0].toUpperCase()}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#001F3F] text-white text-xs font-bold py-1.5 px-3 rounded-lg"
              >
                Login
              </button>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen
              ? <X className="w-5 h-5 text-[#001F3F]" />
              : <Menu className="w-5 h-5 text-[#001F3F]" />
            }
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Drawer panel — slides in from top, below navbar */}
          <div className="relative mt-[57px] bg-[#FFFDF5] border-b border-[#E5E1D3] shadow-xl z-50 max-h-[calc(100vh-57px)] overflow-y-auto">

            {/* User info strip */}
            {userName && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E1D3] bg-slate-50">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#001F3F] to-blue-800 flex items-center justify-center text-white font-black text-sm shadow">
                  {userName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Elite Member</p>
                  <p className="text-sm font-bold text-[#001F3F]">{userName.toUpperCase()}</p>
                </div>
              </div>
            )}

            {/* Exam selector */}
            <div className="px-5 py-4 border-b border-[#E5E1D3]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Goal</p>
              <button
                onClick={() => setIsMobileExamOpen(!isMobileExamOpen)}
                className="w-full flex items-center justify-between bg-white border border-[#E5E1D3] px-4 py-3 rounded-2xl"
              >
                <span className="text-sm font-bold text-[#001F3F] uppercase tracking-tight">
                  {selectedExam || "Select Exam"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${isMobileExamOpen ? "rotate-180" : ""}`}
                  strokeWidth={3}
                />
              </button>

              {isMobileExamOpen && (
                <div className="mt-2 border border-[#E5E1D3] rounded-2xl overflow-hidden">
                  {Object.keys(examData).map((exam) => (
                    <button
                      key={exam}
                      onClick={() => {
                        setSelectedExam(exam);
                        setIsMobileExamOpen(false);
                        closeMobileMenu();
                      }}
                      className={`w-full text-left px-5 py-3.5 text-sm flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors ${
                        selectedExam === exam
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {exam}
                      {selectedExam === exam && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nav actions */}
            <div className="px-5 py-4 flex flex-col gap-2">
              <button
                onClick={() => { navigate("/profile"); closeMobileMenu(); }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-[#001F3F] rounded-xl hover:bg-slate-100 transition-colors"
              >
                My Profile
              </button>

              {userName ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { navigate("/login"); closeMobileMenu(); }}
                  className="w-full bg-[#001F3F] text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;