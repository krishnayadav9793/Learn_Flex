import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const OTP_LENGTH = 6
const OTP_EXPIRY_SEC = 15 * 60   // 15 minutes

// ── tiny helpers ──────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function ForgotPasswordOTP({ onSendEmail, onVerify, onBack }) {
  // ── step: 'email' | 'otp' | 'expired' | 'success' | 'resetpassword' ──────
  const [step, setStep] = useState('email')
  const navigate = useNavigate();
  
  // email step
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [sending, setSending] = useState(false)

  // otp step
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [otpPhase, setOtpPhase] = useState('idle')  // idle|loading|error|success
  const [shake, setShake] = useState(false)
  const [resendSec, setResend] = useState(30)
  const [expirySec, setExpiry] = useState(OTP_EXPIRY_SEC)
  const inputs = useRef([])
  const expiryRef = useRef(null)
  const [originalOTP, setOriginalOTP] = useState();
  
  // reset password step
  const [passwords, setPasswords] = useState({ new: '', verify: '' })
  const [showPassword, setShowPassword] = useState({ new: false, verify: false })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [resetting, setResetting] = useState(false)

  // ── Password strength calculator ──────────────────────────────────────────
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

  const getStrengthColor = (strength) => {
    if (strength < 40) return '#ff5050'
    if (strength < 70) return '#ed8936'
    if (strength < 90) return '#ecc94b'
    return '#00e887'
  }

  // ── 30-sec resend countdown ───────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'otp' || resendSec <= 0) return
    const id = setTimeout(() => setResend(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [step, resendSec])

  // ── 15-min expiry countdown ───────────────────────────────────────────────
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

  // ── focus first OTP box when step becomes 'otp' ───────────────────────────
  useEffect(() => {
    if (step === 'otp') setTimeout(() => inputs.current[0]?.focus(), 80)
  }, [step])

  // ── EMAIL STEP handlers ───────────────────────────────────────────────────
  async function handleSendEmail() {
    if (!isValidEmail(email)) { setEmailErr('Enter a valid email address'); return }
    setEmailErr('')
    setSending(true)
    try {
      const res = await fetch(`https://learn-flex-puce.vercel.app/user/forgetpassword`, {
        method: "POST",
        body: JSON.stringify({ email: email }),
        headers: {
          "Content-Type": "application/json"
        }
      })

      const response = await res.json();
      if (response.msg === "user not exsist") { setEmailErr(response.msg); setSending(false); return }
      setOriginalOTP(response?.OTP);

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

  function handleEmailKey(e) { if (e.key === 'Enter') handleSendEmail() }

  // ── OTP STEP handlers ─────────────────────────────────────────────────────
  function handleChange(e, idx) {
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

    if (originalOTP == code) {
      clearInterval(expiryRef.current)
      setOtpPhase('success')
      setTimeout(() => setStep('resetpassword'), 900)
    }
    else {
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
    await handleSendEmail();
    setStep('email')
    setTimeout(() => setStep('otp'), 10)
  }

  // ── RESET PASSWORD handlers ───────────────────────────────────────────────
  function handlePasswordChange(e) {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
    
    if (name === 'new') {
      setPasswordStrength(calculateStrength(value))
    }
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function validatePasswords() {
    const errors = {}
    
    if (!passwords.new) {
      errors.new = 'Please enter a new password'
    } else if (passwords.new.length < 8) {
      errors.new = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwords.new)) {
      errors.new = 'Password must contain uppercase, lowercase, and numbers'
    }
    
    if (!passwords.verify) {
      errors.verify = 'Please verify your password'
    } else if (passwords.new !== passwords.verify) {
      errors.verify = 'Passwords do not match'
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleResetPassword() {
    if (!validatePasswords()) return
    
    setResetting(true)
    try {
      
      const res = await fetch('https://learn-flex-puce.vercel.app/user/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          newPassword: passwords.new
        })
      })
      
      const response = await res.json()
      
      if (response.msg==="password reset successful") {
        setStep('success')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root {
          min-height: 100vh;
          background: #09090f;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .fp-root::before {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(255,255,255,.016) 2px, rgba(255,255,255,.016) 4px
          );
          pointer-events: none; z-index: 0;
        }

        .blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .blob-gold { width:420px; height:420px; background:rgba(250,200,0,.07); top:-120px; left:-100px; animation:blob-drift 8s ease-in-out infinite alternate; }
        .blob-blue { width:320px; height:320px; background:rgba(0,190,255,.05); bottom:-80px; right:-60px; animation:blob-drift 10s ease-in-out infinite alternate-reverse; }
        @keyframes blob-drift { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,20px) scale(1.06)} }

        .corner { position: fixed; width: 48px; height: 48px; z-index: 1; }
        .corner.tl { top:20px; left:20px;  border-top:1.5px solid rgba(250,200,0,.3); border-left:1.5px solid rgba(250,200,0,.3); }
        .corner.tr { top:20px; right:20px; border-top:1.5px solid rgba(0,190,255,.3); border-right:1.5px solid rgba(0,190,255,.3); }
        .corner.bl { bottom:20px; left:20px;  border-bottom:1.5px solid rgba(250,200,0,.3); border-left:1.5px solid rgba(250,200,0,.3); }
        .corner.br { bottom:20px; right:20px; border-bottom:1.5px solid rgba(0,190,255,.3); border-right:1.5px solid rgba(0,190,255,.3); }

        .fp-card {
          position: relative; z-index: 1;
          width: min(92vw, 480px);
          padding: 44px 40px 40px;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          text-align: center;
          animation: card-in .45s cubic-bezier(.22,1,.36,1);
        }
        @keyframes card-in { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }

        .fp-step { animation: step-in .38s cubic-bezier(.22,1,.36,1); }
        @keyframes step-in { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:none} }

        /* icon ring */
        .icon-ring {
          width:68px; height:68px; border-radius:50%;
          margin:0 auto 24px;
          display:flex; align-items:center; justify-content:center;
          font-size:28px;
        }
        .icon-ring.gold  { background:rgba(250,200,0,.1);  border:1.5px solid rgba(250,200,0,.3); animation:ring-pulse 2.5s ease-in-out infinite; }
        .icon-ring.blue  { background:rgba(0,190,255,.08); border:1.5px solid rgba(0,190,255,.25); animation:ring-pulse-blue 2.5s ease-in-out infinite; }
        .icon-ring.green { background:rgba(0,232,135,.1);  border:1.5px solid #00e887; animation:success-pop .5s cubic-bezier(.34,1.56,.64,1); }
        .icon-ring.red   { background:rgba(255,80,80,.1);  border:1.5px solid #ff5050; animation:success-pop .5s cubic-bezier(.34,1.56,.64,1); }
        @keyframes ring-pulse      { 0%,100%{box-shadow:0 0 0 0 rgba(250,200,0,.25)} 50%{box-shadow:0 0 0 10px rgba(250,200,0,0)} }
        @keyframes ring-pulse-blue { 0%,100%{box-shadow:0 0 0 0 rgba(0,190,255,.2)}  50%{box-shadow:0 0 0 10px rgba(0,190,255,0)} }
        @keyframes success-pop { from{transform:scale(.4);opacity:0} to{transform:scale(1);opacity:1} }

        /* typography */
        .fp-title {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(1.9rem,7vw,2.6rem);
          letter-spacing:.1em; color:#fff; line-height:1; margin-bottom:8px;
        }
        .fp-title .gold  { color:#fac800; }
        .fp-title .green { color:#00e887; }
        .fp-title .red   { color:#ff5050; }

        .fp-sub { font-size:.88rem; color:rgba(255,255,255,.4); line-height:1.6; margin-bottom:6px; }
        .fp-email-shown { font-size:.88rem; color:rgba(250,200,0,.85); font-weight:600; margin-bottom:16px; letter-spacing:.02em; }

        /* step indicator */
        .step-indicator { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:28px; }
        .step-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.12); transition:background .3s, transform .3s; }
        .step-dot.active { background:#fac800; transform:scale(1.3); }
        .step-dot.done   { background:rgba(250,200,0,.4); }
        .step-line { width:32px; height:1.5px; background:rgba(255,255,255,.1); border-radius:1px; transition:background .3s; }
        .step-line.done { background:rgba(250,200,0,.35); }

        /* email input */
        .email-field { position:relative; margin-bottom:8px; text-align:left; }
        .email-label { display:block; font-size:.72rem; letter-spacing:.15em; text-transform:uppercase; color:rgba(255,255,255,.35); margin-bottom:8px; }
        .email-input-wrap { position:relative; display:flex; align-items:center; }
        .email-icon {
          position:absolute; left:14px; font-size:15px; pointer-events:none;
          color:rgba(255,255,255,.3); transition:color .2s;
          font-style:normal;
        }
        .email-input-wrap:focus-within .email-icon { color:#fac800; }
        .email-input {
          width:100%; padding:14px 14px 14px 42px;
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.1);
          border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:.95rem; color:#fff;
          caret-color:#fac800; outline:none;
          transition:border-color .2s, background .2s, box-shadow .2s;
        }
        .email-input::placeholder { color:rgba(255,255,255,.2); }
        .email-input:focus { border-color:#fac800; background:rgba(250,200,0,.05); box-shadow:0 0 0 3px rgba(250,200,0,.12); }
        .email-input.err-field { border-color:#ff5050; }
        .email-input.err-field:focus { box-shadow:0 0 0 3px rgba(255,80,80,.12); }
        .email-error { font-size:.78rem; color:#ff5050; margin-top:7px; text-align:left; display:flex; align-items:center; gap:5px; }

        /* password inputs */
        .password-field { position:relative; margin-bottom:16px; text-align:left; }
        .password-label { display:block; font-size:.72rem; letter-spacing:.15em; text-transform:uppercase; color:rgba(255,255,255,.35); margin-bottom:8px; }
        .password-input-wrap { position:relative; }
        .password-input {
          width:100%; padding:14px 44px 14px 14px;
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.1);
          border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:.95rem; color:#fff;
          caret-color:#fac800; outline:none;
          transition:border-color .2s, background .2s, box-shadow .2s;
        }
        .password-input::placeholder { color:rgba(255,255,255,.2); }
        .password-input:focus { border-color:#fac800; background:rgba(250,200,0,.05); box-shadow:0 0 0 3px rgba(250,200,0,.12); }
        .password-input.err-field { border-color:#ff5050; }
        .password-input.err-field:focus { box-shadow:0 0 0 3px rgba(255,80,80,.12); }
        
        .toggle-password {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 8px; cursor: pointer;
          color: rgba(255,255,255,.3); transition: color .2s;
        }
        .toggle-password:hover { color: #fac800; }
        
        /* strength indicator */
        .strength-indicator { display:flex; align-items:center; gap:10px; margin-top:6px; }
        .strength-bar-container { flex:1; height:3px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
        .strength-bar { height:100%; border-radius:2px; transition:all .3s ease; }
        .strength-label { font-size:.72rem; font-weight:600; min-width:48px; text-align:right; }
        
        /* requirements */
        .requirements-box {
          background:rgba(255,255,255,.03); border-left:3px solid #fac800;
          border-radius:8px; padding:12px 14px; margin-bottom:16px; text-align:left;
        }
        .requirements-title { font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.35); margin-bottom:10px; }
        .requirements-list { list-style:none; display:flex; flex-direction:column; gap:6px; }
        .requirements-list li { display:flex; align-items:center; gap:7px; font-size:.8rem; color:rgba(255,255,255,.3); transition:color .2s; }
        .requirements-list li.met { color:#00e887; }
        .requirements-list li svg { width:14px; height:14px; flex-shrink:0; }

        /* expiry bar */
        .expiry-wrap { margin-bottom:20px; }
        .expiry-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .expiry-label { font-size:.72rem; letter-spacing:.13em; text-transform:uppercase; color:rgba(255,255,255,.3); }
        .expiry-time { font-family:'Bebas Neue',sans-serif; font-size:1rem; letter-spacing:.1em; transition:color .3s; }
        .expiry-time.safe    { color:rgba(250,200,0,.8); }
        .expiry-time.warning { color:#ff5050; animation:blink 1s step-start infinite; }
        @keyframes blink { 50%{opacity:.35} }
        .expiry-bar  { height:3px; border-radius:2px; background:rgba(255,255,255,.08); overflow:hidden; }
        .expiry-fill { height:100%; border-radius:2px; transition:width 1s linear, background .4s; }
        .expiry-fill.safe    { background:#fac800; }
        .expiry-fill.warning { background:#ff5050; }

        /* OTP boxes */
        .otp-boxes { display:flex; gap:10px; justify-content:center; margin-bottom:10px; }
        .otp-boxes.shake { animation:shake .5s cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake {
          10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)}
          30%,50%,70%{transform:translateX(-6px)} 40%,60%{transform:translateX(6px)}
        }
        .otp-input {
          width:52px; height:62px;
          background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.12);
          border-radius:12px; font-family:'Bebas Neue',sans-serif;
          font-size:1.9rem; letter-spacing:.05em; color:#fac800;
          text-align:center; caret-color:#fac800; outline:none;
          transition:border-color .18s, background .18s, box-shadow .18s, transform .12s;
          -webkit-appearance:none;
        }
        .otp-input:focus { border-color:#fac800; background:rgba(250,200,0,.07); box-shadow:0 0 0 3px rgba(250,200,0,.15); transform:translateY(-2px); }
        .otp-input.filled { border-color:rgba(250,200,0,.5); background:rgba(250,200,0,.06); }
        .otp-input.err    { border-color:#ff5050; background:rgba(255,80,80,.08); color:#ff5050; box-shadow:0 0 0 3px rgba(255,80,80,.12); }
        .otp-input.ok     { border-color:#00e887; background:rgba(0,232,135,.08); color:#00e887; box-shadow:0 0 0 3px rgba(0,232,135,.12); }
        .otp-input::-webkit-inner-spin-button, .otp-input::-webkit-outer-spin-button { -webkit-appearance:none; }

        /* dots */
        .otp-dots { display:flex; gap:5px; justify-content:center; margin-bottom:24px; }
        .otp-dot  { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.15); transition:background .2s,transform .2s; }
        .otp-dot.active { background:#fac800; transform:scale(1.3); }
        .otp-dot.done   { background:rgba(250,200,0,.45); }

        /* buttons */
        .primary-btn {
          width:100%; padding:15px 0; background:#fac800;
          border:none; border-radius:12px;
          font-family:'Bebas Neue',sans-serif; font-size:1.15rem; letter-spacing:.16em;
          color:#09090f; cursor:pointer;
          position:relative; overflow:hidden;
          transition:transform .12s, opacity .2s, background .2s;
          margin-bottom:20px;
        }
        .primary-btn:disabled { opacity:.35; cursor:not-allowed; }
        .primary-btn:not(:disabled):hover  { transform:scale(1.02); }
        .primary-btn:not(:disabled):active { transform:scale(.97); }
        .primary-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);
          transform:translateX(-100%); transition:transform .45s;
        }
        .primary-btn:not(:disabled):hover::after { transform:translateX(100%); }
        .primary-btn.err-btn { background:#ff5050; }
        .primary-btn.ok-btn  { background:#00e887; }

        .btn-inner { display:flex; align-items:center; justify-content:center; gap:8px; }

        .spinner {
          width:18px; height:18px; border:2.5px solid rgba(9,9,15,.3);
          border-top-color:#09090f; border-radius:50%;
          animation:spin .7s linear infinite; display:inline-block;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* resend + back */
        .resend-row { font-size:.83rem; color:rgba(255,255,255,.35); }
        .resend-btn {
          background:none; border:none; padding:0;
          font-family:'DM Sans',sans-serif; font-size:.83rem; font-weight:600;
          color:rgba(250,200,0,.75); cursor:pointer;
          text-decoration:underline; text-underline-offset:3px; transition:color .15s;
        }
        .resend-btn:disabled { color:rgba(255,255,255,.25); text-decoration:none; cursor:default; }
        .resend-btn:not(:disabled):hover { color:#fac800; }

        .divider { display:flex; align-items:center; gap:12px; margin:24px 0 20px; }
        .divider-line { flex:1; height:1px; background:rgba(255,255,255,.07); }
        .divider-text { font-size:.72rem; letter-spacing:.15em; text-transform:uppercase; color:rgba(255,255,255,.2); }

        .back-link {
          font-size:.83rem; color:rgba(255,255,255,.3);
          background:none; border:none; padding:0;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:color .15s; text-decoration:underline; text-underline-offset:3px;
        }
        .back-link:hover { color:rgba(255,255,255,.6); }

        /* change email pill */
        .change-email {
          display:inline-flex; align-items:center; gap:5px;
          font-size:.75rem; color:rgba(255,255,255,.35);
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
          border-radius:20px; padding:4px 12px; cursor:pointer; margin-bottom:20px;
          transition:background .15s, color .15s; font-family:'DM Sans',sans-serif;
        }
        .change-email:hover { background:rgba(255,255,255,.09); color:rgba(255,255,255,.6); }
      `}</style>

      <div className="fp-root">
        <div className="blob blob-gold" />
        <div className="blob blob-blue" />
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="fp-card">

          {/* step indicator — only on email/otp/resetpassword steps */}
          {(step === 'email' || step === 'otp' || step === 'resetpassword') && (
            <div className="step-indicator">
              <div className={`step-dot ${step === 'email' ? 'active' : 'done'}`} />
              <div className={`step-line ${step === 'otp' || step === 'resetpassword' ? 'done' : ''}`} />
              <div className={`step-dot ${step === 'otp' ? 'active' : step === 'resetpassword' ? 'done' : ''}`} />
              <div className={`step-line ${step === 'resetpassword' ? 'done' : ''}`} />
              <div className={`step-dot ${step === 'resetpassword' ? 'active' : ''}`} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STEP 1 — EMAIL INPUT                                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 'email' && (
            <div className="fp-step">
              <div className="icon-ring gold">📧</div>
              <h1 className="fp-title">Forgot <span className="gold">Password</span></h1>
              <p className="fp-sub" style={{ marginBottom: 28 }}>
                Enter your Gmail account and we'll send<br />a one-time password to reset it.
              </p>

              <div className="email-field">
                <label className="email-label">Gmail Address</label>
                <div className="email-input-wrap">
                  <i className="email-icon">✉</i>
                  <input
                    className={`email-input${emailErr ? ' err-field' : ''}`}
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                    onKeyDown={handleEmailKey}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {emailErr && <p className="email-error"><span>⚠</span> {emailErr}</p>}
              </div>

              <div style={{ height: 20 }} />

              <button
                className="primary-btn"
                onClick={handleSendEmail}
                disabled={sending || !email.trim()}
              >
                <span className="btn-inner">
                  {sending && <span className="spinner" />}
                  {sending ? 'Sending OTP…' : 'Send OTP →'}
                </span>
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>
              <button className="back-link" onClick={() => navigate('/login')}>← Back to Login</button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STEP 2 — OTP INPUT + 15-MIN TIMER                        */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 'otp' && (
            <div className="fp-step">
              <div className="icon-ring blue">🔐</div>
              <h1 className="fp-title">Enter <span className="gold">OTP</span></h1>
              <p className="fp-sub">We sent a 6-digit code to</p>
              <p className="fp-email-shown">{maskEmail(email)}</p>

              <button
                className="change-email"
                onClick={() => { clearInterval(expiryRef.current); setStep('email') }}
              >
                ✎ Change email
              </button>

              <div className="expiry-wrap">
                <div className="expiry-row">
                  <span className="expiry-label">OTP expires in</span>
                  <span className={`expiry-time ${expiryWarn ? 'warning' : 'safe'}`}>
                    {fmt(expirySec)}
                  </span>
                </div>
                <div className="expiry-bar">
                  <div
                    className={`expiry-fill ${expiryWarn ? 'warning' : 'safe'}`}
                    style={{ width: `${expiryPct}%` }}
                  />
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
                    onChange={e => handleChange(e, i)}
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
                className={[
                  'primary-btn',
                  otpPhase === 'error' ? 'err-btn' : '',
                  otpPhase === 'success' ? 'ok-btn' : '',
                ].filter(Boolean).join(' ')}
                onClick={handleVerify}
                disabled={otpPhase === 'loading' || otpPhase === 'success'}
              >
                <span className="btn-inner">
                  {otpPhase === 'loading' && <span className="spinner" />}
                  {otpPhase === 'loading' ? 'Verifying…'
                    : otpPhase === 'error' ? 'Wrong Code — Retry'
                      : otpPhase === 'success' ? '✓ Verified!'
                        : 'Verify OTP'}
                </span>
              </button>

              <div className="resend-row">
                Didn't receive it?{' '}
                <button
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={resendSec > 0}
                >
                  {resendSec > 0 ? `Resend in ${resendSec}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STEP 3 — RESET PASSWORD                                   */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 'resetpassword' && (
            <div className="fp-step">
              <div className="icon-ring gold">🔑</div>
              <h1 className="fp-title">Reset <span className="gold">Password</span></h1>
              <p className="fp-sub" style={{ marginBottom: 24 }}>
                Create a strong password to secure your account
              </p>

              {/* New Password */}
              <div className="password-field">
                <label className="password-label">New Password</label>
                <div className="password-input-wrap">
                  <input
                    className={`password-input${passwordErrors.new ? ' err-field' : ''}`}
                    type={showPassword.new ? 'text' : 'password'}
                    name="new"
                    placeholder="Enter your new password"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                  >
                    {showPassword.new ? '👁' : '👁‍🗨'}
                  </button>
                </div>
                {passwordErrors.new && (
                  <p className="email-error"><span>⚠</span> {passwordErrors.new}</p>
                )}
                
                {passwords.new && (
                  <div className="strength-indicator">
                    <div className="strength-bar-container">
                      <div
                        className="strength-bar"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor(passwordStrength)
                        }}
                      />
                    </div>
                    <span
                      className="strength-label"
                      style={{ color: getStrengthColor(passwordStrength) }}
                    >
                      {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Fair' : passwordStrength < 90 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Verify Password */}
              <div className="password-field">
                <label className="password-label">Verify Password</label>
                <div className="password-input-wrap">
                  <input
                    className={`password-input${passwordErrors.verify ? ' err-field' : ''}`}
                    type={showPassword.verify ? 'text' : 'password'}
                    name="verify"
                    placeholder="Re-enter your new password"
                    value={passwords.verify}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(p => ({ ...p, verify: !p.verify }))}
                  >
                    {showPassword.verify ? '👁' : '👁‍🗨'}
                  </button>
                </div>
                {passwordErrors.verify && (
                  <p className="email-error"><span>⚠</span> {passwordErrors.verify}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="requirements-box">
                <p className="requirements-title">Password must contain:</p>
                <ul className="requirements-list">
                  <li className={passwords.new.length >= 8 ? 'met' : ''}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      {passwords.new.length >= 8 && (
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      )}
                    </svg>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(passwords.new) ? 'met' : ''}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      {/[A-Z]/.test(passwords.new) && (
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      )}
                    </svg>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(passwords.new) ? 'met' : ''}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      {/[a-z]/.test(passwords.new) && (
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      )}
                    </svg>
                    One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(passwords.new) ? 'met' : ''}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      {/[0-9]/.test(passwords.new) && (
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      )}
                    </svg>
                    One number
                  </li>
                </ul>
              </div>

              {passwordErrors.submit && (
                <p className="email-error" style={{ marginBottom: 16, justifyContent: 'center' }}>
                  <span>⚠</span> {passwordErrors.submit}
                </p>
              )}

              <button
                className="primary-btn"
                onClick={handleResetPassword}
                disabled={resetting}
              >
                <span className="btn-inner">
                  {resetting && <span className="spinner" />}
                  {resetting ? 'Resetting Password…' : 'Reset Password →'}
                </span>
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* EXPIRED                                                   */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 'expired' && (
            <div className="fp-step">
              <div className="icon-ring red">⏰</div>
              <h1 className="fp-title">OTP <span className="red">Expired</span></h1>
              <p className="fp-sub" style={{ marginBottom: 28 }}>
                Your 15-minute window has passed.<br />
                Request a new code to continue.
              </p>

              <button
                className="primary-btn"
                onClick={async () => {
                  setOtp(Array(OTP_LENGTH).fill(''))
                  setOtpPhase('idle')
                  setResend(30)
                  setExpiry(OTP_EXPIRY_SEC)
                  await handleSendEmail();
                  setStep('otp')
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

          {/* ══════════════════════════════════════════════════════════ */}
          {/* SUCCESS                                                   */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 'success' && (
            <div className="fp-step">
              <div className="icon-ring green">✓</div>
              <h1 className="fp-title"><span className="green">Password Reset!</span></h1>
              <p className="fp-sub" style={{ marginTop: 10 }}>
                Your password has been successfully changed.<br />
                Redirecting to login…
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}