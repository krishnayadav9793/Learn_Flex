import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Activity } from "lucide-react";

const getCellStyle = (count) => {
  if (!count)     return { bg: "#ede9e0", border: "rgba(0,0,0,0.05)"       };
  if (count < 3)  return { bg: "#c8dff7", border: "rgba(74,144,217,0.2)"   };
  if (count < 6)  return { bg: "#90bfee", border: "rgba(74,144,217,0.3)"   };
  if (count < 10) return { bg: "#4a90d9", border: "rgba(30,90,180,0.25)"   };
  return            { bg: "#1d5fad", border: "rgba(20,60,140,0.3)"         };
};

const formatLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const SHOW_ROW    = new Set([0, 1, 2, 3, 4, 5, 6]);

const CELL = 13;
const GAP  = 4;

function buildMonths(year) {
  return MONTH_NAMES.map((name, m) => {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const weeks = [];
    let week = new Array(7).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const d   = new Date(year, m, day);
      const dow = d.getDay(); // 0=Sun … 6=Sat
      week[dow] = { date: formatLocal(d), dayOfMonth: day };

      if (dow === 6 || day === daysInMonth) {
        weeks.push([...week]);
        week = new Array(7).fill(null);
      }
    }
    return { name, weeks };
  });
}

export default function Heatmap() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState([]);
  const [rating ,setRating] =useState(0);

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("http://localhost:3000/dc/heatmap", { credentials: "include" });
        const json = await res.json();
        setData(json.heatmap || []);
        setRating(json.rating || 0);
      } catch (e) { 
        console.error("Failed to fetch heatmap data", e); 
      }
    })();
  }, [year]);

  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach((d) => {
      map.set(d.submission_date.slice(0, 10), Number(d.count || 0));
    });
    return map;
  }, [data]);

  const months = useMemo(() => buildMonths(year), [year]);

  // STREAK TRACKING (Fixed Backtracking)
  const streak = useMemo(() => {
    if (!data.length) return 0;

    // 1. Ensure we only store the "YYYY-MM-DD" portion in our set to match formatLocal
    const set = new Set(data.map((d) => d.submission_date.slice(0, 10)));
    
    let count = 0;
    let curr = new Date();
    
    // 2. If there's no submission today, check if there was one yesterday.
    // If not, the streak is 0 and the loop won't run.
    if (!set.has(formatLocal(curr))) {
      curr.setDate(curr.getDate() - 1);
    }
    
    // 3. Backtrack continuously backwards counting the active streak
    while (set.has(formatLocal(curr))) { 
      count++; 
      curr.setDate(curr.getDate() - 1); 
    }
    
    return count;
  }, [data]);

  const btnBase = {
    background: "none", border: "none", cursor: "pointer",
    padding: "5px 7px", borderRadius: 7, color: "#94a3b8", display: "flex", alignItems: "center",
  };

  return (
    <div style={{
      maxWidth: "100%", margin: "2.5rem auto", padding: 28,
      background: "#faf9f6", border: "1px solid #e8e4dc", borderRadius: 20,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ background:"#e8f0fb", borderRadius:11, padding:9, display:"flex" }}>
            <Activity style={{ color:"#4a90d9" }} size={18} />
          </div>
          <div>
            <div style={{ color:"#1e293b", fontSize:17, fontWeight:700, letterSpacing:"-0.2px" }}>Activity Heatmap</div>
            <div style={{ color:"#94a3b8", fontSize:11, marginTop:2, fontWeight:500 }}>{year} Contribution Graph</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:1, background:"#f1ede6", border:"1px solid #e2dbd0", borderRadius:10, padding:3 }}>
          <button style={btnBase} onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>
          <span style={{ fontWeight:700, color:"#334155", width:40, textAlign:"center", fontSize:13 }}>{year}</span>
          <button style={{ ...btnBase, opacity: year >= currentYear ? 0.3 : 1 }} disabled={year >= currentYear} onClick={() => setYear((y) => y + 1)}>
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* HEATMAP */}
      <div style={{ overflowX:"auto", paddingBottom:6 }}>
        <div style={{ display:"flex", alignItems:"flex-start", minWidth:"max-content" }}>

          {/* DAY-OF-WEEK LABELS */}
          <div style={{
            display:"grid",
            gridTemplateRows:`16px repeat(7,${CELL}px)`,
            rowGap:`${GAP}px`,
            flexShrink:0, marginRight:5,
          }}>
            <div style={{ height:16 }} />
            {DAY_LABELS.map((lbl, i) => (
              <div key={lbl} style={{
                height:CELL, display:"flex", alignItems:"center",
                justifyContent:"flex-end", paddingRight:5,
                fontSize:10, fontWeight:600, color:"#b0aa9e",
                opacity: SHOW_ROW.has(i) ? 1 : 0,
                whiteSpace:"nowrap", width:26,
              }}>
                {lbl}
              </div>
            ))}
          </div>

          {/* MONTH GROUPS */}
          <div style={{ display:"flex", gap:6 }}>
            {months.map(({ name, weeks }) => (
              <div key={name} style={{ display:"flex", flexDirection:"column" }}>
                <div style={{ height:16, display:"flex", alignItems:"flex-end", paddingBottom:1 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:"#b0aa9e", letterSpacing:"0.03em" }}>
                    {name}
                  </span>
                </div>
                <div style={{ display:"flex", gap:GAP }}>
                  {weeks.map((week, wi) => (
                    <div key={wi} style={{ display:"flex", flexDirection:"column", gap:GAP, width:CELL, flexShrink:0 }}>
                      {week.map((day, di) => {
                        if (!day) return <div key={`e-${di}`} style={{ width:CELL, height:CELL }} />;
                        const count = dataMap.get(day.date) || 0;
                        const { bg, border } = getCellStyle(count);
                        return (
                          <div
                            key={day.date}
                            title={`${day.date}: ${count} submissions`}
                            style={{
                              width:CELL, height:CELL, borderRadius:3,
                              background:bg, border:`0.5px solid ${border}`,
                              cursor:"pointer", transition:"transform .12s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform="scale(1.4)"; e.currentTarget.style.zIndex=10; e.currentTarget.style.position="relative"; }}
                            onMouseLeave={(e)  => { e.currentTarget.style.transform="scale(1)";   e.currentTarget.style.zIndex=1; }}
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

      {/* FOOTER */}
      <div style={{
        marginTop:18, paddingTop:16, borderTop:"1px solid #ede9e0",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:12,
      }}>
        <div style={{
          display:"flex", alignItems:"center", gap:9,
          background:"#fff8f1", border:"1px solid #fddcbb", borderRadius:11, padding:"8px 14px",
        }}>
          <Flame style={{ color:"#f97316" }} size={16} fill="#f97316" />
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#c2410c", textTransform:"uppercase", letterSpacing:".06em", marginBottom:2 }}>
              Current Streak
            </div>
            <div style={{ fontSize:13, fontWeight:800, color:"#ea580c" }}>
              {streak} {streak === 1 ? "Day" : "Days"}
            </div>
          </div>
        </div>

        <div style={{
          display:"flex", alignItems:"center", gap:9,
          background:"#fff8f1", border:"1px solid #fddcbb", borderRadius:11, padding:"8px 14px",
        }}>
          <Flame style={{ color:"#f97316" }} size={16} fill="#f97316" />
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#c2410c", textTransform:"uppercase", letterSpacing:".06em", marginBottom:2 }}>
              Rating 
            </div>
            <div style={{ fontSize:13, fontWeight:800, color:"#ea580c" }}>
              {rating} 
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#b0aa9e", textTransform:"uppercase", letterSpacing:".05em" }}>Less</span>
          <div style={{ display:"flex", gap:3 }}>
            {[0, 1, 4, 7, 11].map((v, i) => {
              const { bg, border } = getCellStyle(v);
              return <div key={i} style={{ width:13, height:13, borderRadius:3, background:bg, border:`0.5px solid ${border}` }} />;
            })}
          </div>
          <span style={{ fontSize:10, fontWeight:700, color:"#b0aa9e", textTransform:"uppercase", letterSpacing:".05em" }}>More</span>
        </div>
      </div>
    </div>
  );
}