export default function OptionBtn({ label, text, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-xl border-2 transition-all duration-150
        ${selected
          ? "bg-teal-50 border-teal-500"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
    >     
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 transition-all
        ${selected ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500"}`}>
        {label}
      </span>

      <span className={`text-sm leading-relaxed ${selected ? "font-semibold text-teal-800" : "text-gray-700"}`}>
        {text}
      </span>
    </button>
  );
}