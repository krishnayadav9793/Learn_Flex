import { useEffect, useState } from "react";
import { Trophy, Star, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const MEDAL = {
  1: { icon: "🥇", bg: "bg-amber-50",  border: "border-amber-200" },
  2: { icon: "🥈", bg: "bg-slate-50",  border: "border-slate-200" },
  3: { icon: "🥉", bg: "bg-orange-50", border: "border-orange-200" },
};

const RankBadge = ({ rank }) => {
  const m = MEDAL[rank];
  if (m) {
    return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-base ${m.bg} border ${m.border}`}>
        {m.icon}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F7F9FC] border border-[#D6E6F4] text-xs font-black text-[#1a5276]">
      {rank}
    </span>
  );
};

const StatPill = ({ icon: Icon, value, color }) => (
  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${color}`}>
    <Icon className="w-2.5 h-2.5" />
    {value}
  </span>
);

const Leaderboard = () => {
  const location = useLocation();
  const { quizId, quizName } = location.state ?? {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    setCurrentUserId(stored);
  }, []);

  useEffect(() => {
    if (!quizId) { setLoading(false); return; }
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`https://learn-flex-puce.vercel.app/leaderboard/${quizId}`,{
          credentials:"include",
          headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        setData(Array.isArray(result) ? result : result.data ?? []);
        setCurrentUserId(result.userId.id)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  const maxRating = data.length ? Math.max(...data.map(u => Number(u.rating))) : 1;
  const currentUserRow = data.find(u => u.user_id === currentUserId);

  const TableRow = ({ user, isCurrentUser = false }) => {
    const isTop3 = user.rank <= 3;
    const barPct = Math.round((Number(user.rating) / maxRating) * 100);

return (
      <div
        className={`grid items-center px-3 sm:px-5 py-3 border-b border-[#D6E6F4] last:border-0 transition-all duration-150
          ${isCurrentUser
            ? "bg-[#0B2447]"
            : isTop3
            ? "bg-[#F7F9FC]"
            : "hover:bg-[#F7F9FC]"
          }`}
        style={{ gridTemplateColumns: "44px 1fr 60px 60px 60px 72px" }}
      >
        <div className="flex items-center">
          <RankBadge rank={user.rank} />
        </div>
 
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border
            ${isCurrentUser
              ? "bg-white/15 border-white/20 text-white"
              : "bg-[#EAF3FB] border-[#D6E6F4] text-[#0B2447]"
            }`}>
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <span className={`text-xs sm:text-sm font-bold truncate block ${isCurrentUser ? "text-white" : "text-[#0B2447]"}`}>
              {user.name}
              {isCurrentUser && (
                <span className="ml-1.5 text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  You
                </span>
              )}
            </span>
          </div>
        </div>
 
        <div className="flex justify-center">
          <StatPill icon={CheckCircle2} value={user.correct_count ?? 0}
            color={isCurrentUser ? "bg-green-400/20 text-green-300" : "bg-green-50 text-green-600 border border-green-100"} />
        </div>
        <div className="flex justify-center">
          <StatPill icon={XCircle} value={user.wrong_count ?? 0}
            color={isCurrentUser ? "bg-red-400/20 text-red-300" : "bg-red-50 text-red-500 border border-red-100"} />
        </div>
        <div className="flex justify-center">
          <StatPill icon={MinusCircle} value={user.not_attempted ?? 0}
            color={isCurrentUser ? "bg-white/10 text-blue-200" : "bg-slate-50 text-slate-400 border border-slate-100"} />
        </div>
 
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs sm:text-sm font-black ${isCurrentUser ? "text-white" : "text-[#0B2447]"}`}>
            {user.rating}
          </span>
          <div className={`w-full h-1 rounded-full overflow-hidden ${isCurrentUser ? "bg-white/20" : "bg-[#EAF3FB]"}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${isCurrentUser ? "bg-white" : "bg-[#0B2447]"}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF3FB] via-[#F7F9FC] to-white p-4 sm:p-6 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6">
 
        {/* ── Header ── */}
        <div className="relative bg-white border border-[#D6E6F4] rounded-2xl sm:rounded-[2rem] px-5 sm:px-8 py-6 sm:py-8 text-center shadow-lg shadow-blue-900/8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B2447] via-[#7AB8D9] to-[#EAF3FB]" />
          <div className="absolute -top-10 -right-10 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-[#EAF3FB] opacity-60" />
          <div className="absolute -bottom-8 -left-8 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-[#D6E6F4] opacity-40" />
          <div className="relative flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#0B2447] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/25">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2447] tracking-tight">Leaderboard</h1>
          </div>
          <p className="relative text-xs sm:text-sm text-slate-400 font-medium">{quizName ?? "Top performers"}</p>
        </div>
 
        {/* ── Top 3 Podium ── */}
        {!loading && data.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[data[1], data[0], data[2]].map((user, podiumIdx) => {
              const ranks = [2, 1, 3];
              const rank = ranks[podiumIdx];
              const isFirst = rank === 1;
              const isCurrentUser = user.user_id === currentUserId;
              return (
                <div
                  key={user.user_id}
                  className={`relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 px-2 sm:px-4 py-4 sm:py-5 text-center transition-all
                    ${isFirst
                      ? "bg-[#0B2447] border-[#0B2447] shadow-xl shadow-blue-900/25 -translate-y-2 sm:-translate-y-3"
                      : "bg-white border-[#D6E6F4] shadow-md"
                    }`}
                >
                  {isCurrentUser && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-[#7AB8D9] text-white px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      You
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl">{MEDAL[rank].icon}</span>
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-lg font-black border-2
                    ${isFirst ? "bg-white/10 border-white/20 text-white" : "bg-[#EAF3FB] border-[#D6E6F4] text-[#0B2447]"}`}>
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className={`text-xs sm:text-sm font-black leading-tight truncate w-full px-1 ${isFirst ? "text-white" : "text-[#0B2447]"}`}>
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 sm:mt-1 flex-wrap justify-center">
                    <StatPill icon={CheckCircle2} value={user.correct_count ?? 0}
                      color={isFirst ? "bg-green-400/20 text-green-300" : "bg-green-50 text-green-600 border border-green-100"} />
                    <StatPill icon={XCircle} value={user.wrong_count ?? 0}
                      color={isFirst ? "bg-red-400/20 text-red-300" : "bg-red-50 text-red-500 border border-red-100"} />
                    <StatPill icon={MinusCircle} value={user.not_attempted ?? 0}
                      color={isFirst ? "bg-white/10 text-blue-200" : "bg-slate-50 text-slate-400 border border-slate-100"} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-black
                    ${isFirst ? "bg-white/15 text-white" : "bg-[#EAF3FB] text-[#0B2447]"}`}>
                    <Star className="w-3 h-3" />
                    {user.rating}
                  </div>
                </div>
              );
            })}
          </div>
        )}
 
        {/* ── YOUR RANK CARD ── */}
        {!loading && currentUserRow && (
          <div className="relative bg-[#0B2447] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-blue-900/30 border border-[#1a3a6b]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7AB8D9] via-white/40 to-[#7AB8D9]" />
 
            <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#7AB8D9] rounded-full" />
                <span className="text-xs font-black text-blue-200 uppercase tracking-widest">Your Rank</span>
              </div>
              <span className="text-xs text-blue-300 font-bold">
                #{currentUserRow.rank} of {data.length}
              </span>
            </div>
 
            <TableRow user={currentUserRow} isCurrentUser={true} />
          </div>
        )}
 
        {/* ── Full Table ── */}
        <div className="bg-white border border-[#D6E6F4] rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-blue-900/6">
 
          {/* Scroll wrapper — allows horizontal scroll on very small screens */}
          <div className="overflow-x-auto">
            {/* Header */}
            <div
              className="bg-[#F7F9FC] border-b border-[#D6E6F4] px-3 sm:px-5 py-3 grid items-center min-w-[380px]"
              style={{ gridTemplateColumns: "44px 1fr 60px 60px 60px 72px" }}
            >
              <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest">Rank</span>
              <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest">Player</span>
              <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest text-center">✓</span>
              <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest text-center">✗</span>
              <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest text-center">—</span>
              <span className="text-[10px] font-bold text-[#1a5276] uppercase tracking-widest text-right">Rating</span>
            </div>
 
            {/* Rows wrapper also needs min-width to match */}
            <div className="min-w-[380px]">
              {loading ? (
                <div className="flex flex-col gap-3 p-4 sm:p-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-[#F7F9FC] rounded-xl animate-pulse border border-[#D6E6F4]" />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-slate-400 text-sm font-medium">No leaderboard data available yet.</p>
                </div>
              ) : (
                data.map((user) => (
                  <TableRow
                    key={user.user_id}
                    user={user}
                    isCurrentUser={user.user_id === currentUserId}
                  />
                ))
              )}
            </div>
          </div>
        </div>
 
        {/* ── Not participated ── */}
        {!loading && currentUserId && !currentUserRow && (
          <div className="bg-white border border-[#D6E6F4] rounded-xl sm:rounded-2xl px-5 sm:px-6 py-4 text-center shadow-sm">
            <p className="text-sm text-slate-400 font-medium">You haven't participated in this quiz yet.</p>
          </div>
        )}
 
      </div>
    </div>
  );
};
 
export default Leaderboard;