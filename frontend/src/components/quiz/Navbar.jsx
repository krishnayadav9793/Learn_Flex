import React from "react";

const Navbar = ({ tab, setTab, streak = 5 }) => {
  return (
    <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">

      <span className="font-semibold text-base">LearnFlex</span>

      <div className="flex gap-6 items-center text-gray-600">

        <button
          onClick={() => setTab("question")}
          className={`hover:text-black ${
            tab === "question" ? "text-black font-medium" : ""
          }`}
        >
          Today's Quiz
        </button>

        <button
          onClick={() => setTab("leaderboard")}
          className={`hover:text-black ${
            tab === "leaderboard" ? "text-black font-medium" : ""
          }`}
        >
          Leaderboard
        </button>

        <span className="text-orange-500">🔥 {streak} Streak</span>

        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-medium text-xs">
          U
        </div>

      </div>
    </div>
  );
};

export default Navbar;