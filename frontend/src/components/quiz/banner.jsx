import React, { useState, useEffect, useMemo } from 'react';
import { Timer, Calendar, Clock, PlayCircle, AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Banner = (quiz) => {
  console.log(quiz)
  const navigate = useNavigate();
  const quizData = {
    name: quiz.data.Quiz_id,
    startTime: new Date(quiz.data.Start_time), // Starts in 10 seconds for demo purposes
    durationMinutes: quiz.data.Duration,
    description: quiz.data.Description,
    totalQuestions: quiz.data.Number_of_questions
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const renderQuiz = () => {
    navigate(`/quiz/${quiz.data.Quiz_id}`);
  }
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Logic to determine status
  const statusInfo = useMemo(() => {
    const diff = quizData.startTime - currentTime;
    const endTime = new Date(quizData.startTime.getTime() + quizData.durationMinutes * 60000);

    if (currentTime < quizData.startTime) {
      return {
        label: "NOT STARTED",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        indicator: "bg-amber-500",
        icon: <Clock size={16} />,
        countdown: diff
      };
    } else if (currentTime >= quizData.startTime && currentTime <= endTime) {
      return {
        label: "LIVE",
        color: "bg-red-100 text-red-700 border-red-200 animate-pulse",
        indicator: "bg-red-500",
        icon: <PlayCircle size={16} />,
        countdown: endTime - currentTime
      };
    } else {
      return {
        label: "COMPLETED",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        indicator: "bg-emerald-500",
        icon: <CheckCircle2 size={16} />,
        countdown: 0
      };
    }
  }, [currentTime, quizData]);

  // Format countdown string
  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  return (
    <div className="min-w-fit bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full">
        {/* Main Quiz Box */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.01]">

          {/* Status Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.indicator} ${statusInfo.label === 'LIVE' ? 'animate-ping' : ''}`}></span>
              {statusInfo.icon}
              {statusInfo.label}
            </div>
            <div className="text-slate-400 flex items-center gap-2 text-sm">
              <Calendar size={14} />
              {quizData.startTime.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight">
                  {quizData.name}
                </h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  {quizData.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Time scheduled</span>
                    <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <Clock size={14} className="text-blue-500" />
                      {quizData.startTime.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Questions</span>
                    <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-500" />
                      {quizData.totalQuestions} Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Timer Box */}
              <div className="flex flex-col items-center justify-center bg-slate-900 rounded-3xl p-6 text-white min-w-[200px] shadow-lg shadow-slate-300">
                <Timer className={`mb-2 ${statusInfo.label === 'LIVE' ? 'text-red-400' : 'text-blue-400'}`} size={24} />
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">
                  {statusInfo.label === 'LIVE' ? 'Time Remaining' : 'Starts In'}
                </span>
                <div className="text-4xl font-mono font-bold tracking-tighter">
                  {formatCountdown(statusInfo.countdown)}
                </div>
                {statusInfo.label === 'LIVE' && (
                  <div className="mt-4 w-full">
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full transition-all duration-1000"
                        style={{ width: `${(statusInfo.countdown / (quizData.durationMinutes * 60000)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
            <button
              disabled={statusInfo.label !== 'LIVE'}
              onClick={statusInfo.label === 'LIVE' && renderQuiz}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${statusInfo.label === 'LIVE'
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              {statusInfo.label === 'LIVE' ? 'Enter Quiz Lobby' : 'Quiz Not Yet Available'}
            </button>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Banner;