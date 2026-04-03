import OptionBtn from "./Options.jsx";

const OPTION_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY_STYLES = {
  Easy:   "bg-[#EFF6FF] text-[#1d4ed8] border border-[#BFDBFE]",
  Medium: "bg-[#FFFBEB] text-[#b45309] border border-[#FDE68A]",
  Hard:   "bg-[#0B2447] text-[#BFDBFE]",
};

export default function QuizQuestion({
  question,
  index,
  total,
  selectOption,
  selected,
  nextQuestion,
  prevQuestion,
}) {
  const options = [question.option1, question.option2, question.option3, question.option4];
  const diffClass = DIFFICULTY_STYLES[question.difficulty] ?? "bg-gray-100 text-gray-500";

  return (
    <div className="flex flex-col font-sans bg-white rounded-2xl border border-[#E2EDF6] overflow-hidden">

      {/* Question body */}
      <div className="px-7 pt-6 pb-0">

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <div className="flex items-center gap-1.5 bg-[#0B2447] text-white rounded-xl px-4 py-1.5 shadow-sm shadow-blue-900/20">
            <span className="text-[13px] font-bold tracking-wide">Q{index + 1}</span>
            <span className="text-[#93C5FD] text-[11px] font-medium">/ {total}</span>
          </div>

          {question.subject && (
            <span className="bg-[#EAF3FB] text-[#1a5276] border border-[#BFDBFE] rounded-[8px] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              {question.subject}
            </span>
          )}

          {question.difficulty && (
            <span className={`rounded-[8px] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${diffClass}`}>
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Question text box */}
        <div className="relative bg-[#F7F9FC] border border-[#E2EDF6] rounded-2xl px-6 py-5 mb-5 overflow-hidden">
          {/* Left accent bar */}
          <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-[#0B2447] rounded-r-full" />
          {/* Decorative circle */}
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-[#D6E6F4] opacity-40 pointer-events-none" />

          <p className="text-[15px] font-semibold text-[#0B2447] leading-relaxed pl-2 relative z-10">
            {question.question}
          </p>
        </div>

        {/* Optional image */}
        {question.image && (
          <div className="rounded-2xl overflow-hidden border border-[#E2EDF6] mb-5">
            <img src={question.image} alt="question visual" className="w-full object-contain" />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5 px-7 pb-2">
        {options.map((opt, i) => (
          <OptionBtn
            key={i}
            label={OPTION_LABELS[i]}
            text={opt}
            selected={selected === i}
            onClick={() => selectOption(question.id, i)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-7 py-5 mt-2 border-t border-[#EAF3FB]">

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            selected !== undefined ? "bg-blue-500" : "bg-slate-300"
          }`} />
          <span className={`text-xs font-medium transition-colors duration-200 ${
            selected !== undefined ? "text-blue-500" : "text-slate-400"
          }`}>
            {selected !== undefined ? "Answer captured" : "Select an option to proceed"}
          </span>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-2.5">
          {index !== 0 && (
            <button
              onClick={prevQuestion}
              className="bg-white border border-[#D6E6F4] hover:bg-[#EAF3FB] active:scale-95 text-[#1a5276] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-150"
            >
              ← Back
            </button>
          )}

          <button
            onClick={nextQuestion}
            className="bg-[#0B2447] hover:bg-[#163a6b] active:scale-95 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-md shadow-blue-900/20"
          >
            {index === total - 1 ? "Complete Quiz" : "Next Question"}
            <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>

    </div>
  );
}