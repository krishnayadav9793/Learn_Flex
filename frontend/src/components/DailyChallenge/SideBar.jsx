export default function Sidebar({ questions, answers, current, setCurrent, onSubmit }) {

  const answered = Object.keys(answers).length;
  const total = questions.length;
  const remaining = total - answered;
  const progressPct = total ? Math.round((answered / total) * 100) : 0;

  return (
    <aside className="w-60 bg-white border-l border-gray-200 flex flex-col gap-6 p-5 min-h-screen ">

      <div className="flex gap-2">
        {[
          { label: "Total",     value: total,     color: "text-gray-800"  },
          { label: "Answered",  value: answered,  color: "text-teal-600"  },
          { label: "Remaining", value: remaining, color: "text-gray-500"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-1 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-gray-500 font-medium">Progress</span>
          <span className="text-xs text-teal-600 font-semibold">{progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Jump to Question
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            const isDone   = answers[q.id] !== undefined;
            const isActive = i === current;
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                title={`Question ${i + 1}${isDone ? " — Answered" : ""}`}
                className={`
                  aspect-square rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer
                  ${isActive
                    ? "bg-teal-500 text-white border-2 border-teal-500"
                    : isDone
                    ? "bg-green-50 text-green-700 border-2 border-green-200"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                {isDone && !isActive ? "✓" : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Color Guide
        </p>
        <div className="flex flex-col gap-2">
          {[
            { className: "bg-teal-500 border-teal-500",  label: "Current"     },
            { className: "bg-green-50 border-green-200", label: "Already answered" },
            { className: "bg-gray-100 border-gray-200",  label: "Not answered yet" },
          ].map(({ className, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border-2  ${className}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onSubmit}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
        >
          Submit Quiz
        </button>
      </div>

    </aside>
  );
}