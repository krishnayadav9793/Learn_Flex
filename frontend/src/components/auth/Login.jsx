import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Brain,
  AlertCircle,
} from "lucide-react";
import { useNavigate , Link } from "react-router-dom";
import { API_BASE } from "../../config";

/*
Animated background with neutral LearnFlex dashboard colors
*/
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    let animationFrameId;

    const symbols = ["?", "!", "∑", "π", "A", "B", "C", "√", "%", "{ }"];
    const colors = ["#0b2a4a", "#123d6b", "#1c4f85", "#2e6bb3"];

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
        (window.innerWidth * window.innerHeight) / 20000
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
        canvas.height
      );
      gradient.addColorStop(0, '#f0f9ff'); // Sky 50
      gradient.addColorStop(1, '#e0f2fe'); // Sky 100

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

/*
Login Card
*/
const LoginCard = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [status, setStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState("Invalid Details");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const data = { email, password };

    try {
      const res = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      localStorage.setItem("name",resData?.name)
      if (resData.msg === "Invalid email" || resData.msg === "Wrong password") {
        setStatusMsg(resData.msg);

        setTimeout(() => {
          setIsLoading(false);
          setStatus("error");
        }, 1500);
      } else {
        navigate("/HomePage");
      }
    } catch (err) {
      // setIsLoading(false);
      setStatusMsg("Something went wrong");

        setTimeout(() => {
          setIsLoading(false);
          setStatus("error");
        }, 1500)
      console.log("error:", err);
    }
  };

  return (
    <div className="w-full max-w-md p-1 relative z-10 mx-4">
      <div className="relative bg-white border border-[#e5dfd5] rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-[#0b2a4a] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
            Welcome to LearnFlex
          </h1>

          <p className="text-slate-500 text-sm">
            Please login to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Email Address
            </label>

            <div
              className={`relative transition-all ${
                focusedField === "email" ? "scale-[1.01]" : ""
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail
                  className={`w-5 h-5 ${
                    focusedField === "email"
                      ? "text-[#0b2a4a]"
                      : "text-slate-400"
                  }`}
                />
              </div>

              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0b2a4a]/10 focus:border-[#0b2a4a] transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Password
              </label>

              <a
                href="/resetpassword"
                className="text-xs text-[#0b2a4a] hover:text-[#123d6b] font-medium"
              >
                Forgot Password?
              </a>
            </div>

            <div
              className={`relative transition-all ${
                focusedField === "password" ? "scale-[1.01]" : ""
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={`w-5 h-5 ${
                    focusedField === "password"
                      ? "text-[#0b2a4a]"
                      : "text-slate-400"
                  }`}
                />
              </div>

              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0b2a4a]/10 focus:border-[#0b2a4a] transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Error Message */}
          {status === "error" && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b2a4a] hover:bg-[#123d6b] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">

              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                    />
                  </svg>

                  Verifying...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-4">
            Don't have an account?{" "}
<Link
  to="/signup"
  className="text-[#0b2a4a] font-bold hover:text-[#123d6b] hover:underline"
>
  Sign up for free
</Link>
          </p>
        </form>

        {/* Bottom accent */}
        <div className="h-1.5 w-full bg-[#0b2a4a]" />
      </div>
    </div>
  );
};

export default function Login() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center justify-center">
      <AnimatedBackground />
      <LoginCard />
    </div>
  );
}