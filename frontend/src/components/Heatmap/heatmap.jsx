import { useState } from "react";
import "./heatmap.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toKey = (d) => d.toISOString().slice(0, 10);
const TODAY_KEY = toKey(new Date());

/**
 * Build months. Each month has weeks, each week has 7 slots (Sun→Sat).
 * Slots before the 1st or after today are null (empty spacers).
 */
function buildMonths() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = [];

  for (let offset = 11; offset >= 0; offset--) {
    const ref   = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const year  = ref.getFullYear();
    const month = ref.getMonth();

    // All days of this month up to today
    const allDays = [];
    const cursor = new Date(year, month, 1);
    while (cursor.getMonth() === month) {
      allDays.push({ key: toKey(cursor), dayNum: cursor.getDate(), dow: cursor.getDay() });
      cursor.setDate(cursor.getDate() + 1);
    }
    if (allDays.length === 0) continue;

    // Chunk into weeks (columns of 7 rows: index 0=Sun … 6=Sat)
    // Pad the first week with nulls for days before the 1st
    const weeks = [];
    let week = new Array(allDays[0].dow).fill(null); // leading nulls

    allDays.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    // Pad the last partial week
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    months.push({
      label: ref.toLocaleString("default", { month: "short" }).toUpperCase(),
      year,
      month,
      weeks,
    });
  }

  return months;
}

function computeStats(months, completedSet) {
  let maxStreak = 0, curStreak = 0;
  months.forEach(({ weeks }) => {
    weeks.flat().forEach((day) => {
      if (!day) return;
      if (completedSet.has(day.key)) { curStreak++; maxStreak = Math.max(maxStreak, curStreak); }
      else curStreak = 0;
    });
  });
  return { maxStreak };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChallengeHeatmap({
  completedDays = new Set(),
  title = "Daily Challenge Streak",
}) {
  const months = buildMonths();
  const stats  = computeStats(months, completedDays);
  const [tooltip, setTooltip] = useState(null);

  return (
    <>
      <div className="chm-root">

        {/* ── Header ── */}
        <div className="chm-header">
          <div className="chm-title-block">
            <span className="chm-count">{completedDays.size}</span>
            <span className="chm-subtitle">{title} · past year</span>
          </div>
          <div className="chm-stats">
            <div className="chm-stat">
              <div className="chm-stat-label">Active Days</div>
              <div className="chm-stat-value">{completedDays.size}</div>
            </div>
            <div className="chm-divider" />
            <div className="chm-stat">
              <div className="chm-stat-label">Max Streak</div>
              <div className="chm-stat-value">{stats.maxStreak}</div>
            </div>
          </div>
        </div>

        {/* ── Scroll area ── */}
        <div className="chm-scroll-wrap">
          <div className="chm-grid">

            {months.map(({ label, year, month, weeks }, mi) => (
              <div key={`${year}-${month}`} className="chm-month-block">

                {/* Month label spans all its week-columns */}
                <div className="chm-month-label">{label}</div>

                {/* Week columns — each column = 7 rows (Sun–Sat) */}
                <div className="chm-weeks-row">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="chm-week-col">
                      {week.map((day, di) => {
                        if (!day) {
                          // Empty spacer — preserves alignment
                          return <div key={di} className="chm-cell chm-cell--spacer" />;
                        }

                        const done    = completedDays.has(day.key);
                        const isToday = day.key === TODAY_KEY;

                        let cls = "chm-cell";
                        cls += done ? " chm-cell--filled" : " chm-cell--empty";
                        if (isToday) cls += " chm-cell--today";

                        return (
                          <div
                            key={day.key}
                            className={cls}
                            onMouseEnter={(e) =>
                              setTooltip({ key: day.key, done, dayNum: day.dayNum, label, x: e.clientX, y: e.clientY })
                            }
                            onMouseLeave={() => setTooltip(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>
            ))}

          </div>
        </div>

      </div>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div className="chm-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.done ? "✅ Challenge completed" : "Not completed"}
          <span className="chm-tooltip-date">
            {tooltip.label} {tooltip.dayNum} — {tooltip.key}
          </span>
        </div>
      )}
    </>
  );
}