export default function OptionBtn({ label, text, selected, onClick }) {
  // Color Palette Reference:
  // Dark Blue: #0B2447
  // Light Blue: #E1EFFF
  // Light Cream/Background: #F4F9FF (used for unselected backgrounds)

  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-5 text-left px-5 py-4 rounded-xl border-2 transition-all duration-500 group overflow-hidden shadow-[0_2px_8px_rgba(11,36,71,0.03)]
        ${selected
          ? "bg-[#E1EFFF]/50 border-[#0B2447] shadow-lg shadow-[#0B2447]/5 scale-[1.01]"
          : "bg-white border-[#0B2447]/10 hover:border-[#0B2447]/30 hover:bg-[#F4F9FF] hover:shadow-md"
        }`}
    >
      {/* --- GEOMETRIC BACKGROUND DECORATIONS --- */}
      {/* 1. Large Top-Left Triangle/Square */}
      <div className={`absolute -top-6 -left-6 w-20 h-20 -rotate-12 transition-all duration-500 ease-out z-0 rounded-2xl
        ${selected ? 'bg-white opacity-100' : 'bg-[#FAF8F5] group-hover:rotate-0 group-hover:scale-110'}`}>
      </div>

      {/* 2. Dynamic Bottom-Right Slanted shape */}
      <div className={`absolute -bottom-10 -right-2 w-32 h-20 rotate-12 transition-all duration-700 ease-in-out z-0 origin-bottom-right rounded-xl
        ${selected ? 'bg-[#FAF8F5] opacity-100' : 'bg-[#E1EFFF]/40 scale-x-50 opacity-0 group-hover:opacity-100 group-hover:scale-x-100'}`}>
      </div>

      {/* 3. Subtle Slanted Line Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.02] transition-opacity duration-300 group-hover:opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #0B2447 0, #0B2447 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }}>
      </div>


      {/* --- CONTENT LAYER (Above background shapes) --- */}

      {/* Label badge - Geometric Octagon-like feel */}
      <div className={`relative z-10 w-9 h-9 border-2 flex items-center justify-center text-xs font-black shrink-0 transition-all duration-300 ease-out
        ${selected
          ? "bg-[#0B2447] text-white border-[#0B2447] rounded-lg rotate-[-10deg] shadow-md shadow-[#0B2447]/20"
          : "bg-[#F4F9FF] border-[#0B2447]/10 text-[#0B2447]/60 rounded group-hover:bg-[#0B2447] group-hover:text-white group-hover:border-[#0B2447] group-hover:rotate-[-5deg]"
        }`}>
        {label}
      </div>

      {/* Option text */}
      <span className={`relative z-10 text-[15px] leading-relaxed flex-1 transition-all duration-300 ${
        selected
          ? "font-extrabold text-[#0B2447] translate-x-1"
          : "font-medium text-[#0B2447]/90 group-hover:text-[#0B2447] group-hover:font-semibold"
      }`}>
        {text}
      </span>

      {/* Right Indicator Container */}
      <div className="relative z-10 ml-auto shrink-0 flex items-center justify-center w-8 h-8">
        {selected ? (
          // Selected: Rotated geometric box with checkmark
          <div className="absolute inset-0 bg-[#0B2447] flex items-center justify-center rounded-lg rotate-12 shadow-sm shadow-[#0B2447]/30 transition-transform duration-300 animate-popIn">
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none" className="-rotate-12">
              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : (
          // Hover Unselected: Geometric arrow slides in
          <div className="absolute inset-0 bg-white/80 border border-[#0B2447]/20 rounded-md flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-[-5deg] transition-all duration-300 shadow-sm backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-300">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#0B2447" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}