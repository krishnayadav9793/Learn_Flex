import OptionBtn from "./Options.jsx";

const OPTION_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY_STYLES = {
  Easy:   "bg-green-50 text-green-700",
  Medium: "bg-yellow-50 text-yellow-700",
  Hard:   "bg-red-50 text-red-600",
};

export default function QuizQuestion({ question, index, total, selectOption, selected, nextQuestion, prevQuestion }) {
  const options = [question.option1, question.option2, question.option3, question.option4];
  const diffClass = DIFFICULTY_STYLES[question.difficulty] ?? "bg-gray-100 text-gray-500";

  return (
    <div className="flex flex-col gap-4">

      
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-gray-100 text-[#053836] border border-gray-200 rounded-lg px-3 py-0.5 text-xl font-bold">
          <span className="text-[#053836] font-bold" >Q{index + 1}</span>
          <span className=" text-[#053836] font-bold"> / Q{total}</span>
        </span>
        {question.subject && (
          <span className="bg-teal-50 text-[#163e3d] rounded-lg px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            {question.subject}
          </span>
        )}
        {question.difficulty && (
          <span className={`rounded-lg px-3 py-0.5 text-[11px] font-bold ${diffClass}`}>
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question card */}
      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm">
        <p className="text-base font-medium text-gray-800 leading-relaxed">
          {question.question}
        </p>
      </div>
<div>{question.image}</div>
      {/* Options */}
      <div className="flex flex-col gap-2">
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
      <div className="flex items-center justify-between pt-1">
        <span className={`text-xs ${selected !== undefined ? "text-teal-500" : "text-gray-400"}`}>
          {selected !== undefined ? "✅ Answer selected" : "Select an option to continue"}
        </span>
    
        {index !== 0 ? (
        <button
            onClick={prevQuestion}
            className="bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-teal-100 transition-all duration-150 flex items-center gap-1.5"
        >
            Back ←
        </button>
        ) : null}
        
        <button
          onClick={nextQuestion}
          className="bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-teal-100 transition-all duration-150 flex items-center gap-1.5"
        >
          {index === total - 1 ? "Finish" : "Next  →"}
        </button>
    
      </div>

    </div>
  );
}