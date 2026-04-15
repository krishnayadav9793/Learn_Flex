import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../config'

const OTP_LENGTH = 6
const OTP_EXPIRY_SEC = 15 * 60

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) }

function maskEmail(email) {
  const [local, domain] = email.split('@')
  return `${local.slice(0, 2)}${'•'.repeat(Math.max(local.length - 2, 3))}@${domain}`
}

function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

// ── Animated Canvas Background (matches Login) ────────────────────────────────
const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let animationFrameId

    const symbols = ['?', '!', '∑', 'π', 'A', 'B', 'C', '√', '%', '{ }']
    const colors = ['#0b2a4a', '#123d6b', '#1c4f85', '#2e6bb3']

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 20 + 10
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)]
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
        this.opacity = Math.random() * 0.3 + 0.1
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed
        if (this.x > canvas.width + 50) this.x = -50
        if (this.x < -50) this.x = canvas.width + 50
        if (this.y > canvas.height + 50) this.y = -50
        if (this.y < -50) this.y = canvas.height + 50
      }
      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.font = `bold ${this.size}px sans-serif`
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fillText(this.symbol, -this.size / 2, -this.size / 2)
        ctx.restore()
      }
    }

    const initParticles = () => {
      particles = []
      const count = Math.floor((window.innerWidth * window.innerHeight) / 20000)
      for (let i = 0; i < count; i++) particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f0f9ff')
      gradient.addColorStop(1, '#e0f2fe')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ForgotPasswordOTP() {
  const [step, setStep] = useState('email')
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [sending, setSending] = useState(false)

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [otpPhase, setOtpPhase] = useState('idle')
  const [shake, setShake] = useState(false)
  const [resendSec, setResend] = useState(30)
  const [expirySec, setExpiry] = useState(OTP_EXPIRY_SEC)
  const inputs = useRef([])
  const expiryRef = useRef(null)
  const [originalOTP, setOriginalOTP] = useState()

  const [passwords, setPasswords] = useState({ new: '', verify: '' })
  const [showPassword, setShowPassword] = useState({ new: false, verify: false })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [resetting, setResetting] = useState(false)

  const calculateStrength = (password) => {
    let score = 0
    if (!password) return 0
    if (password.length >= 8) score += 20
    if (password.length >= 12) score += 10
    if (/[a-z]/.test(password)) score += 20
    if (/[A-Z]/.test(password)) score += 20
    if (/[0-9]/.test(password)) score += 15
    if (/[^A-Za-z0-9]/.test(password)) score += 15
    return Math.min(score, 100)
  }

  const getStrengthColor = (s) => {
    if (s < 40) return '#ef4444'
    if (s < 70) return '#f97316'
    if (s < 90) return '#eab308'
    return '#16a34a'
  }

  const getStrengthLabel = (s) => {
    if (s < 40) return 'Weak'
    if (s < 70) return 'Fair'
    if (s < 90) return 'Good'
    return 'Strong'
  }

  // 30-sec resend countdown
  useEffect(() => {
    if (step !== 'otp' || resendSec <= 0) return
    const id = setTimeout(() => setResend(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [step, resendSec])

  // 15-min expiry countdown
  useEffect(() => {
    if (step !== 'otp') return
    expiryRef.current = setInterval(() => {
      setExpiry(t => {
        if (t <= 1) {
          clearInterval(expiryRef.current)
          setStep('expired')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(expiryRef.current)
  }, [step])

  // Focus first OTP box
  useEffect(() => {
    if (step === 'otp') setTimeout(() => inputs.current[0]?.focus(), 80)
  }, [step])

  async function handleSendEmail() {
    if (!isValidEmail(email)) { setEmailErr('Enter a valid email address'); return }
    setEmailErr('')
    setSending(true)
    try {
      const res = await fetch(`https://learn-flex-puce.vercel.app/user/forgetpassword`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      })
      const response = await res.json()
      if (response.msg === 'user not exsist') { setEmailErr(response.msg); setSending(false); return }
      if (response.msg === 'OTP limit reached. Try again after 1 hours') { setEmailErr(response.msg); setSending(false); return }
      setOriginalOTP(response?.OTP)
    } catch (e) {
      setEmailErr(e?.message || 'Failed to send. Try again.')
      setSending(false)
      return
    }
    setSending(false)
    setOtp(Array(OTP_LENGTH).fill(''))
    setOtpPhase('idle')
    setResend(30)
    setExpiry(OTP_EXPIRY_SEC)
    setStep('otp')
  }

  function handleOtpChange(e, idx) {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace') {
      if (otp[idx]) { const n = [...otp]; n[idx] = ''; setOtp(n) }
      else if (idx > 0) inputs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  async function handleVerify() {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) { triggerShake(); return }
    setOtpPhase('loading')
    if (String(originalOTP) === code) {
      clearInterval(expiryRef.current)
      setOtpPhase('success')
      setTimeout(() => setStep('resetpassword'), 900)
    } else {
      setOtpPhase('error')
      triggerShake()
      setTimeout(() => setOtpPhase('idle'), 900)
    }
  }

  function triggerShake() { setShake(true); setTimeout(() => setShake(false), 600) }

  async function handleResend() {
    if (resendSec > 0) return
    clearInterval(expiryRef.current)
    setOtp(Array(OTP_LENGTH).fill(''))
    setOtpPhase('idle')
    setResend(30)
    setExpiry(OTP_EXPIRY_SEC)
    await handleSendEmail()
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
    if (name === 'new') setPasswordStrength(calculateStrength(value))
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validatePasswords() {
    const errors = {}
    if (!passwords.new) errors.new = 'Please enter a new password'
    else if (passwords.new.length < 8) errors.new = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwords.new))
      errors.new = 'Password must contain uppercase, lowercase, and numbers'
    if (!passwords.verify) errors.verify = 'Please verify your password'
    else if (passwords.new !== passwords.verify) errors.verify = 'Passwords do not match'
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleResetPassword() {
    if (!validatePasswords()) return
    setResetting(true)
    try {
      const res = await fetch(`${API_BASE}/user/resetpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: passwords.new })
      })
      const response = await res.json()
      if (response.msg === 'password reset successful') {
        setStep('success')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setPasswordErrors({ submit: response.msg || 'Failed to reset password' })
      }
    } catch (e) {
      setPasswordErrors({ submit: e?.message || 'Failed to reset password. Try again.' })
    } finally {
      setResetting(false)
    }
  }

  const filled = otp.filter(Boolean).length
  const expiryPct = (expirySec / OTP_EXPIRY_SEC) * 100
  const expiryWarn = expirySec <= 60

  const stepIndex = { email: 0, otp: 1, resetpassword: 2 }[step] ?? -1

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif;
          position: relative; overflow: hidden;
          padding: 16px;
        }

        .fp-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          background: #fff;
          border: 1px solid #e5dfd5;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(11,42,74,.1);
          overflow: hidden;
        }

        .fp-body {
          padding: clamp(24px,6vw,40px) clamp(20px,6vw,36px) clamp(20px,5vw,32px);
        }

        .fp-step { animation: step-in .35s cubic-bezier(.22,1,.36,1); }
        @keyframes step-in { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:none} }

        /* Step indicator */
        .step-indicator { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:28px; }
        .step-dot { width:8px; height:8px; border-radius:50%; background:#e2e8f0; transition:background .3s,transform .3s; }
        .step-dot.active { background:#0b2a4a; transform:scale(1.3); }
        .step-dot.done { background:#7aa8cc; }
        .step-line { width:32px; height:2px; background:#e2e8f0; border-radius:1px; transition:background .3s; }
        .step-line.done { background:#7aa8cc; }

        /* Icon ring */
        .icon-ring {
          width:64px; height:64px; border-radius:50%;
          margin:0 auto 20px;
          display:flex; align-items:center; justify-content:center; font-size:26px;
        }
        .icon-ring.navy { background:#eef3f8; border:2px solid #b8cde0; }
        .icon-ring.green { background:#f0fdf4; border:2px solid #86efac; animation:pop .4s cubic-bezier(.34,1.56,.64,1); }
        .icon-ring.red { background:#fef2f2; border:2px solid #fca5a5; animation:pop .4s cubic-bezier(.34,1.56,.64,1); }
        @keyframes pop { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }

        /* Typography */
        .fp-title { font-size:clamp(1.5rem,5vw,1.85rem); font-weight:700; color:#0f172a; text-align:center; margin-bottom:6px; letter-spacing:-.02em; }
        .fp-title .accent { color:#0b2a4a; }
        .fp-title .green  { color:#16a34a; }
        .fp-title .red    { color:#dc2626; }
        .fp-sub { font-size:.88rem; color:#64748b; text-align:center; line-height:1.6; margin-bottom:6px; }
        .fp-email-shown { font-size:.88rem; color:#0b2a4a; font-weight:600; text-align:center; margin-bottom:16px; }

        /* Fields */
        .field { margin-bottom:16px; }
        .field-label { display:block; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#64748b; margin-bottom:6px; }
        .input-wrap { position:relative; display:flex; align-items:center; }
        .input-icon { position:absolute; left:12px; font-size:14px; color:#94a3b8; pointer-events:none; transition:color .2s; font-style:normal; }
        .input-wrap:focus-within .input-icon { color:#0b2a4a; }
        .text-input {
          width:100%; padding:12px 12px 12px 40px;
          background:#fff; border:1.5px solid #e2e8f0; border-radius:12px;
          font-family:'Inter',sans-serif; font-size:.95rem; color:#0f172a;
          outline:none; transition:border-color .2s, box-shadow .2s;
        }
        .text-input::placeholder { color:#cbd5e1; }
        .text-input:focus { border-color:#0b2a4a; box-shadow:0 0 0 3px rgba(11,42,74,.1); }
        .text-input.err { border-color:#ef4444; }
        .text-input.err:focus { box-shadow:0 0 0 3px rgba(239,68,68,.1); }

        .password-wrap { position:relative; }
        .password-input {
          width:100%; padding:12px 44px 12px 12px;
          background:#fff; border:1.5px solid #e2e8f0; border-radius:12px;
          font-family:'Inter',sans-serif; font-size:.95rem; color:#0f172a;
          outline:none; transition:border-color .2s, box-shadow .2s;
        }
        .password-input::placeholder { color:#cbd5e1; }
        .password-input:focus { border-color:#0b2a4a; box-shadow:0 0 0 3px rgba(11,42,74,.1); }
        .password-input.err { border-color:#ef4444; }
        .password-input.err:focus { box-shadow:0 0 0 3px rgba(239,68,68,.1); }
        .toggle-pass {
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          background:none; border:none; padding:6px; cursor:pointer;
          font-size:14px; color:#94a3b8; transition:color .2s;
        }
        .toggle-pass:hover { color:#0b2a4a; }

        .field-error { font-size:.78rem; color:#ef4444; margin-top:5px; display:flex; align-items:center; gap:4px; }

        /* Strength */
        .strength-row { display:flex; align-items:center; gap:8px; margin-top:6px; }
        .strength-track { flex:1; height:3px; background:#e2e8f0; border-radius:2px; overflow:hidden; }
        .strength-fill { height:100%; border-radius:2px; transition:all .3s; }
        .strength-text { font-size:.72rem; font-weight:600; min-width:40px; text-align:right; }

        /* Requirements */
        .req-box { background:#f8fafc; border-left:3px solid #0b2a4a; border-radius:8px; padding:12px 14px; margin-bottom:16px; }
        .req-title { font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#64748b; margin-bottom:8px; }
        .req-list { list-style:none; display:flex; flex-direction:column; gap:5px; }
        .req-list li { display:flex; align-items:center; gap:6px; font-size:.8rem; color:#94a3b8; transition:color .2s; }
        .req-list li.met { color:#16a34a; }
        .req-list li svg { width:13px; height:13px; flex-shrink:0; }

        /* Expiry */
        .expiry-wrap { margin-bottom:18px; }
        .expiry-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; }
        .expiry-label { font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#64748b; }
        .expiry-time { font-size:.95rem; font-weight:700; color:#0b2a4a; transition:color .3s; }
        .expiry-time.warn { color:#dc2626; animation:blink 1s step-start infinite; }
        @keyframes blink { 50%{opacity:.4} }
        .expiry-bar { height:3px; background:#e2e8f0; border-radius:2px; overflow:hidden; }
        .expiry-fill { height:100%; border-radius:2px; background:#0b2a4a; transition:width 1s linear, background .4s; }
        .expiry-fill.warn { background:#dc2626; }

        /* OTP */
        .otp-boxes { display:flex; gap:clamp(6px,2vw,10px); justify-content:center; margin-bottom:10px; }
        .otp-boxes.shake { animation:shake .5s cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake {
          10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)}
          30%,50%,70%{transform:translateX(-5px)} 40%,60%{transform:translateX(5px)}
        }
        .otp-input {
          width:clamp(42px,12vw,52px); height:clamp(52px,14vw,62px);
          background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px;
          font-family:'Inter',sans-serif; font-size:1.6rem; font-weight:700; color:#0b2a4a;
          text-align:center; outline:none;
          transition:border-color .18s, background .18s, box-shadow .18s, transform .1s;
          -webkit-appearance:none;
        }
        .otp-input:focus { border-color:#0b2a4a; background:#fff; box-shadow:0 0 0 3px rgba(11,42,74,.1); transform:translateY(-2px); }
        .otp-input.filled { border-color:#7aa8cc; background:#fff; }
        .otp-input.err { border-color:#ef4444; background:#fef2f2; color:#dc2626; box-shadow:0 0 0 3px rgba(239,68,68,.1); }
        .otp-input.ok  { border-color:#22c55e; background:#f0fdf4; color:#16a34a; box-shadow:0 0 0 3px rgba(34,197,94,.1); }
        .otp-input::-webkit-inner-spin-button, .otp-input::-webkit-outer-spin-button { -webkit-appearance:none; }

        .otp-dots { display:flex; gap:5px; justify-content:center; margin-bottom:20px; }
        .otp-dot { width:5px; height:5px; border-radius:50%; background:#e2e8f0; transition:background .2s,transform .2s; }
        .otp-dot.done   { background:#7aa8cc; }
        .otp-dot.active { background:#0b2a4a; transform:scale(1.3); }

        /* Buttons */
        .primary-btn {
          width:100%; padding:14px;
          background:#0b2a4a; border:none; border-radius:12px;
          font-family:'Inter',sans-serif; font-size:1rem; font-weight:600; color:#fff;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition:background .2s, transform .1s, opacity .2s;
          margin-bottom:16px;
        }
        .primary-btn:hover:not(:disabled) { background:#123d6b; }
        .primary-btn:active:not(:disabled) { transform:scale(.98); }
        .primary-btn:disabled { opacity:.45; cursor:not-allowed; }
        .primary-btn.err-btn { background:#dc2626; }
        .primary-btn.err-btn:hover:not(:disabled) { background:#b91c1c; }
        .primary-btn.ok-btn { background:#16a34a; }

        .spinner {
          width:18px; height:18px; border:2.5px solid rgba(255,255,255,.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin .7s linear infinite; display:inline-block;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* Misc */
        .divider { display:flex; align-items:center; gap:10px; margin:4px 0 16px; }
        .divider-line { flex:1; height:1px; background:#e2e8f0; }
        .divider-text { font-size:.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.1em; }

        .back-link {
          display:block; width:100%; text-align:center;
          font-size:.85rem; color:#64748b;
          background:none; border:none; padding:0;
          font-family:'Inter',sans-serif; cursor:pointer;
          transition:color .15s; text-decoration:underline; text-underline-offset:3px;
        }
        .back-link:hover { color:#0b2a4a; }

        .resend-row { text-align:center; font-size:.83rem; color:#64748b; }
        .resend-btn {
          background:none; border:none; padding:0;
          font-family:'Inter',sans-serif; font-size:.83rem; font-weight:600;
          color:#0b2a4a; cursor:pointer;
          text-decoration:underline; text-underline-offset:3px; transition:color .15s;
        }
        .resend-btn:disabled { color:#94a3b8; text-decoration:none; cursor:default; }
        .resend-btn:hover:not(:disabled) { color:#123d6b; }

        .change-email {
          display:inline-flex; align-items:center; gap:5px;
          font-size:.76rem; color:#64748b;
          background:#f1f5f9; border:1px solid #e2e8f0;
          border-radius:20px; padding:4px 12px; cursor:pointer; margin-bottom:18px;
          transition:background .15s,color .15s; font-family:'Inter',sans-serif;
        }
        .change-email:hover { background:#e2e8f0; color:#0b2a4a; }

        .card-accent { height:5px; background:#0b2a4a; width:100%; }

        @media (max-width: 400px) {
          .otp-input { width:38px; height:46px; font-size:1.3rem; border-radius:8px; }
          .otp-boxes { gap:5px; }
        }
      `}</style>

      <div className="fp-root">
        <AnimatedBackground />

        <div className="fp-card">
          <div className="fp-body">

            {/* Step indicator */}
            {['email', 'otp', 'resetpassword'].includes(step) && (
              <div className="step-indicator">
                <div className={`step-dot ${stepIndex === 0 ? 'active' : stepIndex > 0 ? 'done' : ''}`} />
                <div className={`step-line ${stepIndex > 0 ? 'done' : ''}`} />
                <div className={`step-dot ${stepIndex === 1 ? 'active' : stepIndex > 1 ? 'done' : ''}`} />
                <div className={`step-line ${stepIndex > 1 ? 'done' : ''}`} />
                <div className={`step-dot ${stepIndex === 2 ? 'active' : ''}`} />
              </div>
            )}

            {/* ── STEP 1: EMAIL ── */}
            {step === 'email' && (
              <div className="fp-step">
                <div className="icon-ring navy">✉</div>
                <h1 className="fp-title">Forgot <span className="accent">Password</span></h1>
                <p className="fp-sub" style={{ marginBottom: 24 }}>
                  Enter your email and we'll send a one-time password to reset it.
                </p>

                <div className="field">
                  <label className="field-label">Email Address</label>
                  <div className="input-wrap">
                    <i className="input-icon">✉</i>
                    <input
                      className={`text-input${emailErr ? ' err' : ''}`}
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  {emailErr && <p className="field-error"><span>⚠</span> {emailErr}</p>}
                </div>

                <div style={{ height: 12 }} />

                <button
                  className="primary-btn"
                  onClick={handleSendEmail}
                  disabled={sending || !email.trim()}
                >
                  {sending && <span className="spinner" />}
                  {sending ? 'Sending OTP…' : 'Send OTP →'}
                </button>

                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">or</span>
                  <div className="divider-line" />
                </div>
                <button className="back-link" onClick={() => navigate('/login')}>← Back to Login</button>
              </div>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <div className="fp-step">
                <div className="icon-ring navy">🔐</div>
                <h1 className="fp-title">Enter <span className="accent">OTP</span></h1>
                <p className="fp-sub">We sent a 6-digit code to</p>
                <p className="fp-email-shown">{maskEmail(email)}</p>

                <div style={{ textAlign: 'center' }}>
                  <button
                    className="change-email"
                    onClick={() => { clearInterval(expiryRef.current); setStep('email') }}
                  >
                    ✎ Change email
                  </button>
                </div>

                <div className="expiry-wrap">
                  <div className="expiry-row">
                    <span className="expiry-label">OTP expires in</span>
                    <span className={`expiry-time${expiryWarn ? ' warn' : ''}`}>{fmt(expirySec)}</span>
                  </div>
                  <div className="expiry-bar">
                    <div className={`expiry-fill${expiryWarn ? ' warn' : ''}`} style={{ width: `${expiryPct}%` }} />
                  </div>
                </div>

                <div className={`otp-boxes${shake ? ' shake' : ''}`} onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputs.current[i] = el}
                      className={[
                        'otp-input',
                        digit ? 'filled' : '',
                        otpPhase === 'error' ? 'err' : '',
                        otpPhase === 'success' ? 'ok' : '',
                      ].filter(Boolean).join(' ')}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e, i)}
                      onKeyDown={e => handleKeyDown(e, i)}
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    />
                  ))}
                </div>

                <div className="otp-dots">
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <div
                      key={i}
                      className={[
                        'otp-dot',
                        i < filled ? 'done' : '',
                        i === filled && filled < OTP_LENGTH ? 'active' : '',
                      ].filter(Boolean).join(' ')}
                    />
                  ))}
                </div>

                <button
                  className={['primary-btn', otpPhase === 'error' ? 'err-btn' : '', otpPhase === 'success' ? 'ok-btn' : ''].filter(Boolean).join(' ')}
                  onClick={handleVerify}
                  disabled={otpPhase === 'loading' || otpPhase === 'success'}
                >
                  {otpPhase === 'loading' && <span className="spinner" />}
                  {otpPhase === 'loading' ? 'Verifying…'
                    : otpPhase === 'error' ? 'Wrong Code — Retry'
                    : otpPhase === 'success' ? '✓ Verified!'
                    : 'Verify OTP'}
                </button>

                <p className="resend-row">
                  Didn't receive it?{' '}
                  <button className="resend-btn" onClick={handleResend} disabled={resendSec > 0}>
                    {resendSec > 0 ? `Resend in ${resendSec}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            )}

            {/* ── STEP 3: RESET PASSWORD ── */}
            {step === 'resetpassword' && (
              <div className="fp-step">
                <div className="icon-ring navy">🔑</div>
                <h1 className="fp-title">Reset <span className="accent">Password</span></h1>
                <p className="fp-sub" style={{ marginBottom: 20 }}>
                  Create a strong password to secure your account.
                </p>

                <div className="field">
                  <label className="field-label">New Password</label>
                  <div className="password-wrap">
                    <input
                      className={`password-input${passwordErrors.new ? ' err' : ''}`}
                      type={showPassword.new ? 'text' : 'password'}
                      name="new"
                      placeholder="Enter your new password"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="toggle-pass"
                      onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                    >
                      {showPassword.new ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  {passwordErrors.new && <p className="field-error"><span>⚠</span> {passwordErrors.new}</p>}
                  {passwords.new && (
                    <div className="strength-row">
                      <div className="strength-track">
                        <div
                          className="strength-fill"
                          style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor(passwordStrength) }}
                        />
                      </div>
                      <span className="strength-text" style={{ color: getStrengthColor(passwordStrength) }}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="field">
                  <label className="field-label">Verify Password</label>
                  <div className="password-wrap">
                    <input
                      className={`password-input${passwordErrors.verify ? ' err' : ''}`}
                      type={showPassword.verify ? 'text' : 'password'}
                      name="verify"
                      placeholder="Re-enter your new password"
                      value={passwords.verify}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      className="toggle-pass"
                      onClick={() => setShowPassword(p => ({ ...p, verify: !p.verify }))}
                    >
                      {showPassword.verify ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  {passwordErrors.verify && <p className="field-error"><span>⚠</span> {passwordErrors.verify}</p>}
                </div>

                <div className="req-box">
                  <p className="req-title">Password must contain:</p>
                  <ul className="req-list">
                    {[
                      { label: 'At least 8 characters', met: passwords.new.length >= 8 },
                      { label: 'One uppercase letter', met: /[A-Z]/.test(passwords.new) },
                      { label: 'One lowercase letter', met: /[a-z]/.test(passwords.new) },
                      { label: 'One number', met: /[0-9]/.test(passwords.new) },
                    ].map(({ label, met }) => (
                      <li key={label} className={met ? 'met' : ''}>
                        <svg viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          {met && <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                        </svg>
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>

                {passwordErrors.submit && (
                  <p className="field-error" style={{ justifyContent: 'center', marginBottom: 12 }}>
                    <span>⚠</span> {passwordErrors.submit}
                  </p>
                )}

                <button className="primary-btn" onClick={handleResetPassword} disabled={resetting}>
                  {resetting && <span className="spinner" />}
                  {resetting ? 'Resetting Password…' : 'Reset Password →'}
                </button>
              </div>
            )}

            {/* ── EXPIRED ── */}
            {step === 'expired' && (
              <div className="fp-step">
                <div className="icon-ring red">⏰</div>
                <h1 className="fp-title">OTP <span className="red">Expired</span></h1>
                <p className="fp-sub" style={{ marginBottom: 24 }}>
                  Your 15-minute window has passed.<br />Request a new code to continue.
                </p>
                <button
                  className="primary-btn"
                  onClick={async () => {
                    setOtp(Array(OTP_LENGTH).fill(''))
                    setOtpPhase('idle')
                    setResend(30)
                    setExpiry(OTP_EXPIRY_SEC)
                    await handleSendEmail()
                  }}
                >
                  Resend OTP →
                </button>
                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">or</span>
                  <div className="divider-line" />
                </div>
                <button className="back-link" onClick={() => setStep('email')}>← Change Email</button>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {step === 'success' && (
              <div className="fp-step">
                <div className="icon-ring green">✓</div>
                <h1 className="fp-title"><span className="green">Password Reset!</span></h1>
                <p className="fp-sub" style={{ marginTop: 8 }}>
                  Your password has been changed successfully.<br />Redirecting to login…
                </p>
              </div>
            )}

          </div>
          <div className="card-accent" />
        </div>
      </div>
    </>
  )
}
