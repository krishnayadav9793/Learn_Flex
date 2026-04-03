import OptionBtn from "./Options.jsx";

const OPTION_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY_STYLES = {
  Easy: "bg-sky-50 text-sky-700 border border-sky-200 ring-1 ring-sky-100",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100",
  Hard: "bg-blue-900 text-blue-100 border border-blue-800",
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
    <div className="flex flex-col gap-5 font-sans">


      <div className="flex items-center gap-2 flex-wrap">

        <div className="flex items-center gap-1.5 bg-[#0B2447] text-white rounded-xl px-4 py-1.5 shadow-md shadow-blue-900/20">
          <span className="text-sm font-bold tracking-wide">Q{index + 1}</span>
          <span className="text-blue-300 text-xs font-medium">/ {total}</span>
        </div>

        {question.subject && (
          <span className="bg-[#EAF3FB] text-[#1a5276] border border-[#bde0f5] rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
            {question.subject}
          </span>
        )}

        {question.difficulty && (
          <span className={`rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${diffClass}`}>
            {question.difficulty}
          </span>
        )}
      </div>

      <div className="relative bg-[#F7F9FC] border border-[#D6E6F4] rounded-2xl px-7 py-6 shadow-sm overflow-hidden">

        <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#0B2447] rounded-r-full opacity-80" />


        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#D6E6F4] opacity-40" />

        <p className="text-base font-semibold text-[#0B2447] leading-relaxed pl-3">
          {question.question}
        </p>
      </div>


      {question.image && (
        <div className="rounded-2xl overflow-hidden border border-[#D6E6F4] shadow-sm">
          <img
            src={question.image}
            alt="question"
            className="w-full object-contain"
          />
        </div>
      )}


      <div className="flex flex-col gap-2.5">
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


      <div className="flex items-center justify-between pt-4 mt-1 border-t border-[#D6E6F4]">


        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${selected !== undefined ? "bg-sky-500 shadow-sm shadow-sky-300" : "bg-slate-300"
              }`}
          />
          <span
            className={`text-xs font-medium transition-colors duration-200 ${selected !== undefined ? "text-sky-600" : "text-slate-400"
              }`}
          >
            {selected !== undefined ? "Answer captured" : "Select an option to proceed"}
          </span>
        </div>


        <div className="flex gap-2.5">
          {index !== 0 && (
            <button
              onClick={prevQuestion}
              className="bg-white border border-[#D6E6F4] hover:bg-[#EAF3FB] active:scale-95 text-[#1a5276] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-150 shadow-sm"
            >
              ← Back
            </button>
          )}

          <button
            onClick={nextQuestion}
            className="bg-[#0B2447] hover:bg-[#163a6b] active:scale-95 text-white font-semibold text-sm px-7 py-2.5 rounded-xl shadow-md shadow-blue-900/20 transition-all duration-150 flex items-center gap-2"
          >
            {index === total - 1 ? "Complete Quiz" : "Next Question"}
            <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>

    </div>
  );
}