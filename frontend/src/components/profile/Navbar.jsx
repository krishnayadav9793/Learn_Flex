import React from "react";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    
    <nav className="sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur-md border-b border-[#E5E1D3] px-6 py-3 flex items-center justify-between shadow-sm">
      
      <div className="flex items-center gap-10">
        
        {/* --- BRAND NAME WITH BOOK ICON --- */}
        <div className="flex items-center gap-2 group cursor-pointer">
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


      
      </div>

      {/* --- RIGHT SIDE: ACTIONS & USER --- */}
      <div className="flex items-center gap-6">
        {/* Simple Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors group">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E1D3]">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Elite Member</p>
            <p className="text-xs font-bold text-[#001F3F]">Abhishek D.</p>
          </div>
<div
  onClick={() => navigate("/profile")}
  className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#001F3F] to-blue-800 flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-white hover:scale-105 transition-transform cursor-pointer"
>
  AD
</div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;