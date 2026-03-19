export default function ResultScreen({ score, total, onRetry }) {
  const pct = Math.round((score / total) * 100);

  const tier =
    pct >= 80 ? { 
      emoji: "🏆", 
      label: "Excellent!",   
      sub: "You've mastered this challenge.", 
      colorClass: "text-[#0B2447]", 
      bgClass: "bg-blue-50/50",  
      borderClass: "border-blue-100" 
    } :
    pct >= 60 ? { 
      emoji: "🌟", 
      label: "Good job!",    
      sub: "You're on the right track.",    
      colorClass: "text-blue-700", 
      bgClass: "bg-slate-50", 
      borderClass: "border-slate-200" 
    } :
    { 
      emoji: "📚", 
      label: "Keep Learning", 
      sub: "Every mistake is a lesson.",      
      colorClass: "text-slate-600",   
      bgClass: "bg-slate-50",     
      borderClass: "border-slate-200" 
    };

  return (
   
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center max-w-sm w-full shadow-xl shadow-blue-900/5">

        <div className="text-6xl mb-4 drop-shadow-sm">{tier.emoji}</div>
        <h1 className="text-3xl font-black text-[#0B2447] tracking-tight mb-1">{tier.label}</h1>
        <p className="text-sm text-slate-400 font-medium mb-8">{tier.sub}</p>

     
        <div className={`relative inline-flex flex-col items-center rounded-3xl px-12 py-8 mb-8 border-2 ${tier.bgClass} ${tier.borderClass}`}>
          <p className={`text-6xl font-black leading-none ${tier.colorClass}`}>
            {score}<span className="text-2xl opacity-30 font-bold">/{total}</span>
          </p>
          <div className="absolute -bottom-3 bg-[#0B2447] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em]">
            {pct}% Score
          </div>
        </div>

    
        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-white border border-slate-100 rounded-2xl py-4 shadow-sm">
            <p className="text-2xl font-black text-blue-600">{score}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Correct</p>
          </div>
          <div className="flex-1 bg-white border border-slate-100 rounded-2xl py-4 shadow-sm">
            <p className="text-2xl font-black text-slate-300">{total - score}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Missed</p>
          </div>
        </div>

    
        <button
          onClick={onRetry}
          className="w-full bg-[#0B2447] hover:bg-[#142e52] text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all duration-200 active:scale-95"
        >
          Retake Challenge
        </button>
        
        <button className="mt-4 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
           Back to Dashboard
        </button>
      </div>
    </div>
  );
}