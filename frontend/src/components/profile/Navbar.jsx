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
       

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E1D3]">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Elite Member</p>
            <p className="text-xs font-bold text-[#001F3F]">{localStorage.getItem("name").toUpperCase()}</p>
          </div>
<div
  onClick={() => navigate("/profile")}
  className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#001F3F] to-blue-800 flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-white hover:scale-105 transition-transform cursor-pointer"
>
  {localStorage.getItem("name")[0].toUpperCase()}
</div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;