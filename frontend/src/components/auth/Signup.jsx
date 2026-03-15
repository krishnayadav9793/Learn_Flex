import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ArrowRight, Brain, Sparkles, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { redirect, replace, useNavigate } from 'react-router-dom';

/**
 * AnimatedBackground Component
 * Renders a canvas with floating quiz-related symbols that drift and react to mouse movement.
 */
const AnimatedBackground = () => {

  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Symbols appropriate for a quiz site
    const symbols = ['?', '!', '∑', 'π', 'A', 'B', 'C', '√', '%', '{ }'];
    const colors = ['#818cf8', '#c084fc', '#f472b6', '#22d3ee']; // Tailwind indigo, purple, pink, cyan

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 20 + 10; // 10px to 30px
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

        // Wrap around screen
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
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 20000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a'); // Slate 900
      gradient.addColorStop(1, '#1e1b4b'); // Indigo 950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
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
 * AuthCard Component
 * Handles Signup form with glassmorphism effects.
 */
const AuthCard = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [passwordInstruction,setPasswordInstruction]=useState(null);
  const [statusMsg, setStatusMsg] = useState("Please fill in all fields correctly.");

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    // console.log(e.target.value);
    
    console.log(name, email, password)
    const data = { name: name, email: email, password: password }


    
    try {
      const res = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const resData = await res.json();
      console.log(resData);

      if (!res.ok) {
        setStatusMsg(resData.msg || "Signup failed.");
        setStatus("error");
        setIsLoading(false);
        return;
      }

      setStatus("success");
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      console.log("error:", err)
      setStatusMsg("Unable to connect to server.");
      setStatus("error");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-1 relative z-10 mx-4">
      {/* Glow effect behind the card */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>

      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">

        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">QuizMaster</h1>
          <p className="text-slate-400 text-sm">
            Join the challenge. Unlock your potential.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">

          {/* Name Input */}
          <div className="space-y-2 animate-fadeIn">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">
              Full Name
            </label>
            <div className={`relative group transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-violet-400' : 'text-slate-500'}`} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-violet-400' : 'text-slate-500'}`} />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-violet-400' : 'text-slate-500'}`} />
              </div>
              <input
                
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Status Messages */}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 animate-fadeIn">
              <AlertCircle className="w-4 h-4" />
              <span>
                {statusMsg}
              </span>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Account created successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || status === 'success'}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
          </button>

          {/* Already have an account link */}
          <p className="text-center text-slate-500 text-sm mt-4">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-violet-400 font-medium hover:text-violet-300 hover:underline transition-all"
            >
              Log in
            </a>
          </p>
        </form>

        {/* Decorative bottom bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600"></div>
      </div>
    </div>
  );
};

/**
 * App Component
 * Combines the background and the login card.
 */
export default function Signup() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center justify-center selection:bg-violet-500/30">
      <AnimatedBackground />
      <AuthCard />

      {/* Additional interactive decorative elements */}
      <div className="absolute bottom-4 right-4 text-slate-600/30 text-xs flex items-center gap-1 select-none pointer-events-none">
        <Sparkles className="w-3 h-3" />
        <span>Powered by Knowledge</span>
      </div>
    </div>
  );
}
