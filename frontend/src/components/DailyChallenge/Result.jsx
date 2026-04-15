import { useEffect, useState } from "react";
// import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResultScreen({ score, total, onRetry }) {
  const navigate = useNavigate();

  // Safely handle decimals and edge cases
  const safeScore = Number(score) || 0;
  const safeTotal = Number(total) || 1; // avoid division by zero
  const rawPct = (safeScore / safeTotal) * 100;
  const pct = Number.isFinite(rawPct) ? Math.round(rawPct * 10) / 10 : 0; // 1 decimal place
  const pctDisplay = Number.isInteger(pct) ? pct : pct.toFixed(1);

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);
  // const navigate = useNavigate();
  // const pct = Math.round((score / total) * 100);
  // const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const tier =
    pct >= 80
      ? {
          emoji: "🏆",
          label: "Excellent!",
          sub: "You've mastered this challenge.",
          accent: "#0B2447",
          accentLight: "#D6E6F4",
          accentBorder: "#7AB8D9",
        }
      : pct >= 60
      ? {
          emoji: "🌟",
          label: "Good Job!",
          sub: "You're on the right track.",
          accent: "#1a5276",
          accentLight: "#EAF3FB",
          accentBorder: "#A8CDE8",
        }
      : {
          emoji: "📚",
          label: "Keep Learning",
          sub: "Every mistake is a lesson.",
          accent: "#2c4a6e",
          accentLight: "#F0F5FA",
          accentBorder: "#C4D9EC",
        };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D6E6F4] via-[#EAF3FB] to-[#F7F9FC] flex items-center justify-center p-6">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7); }
          70%  { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes barFill {
          from { width: 0%; }
        }
        .anim-fade-up   { animation: fadeUp 0.5s ease both; }
        .anim-pop-in    { animation: popIn 0.5s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div
        className="relative bg-white rounded-[2rem] p-10 text-center max-w-sm w-full overflow-hidden"
        style={{
          boxShadow: "0 32px 80px -12px rgba(11,36,71,0.18), 0 0 0 1px #D6E6F4",
          animation: "fadeUp 0.45s ease both",
        }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2447] via-[#7AB8D9] to-[#D6E6F4] rounded-t-[2rem]" />

        {/* Soft decorative blobs */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#EAF3FB] opacity-50 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#D6E6F4] opacity-40 pointer-events-none" />

        {/* Emoji */}
        <div
          className="relative text-6xl mb-3"
          style={{ animation: "popIn 0.55s 0.2s cubic-bezier(.34,1.56,.64,1) both" }}
        >
          {tier.emoji}
        </div>

        {/* Title */}
        <h1
          className="relative text-3xl font-black text-[#0B2447] tracking-tight mb-1 anim-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          {tier.label}
        </h1>
        <p
          className="relative text-sm text-slate-400 font-medium mb-8 anim-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          {tier.sub}
        </p>

        {/* Score card */}
        <div
          className="relative rounded-2xl px-8 py-7 mb-6 anim-fade-up"
          style={{
            background: tier.accentLight,
            border: `2px solid ${tier.accentBorder}`,
            animationDelay: "0.35s",
          }}
        >
          <p className="text-5xl font-black leading-none text-[#0B2447]">
            {score}
            <span className="text-xl text-slate-300 font-bold"> / {total}</span>
          </p>
          <p className="mt-1 text-xs font-bold text-[#7AB8D9] uppercase tracking-[0.18em]">
            {pct}% Score
          </p>
        </div>

        {/* Stat chips */}
        <div
          className="flex gap-3 mb-6 anim-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex-1 bg-[#EAF3FB] border border-[#D6E6F4] rounded-2xl py-4">
            <p className="text-2xl font-black text-[#0B2447]">{score}</p>
            <p className="text-[9px] font-bold text-[#7AB8D9] uppercase tracking-widest mt-0.5">
              Correct
            </p>
          </div>
          <div className="flex-1 bg-[#F7F9FC] border border-[#D6E6F4] rounded-2xl py-4">
            <p className="text-2xl font-black text-slate-300">{total - score}</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
              Missed
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-2 bg-[#EAF3FB] rounded-full overflow-hidden mb-8 anim-fade-up"
          style={{ animationDelay: "0.45s" }}
        >
          <div
            className="h-full bg-[#0B2447] rounded-full"
            style={{
              width: animated ? `${pct}%` : "0%",
              transition: "width 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.5s",
            }}
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
