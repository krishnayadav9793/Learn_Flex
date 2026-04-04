import OptionBtn from "./Options.jsx";

const OPTION_LABELS = ["A", "B", "C", "D"];

// Difficulty styles strictly following the Blue/Cream palette
const DIFFICULTY_STYLES = {
  Easy:   "bg-[#E1EFFF] text-[#0B2447] border border-[#0B2447]/10",
  Medium: "bg-[#FAF8F5] text-[#0B2447] border border-[#0B2447]/20",
  Hard:   "bg-[#0B2447] text-[#E1EFFF] border border-[#0B2447]",
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
    // Main card: Added a thick dark blue top border and deeper soft shadow
    <div className="flex flex-col font-sans bg-white rounded-2xl border-x border-b border-[#0B2447]/10 border-t-4 border-t-[#0B2447] shadow-[0_12px_40px_rgb(11,36,71,0.06)] overflow-hidden">

      {/* Question body */}
      <div className="px-7 pt-7 pb-0">

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {/* Q Number Badge - Dark Blue */}
          <div className="flex items-center gap-1.5 bg-[#0B2447] text-white rounded-xl px-4 py-1.5 shadow-md shadow-[#0B2447]/10">
            <span className="text-[13px] font-bold tracking-wide">Q{index + 1}</span>
            <span className="text-[#E1EFFF] text-[11px] font-medium opacity-80">/ {total}</span>
          </div>

          {/* Subject Badge - Light Blue */}
          {question.subject && (
            <span className="bg-[#E1EFFF] text-[#0B2447] border border-[#0B2447]/10 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              {question.subject}
            </span>
          )}

          {/* Difficulty Badge */}
          {question.difficulty && (
            <span className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${diffClass}`}>
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Question text box - Gradient blending Light Blue and Light Cream */}
        <div className="relative bg-gradient-to-br from-[#F4F9FF] to-[#FAF8F5] border border-[#E1EFFF] rounded-2xl px-6 py-6 mb-6 overflow-hidden shadow-sm">
          {/* Left accent bar - Dark Blue */}
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#0B2447] rounded-r-full" />
          
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#E1EFFF] opacity-50 pointer-events-none" />
          <div className="absolute -bottom-8 right-10 w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E1EFFF] opacity-60 pointer-events-none" />

          <p className="text-[16px] font-semibold text-[#0B2447] leading-relaxed pl-3 relative z-10">
            {question.question}
          </p>
        </div>

        {/* Optional image - Reduced size, centered, framed in cream */}
        {question.image && (
          <div className="rounded-xl overflow-hidden border border-[#0B2447]/10 mb-6 max-w-sm mx-auto bg-[#FAF8F5] p-3 shadow-inner">
            <img 
              src={question.image} 
              alt="question visual" 
              className="w-full h-auto max-h-48 object-contain mx-auto rounded-lg mix-blend-multiply" 
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 px-7 pb-4">
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

      {/* Footer - Solid Light Cream to separate actions from the white card body */}
      <div className="flex items-center justify-between px-7 py-5 mt-2 border-t border-[#0B2447]/10 bg-[#FAF8F5]">

        {/* Status indicator */}
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${
            selected !== undefined ? "bg-[#0B2447] shadow-[#0B2447]/30" : "bg-[#0B2447]/20"
          }`} />
          <span className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${
            selected !== undefined ? "text-[#0B2447]" : "text-[#0B2447]/50"
          }`}>
            {selected !== undefined ? "Answer captured" : "Select an option to proceed"}
          </span>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          {index !== 0 && (
            <button
              onClick={prevQuestion}
              className="bg-white border border-[#0B2447]/15 hover:bg-[#F4F9FF] hover:border-[#0B2447]/30 active:scale-95 text-[#0B2447] font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
            >
              ← Back
            </button>
          )}

          <button
            onClick={nextQuestion}
            className="bg-[#0B2447] hover:bg-[#0f2e5a] active:scale-95 text-[#E1EFFF] font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md shadow-[#0B2447]/25 hover:shadow-lg hover:shadow-[#0B2447]/30"
          >
            {index === total - 1 ? "Complete Quiz" : "Next Question"}
            <span className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

    </div>
  );
}