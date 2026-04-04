import { Brain, Clock, Zap } from "lucide-react";

export default function Navbar({ exam, timeLeft, totalTime, formatTime, answered, total }) {
  const urgentThreshold = totalTime ? totalTime * 0.2 : 240;
  const urgent = timeLeft <= urgentThreshold;
  const timeProgressPct = totalTime ? Math.round(((totalTime - timeLeft) / totalTime) * 100) : 0;

  return (
    <nav className="sticky top-0 z-50 h-15 px-6 flex items-center justify-between bg-white border-b border-[#D6E6F4] shadow-[0_1px_12px_0_rgba(11,36,71,0.08)]" style={{ height: "60px" }}>

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B2447] via-[#3B82F6] to-[#BFDBFE]" />

      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0B2447] rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
          <Brain className="w-[18px] h-[18px] text-white" />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-[17px] font-black tracking-tight flex items-center leading-none">
            <span className="text-blue-500">LEARN</span>
            <span className="text-[#0B2447]">FLEX</span>
          </h1>
          <span className="text-[9px] text-[#93C5FD] font-bold uppercase tracking-[0.2em] mt-1 leading-none">
            Daily Challenge
          </span>
        </div>

        <div className="w-px h-7 bg-[#D6E6F4] mx-1" />

        {exam && (
          <span className="bg-[#EAF3FB] text-[#1a5276] border border-[#BFDBFE] rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider">
            {exam}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2.5">

        {/* Timer */}
        <div className={`relative flex items-center gap-2 px-4 py-2 rounded-xl border overflow-hidden transition-all duration-500
          ${urgent
            ? "bg-red-50 border-red-200 ring-2 ring-red-100 animate-pulse"
            : "bg-[#F7F9FC] border-[#D6E6F4]"
          }`}>

          {/* Draining fill */}
          {!urgent && totalTime > 0 && (
            <div
              className="absolute inset-0 bg-[#EAF3FB] transition-all duration-1000 ease-linear"
              style={{ width: `${100 - timeProgressPct}%` }}
            />
          )}

          <div className="relative flex items-center gap-2">
            <Clock className={`w-4 h-4 ${urgent ? "text-red-500" : "text-[#1a5276]"}`} />
            <span className={`font-mono font-black text-[15px] tracking-wider ${urgent ? "text-red-600" : "text-[#0B2447]"}`}>
              {formatTime()}
            </span>
          </div>

          {urgent && <span className="relative text-sm leading-none">⚠️</span>}
        </div>

        {/* Score chip */}
        <div className="flex items-center gap-2 bg-[#0B2447] px-4 py-2 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-[#93C5FD]" />
          <span className="text-[12px] font-bold text-white">
            {answered} / {total} done
          </span>
        </div>

      </div>
    </nav>
  );
}