export default function Navbar({ exam,timeLeft, totalTime, formatTime, answered, total }) {
 
  const urgentThreshold = totalTime ? totalTime * 0.2 : timeLeft * 0.2;
  const urgent = timeLeft <= urgentThreshold;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 px-6 flex items-center justify-between">

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-lg shadow-md shadow-teal-200">
          ⚡
        </div>
        <span className="font-extrabold text-gray-800 tracking-tight text-base">
          Learn<span className="text-teal-500">Flex</span>
        </span>
        <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
          {exam}
        </span>
      </div>
      
      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border transition-all duration-300 ${
        urgent ? "bg-red-50 border-red-200 animate-pulse" : "bg-gray-50 border-gray-200"
      }`}>
        <span className="text-sm">{urgent ? "🔴" : "⏱"}</span>
        <span className={`font-mono font-medium text-sm tracking-wide ${urgent ? "text-red-500" : "text-gray-700"}`}>
          {formatTime()}
        </span>
      </div>

    </nav>
  );
}