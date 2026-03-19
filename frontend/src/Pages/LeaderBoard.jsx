import { useEffect, useState } from "react";
import { Trophy, Medal, Star, Zap } from "lucide-react";

const MEDAL = {
  1: { icon: "🥇", bg: "bg-amber-50",   border: "border-amber-200", rank: "text-amber-500" },
  2: { icon: "🥈", bg: "bg-slate-50",   border: "border-slate-200", rank: "text-slate-400" },
  3: { icon: "🥉", bg: "bg-orange-50",  border: "border-orange-200",rank: "text-orange-400" },
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

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/leaderboard");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const maxRating = data.length ? Math.max(...data.map(u => u.rating)) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF3FB] via-[#F7F9FC] to-white p-6 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* ── Page Header ── */}
        <div className="relative bg-white border border-[#D6E6F4] rounded-[2rem] px-8 py-8 text-center shadow-lg shadow-blue-900/8 overflow-hidden">
          {/* Gradient accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B2447] via-[#7AB8D9] to-[#EAF3FB]" />
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#EAF3FB] opacity-60" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#D6E6F4] opacity-40" />

          <div className="relative flex items-center justify-center gap-3 mb-2">
            <div className="w-11 h-11 bg-[#0B2447] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/25">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#0B2447] tracking-tight">Leaderboard</h1>
          </div>
          <p className="relative text-sm text-slate-400 font-medium">Top performers of Weekly Challenges</p>
        </div>

        {/* ── Top 3 Podium (if enough data) ── */}
        {!loading && data.length >= 3 && (
          <div className="grid grid-cols-3 gap-3">
            {[data[1], data[0], data[2]].map((user, podiumIdx) => {
              const ranks = [2, 1, 3];
              const rank = ranks[podiumIdx];
              const isFirst = rank === 1;
              return (
                <div
                  key={user.rank}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all
                    ${isFirst
                      ? "bg-[#0B2447] border-[#0B2447] shadow-xl shadow-blue-900/25 -translate-y-3"
                      : "bg-white border-[#D6E6F4] shadow-md shadow-blue-900/8"
                    }`}
                >
                  <span className="text-2xl">{MEDAL[rank].icon}</span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border-2
                    ${isFirst ? "bg-white/10 border-white/20 text-white" : "bg-[#EAF3FB] border-[#D6E6F4] text-[#0B2447]"}`}>
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className={`text-sm font-black leading-tight ${isFirst ? "text-white" : "text-[#0B2447]"}`}>{user.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isFirst ? "text-blue-300" : "text-[#7AB8D9]"}`}>{user.exam_name}</p>
                  <div className={`flex items-center gap-1 mt-1 px-3 py-1 rounded-full text-xs font-black
                    ${isFirst ? "bg-white/15 text-white" : "bg-[#EAF3FB] text-[#0B2447]"}`}>
                    <Star className="w-3 h-3" />
                    {user.rating}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Full Table ── */}
        <div className="bg-white border border-[#D6E6F4] rounded-2xl overflow-hidden shadow-md shadow-blue-900/6">

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 bg-[#F7F9FC] border-b border-[#D6E6F4] px-5 py-3">
            {[["Rank", "col-span-2"], ["Player", "col-span-4"], ["Exam", "col-span-4"], ["Rating", "col-span-2 text-right"]].map(([label, cls]) => (
              <span key={label} className={`${cls} text-[10px] font-bold text-[#1a5276] uppercase tracking-widest`}>{label}</span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-[#F7F9FC] rounded-xl animate-pulse border border-[#D6E6F4]" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm font-medium">No leaderboard data available yet.</p>
            </div>
          ) : (
            data.map((user, index) => {
              const isTop3 = user.rank <= 3;
              const barPct = Math.round((user.rating / maxRating) * 100);
              return (
                <div
                  key={index}
                  className={`group grid grid-cols-12 gap-2 items-center px-5 py-3.5 border-b border-[#D6E6F4] last:border-0 transition-all duration-150
                    ${isTop3 ? "bg-[#F7F9FC]" : "hover:bg-[#F7F9FC]"}`}
                >
                  {/* Rank */}
                  <div className="col-span-2 flex items-center">
                    <RankBadge rank={user.rank} />
                  </div>

                  {/* Name + avatar initial */}
                  <div className="col-span-4 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF3FB] border border-[#D6E6F4] flex items-center justify-center text-xs font-black text-[#0B2447] shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm font-bold text-[#0B2447] truncate">{user.name}</span>
                  </div>

                  {/* Exam badge */}
                  <div className="col-span-4">
                    <span className="inline-flex items-center gap-1 bg-[#EAF3FB] border border-[#D6E6F4] text-[#1a5276] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      <Zap className="w-2.5 h-2.5" />
                      {user.exam_name}
                    </span>
                  </div>

                  {/* Rating + mini bar */}
                  <div className="col-span-2 flex flex-col items-end gap-1">
                    <span className="text-sm font-black text-[#0B2447]">{user.rating}</span>
                    <div className="w-full h-1 bg-[#EAF3FB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B2447] rounded-full transition-all duration-700"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;