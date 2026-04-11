import React, { useState, useEffect } from "react";
import Navbar from "../components/profile/Navbar";
import SimpleYearlyHeatmap from "../components/Heatmap/heatmap";
import {
  Atom,
  FlaskConical,
  PieChart,
  ShieldCheck,
  ArrowRight,
  Trophy,
  BookOpen,
  Activity
} from "lucide-react";

const Dashboard = () => {
  const [examData, setExamData] = useState({});
  const [selectedExam, setSelectedExam] = useState("");
  const [analysis, setAnalysis] = useState([]); // 🔥 Added analysis state

  // Filter analysis data for the currently selected exam
  const currentAnalysis = analysis.filter(item => item.exam_name === selectedExam);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch("https://learn-flex-puce.vercel.app/exam/subjects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });

        const data = await res.json();

        const formatted = {};
        data.forEach((row) => {
          if (!formatted[row.exam_name]) {
            formatted[row.exam_name] = {
              id: row.exam_id,
              subjects: [],
            };
          }

          if (
            row.subject_name &&
            !formatted[row.exam_name].subjects.includes(row.subject_name)
          ) {
            formatted[row.exam_name].subjects.push(row.subject_name);
          }
        });

        setExamData(formatted);
        setAnalysis(data); // 🔥 Save raw data for performance mapping

        const savedExamId = localStorage.getItem("examId");

        const examName =
          Object.keys(formatted).find(
            (key) => formatted[key].id == savedExamId
          ) || Object.keys(formatted)[0];

        if (examName) setSelectedExam(examName);

      } catch (error) {
        console.log(error.message);
      }
    };

    fetchExam();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-[#0B2447]">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">

        {/* TOP SECTION: HEATMAP */}
        <div>
          {/* HEATMAP (Span 8) */}
          <div className="lg:col-span-8">
            <SimpleYearlyHeatmap />
          </div>
        </div>

        {/* SUBJECT ANALYSIS SECTION - FLAT THEME */}
        <section className="space-y-6 font-sans">
          <div className="flex items-end justify-between px-1">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[#0B2447]">
                Analysis by Subject
              </h3>
              <p className="text-[#0B2447]/50 text-[12px] font-bold uppercase tracking-widest mt-1.5">
                Performance breakdown
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentAnalysis.length > 0 ? (
              currentAnalysis.map((sub, index) => {
                const accuracy = Number(sub.accuracy || 0);

                // Flat theme configuration based on accuracy score
                let statusConfig = { text: "Weak", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500" };
                if (accuracy >= 80) statusConfig = { text: "Strong", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" };
                else if (accuracy >= 50) statusConfig = { text: "Average", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500" };

                return (
                  <div
                    key={index}
                    className="group bg-white border-2 border-[#E1EFFF] p-6 rounded-[1.5rem] hover:border-[#0B2447] hover:bg-[#FAF8F5] transition-colors duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#E1EFFF] group-hover:bg-[#0B2447] transition-colors duration-200 rounded-xl flex items-center justify-center">
                          <Activity size={22} className="text-[#0B2447] group-hover:text-white transition-colors duration-200" />
                        </div>
                        <h4 className="font-bold text-[17px] text-[#0B2447] leading-snug">
                          {sub.subject_name}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        {statusConfig.text}
                      </span>
                    </div>

                    {/* Stats Boxes */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-[#FAF8F5] p-3 rounded-xl border-2 border-[#E1EFFF] group-hover:border-[#0B2447]/20 transition-colors duration-200">
                        <p className="text-[#0B2447]/50 text-[10px] font-black uppercase tracking-widest mb-1">Attempted</p>
                        <p className="text-lg font-bold text-[#0B2447]">{sub.attempted || 0}</p>
                      </div>
                      <div className="bg-[#FAF8F5] p-3 rounded-xl border-2 border-[#E1EFFF] group-hover:border-[#0B2447]/20 transition-colors duration-200">
                        <p className="text-[#0B2447]/50 text-[10px] font-black uppercase tracking-widest mb-1">Correct</p>
                        <p className="text-lg font-bold text-[#0B2447]">{sub.correct || 0}</p>
                      </div>
                    </div>

                    {/* Flat Progress Bar */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-black text-[#0B2447]/50 uppercase tracking-widest group-hover:text-[#0B2447] transition-colors">Accuracy</span>
                        <span className="text-[13px] font-black text-[#0B2447]">{accuracy}%</span>
                      </div>
                      <div className="h-1.5 flex-grow bg-[#E1EFFF] group-hover:bg-white rounded-full overflow-hidden transition-colors duration-200">
                        <div className={`h-full ${statusConfig.bar}`} style={{ width: `${accuracy}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Flat Skeleton Loading State */
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[220px] bg-[#FAF8F5] border-2 border-[#E1EFFF] rounded-[1.5rem] animate-pulse"
                />
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;