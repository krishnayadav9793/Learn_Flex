import React from "react";

const Footer = () => {

  const FooterLink = ({ children }) => (
    <li className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-white cursor-pointer transition-colors">
      <span className="text-slate-600 text-[10px] transition-transform group-hover:translate-x-0.5">›</span>
      {children}
    </li>
  );

  const SocialBtn = ({ label, icon }) => (
    <a
      title={label}
      className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:bg-indigo-600/30 hover:border-indigo-500/50 hover:text-white hover:-translate-y-1 transition-all cursor-pointer text-sm"
    >
      {icon}
    </a>
  );

  return (
    <footer className="bg-slate-900 mt-20 rounded-t-[40px] px-8 pt-12 pb-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-white/[0.06]">

          {/* Brand */}
          <div>
            <div className="text-2xl font-black tracking-tighter text-indigo-500 mb-3">
              Learn<span className="text-white">Flex</span>
            </div>

            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[230px] mb-5">
              An adaptive learning platform helping students master competitive exams through daily challenges and real-time battles.
            </p>

            <div className="flex gap-2">
              <SocialBtn label="Twitter" icon="𝕏" />
              <SocialBtn label="Instagram" icon="📸" />
              <SocialBtn label="YouTube" icon="▶" />
              <SocialBtn label="Telegram" icon="✈" />
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[.1em] uppercase text-slate-500 mb-4">
              Platform
            </h4>

            <ul className="flex flex-col gap-2.5">
              {[
                "Daily Challenges",
                "Weekly Quizzes",
                "Practice Session",
                "1vs1 Battles",
                "Leaderboard"
              ].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[.1em] uppercase text-slate-500 mb-4">
              Exams
            </h4>

            <ul className="flex flex-col gap-2.5">
              {[
                "JEE Main",
                "JEE Advanced",
                "NEET-UG",
                "UPSC CSE",
                "GATE",
                "CAT"
              ].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[.1em] uppercase text-slate-500 mb-4">
              Company
            </h4>

            <ul className="flex flex-col gap-2.5 mb-5">
              {["About Us", "Careers", "Blog", "Support"].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </ul>

            <h4 className="text-[10px] font-bold tracking-[.1em] uppercase text-slate-500 mb-3">
              Contact
            </h4>

            <div className="flex flex-col gap-1.5 text-xs text-slate-500">
              <span>📧 hello@learnflex.in</span>
              <span>📍 Bangalore, India</span>
              <span>🕐 10AM – 6PM IST</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] text-slate-600">
            © 2026 LearnFlex Platform. All rights reserved.
          </p>

          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[11px] text-slate-600 hover:text-indigo-400 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          <p className="text-[11px] text-slate-600 flex items-center gap-1">
            Made with <span className="text-rose-500">♥</span> for Indian students
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;