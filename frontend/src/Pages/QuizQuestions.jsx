import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Send } from 'lucide-react';

function QuizQuestions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const initialTime = location.state?.remainingTime || 0;

  const [questionList, setQuestionList] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const timerRef = useRef(null);

  // fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://learn-flex-puce.vercel.app/quiz/question/${id}?quizId=${id}`, {
          method: 'GET',
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch questions');
        const list = await res.json();
        // ✅ Check BEFORE setting state
        if (list?.msg === 'already participated') {
          navigate('/weeklyquiz', { state: { exam_id: localStorage.getItem('examId') } });
          return; 
        }

setQuestionList(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  // timer starts immediately after load
  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) { submitQuiz(); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timerRef.current);
          submitQuiz();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading]);

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 60000;
  const isCritical = timeLeft < 30000;

  const handleAnswer = (quesId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [quesId]: { answer_marked: option, test_id: id },
    }));
  };

  const submitQuiz = async () => {
    clearInterval(timerRef.current);
    console.log("clicked");
    try {
      await fetch('https://learn-flex-puce.vercel.app/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: answers }),
        credentials: 'include',
      });
      navigate('/weeklyquiz', { state: { exam_id: localStorage.getItem('examId') } });
    } catch (e) {
      console.log('error:', e);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questionList.length;
  const currentQ = questionList[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#001F3F]/20 border-t-[#001F3F] animate-spin" />
        <p className="text-[#001F3F]/40 text-sm font-medium tracking-wide">Loading questions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans flex flex-col selection:bg-blue-100">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-30 bg-[#FFFDF5]/90 backdrop-blur-sm border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center gap-6">

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="flex items-center gap-2 text-xs font-bold text-[#001F3F]/50 hover:text-[#001F3F] transition-colors tracking-wide uppercase"
          >
            <span className="grid grid-cols-2 gap-[3px]">
              {[0,1,2,3].map(i => (
                <span key={i} className="w-[5px] h-[5px] rounded-[1px] bg-current" />
              ))}
            </span>
            {sidebarOpen ? 'Hide' : 'Map'}
          </button>

          {/* Progress bar */}
          <div className="flex-1 max-w-sm">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
              <span>{answeredCount} answered</span>
              <span>{totalCount - answeredCount} remaining</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#001F3F] rounded-full transition-all duration-500"
                style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-bold text-sm transition-all duration-300
            ${isCritical
              ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
              : isLowTime
              ? 'bg-amber-50 border-amber-300 text-amber-600'
              : 'bg-white border-slate-200 text-[#001F3F]'
            }`}>
            <Clock size={14} />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-6 md:px-10 py-8 gap-8">

        {/* ── SIDEBAR ── */}
        <aside className={`transition-all duration-300 overflow-hidden flex-shrink-0
          ${sidebarOpen ? 'w-52 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
          <div className="w-52 space-y-5">

            <p className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-400">
              Question Map
            </p>

            {/* Legend */}
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-[#001F3F]" /> Done
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-slate-200" /> Skip
              </span>
            </div>

            {/* Number grid */}
            <div className="grid grid-cols-5 gap-2">
              {questionList.map((q, idx) => {
                const answered = !!answers[q.Ques_id];
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={q.Ques_id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-150
                      ${isActive
                        ? 'bg-[#001F3F] text-white scale-110 shadow-md shadow-[#001F3F]/25'
                        : answered
                        ? 'bg-[#001F3F]/12 text-[#001F3F] hover:bg-[#001F3F]/20'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Stats card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Attempted</span>
                <span className="text-[#001F3F] font-black">{answeredCount}/{totalCount}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#001F3F] to-blue-400 transition-all duration-500"
                  style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Skipped</span>
                <span className="text-slate-400 font-black">{totalCount - answeredCount}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── QUESTION MAIN ── */}
        <main className="flex-1 flex flex-col min-w-0 gap-6">

          {/* Question Card */}
          {currentQ && (
            <div
              key={currentQ.Ques_id}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex-1 flex flex-col"
              style={{ animation: 'fadeUp 0.22s ease' }}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 mb-7">
                <span className="bg-[#001F3F] text-white text-[11px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                  Q {currentIndex + 1}
                </span>
                <span className="text-slate-300 text-xs font-bold">of {totalCount}</span>
                {answers[currentQ.Ques_id] && (
                  <span className="ml-auto flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                    <CheckCircle2 size={13} /> Answered
                  </span>
                )}
              </div>

              {/* Statement */}
              <p className="text-[#1E293B] text-xl font-semibold leading-relaxed mb-8">
                {currentQ.Question_Statement}
              </p>

              {/* Image */}
              {currentQ.Image && (
                <img
                  src={currentQ.Image}
                  alt="question"
                  className="rounded-2xl border border-slate-100 mb-8 max-w-md"
                />
              )}

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                {[1, 2, 3, 4].map((opt, i) => {
                  const isSelected = answers[currentQ.Ques_id]?.answer_marked === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(currentQ.Ques_id, opt)}
                      className={`group flex items-center gap-4 p-5 rounded-2xl border-2 text-left font-sans transition-all duration-200
                        ${isSelected
                          ? 'bg-[#001F3F] border-[#001F3F] text-white shadow-lg shadow-[#001F3F]/15 scale-[1.01]'
                          : 'bg-white border-slate-200 text-[#1E293B] hover:border-[#001F3F]/40 hover:bg-slate-50/80'
                        }`}
                    >
                      <span className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-black transition-colors
                        ${isSelected
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-100 text-[#001F3F] group-hover:bg-[#001F3F]/8'
                        }`}>
                        {optionLabels[i]}
                      </span>
                      <span className="flex-1 text-sm font-medium leading-snug">
                        {currentQ[`Option_${opt}`]}
                      </span>
                      {isSelected && <CheckCircle2 size={17} className="text-white/60 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NAV ROW ── */}
          <div className="flex items-center justify-between">
            {/* Prev */}
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all
                ${currentIndex === 0
                  ? 'border-slate-100 text-slate-300 bg-white cursor-not-allowed'
                  : 'border-slate-200 bg-white text-[#001F3F] hover:bg-[#001F3F] hover:text-white hover:border-[#001F3F] active:scale-95'
                }`}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Dot strip */}
            <div className="flex items-center gap-1.5">
              {questionList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all duration-200
                    ${idx === currentIndex
                      ? 'w-5 h-2 bg-[#001F3F]'
                      : answers[questionList[idx]?.Ques_id]
                      ? 'w-2 h-2 bg-[#001F3F]/25'
                      : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                />
              ))}
            </div>

            {/* Next / Submit */}
            {currentIndex < totalCount - 1 ? (
              <button
                onClick={() => setCurrentIndex((p) => Math.min(totalCount - 1, p + 1))}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-slate-200 bg-white text-[#001F3F] font-bold text-sm hover:bg-[#001F3F] hover:text-white hover:border-[#001F3F] transition-all active:scale-95"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setSubmitConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#001F3F] text-white font-bold text-sm hover:bg-[#002b59] transition-all active:scale-95 shadow-lg shadow-[#001F3F]/20"
              >
                Submit <Send size={14} />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* ── SUBMIT MODAL ── */}
      {submitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100"
            style={{ animation: 'fadeUp 0.2s ease' }}
          >
            <div className="w-14 h-14 bg-[#001F3F] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Send size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-[#001F3F] text-center mb-2">Submit Quiz?</h2>
            <p className="text-slate-400 text-sm text-center leading-relaxed mb-8">
              You've answered{' '}
              <span className="font-black text-[#001F3F]">{answeredCount}</span> of{' '}
              <span className="font-black text-[#001F3F]">{totalCount}</span> questions.
              {answeredCount < totalCount && (
                <span className="block mt-1.5 text-amber-500 font-semibold text-xs">
                  {totalCount - answeredCount} question{totalCount - answeredCount > 1 ? 's' : ''} unanswered
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSubmitConfirm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-[#001F3F] font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Review
              </button>
              <button
                onClick={submitQuiz}
                className="flex-1 py-3 rounded-2xl bg-[#001F3F] text-white font-bold text-sm hover:bg-[#002b59] transition-all shadow-lg shadow-[#001F3F]/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default QuizQuestions;