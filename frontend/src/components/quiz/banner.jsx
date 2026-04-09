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
    /* Outer centering wrapper — 90% width, centered */
    <div
      style={{
        width: "90%",
        margin: "0 auto",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "22px",
          border: "1px solid #E5E1D3",
          overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,31,63,0.09)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {/* Left accent bar */}
          <div style={{ width: "5px", flexShrink: 0, background: accentColor }} />

          {/* Card content */}
          <div style={{ flex: 1, padding: "1.4rem 1.5rem" }}>

            {/* Top row: status badge + date */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  ...badgeStyle,
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                {badgeLabel}
              </span>

              <span
                style={{
                  fontSize: "12px",
                  color: "#94A3B8",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {formattedDate}
              </span>
            </div>

            {/* Main row — stacks vertically on small screens */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              {/* Left: title, description, stats */}
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "clamp(15px, 2.5vw, 20px)",
                    fontWeight: 900,
                    color: "#001F3F",
                    letterSpacing: "-0.3px",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.quizname}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748B",
                    fontWeight: 600,
                    marginTop: "2px",
                    wordBreak: "break-word",
                  }}
                >
                  {data?.description}
                </div>

                {/* Stat chips — wrap naturally on small screens */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "Time Schedule", value: formattedTime, unit: null },
                    { label: "Questions", value: data?.totalQuestions, unit: "items" },
                    { label: "Duration", value: data?.time_limit, unit: "mins" },
                  ].map(({ label, value, unit }) => (
                    <div
                      key={label}
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #E5E1D3",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        flex: "1 1 70px",
                        minWidth: "70px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#94A3B8",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(13px, 2vw, 15px)",
                          fontWeight: 900,
                          color: "#001F3F",
                          marginTop: "2px",
                        }}
                      >
                        {value}{" "}
                        {unit && (
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94A3B8" }}>
                            {unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: timer + CTA */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "0.75rem",
                  flex: "0 1 150px",
                  minWidth: "130px",
                }}
              >
                {/* Timer */}
                <div
                  style={{
                    background: "#001F3F",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#7CA4C8",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="9" r="5.5" stroke="#7CA4C8" strokeWidth="1.5" />
                      <path d="M8 6v3l2 1.5" stroke="#7CA4C8" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M6 1h4" stroke="#7CA4C8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {timerLabel}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(16px, 3vw, 22px)",
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: "2px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {timeLeft}
                  </div>
                </div>

                {/* CTA Button */}
                {status === "completed" && (
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                      color: "#78350F",
                      fontSize: "13px",
                      fontWeight: 800,
                      padding: "11px 16px",
                      borderRadius: "14px",
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
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
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      background: "#001F3F",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 800,
      padding: "11px 16px",
      borderRadius: "14px",
      border: "none",
      cursor: "pointer",
      whiteSpace: "nowrap",
      width: "100%",
    }}
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
                  <button
                    disabled
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "#F1F5F9",
                      color: "#94A3B8",
                      fontSize: "13px",
                      fontWeight: 800,
                      padding: "11px 16px",
                      borderRadius: "14px",
                      border: "none",
                      cursor: "not-allowed",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
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
  );
};

export default Banner;
