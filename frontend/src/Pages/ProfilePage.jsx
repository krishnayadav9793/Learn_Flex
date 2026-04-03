import React from "react";
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

const dummyData = [
  { challenge_date: "2026-03-10" },
  { challenge_date: "2026-03-12" },
  { challenge_date: "2026-03-24" },
];

const subjects = [
  { icon: Atom, label: "Physics", percentage: 72, solved: 420, color: "bg-purple-50", text: "text-purple-600" },
  { icon: FlaskConical, label: "Chemistry", percentage: 85, solved: 510, color: "bg-emerald-50", text: "text-emerald-600" },
  { icon: PieChart, label: "Mathematics", percentage: 58, solved: 354, color: "bg-blue-50", text: "text-blue-600" },
  { icon: BookOpen, label: "Biology", percentage: 30, solved: 120, color: "bg-rose-50", text: "text-rose-600" },
];

const Dashboard = () => {
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

        {/* BOTTOM SECTION: PRACTICE BY SUBJECT */}
        <section className="space-y-14">
          <div className="flex items-end justify-between px-2">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-[#0B2447]">Analysis Subject</h3>
              <p className="text-slate-400 text-sm mt-1 font-medium">Deep dive into specific topics and track mastery</p>
            </div>
            <Trophy size={28} className="text-amber-500 opacity-50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="group bg-[#FCFBF4] border border-[#E5E2D0] p-7 rounded-[2.5rem] hover:bg-[#0B2447] hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-900/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 ${subject.color} rounded-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:rotate-6 transition-all`}>
                    <subject.icon size={26} className={`${subject.text} group-hover:text-white`} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-slate-400/50">Solved</p>
                    <p className="text-lg font-black text-[#0B2447] group-hover:text-white">{subject.solved}</p>
                  </div>
                </div>

                <h4 className="font-bold text-xl text-[#0B2447] group-hover:text-white transition-colors mb-4">
                  {subject.label}
                </h4>

                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-[#E5E2D0] rounded-full overflow-hidden group-hover:bg-white/10">
                    <div 
                      className="h-full bg-[#0B2447] group-hover:bg-[#BAD7F5] transition-all duration-1000" 
                      style={{ width: `${subject.percentage}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest group-hover:text-sky-300">
                      {subject.percentage}% Mastered
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;