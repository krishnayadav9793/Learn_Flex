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
  BookOpen
} from "lucide-react";



const Dashboard = () => {
  const [examData, setExamData] = useState({});
  const [selectedExam, setSelectedExam] = useState("");
  const currentTopics = examData[selectedExam]?.subjects || [];

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch("http://localhost:3000/exam/subjects", {
          method: "GET",
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

        {/* TOP SECTION: PROFILE & HEATMAP */}
        <div >

          {/* RIGHT: HEATMAP (Span 8) */}
          <div className="lg:col-span-8">
            <SimpleYearlyHeatmap />
          </div>
        </div>


        <section className="space-y-6 font-sans">
          <div className="flex items-end justify-between px-1">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[#0B2447]">
                Analysis by Subject
              </h3>
              <p className="text-[#0B2447]/50 text-[12px] font-bold uppercase tracking-widest mt-1.5">
                Check the number of questions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentTopics.length > 0 ? (
              currentTopics.map((topic, index) => (
                <div
                  key={index}
                  className="group bg-white border-2 border-[#E1EFFF] p-5 rounded-[1.5rem] hover:border-[#0B2447] hover:bg-[#FAF8F5] transition-colors duration-200 cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    {/* Flat Icon Container */}
                    <div className="w-12 h-12 bg-[#E1EFFF] group-hover:bg-[#0B2447] transition-colors duration-200 rounded-xl flex items-center justify-center mb-4">
                      <BookOpen size={22} className="text-[#0B2447] group-hover:text-white transition-colors duration-200" />
                    </div>

                    <h4 className="font-bold text-[15px] text-[#0B2447] mb-4 line-clamp-2 leading-snug">
                      {topic}
                    </h4>
                  </div>

                  {/* Flat Progress Bar */}
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="h-1.5 flex-grow bg-[#E1EFFF] group-hover:bg-white rounded-full overflow-hidden transition-colors duration-200">
                      <div className="h-full bg-[#0B2447] w-1/3"></div>
                    </div>
                    <span className="text-[11px] font-black text-[#0B2447]/50 group-hover:text-[#0B2447] transition-colors duration-200">
                      30%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              /* Flat Skeleton Loading State */
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[160px] bg-[#FAF8F5] border-2 border-[#E1EFFF] rounded-[1.5rem] animate-pulse"
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