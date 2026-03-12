export default function ResultScreen({ score, total, onRetry }) {
  const pct = Math.round((score / total) * 100);

  const tier =
    pct >= 80 ? { emoji: "🏆", label: "Excellent!",  sub: "Outstanding performance!", colorClass: "text-green-600", bgClass: "bg-green-50",  borderClass: "border-green-200" } :
    pct >= 60 ? { emoji: "👍", label: "Good job!",   sub: "You're making progress.",  colorClass: "text-yellow-600", bgClass: "bg-yellow-50", borderClass: "border-yellow-200" } :
                { emoji: "📖", label: "Keep going!",  sub: "Review and try again.",    colorClass: "text-red-600",   bgClass: "bg-red-50",    borderClass: "border-red-200" };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-sm w-full shadow-lg">

        <div className="text-5xl mb-3">{tier.emoji}</div>
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1">{tier.label}</h1>
        <p className="text-sm text-gray-500 mb-6">{tier.sub}</p>

        {/* Score badge */}
        <div className={`inline-flex flex-col items-center rounded-2xl px-10 py-5 mb-5 border ${tier.bgClass} ${tier.borderClass}`}>
          <p className={`text-5xl font-black leading-none ${tier.colorClass}`}>
            {score}<span className="text-2xl font-semibold text-gray-400">/{total}</span>
          </p>
          <p className={`text-sm font-bold mt-1.5 ${tier.colorClass}`}>{pct}% correct</p>
        </div>

        {/* Correct / Wrong */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-green-50 border border-green-100 rounded-xl py-3">
            <p className="text-2xl font-extrabold text-green-600">{score}</p>
            <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Correct</p>
          </div>
          <div className="flex-1 bg-red-50 border border-red-100 rounded-xl py-3">
            <p className="text-2xl font-extrabold text-red-500">{total - score}</p>
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Wrong</p>
          </div>
        </div>

        <button
          onClick={onRetry}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-teal-100 transition-colors duration-150"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}