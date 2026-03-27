import React, { useState, useMemo, useEffect } from "react";
import { Activity, Flame, ChevronLeft, ChevronRight } from "lucide-react";

// Helper to format date to YYYY-MM-DD
const toKey = (d) => d.toISOString().slice(0, 10);
const TODAY_KEY = toKey(new Date());

function buildMonths(selectedYear) {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const firstDayOfMonth = new Date(selectedYear, m, 1);
    const label = firstDayOfMonth.toLocaleString("default", { month: "short" });
    const allDays = [];
    const cursor = new Date(selectedYear, m, 1);

    while (cursor.getMonth() === m) {
      allDays.push({
        key: toKey(cursor),
        dow: cursor.getDay(), // 0 (Sun) to 6 (Sat)
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeks = [];
    // Start the first week with nulls for empty days
    let week = new Array(allDays[0].dow).fill(null);

    allDays.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    months.push({ label, weeks });
  }
  return months;
}

// Logic to calculate streak based on the total data, not just the filtered view
const calculateStreak = (allData) => {
  const map = new Set(allData.map(item => toKey(new Date(item.challenge_date))));
  let streak = 0;
  let curr = new Date();
  curr.setHours(0, 0, 0, 0);

  // If today is empty, check yesterday to keep streak alive
  if (!map.has(toKey(curr))) {
    curr.setDate(curr.getDate() - 1);
  }

  while (map.has(toKey(curr))) {
    streak++;
    curr.setDate(curr.getDate() - 1);
  }
  return streak;
};

export default function SimpleYearlyHeatmap() {
  const currentFullYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentFullYear);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        // Replace with your actual API endpoint
        const res = await fetch("http://localhost:3000/dc/heatmap", {
          credentials: "include"
        });
        const data = await res.json();
        setHeatmapData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchHeatmap();
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map();
    heatmapData.forEach((item) => {
      const d = new Date(item.challenge_date);
      if (d.getFullYear() === selectedYear) {
        map.set(toKey(d), true);
      }
    });
    return map;
  }, [heatmapData, selectedYear]);

  const months = useMemo(() => buildMonths(selectedYear), [selectedYear]);
  const currentStreak = useMemo(() => calculateStreak(heatmapData), [heatmapData]);

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "2rem auto",
      backgroundColor: "#FCFBF4",
      border: "1px solid #E5E2D0",
      borderRadius: "1.5rem",
      padding: "2rem",
      fontFamily: "sans-serif",
      color: "#0B2447"
    }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Activity size={24} color="#0B2447" />
          <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Activity Radar</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button 
            onClick={() => setSelectedYear(y => y - 1)}
            style={navButtonStyle}
          >
            <ChevronLeft size={20} />
          </button>

          <span style={{ fontWeight: "bold", minWidth: "3rem", textAlign: "center" }}>
            {selectedYear}
          </span>

          <button
            onClick={() => setSelectedYear(y => y + 1)}
            disabled={selectedYear >= currentFullYear}
            style={{...navButtonStyle, opacity: selectedYear >= currentFullYear ? 0.3 : 1}}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* GRID CONTAINER - Wrapped for scrollability on small screens */}
      <div style={{ overflowX: "auto", paddingBottom: "1rem" }}>
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          minWidth: "max-content", // Prevents crushing the grid
          justifyContent: "space-between" 
        }}>
          {months.map((m, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ 
                textAlign: "left", 
                fontSize: "11px", 
                marginBottom: "8px", 
                color: "#666",
                fontWeight: "600"
              }}>
                {m.label}
              </div>

              <div style={{ display: "flex", gap: "4px" }}>
                {m.weeks.map((week, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {week.map((day, di) => {
                      if (!day) return <div key={di} style={{ width: 12, height: 12 }} />;
                      
                      const hasData = dataMap.has(day.key);
                      const isToday = day.key === TODAY_KEY;

                      return (
                        <div
                          key={day.key}
                          title={day.key}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "2px",
                            backgroundColor: hasData ? "#0B2447" : "rgba(11,36,71,0.08)",
                            outline: isToday ? "2px solid #FF8A00" : "none",
                            outlineOffset: "1px",
                            transition: "transform 0.1s",
                            cursor: "pointer"
                          }}
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

      {/* FOOTER */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid #E5E2D0", paddingTop: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Flame size={20} fill="#FF8A00" color="#FF8A00" />
          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            {currentStreak} Day Streak
          </span>
        </div>
      </div>
    </div>
  );
}

const navButtonStyle = {
  background: "none",
  border: "1px solid #E5E2D0",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  color: "#0B2447"
};