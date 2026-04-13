import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BookOpen, Brain, CheckCircle2, Clock3, PlayCircle, Send,
  Target, TimerReset, BarChart3, ChevronLeft, ChevronRight, RotateCcw,
  Award, TrendingUp, AlertCircle, Zap, Menu, X, Trophy, History, MousePointer2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../config";



const formatTime = (seconds) => {
  const safe = Math.max(0, seconds);
  const mm = Math.floor(safe / 60).toString().padStart(2, "0");
  const ss = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const formatScore = (val) => {
  const num = Number(val || 0);
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(2).replace(/\.?0+$/, "");
};

const formatPercent = (value) => `${formatScore(value)}%`;

const subjectLabel = (key = "") => {
  const map = { mathematics: "Mathematics", chemistry: "Chemistry", physics: "Physics" };
  return map[key] || key;
};

const StatPill = ({ label, value, variant = "default" }) => {
  const styles = {
    default: "bg-slate-50 border-slate-200 text-slate-700",
    green:   "bg-emerald-50 border-emerald-200 text-emerald-700",
    red:     "bg-red-50 border-red-200 text-red-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    navy:    "bg-[#0b2a4a]/5 border-[#0b2a4a]/20 text-[#0b2a4a]",
  };
  return (
    <div className={`rounded-xl border px-3 py-2.5 text-center ${styles[variant]}`}>
      <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5 font-semibold">{label}</div>
      <div className="text-base font-bold font-mono leading-none">{value}</div>
    </div>
  );
};

const QuestionDot = ({ index, answered, correct, wrong, current, onClick }) => {
  let cls = "w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 cursor-pointer flex-shrink-0 ";
  if (current)       cls += "border-[#0b2a4a] bg-[#0b2a4a] scale-125 shadow-md";
  else if (correct)  cls += "border-emerald-500 bg-emerald-500";
  else if (wrong)    cls += "border-red-500 bg-red-500";
  else if (answered) cls += "border-[#2e6bb3] bg-[#2e6bb3]";
  else               cls += "border-slate-300 bg-white hover:border-slate-400";
  return <button className={cls} onClick={() => onClick(index)} title={`Q${index + 1}`} />;
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
  </svg>
);

export default function PracticeMode() {
  const navigate = useNavigate();
  const { exam_name: examName } = useParams();

  const [subjects, setSubjects]               = useState([]);
  const [subject, setSubject]                 = useState("");
  const [selectedTopics, setSelectedTopics]   = useState([]);
  const [questionCount, setQuestionCount]     = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [starting, setStarting]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  const [session, setSession] = useState(null);
  const [result, setResult]   = useState(null);
  const [history, setHistory] = useState([]);

  const [questionIndex, setQuestionIndex]         = useState(0);
  const [remainingSeconds, setRemainingSeconds]   = useState(0);
  const [answers, setAnswers]                     = useState({});
  const [marking, setMarking]                     = useState({ correctMarks: 4, negativeMarks: -1 });
  const [showHistory, setShowHistory] = useState(false);
  
  const getExamContent = () => {
    const name = examName?.toUpperCase() || "";
    if (name.includes("UPSC")) {
      return {
        title: "UPSC Civil Services",
        subtitle: "India's Premiere Administrative Service",
        description: "Master General Studies, Current Affairs, and CSAT. Preparation for Prelims requires precision, conceptual clarity, and rapid decision making.",
        highlights: [
          { label: "Focus", value: "Analytical & Decisive" },
          { label: "Marking", value: "+1 / -0.33" },
          { label: "Target", value: " Prelims Master" }
        ],
        icon: <Award className="w-8 h-8 text-amber-500" />
      };
    }
    if (name.includes("NEET")) {
      return {
        title: "NEET Medical",
        subtitle: "Gateway to Medical Excellence",
        description: "Focus on Biology, Physics, and Chemistry. Practice for high accuracy and speed to secure your spot in India's top medical colleges.",
        highlights: [
          { label: "Focus", value: "Biology & Accuracy" },
          { label: "Marking", value: "+4 / -1" },
          { label: "Target", value: "MBBS Aspirant" }
        ],
        icon: <Target className="w-8 h-8 text-red-500" />
      };
    }
    if (name.includes("JEE")) {
      return {
        title: "JEE Engineering",
        subtitle: "Path to IITs & NITs",
        description: "Master Physics, Chemistry, and Mathematics. Solve complex engineering problems with logic and speed.",
        highlights: [
          { label: "Focus", value: "Logic & Application" },
          { label: "Marking", value: "+4 / -1" },
          { label: "Target", value: "IIT Foundation" }
        ],
        icon: <Zap className="w-8 h-8 text-blue-500" />
      };
    }
    return {
      title: `${examName} Practice`,
      subtitle: "Exam-Specifc Preparation",
      description: "Enhance your learning through targeted practice. Select subjects and topics on the left to begin your journey.",
      highlights: [
        { label: "Mode", value: "Practice" },
        { label: "Goal", value: "Mastery" },
        { label: "Focus", value: "Accuracy" }
      ],
      icon: <Brain className="w-8 h-8 text-indigo-500" />
    };
  };


  // Mobile: left panel (config) drawer
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const selectedSubjectMeta   = useMemo(() => subjects.find((item) => item.key === subject), [subjects, subject]);
  const topicList             = useMemo(() => selectedSubjectMeta?.topics || [], [selectedSubjectMeta]);
  const topicNames            = useMemo(() => topicList.map((t) => t.name), [topicList]);
  const allTopicsSelected     = topicNames.length > 0 && selectedTopics.length === topicNames.length;

  const availableBySelectedTopics = useMemo(() => {
    if (!selectedSubjectMeta) return 0;
    if (!selectedTopics.length || allTopicsSelected) return selectedSubjectMeta.availableQuestions || 0;
    const selected = new Set(selectedTopics);
    return topicList.filter((t) => selected.has(t.name)).reduce((s, t) => s + (t.count || 0), 0);
  }, [selectedSubjectMeta, selectedTopics, allTopicsSelected, topicList]);

  const questionResultMap = useMemo(() => {
    const map = {};
    for (const item of result?.questionResults || []) map[item.questionId] = item;
    return map;
  }, [result]);

  const currentQuestion       = session?.questions?.[questionIndex] || null;
  const currentQuestionResult = currentQuestion ? questionResultMap[currentQuestion.id] : null;
  const isTimeOver            = !!session && remainingSeconds <= 0;
  const isSessionLocked       = !!result || isTimeOver;

  const totalSeconds  = timeLimitMinutes * 60;
  const timeRatio     = session ? remainingSeconds / totalSeconds : 1;
  const timeUrgent    = timeRatio < 0.2;
  const timeCritical  = timeRatio < 0.1;

  const fetchHistory = useCallback(async () => {
    try {
      let query = examName ? `?examName=${encodeURIComponent(examName)}` : "";
      if (subject) {
        query += (query ? "&" : "?") + `subject=${encodeURIComponent(subject)}`;
      }
      const res = await fetch(`${API_BASE}/practice/history${query}`, { credentials: "include" });
      if (res.status === 401) return;
      const data = await res.json();
      setHistory(data.history || []);
    } catch {}
  }, [examName, subject]);

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true); setError("");
      try {
        const query = examName ? `?examName=${encodeURIComponent(examName)}` : "";
        const res = await fetch(`${API_BASE}/practice/meta${query}`, { credentials: "include" ,headers: { "Content-Type": "application/json" },});
        if (res.status === 401) { navigate("/login"); return; }
        const data = await res.json();
        const subjectList = data.subjects || [];
        setSubjects(subjectList);
        
        // Dynamic marking from backend
        if (data.marking) {
          setMarking(data.marking);
        }
        
        // Critical client-side fallback for UPSC
        if (examName && examName.toUpperCase().includes("UPSC")) {
          setMarking(prev => {
            if (prev.correctMarks === 4 && prev.negativeMarks === -1) {
              return { correctMarks: 1, negativeMarks: -0.33 };
            }
            return prev;
          });
        }

        if (subjectList.length) setSubject(subjectList[0].key);
      } catch { setError("Unable to load practice metadata."); }
      finally { setLoadingMeta(false); }
    };
    fetchMeta();
  }, [navigate, examName]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!subject) return;
    const meta = subjects.find((item) => item.key === subject);
    setSelectedTopics((meta?.topics || []).map((t) => t.name));
  }, [subject, subjects]);

  useEffect(() => {
    if (!session) return;
    const tick = () =>
      setRemainingSeconds(Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const startPractice = async () => {
    setError("");
    if (!subject) { setError("Please select a subject."); return; }
    setStarting(true);
    try {
      const safeCount = Math.max(1, Math.min(Number(questionCount) || 1, availableBySelectedTopics || 1));
      const res = await fetch(`${API_BASE}/practice/session`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName, subject, topics: ["General"],
          questionCount: safeCount,
          timeLimitMinutes: Math.max(1, Number(timeLimitMinutes) || 1),
          excludeIds: history.flatMap((h) => h.questionResults?.map((qr) => qr.questionId) || []),
        }),
      });
      if (res.status === 401) { navigate("/login"); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Unable to start practice session."); return; }
      setSession(data); setResult(null); setQuestionIndex(0); setAnswers({});
      setRemainingSeconds(Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)));
      setShowConfigDrawer(false); // close drawer when session starts
    } catch { setError("Unable to start practice session."); }
    finally { setStarting(false); }
  };

  const submitPractice = useCallback(async () => {
    if (!session || submitting || result) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/practice/session/${session.sessionId}/submit`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.status === 401) { navigate("/login"); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Unable to submit."); return; }
      setResult(data); fetchHistory();
    } catch { setError("Unable to submit practice session."); }
    finally { setSubmitting(false); }
  }, [answers, fetchHistory, navigate, result, session, submitting]);

  useEffect(() => {
    if (!session || result || submitting) return;
    if (remainingSeconds <= 0) submitPractice();
  }, [remainingSeconds, result, session, submitPractice, submitting]);

  const toggleTopic     = (name) =>
    setSelectedTopics((prev) => prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]);
  const toggleAllTopics = () => setSelectedTopics(allTopicsSelected ? [] : topicNames);
  const updateAnswer    = (qId, val) => { if (isSessionLocked) return; setAnswers((prev) => ({ ...prev, [qId]: val })); };
  const clearAnswer     = (qId) => {
    if (isSessionLocked) return;
    setAnswers((prev) => { const next = { ...prev }; delete next[qId]; return next; });
  };
  const resetSessionView = () => { setSession(null); setResult(null); setAnswers({}); setQuestionIndex(0); };

  /* ── Config panel (shared between sidebar + drawer) ── */
  const ConfigPanel = () => (
    <div className="relative bg-white border border-[#e5dfd5] rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 pt-7 pb-5 text-center border-b border-slate-100">
        <div className="mx-auto w-14 h-14 bg-[#0b2a4a] rounded-2xl flex items-center justify-center mb-3 shadow-lg">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Practice Mode</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your session below</p>
      </div>

      <div className="px-6 pb-6 pt-5 space-y-5">
        {loadingMeta ? (
          <div className="flex items-center gap-3 py-4 justify-center">
            <svg className="animate-spin h-5 w-5 text-[#0b2a4a]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
            </svg>
            <span className="text-sm text-slate-500">Loading subjects…</span>
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-sm text-slate-500 font-semibold max-w-[200px]">No questions are currently available for this exam.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Subject</label>
              <div className="flex gap-2 flex-wrap">
                {subjects.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSubject(item.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                      subject === item.key
                        ? "bg-[#0b2a4a] border-[#0b2a4a] text-white shadow-md"
                        : "bg-white border-slate-200 text-slate-600 hover:border-[#0b2a4a]/40 hover:text-[#0b2a4a]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Questions</label>
                <input
                  type="number" min={1} max={100} value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#0b2a4a]/10 focus:border-[#0b2a4a] px-3 py-2.5 text-sm text-slate-900 font-mono transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Minutes</label>
                <input
                  type="number" min={1} max={180} value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#0b2a4a]/10 focus:border-[#0b2a4a] px-3 py-2.5 text-sm text-slate-900 font-mono transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-sky-50 border border-sky-200 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-widest text-sky-600 font-semibold">Available</div>
                <div className="text-sm font-bold font-mono text-[#1c4f85]">{availableBySelectedTopics}</div>
              </div>
              <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold">Scoring</div>
                <div className="text-sm font-bold font-mono text-emerald-700">
                  {marking.correctMarks > 0 ? `+${formatScore(marking.correctMarks)}` : formatScore(marking.correctMarks)} / {marking.negativeMarks > 0 ? `+${formatScore(marking.negativeMarks)}` : formatScore(marking.negativeMarks)}
                </div>
              </div>
            </div>

            <button
              onClick={startPractice}
              disabled={starting || loadingMeta || !subject || availableBySelectedTopics <= 0}
              className="w-full bg-[#0b2a4a] hover:bg-[#123d6b] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {starting ? <><Spinner />Starting…</> : <><PlayCircle className="w-4 h-4" />Start Session</>}
            </button>

            {session && !result && (
              <button
                onClick={submitPractice}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md active:scale-[0.98] disabled:opacity-60 inline-flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? <><Spinner />Submitting…</> : <><Send className="w-4 h-4" />Submit Session</>}
              </button>
            )}
          </>
        )}
      </div>

      <div className="h-1.5 w-full bg-[#0b2a4a]" />
    </div>
  );

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .timer-bar { transition: width 1s linear; }
        .option-card { transition: all 0.15s ease; }
        .option-card:hover:not([data-locked="true"]) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(11,42,74,0.10); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.25s ease forwards; }
        @keyframes pulseBorder { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 0 4px rgba(239,68,68,0.1); } }
        .pulse-red { animation: pulseBorder 1s ease-in-out infinite; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .slide-down { animation: slideDown 0.2s ease forwards; }
      `}</style>

      <div className="max-w-[1400px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate("/HomePage")}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#0b2a4a] border border-slate-200 hover:border-[#0b2a4a]/30 bg-white hover:bg-[#0b2a4a]/5 shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0b2a4a]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-500 hidden sm:inline">LearnFlex · Practice</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-500 sm:hidden">Practice</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer pill */}
            {session && !result ? (
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border text-sm font-mono font-bold shadow-sm transition-all duration-500 ${
                timeCritical ? "bg-red-50 border-red-300 text-red-700 pulse-red"
                : timeUrgent ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-slate-200 text-[#0b2a4a]"
              }`}>
                <Clock3 className={`w-4 h-4 ${timeCritical ? "text-red-500" : timeUrgent ? "text-amber-500" : "text-[#0b2a4a]"}`} />
                {formatTime(remainingSeconds)}
              </div>
            ) : (
              <div className="w-4 sm:w-28" />
            )}

            {/* Mobile config toggle — only when no active session, or always to allow submit */}
            <button
              onClick={() => setShowConfigDrawer((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-600 hover:text-[#0b2a4a] hover:border-[#0b2a4a]/30 transition-all"
              aria-label="Toggle config"
            >
              {showConfigDrawer ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Timer progress bar */}
        {session && !result && (
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full timer-bar rounded-full ${timeCritical ? "bg-red-500" : timeUrgent ? "bg-amber-400" : "bg-[#0b2a4a]"}`}
              style={{ width: `${Math.max(0, Math.min(100, timeRatio * 100))}%` }}
            />
          </div>
        )}

        {/* Mobile config drawer */}
        {showConfigDrawer && (
          <div className="lg:hidden slide-down space-y-3">
            <ConfigPanel />
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">

          {/* ═══ LEFT PANEL — desktop only ═══ */}
          <div className="hidden lg:flex flex-col space-y-4">
            <ConfigPanel />
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div className="relative bg-white border border-[#e5dfd5] rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px] sm:min-h-[600px]">

            {/* Empty state / Dashboard */}
            {!session && (
              <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 fade-up h-full bg-slate-50/50 overflow-y-auto">
                {showHistory ? (
                  <>
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0b2a4a] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Recent Sessions</h2>
                          <p className="text-xs sm:text-sm text-slate-500">Track your practice performance</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowHistory(false)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0b2a4a] bg-white border border-slate-200 hover:border-[#0b2a4a] transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                    </div>

                    {history.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 border border-slate-200">
                          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">No history yet</h2>
                        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                          Complete a session to see your performance history here!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {history.map((item, idx) => (
                          <div key={`${item.submittedAt}-${idx}`} className="group relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all hover:-translate-y-1 hover:border-[#0b2a4a]/20">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0b2a4a]" />
                                <span className="text-xs font-bold text-slate-700">{subjectLabel(item.subject)}</span>
                              </div>
                              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                item.percentage >= 70 ? "bg-emerald-50 text-emerald-700" :
                                item.percentage >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                              }`}>
                                {formatPercent(item.percentage)}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold mb-1">Score</div>
                                <div className="text-xs sm:text-sm font-mono font-bold text-slate-700">{formatScore(item.score)}<span className="opacity-50 text-[10px]">/{formatScore(item.maxScore)}</span></div>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                                <div className="text-[9px] sm:text-[10px] text-emerald-600 uppercase font-bold mb-1">Correct</div>
                                <div className="text-xs sm:text-sm font-mono font-bold text-emerald-700">{item.correct}</div>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-red-50 border border-red-100">
                                <div className="text-[9px] sm:text-[10px] text-red-500 uppercase font-bold mb-1">Wrong</div>
                                <div className="text-xs sm:text-sm font-mono font-bold text-red-600">{item.wrong}</div>
                              </div>
                            </div>

                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Clock3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {new Date(item.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </div>
                              <div className="flex items-center gap-1.5 font-bold text-[#0b2a4a]">
                                <Trophy className="w-3 h-3" />
                                Review Result
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col h-full fade-up">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden bg-[#0b2a4a] p-6 sm:p-10 mb-6 sm:mb-8 text-white shadow-2xl group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4 sm:mb-6">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                            {getExamContent().icon}
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                              {getExamContent().subtitle}
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">{getExamContent().title}</h2>
                          </div>
                        </div>
                        
                        <p className="text-sm sm:text-lg text-blue-100/80 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-medium italic">
                          "{getExamContent().description}"
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {getExamContent().highlights.map((h, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                              <div className="text-[10px] uppercase font-bold text-blue-300 mb-1">{h.label}</div>
                              <div className="text-base sm:text-lg font-bold">{h.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col group hover:border-[#0b2a4a]/20 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Zap className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Start Training</h3>
                        <p className="text-sm text-slate-500 mb-6 flex-1">Configure your session on the left panel. Choose subjects, topics and timing to begin your practice run.</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0b2a4a]">
                          <MousePointer2 className="w-4 h-4 animate-bounce-x" />
                          Use left panel to start
                        </div>
                      </div>

                      <div 
                        onClick={() => setShowHistory(true)}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col group hover:border-[#0b2a4a]/20 transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <History className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Performance History</h3>
                        <p className="text-sm text-slate-500 mb-6 flex-1">Review your past sessions, check correct answers, and track your progress over time.</p>
                        <button className="w-full py-3 rounded-xl bg-slate-100 text-[#0b2a4a] text-sm font-bold hover:bg-[#0b2a4a] hover:text-white transition-all">
                          View Activity Log
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active session */}
            {session && currentQuestion && (
              <div className="flex flex-col h-full">

                {/* Result summary */}
                {result && (
                  <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-slate-100 fade-up">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0b2a4a] rounded-xl flex items-center justify-center shadow-md">
                          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">Session Complete</h2>
                      </div>
                      <button
                        onClick={resetSessionView}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0b2a4a] border border-slate-200 hover:border-[#0b2a4a]/30 rounded-xl px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#0b2a4a]/5 transition-all shadow-sm whitespace-nowrap"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">View Past Sessions</span>
                        <span className="sm:hidden">History</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <StatPill label="Score"   value={`${formatScore(result.score)}/${formatScore(result.maxScore)}`} variant="navy" />
                      <StatPill label="Percent" value={formatPercent(result.percentage)}     variant="default" />
                      <StatPill label="Correct" value={result.correct}                       variant="green" />
                      <div className="hidden sm:block"><StatPill label="Wrong"   value={result.wrong}     variant="red" /></div>
                      <div className="hidden sm:block"><StatPill label="Skipped" value={result.unanswered} variant="amber" /></div>
                    </div>
                    {/* Show wrong/skipped on mobile inline */}
                    <div className="sm:hidden grid grid-cols-2 gap-2 mt-2">
                      <StatPill label="Wrong"   value={result.wrong}      variant="red" />
                      <StatPill label="Skipped" value={result.unanswered} variant="amber" />
                    </div>
                  </div>
                )}

                {/* Question dot nav */}
                <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mr-1 flex-shrink-0">Q</span>
                  {session.questions?.map((q, i) => {
                    const qr      = questionResultMap[q.id];
                    const answered = !!answers[q.id];
                    return (
                      <QuestionDot
                        key={q.id} index={i}
                        answered={answered && !result}
                        correct={qr && qr.marksAwarded > 0}
                        wrong={qr && qr.marksAwarded < 0}
                        current={i === questionIndex}
                        onClick={setQuestionIndex}
                      />
                    );
                  })}
                  <div className="ml-auto flex-shrink-0 pl-3 sm:pl-4 border-l border-slate-100">
                    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold ${
                      isSessionLocked
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {isSessionLocked ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {isSessionLocked ? "Review" : "Live"}
                    </div>
                  </div>
                </div>

                {/* Breadcrumb */}
                <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-1 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1">
                    <TimerReset className="w-3 h-3 text-[#0b2a4a]" />
                    {subjectLabel(session.subject)}
                  </span>
                  <span className="text-slate-300 text-xs">›</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1">
                    <TrendingUp className="w-3 h-3 text-[#1c4f85]" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{currentQuestion.topic}</span>
                  </span>
                  <span className="ml-auto text-xs font-mono font-semibold text-slate-400">
                    {questionIndex + 1} / {session.questionCount}
                  </span>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 pt-3 space-y-3 sm:space-y-4 fade-up">

                  {/* Question card */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono text-white bg-[#0b2a4a] rounded-lg px-2.5 py-1 mb-3 shadow-sm">
                      Q{questionIndex + 1}
                      {currentQuestion.questionType && (
                        <span className="opacity-60 font-normal uppercase ml-1">{currentQuestion.questionType}</span>
                      )}
                    </span>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words mt-2">
                      {currentQuestion.statement}
                    </p>
                    {currentQuestion.imageUrl && (
                      <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                        <img
                          src={`${API_BASE}${currentQuestion.imageUrl}`}
                          alt={`Question ${currentQuestion.qno}`}
                          className="w-full max-h-[320px] sm:max-h-[480px] object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  {/* Options / numerical input */}
                  <div className="space-y-2">
                    {(currentQuestion.questionType === "mcq" || currentQuestion.options?.length >= 2) ? (
                      <>
                        {currentQuestion.optionSource === "generated" && currentQuestion.imageUrl && (
                          <p className="text-xs text-slate-400 mb-2">Option text is image-based — match option number from the image.</p>
                        )}

                        {answers[currentQuestion.id] && !isSessionLocked && (
                          <div className="flex justify-end mb-1">
                            <button
                              onClick={() => clearAnswer(currentQuestion.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg px-2.5 py-1 transition-all duration-150"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Clear Response
                            </button>
                          </div>
                        )}

                        {/* Single column on mobile, 2 cols on md+ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                          {currentQuestion.options.map((option) => {
                            const selectedValue  = answers[currentQuestion.id] || "";
                            const isSelected     = selectedValue === option.key;
                            const optionText     = String(option.text || "").trim();
                            const isGenericOption = /^Option\s+[1-4]$/i.test(optionText);
                            const displayText    = isGenericOption && currentQuestion.imageUrl ? `${optionText} (see image)` : optionText;
                            const isCorrectOption = !!currentQuestionResult &&
                              String(currentQuestionResult.correctAnswer || "") === String(option.key);

                            let borderCls, bgCls, textCls, radioCls;
                            if (isSessionLocked && isCorrectOption) {
                              borderCls = "border-emerald-400"; bgCls = "bg-emerald-50"; textCls = "text-emerald-800";
                              radioCls  = "border-emerald-500 bg-emerald-500";
                            } else if (isSessionLocked && isSelected && !isCorrectOption) {
                              borderCls = "border-red-400"; bgCls = "bg-red-50"; textCls = "text-red-800";
                              radioCls  = "border-red-500 bg-red-500";
                            } else if (isSelected) {
                              borderCls = "border-[#0b2a4a]"; bgCls = "bg-[#0b2a4a]/5"; textCls = "text-[#0b2a4a]";
                              radioCls  = "border-[#0b2a4a] bg-[#0b2a4a]";
                            } else {
                              borderCls = "border-slate-200 hover:border-[#0b2a4a]/40"; bgCls = "bg-white hover:bg-[#0b2a4a]/3"; textCls = "text-slate-700";
                              radioCls  = "border-slate-300 bg-white";
                            }

                            return (
                              <label
                                key={`${currentQuestion.id}-${option.key}`}
                                data-locked={isSessionLocked}
                                onDoubleClick={() => { if (!isSessionLocked && isSelected) clearAnswer(currentQuestion.id); }}
                                className={`option-card flex items-start gap-3 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border cursor-pointer shadow-sm ${borderCls} ${bgCls}`}
                              >
                                <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${radioCls}`}>
                                  {(isSelected || (isSessionLocked && isCorrectOption)) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  name={`answer-${currentQuestion.id}`}
                                  value={option.key}
                                  checked={isSelected}
                                  onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                                  disabled={isSessionLocked}
                                  className="sr-only"
                                />
                                <span className={`text-sm font-medium leading-relaxed ${textCls}`}>
                                  <span className="font-mono opacity-40 mr-1.5">({option.key})</span>
                                  {displayText}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Numerical Answer</label>
                        <input
                          type="text"
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                          disabled={isSessionLocked}
                          className="w-full rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#0b2a4a]/10 focus:border-[#0b2a4a] px-4 py-3 text-slate-900 font-mono text-sm transition-all shadow-sm placeholder-slate-300"
                          placeholder="Enter your answer…"
                        />
                      </div>
                    )}

                    {/* Answer reveal */}
                    {isSessionLocked && currentQuestionResult && (
                      <div className="mt-1 rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4 shadow-sm">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2 sm:mb-3">Answer Breakdown</div>
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Your Answer</div>
                            <div className="text-sm font-mono font-bold text-[#1c4f85]">{currentQuestionResult.userAnswer || "—"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Correct</div>
                            <div className="text-sm font-mono font-bold text-emerald-600">{currentQuestionResult.correctAnswer}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Marks</div>
                            <div className={`text-sm font-mono font-bold ${
                              currentQuestionResult.marksAwarded > 0 ? "text-emerald-600" :
                              currentQuestionResult.marksAwarded < 0 ? "text-red-500" : "text-slate-400"
                            }`}>
                              {currentQuestionResult.marksAwarded > 0 ? "+" : ""}{formatScore(currentQuestionResult.marksAwarded)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nav footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
                  <button
                    onClick={() => setQuestionIndex((p) => Math.max(0, p - 1))}
                    disabled={questionIndex === 0}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {questionIndex === session.questionCount - 1 && !result ? (
                    <button
                      onClick={submitPractice}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                      {submitting ? <><Spinner />Submitting...</> : <><Send className="w-4 h-4" />Submit</>}
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {questionIndex + 1} / {session.questionCount}
                    </span>
                  )}

                  <button
                    onClick={() => setQuestionIndex((p) => Math.min(session.questionCount - 1, p + 1))}
                    disabled={questionIndex >= session.questionCount - 1}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold bg-[#0b2a4a] hover:bg-[#123d6b] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="h-1.5 w-full bg-[#0b2a4a] mt-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}