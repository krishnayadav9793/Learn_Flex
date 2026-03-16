import React from "react";

const exams = ['JEE Mains', 'JEE Advanced', 'NEET-UG', 'UPSC', 'GATE', 'HSC Science'];

const challenges = [
  { icon: '🎯', title: 'Daily Challenge', sub: '6 questions · Earn XP',  bg: 'from-emerald-800 to-emerald-600', shadow: 'shadow-emerald-900/40' },
  { icon: '📅', title: 'Weekly Test',     sub: 'Compete with others',    bg: 'from-violet-900 to-violet-600', shadow: 'shadow-violet-900/40' },
  { icon: '📖', title: 'Practice',        sub: 'Topic-wise learning',    bg: 'from-amber-800 to-amber-500',   shadow: 'shadow-amber-900/40' },
];

const Middle = () => {
  return (
    <div className="bg-blue-50 min-h-screen">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 px-10 py-14 text-center">
        <span className="inline-block bg-white/15 border border-white/25 rounded-full px-4 py-1 text-xs text-blue-200 font-medium mb-4">
          ✦ India's smartest exam prep platform
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 leading-tight">
          Master your exam.<br />One concept at a time.
        </h1>
        <p className="text-blue-200 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Curated content, daily challenges, and 1v1 battles to keep you sharp and motivated.
        </p>
        <div className="flex justify-center gap-12 flex-wrap">
          {[['48K+', 'Active learners'], ['2,400', 'Questions'], ['98%', 'Satisfaction']].map(([num, lbl]) => (
            <div key={lbl}>
              <div className="text-2xl font-bold text-white">{num}</div>
              <div className="text-xs text-blue-300 mt-0.5">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Exam Selector */}
        <h2 className="text-lg font-bold text-blue-900 mb-4">Your Exam</h2>
        <div className="flex flex-wrap gap-3 mb-10">
          {exams.map((exam, i) => (
            <div key={exam}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm border-2 cursor-pointer transition-all shadow-sm
                ${i === 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                  : 'bg-white text-blue-800 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-0.5 hover:shadow-blue-200'}`}>
              {exam}
            </div>
          ))}
        </div>

        {/* Challenges */}
        <h2 className="text-lg font-bold text-blue-900 mb-4">Challenges &amp; Practice</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {challenges.map(({ icon, title, sub, bg, shadow }) => (
            <div key={title}
              className={`bg-gradient-to-br ${bg} rounded-2xl p-5 text-center cursor-pointer shadow-lg ${shadow} hover:-translate-y-1 transition-transform`}>
              <div className="text-4xl mb-2">{icon}</div>
              <div className="text-white font-bold text-base mb-1">{title}</div>
              <div className="text-white/60 text-xs">{sub}</div>
            </div>
          ))}
        </div>

        {/* 1v1 Battle */}
        <div className="flex items-center justify-between bg-gradient-to-r from-red-900/90 to-red-800/80 border border-red-700 rounded-2xl p-6 shadow-xl flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚔️</div>
            <div>
              <h3 className="text-white text-lg font-bold">1v1 Battle</h3>
              <p className="text-red-300 text-sm">Challenge a friend or get matched instantly</p>
              <span className="inline-block mt-2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                2 Pending
              </span>
            </div>
          </div>
          <div className="text-red-400 text-3xl font-bold opacity-80">VS</div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl">🧍</div>
            <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition">
              FIGHT NOW
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Middle