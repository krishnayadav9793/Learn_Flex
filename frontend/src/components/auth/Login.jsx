import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ArrowRight, Brain, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { redirect ,useNavigate} from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
/**
 * AnimatedBackground Component
 * Renders a canvas with floating quiz-related symbols that drift and react to mouse movement.
 */
const AnimatedBackground = () => {
  const navigate=useNavigate();
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Symbols appropriate for a quiz site
    const symbols = ['?', '!', '∑', 'π', 'A', 'B', 'C', '√', '%', '{ }'];
    const colors = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa']; // Tailwind indigo, purple, pink, cyan

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
      gradient.addColorStop(0, '#f0f9ff'); // Sky 50 (Very light blue)
      gradient.addColorStop(1, '#e0f2fe'); // Sky 100
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
 * LoginCard Component
 * The main form UI with glassmorphism effects.
 */

const LoginCard = () => {
  const navigate=useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusMsg,setStatusMsg]=useState("Invalid Details");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    const data = {  email: email, password: password }
    
    try {
      const res = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const resData = await res.json();
      console.log(resData.msg)
    //   setTimeout(() => {
    //   setIsLoading(false);
    //   if (email && password.length > 5) {
    //     setStatus('success');
    //   } else {
    //     setStatus('error');
    //   }
    // }, 1500);
      if(resData.msg==="Invalid email" || resData.msg==="Wrong password"){
        setStatusMsg(resData.msg)
        setTimeout(()=>{
          setIsLoading(false)
          setStatus('error')
        },1500)
        setStatus('')
        
      }else{
        navigate("/profile")
      }
      
    } catch (err) {
      console.log("error:", err)
    }
    
    
  };

  return (
    <div className="w-full max-w-md p-1 relative z-10 mx-4">
      {/* Light Glassmorphism Card */}
      <div className="relative bg-white/70 backdrop-blur-2xl border border-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Welcome to Learnflex</h1>
          <p className="text-slate-500 text-sm">Please login to continue</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
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
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium">
                Forgot Password?
              </a>
            </div>
            <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
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
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-fadeIn">
              <AlertCircle className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || status === 'success'}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
          </button>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-4">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all">
              Sign up for free
            </a>
          </p>
        </form>

        {/* Decorative bottom bar - Blue to Sky gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500"></div>
      </div>
    </div>
  );
};

export default function Login() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center justify-center selection:bg-blue-200/50">
      <AnimatedBackground />
      <LoginCard />
    </div>
  );
}