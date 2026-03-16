import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Send,
  Target,
  TimerReset
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

const formatTime = (seconds) => {
  const safe = Math.max(0, seconds);
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
};

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

const subjectLabel = (key = "") => {
  const map = {
    mathematics: "Mathematics",
    chemistry: "Chemistry",
    physics: "Physics"
  };
  return map[key] || key;
};

export default function PracticeMode() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [answers, setAnswers] = useState({});

  const selectedSubjectMeta = useMemo(
    () => subjects.find((item) => item.key === subject),
    [subjects, subject]
  );

  const topicList = useMemo(() => selectedSubjectMeta?.topics || [], [selectedSubjectMeta]);
  const topicNames = useMemo(() => topicList.map((topic) => topic.name), [topicList]);

  const allTopicsSelected = topicNames.length > 0 && selectedTopics.length === topicNames.length;

  const availableBySelectedTopics = useMemo(() => {
    if (!selectedSubjectMeta) return 0;
    if (!selectedTopics.length || allTopicsSelected) {
      return selectedSubjectMeta.availableQuestions || 0;
    }

    const selected = new Set(selectedTopics);
    return topicList
      .filter((topic) => selected.has(topic.name))
      .reduce((sum, topic) => sum + (topic.count || 0), 0);
  }, [selectedSubjectMeta, selectedTopics, allTopicsSelected, topicList]);

  const questionResultMap = useMemo(() => {
    const map = {};
    for (const item of result?.questionResults || []) {
      map[item.questionId] = item;
    }
    return map;
  }, [result]);

  const currentQuestion = session?.questions?.[questionIndex] || null;
  const currentQuestionResult = currentQuestion ? questionResultMap[currentQuestion.id] : null;

  const isTimeOver = !!session && remainingSeconds <= 0;
  const isSessionLocked = !!result || isTimeOver;

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/practice/history`, { credentials: "include" });
      if (res.status === 401) return;
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      // ignore history fetch errors
    }
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/practice/meta`, {
          credentials: "include"
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        const subjectList = data.subjects || [];
        setSubjects(subjectList);

        if (subjectList.length) {
          setSubject(subjectList[0].key);
        }
      } catch {
        setError("Unable to load practice metadata.");
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchMeta();
    fetchHistory();
  }, [fetchHistory, navigate]);

  useEffect(() => {
    if (!subject) return;
    const meta = subjects.find((item) => item.key === subject);
    const names = (meta?.topics || []).map((topic) => topic.name);
    setSelectedTopics(names);
  }, [subject, subjects]);

  useEffect(() => {
    if (!session) return;

    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(seconds);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const startPractice = async () => {
    setError("");

    if (!subject) {
      setError("Please select a subject.");
      return;
    }

    if (!selectedTopics.length) {
      setError("Please select at least one topic.");
      return;
    }

    setStarting(true);

    try {
      const safeQuestionCount = Math.max(
        1,
        Math.min(Number(questionCount) || 1, availableBySelectedTopics || 1)
      );

      const res = await fetch(`${API_BASE}/practice/session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topics: selectedTopics,
          questionCount: safeQuestionCount,
          timeLimitMinutes: Math.max(1, Number(timeLimitMinutes) || 1)
        })
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Unable to start practice session.");
        return;
      }

      setSession(data);
      setResult(null);
      setQuestionIndex(0);
      setAnswers({});
    } catch {
      setError("Unable to start practice session.");
    } finally {
      setStarting(false);
    }
  };

  const submitPractice = useCallback(async () => {
    if (!session || submitting || result) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/practice/session/${session.sessionId}/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Unable to submit practice session.");
        return;
      }

      setResult(data);
      fetchHistory();
    } catch {
      setError("Unable to submit practice session.");
    } finally {
      setSubmitting(false);
    }
  }, [answers, fetchHistory, navigate, result, session, submitting]);

  useEffect(() => {
    if (!session || result || submitting) return;
    if (remainingSeconds <= 0) {
      submitPractice();
    }
  }, [remainingSeconds, result, session, submitPractice, submitting]);

  const toggleTopic = (topicName) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicName)) {
        return prev.filter((item) => item !== topicName);
      }
      return [...prev, topicName];
    });
  };

  const toggleAllTopics = () => {
    if (allTopicsSelected) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topicNames);
    }
  };

  const updateAnswer = (questionId, value) => {
    if (isSessionLocked) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const resetSessionView = () => {
    setSession(null);
    setResult(null);
    setAnswers({});
    setQuestionIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 hover:bg-slate-700/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {session && !result && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-900/60 border border-indigo-500/30">
              <Clock3 className="w-4 h-4 text-indigo-300" />
              <span className="font-semibold tracking-wide">{formatTime(remainingSeconds)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Brain className="w-6 h-6 text-violet-400" />
                Practice Mode
              </h1>
              <p className="text-sm text-slate-400">
                Select subject, topics, number of questions, and timer.
              </p>
            </div>

            {loadingMeta && <p className="text-slate-300 text-sm">Loading subjects...</p>}

            {!loadingMeta && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Subject</span>
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                  >
                    {subjects.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="block">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Topics</span>
                    <button
                      type="button"
                      onClick={toggleAllTopics}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
                    >
                      {allTopicsSelected ? "Clear All" : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto rounded-xl bg-slate-800/50 border border-slate-700 p-2 space-y-1">
                    {topicList.map((topic) => {
                      const checked = selectedTopics.includes(topic.name);
                      return (
                        <label
                          key={topic.name}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTopic(topic.name)}
                              className="accent-violet-500"
                            />
                            <span>{topic.name}</span>
                          </span>
                          <span className="text-xs text-cyan-300">{topic.count}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">No. of Questions</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Math.max(1, Number(event.target.value) || 1))}
                    className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Time Limit (minutes)</span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(event) => setTimeLimitMinutes(Math.max(1, Number(event.target.value) || 1))}
                    className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                  />
                </label>

                <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3 text-sm text-slate-300">
                  Available for selected topics:{" "}
                  <span className="font-semibold text-cyan-300">{availableBySelectedTopics}</span>
                </div>

                <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3 text-sm text-emerald-300">
                  Scoring mode: +4 for correct, -1 for wrong
                </div>

                <button
                  onClick={startPractice}
                  disabled={
                    starting ||
                    loadingMeta ||
                    !subject ||
                    !selectedTopics.length ||
                    availableBySelectedTopics <= 0
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
                >
                  <PlayCircle className="w-5 h-5" />
                  {starting ? "Starting..." : "Start Practice"}
                </button>

                {session && !result && (
                  <button
                    onClick={submitPractice}
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Submit Session"}
                  </button>
                )}
              </div>
            )}

            {history.length > 0 && (
              <div className="rounded-xl bg-slate-800/40 border border-slate-700 p-3">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Recent Sessions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {history.slice(0, 5).map((item, idx) => (
                    <div key={`${item.submittedAt}-${idx}`} className="text-xs text-slate-300 border border-slate-700 rounded-lg p-2">
                      <div>{subjectLabel(item.subject)}</div>
                      <div>
                        Score: {item.score}/{item.maxScore} ({formatPercent(item.percentage)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-2 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
            {!session && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center">
                <BookOpen className="w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Session not started</h2>
                <p className="text-slate-400 max-w-md">
                  Select your topics and launch a timed practice session. Submit when done to get +4/-1 scoring and review mode.
                </p>
              </div>
            )}

            {session && currentQuestion && (
              <div className="space-y-5">
                {result && (
                  <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-400" />
                      Result Summary
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                      <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2">
                        <p className="text-slate-400">Score</p>
                        <p className="font-bold text-emerald-300">{result.score}/{result.maxScore}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2">
                        <p className="text-slate-400">%</p>
                        <p className="font-bold text-cyan-300">{formatPercent(result.percentage)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2">
                        <p className="text-slate-400">Correct</p>
                        <p className="font-bold text-emerald-300">{result.correct}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2">
                        <p className="text-slate-400">Wrong</p>
                        <p className="font-bold text-rose-300">{result.wrong}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2">
                        <p className="text-slate-400">Unanswered</p>
                        <p className="font-bold text-amber-300">{result.unanswered}</p>
                      </div>
                    </div>
                    <button
                      onClick={resetSessionView}
                      className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
                    >
                      Start New Session
                    </button>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                    <TimerReset className="w-4 h-4 text-cyan-400" />
                    {subjectLabel(session.subject)} | {currentQuestion.topic} | Question {questionIndex + 1} of {session.questionCount}
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                      isSessionLocked
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSessionLocked ? "Review mode" : "Session running"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5 space-y-4">
                  <h3 className="text-xl font-bold text-white">Q{currentQuestion.qno || questionIndex + 1}</h3>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-100 break-words">
                    {currentQuestion.statement}
                  </p>

                  {currentQuestion.imageUrl && (
                    <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
                      <img
                        src={`${API_BASE}${currentQuestion.imageUrl}`}
                        alt={`Question ${currentQuestion.qno}`}
                        className="w-full max-h-[520px] object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-4">
                  {(currentQuestion.questionType === "mcq" || currentQuestion.options?.length >= 2) ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300 mb-2">Select your answer:</p>
                      {currentQuestion.optionSource === "generated" && currentQuestion.imageUrl && (
                        <p className="text-xs text-slate-400 mb-2">
                          Option text is image-based for this question. Match option number from the image.
                        </p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option) => {
                        const selectedValue = answers[currentQuestion.id] || "";
                        const isSelected = selectedValue === option.key;
                        const optionLabel = String(option.text || "").trim();
                        const isGenericOption = /^Option\s+[1-4]$/i.test(optionLabel);
                        const displayOptionText =
                          isGenericOption && currentQuestion.imageUrl
                            ? `${optionLabel} (see image)`
                            : optionLabel;
                        const isCorrectOption =
                          !!currentQuestionResult &&
                          String(currentQuestionResult.correctAnswer || "") === String(option.key);

                        let borderClass = "border-slate-700";
                        if (isSessionLocked && isCorrectOption) borderClass = "border-emerald-500";
                        if (isSessionLocked && isSelected && !isCorrectOption) borderClass = "border-rose-500";

                        return (
                          <label
                            key={`${currentQuestion.id}-${option.key}`}
                            className={`flex items-start gap-2 rounded-lg px-3 py-3 border ${borderClass} hover:bg-slate-800/60 cursor-pointer`}
                          >
                            <input
                              type="radio"
                              name={`answer-${currentQuestion.id}`}
                              value={option.key}
                              checked={isSelected}
                              onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
                              disabled={isSessionLocked}
                              className="accent-violet-500 mt-1"
                            />
                            <span className="text-sm text-slate-200">
                              ({option.key}) {displayOptionText}
                            </span>
                          </label>
                        );
                      })}
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <span className="text-sm text-slate-300">Numerical answer:</span>
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || ""}
                        onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
                        disabled={isSessionLocked}
                        className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                        placeholder="Type numeric/option answer"
                      />
                    </label>
                  )}

                  {isSessionLocked && currentQuestionResult && (
                    <div className="mt-3 rounded-lg bg-slate-800/60 border border-slate-700 p-3 text-sm">
                      <p>
                        Your answer: <span className="text-cyan-300">{currentQuestionResult.userAnswer || "Not answered"}</span>
                      </p>
                      <p>
                        Correct answer: <span className="text-emerald-300">{currentQuestionResult.correctAnswer}</span>
                      </p>
                      <p>
                        Marks: <span className="text-amber-300">{currentQuestionResult.marksAwarded}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={questionIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => setQuestionIndex((prev) => Math.min(session.questionCount - 1, prev + 1))}
                    disabled={questionIndex >= session.questionCount - 1}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
