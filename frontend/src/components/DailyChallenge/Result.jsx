import { useNavigate } from "react-router-dom";

export default function ResultScreen({ score, total, onRetry }) {
  const navigate=useNavigate();
  const pct = Math.round((score / total) * 100);

  const tier =
    pct >= 80 ? {
      emoji: "🏆",
      label: "Excellent!",
      sub: "You've mastered this challenge.",
      colorClass: "text-[#0B2447]",
      bgClass: "bg-[#EAF3FB]",
      borderClass: "border-[#7AB8D9]",
    } :
    pct >= 60 ? {
      emoji: "🌟",
      label: "Good Job!",
      sub: "You're on the right track.",
      colorClass: "text-[#1a5276]",
      bgClass: "bg-[#F0F7FF]",
      borderClass: "border-[#D6E6F4]",
    } :
    {
      emoji: "📚",
      label: "Keep Learning",
      sub: "Every mistake is a lesson.",
      colorClass: "text-[#2c4a6e]",
      bgClass: "bg-[#F7F9FC]",
      borderClass: "border-[#D6E6F4]",
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D6E6F4] via-[#EAF3FB] to-[#F7F9FC] flex items-center justify-center p-6">

      <div className="relative bg-white border border-[#D6E6F4] rounded-[2rem] p-10 text-center max-w-sm w-full shadow-2xl shadow-blue-900/10 overflow-hidden">

        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B2447] via-[#7AB8D9] to-[#EAF3FB]" />

        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#EAF3FB] opacity-60 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-[#D6E6F4] opacity-40 pointer-events-none" />

        <div className="relative text-6xl mb-4 drop-shadow-sm">{tier.emoji}</div>

        <h1 className="relative text-3xl font-black text-[#0B2447] tracking-tight mb-1">{tier.label}</h1>
        <p className="relative text-sm text-slate-400 font-medium mb-8">{tier.sub}</p>

        <div className={`relative inline-flex flex-col items-center rounded-3xl px-12 py-8 mb-8 border-2 ${tier.bgClass} ${tier.borderClass}`}>

          <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#0B2447] rounded-r-full opacity-30" />

          <p className={`text-6xl font-black leading-none ${tier.colorClass}`}>
            {score}
            <span className="text-2xl opacity-30 font-bold">/{total}</span>
          </p>

          <div className="absolute -bottom-3 bg-[#0B2447] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] shadow-md shadow-blue-900/20">
            {pct}% Score
          </div>
        </div>


        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-[#EAF3FB] border border-[#D6E6F4] rounded-2xl py-4 shadow-sm">
            <p className="text-2xl font-black text-[#0B2447]">{score}</p>
            <p className="text-[9px] font-bold text-[#7AB8D9] uppercase tracking-widest mt-1">Correct</p>
          </div>
          <div className="flex-1 bg-[#F7F9FC] border border-[#D6E6F4] rounded-2xl py-4 shadow-sm">
            <p className="text-2xl font-black text-slate-400">{total - score}</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Missed</p>
          </div>
        </div>

        <div className="h-2 bg-[#EAF3FB] rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-[#0B2447] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

  
        <button
          onClick={onRetry}
          className="w-full bg-[#0B2447] hover:bg-[#163a6b] text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Retake Challenge</span>
          <span className="text-base leading-none">↺</span>
        </button>

        <button onClick={()=>navigate("/HomePage")} className="mt-4 text-xs font-bold text-slate-400 hover:text-[#0B2447] transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 w-full">
          <span>←</span>
          <span>Back to Dashboard</span>
        </button>

      </div>
    </div>
  );
}