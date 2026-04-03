export default function Sidebar({ questions, answers, current, setCurrent, onSubmit }) {
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const remaining = total - answered;
  const progressPct = total ? Math.round((answered / total) * 100) : 0;

  return (
    <aside className="relative w-64 flex flex-col gap-3.5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total",  value: total,     cls: "bg-[#0B2447] border-[#0B2447]",  val: "text-white",     sub: "text-[#93C5FD]"  },
          { label: "Done",   value: answered,  cls: "bg-[#EAF3FB] border-[#BFDBFE]",  val: "text-[#0B2447]", sub: "text-[#7AB8D9]" },
          { label: "Left",   value: remaining, cls: "bg-white border-[#E2EDF6]",       val: "text-[#2c4a6e]", sub: "text-slate-400" },
        ].map(({ label, value, cls, val, sub }) => (
          <div key={label} className={`${cls} border rounded-2xl py-4 px-1 text-center`}>
            <p className={`text-2xl font-black ${val} leading-none`}>{value}</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${sub}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Progress ── */}
      <div className="bg-white border border-[#E2EDF6] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest">Progress</span>
          <span className="text-sm text-[#0B2447] font-black">{progressPct}%</span>
        </div>
        <div className="h-2 bg-[#EAF3FB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0B2447] rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-2">
          {answered} of {total} answered
        </p>
      </div>

      {/* ── Navigator ── */}
      <div className="bg-white border border-[#E2EDF6] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest">Navigator</p>
          <span className="text-[10px] text-slate-400 font-medium">{remaining} left</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, i) => {
            const isDone   = answers[q.id] !== undefined;
            const isActive = i === current;
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`
                  aspect-square rounded-xl text-[11px] font-bold transition-all duration-200 border-2
                  ${isActive
                    ? "bg-[#0B2447] text-white border-[#0B2447] scale-110 z-10"
                    : isDone
                    ? "bg-[#EAF3FB] text-[#1a5276] border-[#7AB8D9] hover:border-[#0B2447] hover:bg-[#D6E6F4]"
                    : "bg-white text-slate-400 border-[#E2EDF6] hover:border-[#7AB8D9] hover:text-[#1a5276]"
                  }
                `}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="bg-white border border-[#E2EDF6] rounded-2xl p-4">
        <p className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest mb-3">
          Status Guide
        </p>
        <div className="flex flex-col gap-2.5">
          {[
            { dot: "bg-[#0B2447]",                               label: "Current",   desc: "Viewing now"  },
            { dot: "bg-[#EAF3FB] border border-[#7AB8D9]",       label: "Attempted", desc: "Answer saved" },
            { dot: "bg-white border border-[#E2EDF6]",           label: "Unseen",    desc: "Not visited"  },
          ].map(({ dot, label, desc }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className={`w-3.5 h-3.5 rounded-[5px] shrink-0 ${dot}`} />
              <div className="flex flex-col -space-y-0.5">
                <span className="text-[11px] font-bold text-[#1a5276]">{label}</span>
                <span className="text-[9px] text-slate-400 font-medium">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={onSubmit}
          className="w-full bg-[#0B2447] hover:bg-[#163a6b] active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all duration-200 shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          <span>Submit Challenge</span>
          <span className="text-base leading-none">→</span>
        </button>
        <p className="text-center text-[10px] font-medium text-slate-400">
          {remaining > 0
            ? `${remaining} question${remaining !== 1 ? "s" : ""} remaining`
            : "✓ All questions answered"}
        </p>
      </div>

    </aside>
  );
}