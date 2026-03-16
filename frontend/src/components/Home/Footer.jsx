import React from "react";

const Footer = () => {

  const FooterLink = ({ children }) => (
    <li className="group flex items-center gap-1.5 text-[13px] text-blue-100/60 hover:text-amber-200 cursor-pointer transition-colors">
      <span className="text-blue-400 text-[10px] transition-transform group-hover:translate-x-0.5">›</span>
      {children}
    </li>
  );

  const SocialBtn = ({ label, icon }) => (
    <a
      title={label}
      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-100/60 hover:bg-amber-400/20 hover:border-amber-400/50 hover:text-amber-400 hover:-translate-y-1 transition-all cursor-pointer text-sm"
    >
      {icon}
    </a>
  );

  return (
    /* Background matches your Navy Hero section */
    <footer className="bg-[#001F3F] mt-20 rounded-t-[40px] px-8 pt-12 pb-6 overflow-hidden border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="max-w-6xl mx-auto">

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-white/[0.06]">

          {/* Brand & About */}
          <div>
            <div className="text-2xl font-black tracking-tighter text-white mb-3">
              Learn<span className="text-blue-400">Flex</span>
            </div>

            <p className="text-[13px] text-blue-100/50 leading-relaxed max-w-[230px] mb-6">
              Empowering students through adaptive learning, competitive challenges, and real-time exam simulations.
            </p>

            <div className="flex gap-2">
              <SocialBtn label="Twitter" icon="𝕏" />
              <SocialBtn label="Instagram" icon="📸" />
              <SocialBtn label="YouTube" icon="▶" />
              <SocialBtn label="Telegram" icon="✈" />
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-400/80 mb-5">
              Platform
            </h4>
            <ul className="flex flex-col gap-2.5">
              {["Daily Challenges", "Weekly Quizzes", "Practice Sessions", "1vs1 Battles", "Leaderboard"].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Exams Column */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-400/80 mb-5">
              Top Exams
            </h4>
            <ul className="flex flex-col gap-2.5">
              {["JEE Main", "NEET-UG", "UPSC CSE", "GATE", "CAT"].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Company & Contact */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-400/80 mb-5">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 mb-6">
              {["About Us", "Careers", "Support Center"].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </ul>

            <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-400/80 mb-3">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-2 text-xs text-blue-100/50">
              <span className="hover:text-white cursor-pointer transition-colors">📧 hello@learnflex.in</span>
              <span>📍 Bangalore, India</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[11px] text-blue-100/30">
            © 2026 LearnFlex Platform. Premium Education for Indian Aspirants.
          </p>

          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[11px] text-blue-100/30 hover:text-amber-400 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          <p className="text-[11px] text-blue-100/30 flex items-center gap-1 font-medium">
            Crafted with <span className="text-amber-500 animate-pulse">✦</span> for Students
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;