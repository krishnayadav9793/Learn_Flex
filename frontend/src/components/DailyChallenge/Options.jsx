export default function OptionBtn({ label, text, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 group overflow-hidden
        ${selected
          ? "bg-[#EAF3FB] border-[#0B2447]"
          : "bg-white border-[#E2EDF6] hover:border-[#7AB8D9] hover:bg-[#F7F9FC]"
        }`}
    >
      {/* Selected left accent bar */}
      <div className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full transition-all duration-200
        ${selected ? "opacity-100 bg-[#0B2447]" : "opacity-0"}`}
      />

      {/* Label badge */}
      <span className={`min-w-[32px] h-8 rounded-[9px] flex items-center justify-center text-xs font-black shrink-0 transition-all duration-200
        ${selected
          ? "bg-[#0B2447] text-white"
          : "bg-[#EAF3FB] border border-[#D6E6F4] text-[#1a5276] group-hover:bg-[#0B2447] group-hover:text-white group-hover:border-[#0B2447]"
        }`}>
        {label}
      </span>

      {/* Option text */}
      <span className={`text-sm leading-relaxed flex-1 transition-colors duration-200 ${
        selected
          ? "font-semibold text-[#0B2447]"
          : "font-medium text-[#2c4a6e] group-hover:text-[#0B2447]"
      }`}>
        {text}
      </span>

      {/* Right: check or arrow */}
      <span className="ml-auto shrink-0">
        {selected ? (
          <span className="w-6 h-6 rounded-full bg-[#0B2447] flex items-center justify-center">
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        ) : (
          <span className="w-6 h-6 rounded-full border border-[#D6E6F4] bg-[#F7F9FC] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M2 4H6M6 4L4 2M6 4L4 6" stroke="#7AB8D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </span>
    </button>
  );
}