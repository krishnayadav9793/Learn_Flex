import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Banner = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const navigate = useNavigate();

  const status = (() => {
    if (!data?.Start_Time) return "upcoming";
    const start = new Date(data.Start_Time).getTime();
    const end = start + (data.time_limit || 60) * 60 * 1000;
    const now = Date.now();
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "completed";
  })();

  const accentColor = {
    completed: "#22C55E",
    live: "#F59E0B",
    upcoming: "#3B82F6",
  }[status];

  const badgeStyle = {
    completed: { background: "#DCFCE7", color: "#16A34A" },
    live: { background: "#FEF3C7", color: "#D97706" },
    upcoming: { background: "#EFF6FF", color: "#2563EB" },
  }[status];

  const badgeLabel = {
    completed: "Completed",
    live: "Live Now",
    upcoming: "Upcoming",
  }[status];

  useEffect(() => {
    if (!data?.Start_Time) return;
    const start = new Date(data.Start_Time).getTime();
    const end = start + (data.time_limit || 60) * 60 * 1000;

    if (status === "completed") {
      setTimeLeft("00:00:00");
      return;
    }

    const target = status === "live" ? end : start;

    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft([h, m, s].map((n) => String(n).padStart(2, "0")).join(":"));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data, status]);

  const formattedDate = (() => {
    if (!data?.Start_Time) return "";
    const d = new Date(data.Start_Time);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  })();

  const formattedTime = (() => {
    if (!data?.Start_Time) return "—";
    const d = new Date(data.Start_Time);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  })();

  const timerLabel = status === "live" ? "Ends In" : "Starts In";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');

        .banner-wrapper {
          width: 90%;
          margin: 0 auto;
          font-family: 'DM Sans', sans-serif;
        }

        .banner-card {
          background: #fff;
          border-radius: 22px;
          border: 1px solid #E5E1D3;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .banner-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(0, 31, 63, 0.09);
        }

        .banner-inner {
          display: flex;
          align-items: stretch;
        }

        .accent-bar {
          width: 5px;
          flex-shrink: 0;
        }

        .banner-content {
          flex: 1;
          padding: 1.4rem 1.5rem;
          min-width: 0;
        }

        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .date-label {
          font-size: 12px;
          color: #94A3B8;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .main-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .left-section {
          flex: 1 1 220px;
          min-width: 0;
        }

        .quiz-title {
          font-size: clamp(15px, 3vw, 20px);
          font-weight: 900;
          color: #001F3F;
          letter-spacing: -0.3px;
          word-break: break-word;
        }

        .quiz-desc {
          font-size: 13px;
          color: #64748B;
          font-weight: 600;
          margin-top: 2px;
          word-break: break-word;
        }

        .stats-row {
          display: flex;
          gap: 0.6rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .stat-chip {
          background: #F8FAFC;
          border: 1px solid #E5E1D3;
          border-radius: 12px;
          padding: 8px 12px;
          flex: 1 1 70px;
          min-width: 70px;
        }

        .stat-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94A3B8;
        }

        .stat-value {
          font-size: clamp(12px, 2.5vw, 15px);
          font-weight: 900;
          color: #001F3F;
          margin-top: 2px;
        }

        .stat-unit {
          font-size: 11px;
          font-weight: 600;
          color: #94A3B8;
        }

        .right-section {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
          flex: 0 1 150px;
          min-width: 130px;
        }

        .timer-box {
          background: #001F3F;
          border-radius: 14px;
          padding: 10px 14px;
          text-align: center;
        }

        .timer-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7CA4C8;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .timer-value {
          font-size: clamp(16px, 4vw, 22px);
          font-weight: 900;
          color: #fff;
          letter-spacing: 2px;
          font-variant-numeric: tabular-nums;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 800;
          padding: 11px 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        .btn-completed {
          background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
          color: #78350F;
        }

        .btn-live {
          background: #001F3F;
          color: #fff;
        }

        .btn-upcoming {
          background: #F1F5F9;
          color: #94A3B8;
          cursor: not-allowed;
        }

        /* ── Mobile: stack timer below stats ── */
        @media (max-width: 480px) {
          .banner-wrapper {
            width: 95%;
          }

          .banner-content {
            padding: 1rem 1rem;
          }

          .main-row {
            flex-direction: column;
            gap: 1rem;
          }

          .right-section {
            flex: 1 1 100%;
            min-width: unset;
            flex-direction: row;
            align-items: center;
          }

          .timer-box {
            flex: 1;
          }

          .cta-btn {
            flex: 1;
          }

          .stat-chip {
            flex: 1 1 60px;
            min-width: 60px;
            padding: 6px 8px;
          }

          .quiz-title {
            font-size: clamp(14px, 4vw, 17px);
          }
        }

        /* ── Tablet tweaks ── */
        @media (min-width: 481px) and (max-width: 768px) {
          .right-section {
            flex: 0 1 140px;
            min-width: 120px;
          }
        }
      `}</style>

      <div className="banner-wrapper">
        <div className="banner-card">
          <div className="banner-inner">
            {/* Left accent bar */}
            <div className="accent-bar" style={{ background: accentColor }} />

            {/* Card content */}
            <div className="banner-content">

              {/* Top row: status badge + date */}
              <div className="top-row">
                <span className="badge" style={badgeStyle}>
                  <span className="badge-dot" />
                  {badgeLabel}
                </span>

                <span className="date-label">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  {formattedDate}
                </span>
              </div>

              {/* Main row */}
              <div className="main-row">

                {/* Left: title, description, stats */}
                <div className="left-section">
                  <div className="quiz-title">{data?.quizname}</div>
                  <div className="quiz-desc">{data?.description}</div>

                  <div className="stats-row">
                    {[
                      { label: "Time Schedule", value: formattedTime, unit: null },
                      { label: "Questions", value: data?.totalQuestions, unit: "items" },
                      { label: "Duration", value: data?.time_limit, unit: "mins" },
                    ].map(({ label, value, unit }) => (
                      <div key={label} className="stat-chip">
                        <div className="stat-label">{label}</div>
                        <div className="stat-value">
                          {value}{" "}
                          {unit && <span className="stat-unit">{unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: timer + CTA */}
                <div className="right-section">
                  {/* Timer */}
                  <div className="timer-box">
                    <div className="timer-label">
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="9" r="5.5" stroke="#7CA4C8" strokeWidth="1.5" />
                        <path d="M8 6v3l2 1.5" stroke="#7CA4C8" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 1h4" stroke="#7CA4C8" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {timerLabel}
                    </div>
                    <div className="timer-value">{timeLeft}</div>
                  </div>

                  {/* CTA Button */}
                  {status === "completed" && (
                    <button
                      className="cta-btn btn-completed"
                      onClick={() =>
                        navigate(`/leaderboard/`, {
                          state: { quizId: data.test_id, quizName: data.name },
                        })
                      }
                    >
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                        <polygon
                          points="10,2 12.6,7.4 18.5,8.3 14.2,12.5 15.2,18.4 10,15.7 4.8,18.4 5.8,12.5 1.5,8.3 7.4,7.4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                      </svg>
                      View Leaderboard
                    </button>
                  )}

                  {status === "live" && (
                    <button
                      className="cta-btn btn-live"
                      onClick={() => {
                        const start = new Date(data.Start_Time).getTime();
                        const end = start + data.time_limit * 60 * 1000;
                        const remainingTime = Math.max(0, end - Date.now());
                        navigate(`/Quiz/${data.test_id}`, {
                          state: { quizName: data.quizname, remainingTime },
                        });
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                        <polygon points="5,3 17,10 5,17" />
                      </svg>
                      Attempt Now
                    </button>
                  )}

                  {status === "upcoming" && (
                    <button disabled className="cta-btn btn-upcoming">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 6v3l1.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Not Started Yet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner;