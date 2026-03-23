import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Flame,
  Brain,
  Settings,
  User,
  Mail,
  LogOut,
  Bell,
  Shield,
  ChevronRight,
  Edit3,
  Sparkles,
} from "lucide-react";

import Heatmap from "../Heatmap/heatmap";

const dummyData = [
  { date: "2026-03-18", count: 1 },
  { date: "2026-03-19", count: 1 },
  { date: "2026-03-20", count: 1 },
];

/**
 * AnimatedBackground Component
 * Renders the same floating symbol background to maintain theme consistency.
 */
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const symbols = ["?", "!", "∑", "π", "A", "B", "C", "√", "%", "{ }"];
    const colors = ["#818cf8", "#c084fc", "#f472b6", "#22d3ee"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 20 + 10;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x > canvas.width + 50) this.x = -50;
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.y > canvas.height + 50) this.y = -50;
        if (this.y < -50) this.y = canvas.height + 50;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `bold ${this.size}px sans-serif`;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillText(this.symbol, -this.size / 2, -this.size / 2);
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(
        (window.innerWidth * window.innerHeight) / 20000,
      );
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

/**
 * StatCard Component
 * Reusable card for displaying specific stats (Rank, Questions, Streak).
 */
const StatCard = ({ icon: Icon, label, value, subtext, colorClass, delay }) => (
  <div
    className={`bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:bg-slate-800/40 transition-all duration-300 hover:-translate-y-1 animate-fadeIn`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}
    >
      <Icon className="w-24 h-24" />
    </div>

    <div className="relative z-10">
      <div
        className={`w-12 h-12 rounded-xl ${colorClass} bg-opacity-20 flex items-center justify-center mb-4 border border-white/10`}
      >
        <Icon
          className={`w-6 h-6 ${colorClass.replace("bg-", "text-").replace("/20", "")}`}
        />
      </div>
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
        {label}
      </h3>
      <div className="text-3xl font-bold text-white mt-1">{value}</div>
      {subtext && (
        <div className="text-xs text-slate-500 mt-2 font-medium">{subtext}</div>
      )}
    </div>
  </div>
);

/**
 * SettingsPanel Component
 * A slide-over panel for settings.
 */
const SettingsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-400" /> Settings
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Account
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-white font-medium">Edit Profile</div>
                  <div className="text-xs text-slate-500">
                    Change name, avatar
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="text-white font-medium">
                    Privacy & Security
                  </div>
                  <div className="text-xs text-slate-500">Password, 2FA</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Preferences
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Bell size={18} />
                </div>
                <div>
                  <div className="text-white font-medium">Notifications</div>
                  <div className="text-xs text-slate-500">
                    Email digests, alerts
                  </div>
                </div>
              </div>
              <div className="w-10 h-5 bg-violet-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-slate-900/50">
          <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Dashboard Component
 */
const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const safeUser = user && typeof user === "object" ? user : {};
  const displayName = safeUser.name || "Learner";
  const displayEmail = safeUser.email || "learner@learnflex.app";
  const displayRating = safeUser.rating ?? 0;
  const displayStreak = safeUser.streak ?? 0;
  const displayQuestions = safeUser.questions ?? 0;

  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const names = displayName.split(" ")[0]?.[0]?.toUpperCase() || "L";
  // Mock User Data
  //   const user = {
  //     name: "Alex Johnson",
  //     email: "alex.j@quizmaster.com",
  //     rank: 42,
  //     questionsSolved: 1258,
  //     streak: 14,
  //     level: "Quiz Wizard"
  //   };

  return (
    <div className="relative min-h-screen w-full font-sans text-slate-200 selection:bg-violet-500/30 overflow-x-hidden">
      <AnimatedBackground />

      {/* Settings Modal Overlay */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full bg-slate-900/70 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
            QuizMaster
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-300">Online</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <Settings className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {names}
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slideDown">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back,{" "}
              <span className="text-violet-400 font-medium">{displayName}</span>
              . You're on fire today!
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2">
              <Sparkles size={18} /> New Quiz
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8 animate-fadeIn">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/10 group-hover:opacity-75 transition-opacity"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[3px] mb-4 shadow-2xl shadow-violet-500/20">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    <User className="w-12 h-12 text-slate-400" />
                    {/* Placeholder for avatar image */}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                  <Mail className="w-3.5 h-3.5" /> {displayEmail}
                </div>

                <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-white/5 mb-6">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-400">Current Level</span>
                    <span className="text-violet-400 font-bold">
                      {displayRating}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full w-[75%] rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)]"></div>
                  </div>
                  <div className="text-right text-xs text-slate-500 mt-1">
                    750 / 1000 XP
                  </div>
                </div>

                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              </div>
            </div>

            {/* Daily Quote / Mini Card */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-2xl p-6 relative">
              <div className="text-indigo-400 mb-2">
                <Sparkles size={20} />
              </div>
              <p className="text-slate-300 italic text-sm">
                "YOU HAVE TO TRUST TO BUILD TRUST"
              </p>
              <p className="text-slate-500 text-xs mt-2 font-medium">
                — DISHANT MARCHANT
              </p>
            </div>
          </div>

          {/* Right Column: Stats Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Trophy}
                label="Global Rank"
                value={`#${displayRating}`}
                subtext="Top 5% of users"
                colorClass="bg-amber-500 text-amber-500"
                delay={100}
              />

              <StatCard
                icon={Brain}
                label="Questions"
                value={displayQuestions}
                subtext="Total Solved"
                colorClass="bg-cyan-500 text-cyan-500"
                delay={300}
              />
            </div>

            {/* Recent Activity / Detailed Chart Section */}
           <div >

              <Heatmap data={dummyData} />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App({ user }) {
  return <Dashboard user={user} />;
}
