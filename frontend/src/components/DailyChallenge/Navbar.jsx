import { Brain, Zap, Clock } from "lucide-react";

export default function Navbar({ exam, timeLeft, totalTime, formatTime, answered, total }) {
  const urgentThreshold = totalTime ? totalTime * 0.2 : timeLeft * 0.2;
  const urgent = timeLeft <= urgentThreshold;
  const timeProgressPct = totalTime ? Math.round(((totalTime - timeLeft) / totalTime) * 100) : 0;

  return (
    <nav className="sticky top-0 z-50 h-16 px-6 flex items-center justify-between
      bg-white border-b border-[#D6E6F4]
      shadow-[0_2px_16px_0_rgba(11,36,71,0.07)]">

      {/* Gradient top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B2447] via-[#7AB8D9] to-[#EAF3FB]" />

      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        {/* Logo mark - Removed the blue dot span here */}
        <div className="relative w-10 h-10 bg-[#0B2447] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/25 shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>

        {/* Text Container */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-[1000] tracking-tighter flex items-center leading-none">
            <span className="text-blue-500">LEARN</span>
            <span className="text-[#0B2447] ml-0.5 relative">
              FLEX
              {/* This is the underline from your homepage */}
              <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-blue-600/20 rounded-full"></span>
            </span>
          </h1>
          <span className="text-[9px] text-[#7AB8D9] font-black uppercase tracking-[0.2em] mt-1.5 leading-none">
            Daily Challenge
          </span>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-8 bg-[#D6E6F4] mx-2" />
        
        {/* ... rest of your navbar (Exam badge, etc.) */}
      </div>

      {/* ── Right: Timer + Score ── */}
      <div className="flex items-center gap-3">

        {/* Timer with draining background fill */}
        <div className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-500 overflow-hidden
          ${urgent
            ? "bg-red-50 border-red-200 ring-2 ring-red-100 animate-pulse"
            : "bg-[#F7F9FC] border-[#D6E6F4]"
          }`}>

          {/* Draining fill layer */}
          {!urgent && totalTime > 0 && (
            <div
              className="absolute inset-0 bg-[#EAF3FB] transition-all duration-1000"
              style={{ width: `${100 - timeProgressPct}%` }}
            />
          )}

          <div className="relative flex items-center gap-2">
            <Clock className={`w-4 h-4 ${urgent ? "text-red-500" : "text-[#1a5276]"}`} />
            <span className={`font-mono font-black text-base tracking-widest ${
              urgent ? "text-red-600" : "text-[#0B2447]"
            }`}>
              {formatTime()}
            </span>
          </div>

          {urgent && <span className="relative text-sm">⚠️</span>}
        </div>

        

      </div>
    </nav>
  );
}