import React, { useEffect, useState, useRef } from 'react'
import socket from '../../socket.js'
import { useNavigate } from 'react-router-dom'

const PHASES = {
  FINDING: 'FINDING',
  MATCH_FOUND: 'MATCH_FOUND',
  COUNTDOWN: 'COUNTDOWN',
  START: 'START',
  QUIZ: 'QUIZ',
  WAITING: 'WAITING',
  RESULT: 'RESULT',
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CSS – LearnFlex theme                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #e8f6f5;
    --bg2:         #d4efed;
    --surface:     #ffffff;
    --surface2:    #f4fafa;
    --navy:        #0d1b3e;
    --navy2:       #162347;
    --navy-light:  rgba(13,27,62,.07);
    --navy-mid:    rgba(13,27,62,.13);
    --teal:        #0ab4b4;
    --teal-dim:    rgba(10,180,180,.12);
    --teal-glow:   rgba(10,180,180,.3);
    --amber:       #f5a623;
    --amber-dim:   rgba(245,166,35,.12);
    --green:       #22c55e;
    --red:         #ef4444;
    --text:        #0d1b3e;
    --muted:       rgba(13,27,62,.45);
    --muted2:      rgba(13,27,62,.65);
    --border:      rgba(13,27,62,.1);
    --border2:     rgba(13,27,62,.18);
    --shadow:      0 4px 24px rgba(13,27,62,.1);
    --shadow-lg:   0 8px 40px rgba(13,27,62,.15);
  }

  /* ── root shell ── */
  .cr {
    min-height: 100dvh;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative; overflow: hidden;
  }

  /* floating symbols background – same style as login page */
  .cr-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .cr-bg span {
    position: absolute;
    font-size: clamp(1rem, 2.5vw, 1.6rem);
    color: var(--teal);
    opacity: .18;
    font-weight: 600;
    animation: float-sym linear infinite;
    user-select: none;
  }
  @keyframes float-sym {
    0%   { transform: translateY(0) rotate(0deg);   opacity: .12; }
    50%  { opacity: .22; }
    100% { transform: translateY(-110vh) rotate(30deg); opacity: 0; }
  }

  /* ambient blobs */
  .cr-blob {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
    filter: blur(80px);
  }
  .cr-blob.a {
    width: 500px; height: 500px;
    top: -120px; left: -100px;
    background: radial-gradient(circle, rgba(10,180,180,.18) 0%, transparent 70%);
    animation: blob-drift 20s ease-in-out infinite alternate;
  }
  .cr-blob.b {
    width: 400px; height: 400px;
    bottom: -80px; right: -80px;
    background: radial-gradient(circle, rgba(13,27,62,.1) 0%, transparent 70%);
    animation: blob-drift 26s ease-in-out infinite alternate-reverse;
  }
  @keyframes blob-drift { to { transform: translate(40px, 30px); } }

  .cr-inner {
    position: relative; z-index: 2;
    width: min(94vw, 580px);
    text-align: center;
  }

  /* ── logo pill ── */
  .match-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 100px;
    padding: 5px 16px;
    font-size: .68rem; letter-spacing: .18em; text-transform: uppercase;
    color: var(--muted2); font-weight: 700;
    margin-bottom: 36px;
    box-shadow: var(--shadow);
  }
  .match-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--teal);
    box-shadow: 0 0 8px var(--teal);
    animation: dot-pulse 2s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%,100% { opacity: 1; } 50% { opacity: .35; }
  }

  /* ═══════════════════════════════════════════════════════════════════
     FINDING
  ═══════════════════════════════════════════════════════════════════ */
  .finding {
    display: flex; flex-direction: column; align-items: center; gap: 40px;
    animation: fade-up .5s ease both;
  }
  .sonar {
    position: relative;
    width: 140px; height: 140px;
    display: flex; align-items: center; justify-content: center;
  }
  .sonar-ring {
    position: absolute; border-radius: 50%;
    border: 1.5px solid var(--teal);
    animation: sonar-out 2.4s cubic-bezier(.25,1,.5,1) infinite;
  }
  .sonar-ring:nth-child(2) { animation-delay: .8s; }
  .sonar-ring:nth-child(3) { animation-delay: 1.6s; }
  @keyframes sonar-out {
    0%   { width:48px; height:48px; opacity:.7; }
    100% { width:140px; height:140px; opacity:0; }
  }
  .sonar-core {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; z-index: 1;
    box-shadow: 0 0 0 10px rgba(10,180,180,.12), 0 0 40px var(--teal-glow);
  }
  .finding-h {
    font-size: clamp(1.9rem, 7vw, 2.8rem);
    font-weight: 800; color: var(--navy);
    letter-spacing: -.02em; line-height: 1;
  }
  .finding-sub {
    margin-top: 8px;
    font-size: .85rem; color: var(--muted);
    letter-spacing: .08em; text-transform: uppercase; font-weight: 600;
  }

  /* ═══════════════════════════════════════════════════════════════════
     VERSUS
  ═══════════════════════════════════════════════════════════════════ */
  .versus {
    display: flex; flex-direction: column; align-items: center; gap: 28px;
    animation: fade-up .45s ease both;
  }
  .found-label {
    font-size: .72rem; letter-spacing: .28em; text-transform: uppercase;
    color: var(--teal); font-weight: 800;
  }
  .players-row {
    display: flex; align-items: center; justify-content: center;
    gap: clamp(16px,5vw,36px); width: 100%;
  }
  .pcard {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    opacity: 0; animation: card-slide .55s cubic-bezier(.22,1,.36,1) forwards;
    flex: 1; max-width: 140px;
  }
  .pcard.right { animation-delay: .12s; animation-name: card-slide-r; }
  @keyframes card-slide   { from { opacity:0; transform: translateX(-24px); } to { opacity:1; transform: none; } }
  @keyframes card-slide-r { from { opacity:0; transform: translateX( 24px); } to { opacity:1; transform: none; } }

  .avatar {
    width: 84px; height: 84px; border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; font-weight: 800;
    position: relative; overflow: hidden;
  }
  .avatar::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.18) 0%, transparent 60%);
  }
  .avatar.you {
    background: var(--navy);
    border: 2px solid rgba(255,255,255,.15);
    color: #fff;
    box-shadow: var(--shadow-lg);
  }
  .avatar.opp {
    background: var(--surface);
    border: 2px solid var(--border2);
    color: var(--navy);
    box-shadow: var(--shadow);
  }
  .pname {
    font-size: 1rem; font-weight: 700;
    color: var(--navy); letter-spacing: -.01em;
  }
  .ptag {
    font-size: .65rem; letter-spacing: .18em; text-transform: uppercase;
    font-weight: 700; padding: 2px 10px; border-radius: 100px;
  }
  .ptag.you { background: var(--navy); color: #fff; }
  .ptag.opp { background: var(--teal-dim); color: var(--teal); border: 1px solid rgba(10,180,180,.3); }

  .vs-zone {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    flex-shrink: 0;
  }
  .vs-word {
    font-size: clamp(2rem, 8vw, 3rem); font-weight: 800;
    color: var(--navy); opacity: 0;
    animation: vs-appear .4s cubic-bezier(.34,1.56,.64,1) .28s forwards;
    letter-spacing: -.02em;
  }
  @keyframes vs-appear {
    from { opacity:0; transform: scale(.5); }
    to   { opacity:1; transform: scale(1); }
  }
  .vs-line {
    width: 1.5px; height: 28px;
    background: linear-gradient(to bottom, transparent, var(--border2), transparent);
  }

  /* Countdown */
  .cd-wrap {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    margin-top: 8px;
  }
  .cd-lbl {
    font-size: .68rem; letter-spacing: .22em; text-transform: uppercase;
    color: var(--muted); font-weight: 600;
  }
  .cd-num {
    font-size: clamp(4.5rem, 18vw, 7.5rem);
    font-weight: 800; line-height: 1; color: var(--navy);
    animation: cd-pop .3s cubic-bezier(.22,1,.36,1);
    display: inline-block; letter-spacing: -.04em;
  }
  @keyframes cd-pop {
    from { transform: scale(1.5); opacity: .4; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .cd-num.go {
    color: var(--teal);
    animation: go-burst .5s cubic-bezier(.34,1.56,.64,1);
    text-shadow: 0 0 48px var(--teal-glow);
  }
  @keyframes go-burst {
    from { transform: scale(.4); opacity: 0; }
    60%  { transform: scale(1.15); opacity: 1; }
    to   { transform: scale(1); opacity: 1; }
  }

  /* ═══════════════════════════════════════════════════════════════════
     TIMER BAR
  ═══════════════════════════════════════════════════════════════════ */
  .timer-bar {
    position: fixed; top: 0; left: 0; right: 0;
    height: 4px; z-index: 100;
    background: var(--bg2);
  }
  .timer-bar-fill {
    height: 100%;
    background: var(--navy);
    transition: width 1s linear, background .5s;
  }
  .timer-bar-fill.warn { background: var(--red); }

  .timer-pill {
    position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
    z-index: 100;
    background: var(--surface);
    border: 1.5px solid var(--border2);
    border-radius: 100px;
    padding: 7px 20px;
    font-size: .95rem; font-weight: 800;
    color: var(--navy);
    display: flex; align-items: center; gap: 8px;
    letter-spacing: .04em;
    box-shadow: var(--shadow);
    transition: color .5s, border-color .5s, box-shadow .5s;
  }
  .timer-pill.warn {
    color: var(--red);
    border-color: rgba(239,68,68,.35);
    box-shadow: 0 4px 24px rgba(239,68,68,.15);
    animation: pill-throb 1s ease-in-out infinite;
  }
  @keyframes pill-throb {
    0%,100% { transform: translateX(-50%) scale(1); }
    50%      { transform: translateX(-50%) scale(1.04); }
  }
  .timer-icon { font-size: .8rem; }

  /* ═══════════════════════════════════════════════════════════════════
     QUIZ
  ═══════════════════════════════════════════════════════════════════ */
  .quiz {
    display: flex; flex-direction: column; gap: 12px;
    text-align: left;
    animation: fade-up .4s cubic-bezier(.22,1,.36,1);
    padding-top: 68px;
  }

  .quiz-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2px;
  }
  .quiz-step {
    font-size: .68rem; letter-spacing: .18em; text-transform: uppercase;
    color: var(--muted); font-weight: 600;
  }
  .quiz-player {
    font-size: .72rem; font-weight: 700;
    color: #fff;
    background: var(--navy);
    padding: 4px 12px; border-radius: 100px;
  }

  .progress-track {
    height: 4px; border-radius: 2px;
    background: var(--navy-light);
    margin-bottom: 22px; overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--navy);
    border-radius: 2px;
    transition: width .5s cubic-bezier(.22,1,.36,1);
  }

  .q-text {
    font-size: clamp(.95rem, 3vw, 1.08rem);
    font-weight: 600; color: var(--text);
    line-height: 1.7; margin-bottom: 6px;
  }

  .q-image {
    border-radius: 12px; overflow: hidden;
    border: 1.5px solid var(--border);
    background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    padding: 14px;
    box-shadow: var(--shadow);
  }
  .q-image img {
    max-width: 100%; max-height: 220px; object-fit: contain; border-radius: 6px;
  }

  /* Options */
  .opt {
    display: flex; align-items: center; gap: 14px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 13px 16px;
    cursor: pointer;
    transition: border-color .15s, background .15s, transform .1s, box-shadow .15s;
    width: 100%; text-align: left;
    box-shadow: 0 2px 8px rgba(13,27,62,.06);
  }
  .opt:hover:not(.sel) {
    border-color: var(--border2);
    background: var(--surface2);
    box-shadow: 0 4px 16px rgba(13,27,62,.1);
  }
  .opt.sel {
    background: var(--navy);
    border-color: var(--navy);
    box-shadow: 0 4px 20px rgba(13,27,62,.25);
  }
  .opt:active { transform: scale(.985); }

  .opt-badge {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: .82rem; font-weight: 800;
    flex-shrink: 0;
    background: var(--surface2);
    color: var(--muted);
    border: 1.5px solid var(--border);
    transition: background .15s, color .15s, border-color .15s;
  }
  .opt.sel .opt-badge {
    background: rgba(255,255,255,.15);
    color: #fff;
    border-color: rgba(255,255,255,.2);
  }
  .opt-txt {
    font-size: .9rem; font-weight: 500;
    color: var(--muted2);
    line-height: 1.5;
    transition: color .15s;
  }
  .opt.sel .opt-txt { color: #fff; }

  /* Next / Finish button */
  .next-btn {
    margin-top: 6px; padding: 14px 0;
    background: var(--navy);
    border: none; border-radius: 12px;
    font-size: .92rem; font-weight: 700;
    letter-spacing: .04em;
    color: #fff; cursor: pointer;
    opacity: 0; pointer-events: none;
    transform: translateY(8px);
    transition: opacity .2s, transform .2s, box-shadow .2s;
    box-shadow: 0 0 0 0 rgba(13,27,62,0);
  }
  .next-btn.show {
    opacity: 1; pointer-events: auto; transform: none;
    box-shadow: 0 4px 24px rgba(13,27,62,.25);
  }
  .next-btn:hover { box-shadow: 0 6px 32px rgba(13,27,62,.35); transform: translateY(-1px); }
  .next-btn:active { transform: scale(.97); }

  /* ═══════════════════════════════════════════════════════════════════
     WAITING
  ═══════════════════════════════════════════════════════════════════ */
  .waiting {
    display: flex; flex-direction: column; align-items: center; gap: 28px;
    animation: fade-up .5s ease both;
  }
  .spin-ring {
    width: 88px; height: 88px; border-radius: 50%;
    border: 3px solid var(--navy-light);
    border-top-color: var(--navy);
    animation: spin 1s linear infinite;
    box-shadow: 0 0 24px rgba(13,27,62,.12);
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .wait-h {
    font-size: clamp(1.6rem,6vw,2.2rem);
    font-weight: 800; color: var(--navy); letter-spacing: -.02em;
  }
  .wait-sub { font-size: .85rem; color: var(--muted); max-width: 280px; line-height: 1.6; font-weight: 500; }

  /* ═══════════════════════════════════════════════════════════════════
     RESULT
  ═══════════════════════════════════════════════════════════════════ */
  .result {
    display: flex; flex-direction: column; gap: 12px;
    text-align: left; animation: fade-up .5s ease both;
    max-height: 80vh; overflow-y: auto; padding-right: 6px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }

  .result-top {
    text-align: center; padding-bottom: 22px;
    border-bottom: 1.5px solid var(--border);
    margin-bottom: 4px;
  }
  .result-title {
    font-size: clamp(1.7rem,6vw,2.4rem); font-weight: 800;
    color: var(--navy); margin-bottom: 16px; letter-spacing: -.02em;
  }

  .winner-banner {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 11px 24px; border-radius: 12px;
    font-size: clamp(1rem,4vw,1.3rem); font-weight: 800;
    letter-spacing: -.01em; margin-bottom: 20px;
  }
  .winner-banner.win  { background: var(--navy); color: #fff; box-shadow: var(--shadow-lg); }
  .winner-banner.lose { background: var(--surface); color: var(--navy); border: 1.5px solid var(--border2); }
  .winner-banner.tie  { background: var(--teal-dim); border: 1px solid rgba(10,180,180,.3); color: var(--teal); }

  .scores-row {
    display: flex; justify-content: center; gap: 56px; margin-top: 4px;
  }
  .score-col { text-align: center; }
  .score-lbl {
    font-size: .65rem; letter-spacing: .2em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 6px; font-weight: 600;
  }
  .score-num {
    font-size: 2.4rem; font-weight: 800;
    line-height: 1; letter-spacing: -.04em;
  }
  .score-num.you { color: var(--navy); }
  .score-num.opp { color: var(--teal); }
  .score-denom {
    font-size: .78rem; color: var(--muted); margin-top: 2px; font-weight: 500;
  }

  /* result question cards */
  .rcard {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 14px; padding: 16px;
    box-shadow: 0 2px 10px rgba(13,27,62,.06);
    transition: border-color .15s;
  }
  .rcard:hover { border-color: var(--border2); }
  .rcard-num {
    font-size: .65rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 10px;
  }
  .rcard-responses { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .rcard-resp {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    background: var(--surface2);
    border-radius: 8px; font-size: .82rem;
    border: 1px solid var(--border);
  }
  .resp-who {
    font-size: .7rem; font-weight: 800; letter-spacing: .08em; min-width: 58px;
  }
  .resp-who.you { color: var(--navy); }
  .resp-who.opp { color: var(--teal); }
  .resp-ans { color: var(--muted2); font-weight: 500; }
  .resp-correct-tag {
    margin-left: auto;
    font-size: .68rem; font-weight: 700;
    padding: 2px 9px; border-radius: 100px;
  }
  .resp-correct-tag.right { background: rgba(34,197,94,.1); color: var(--green); border: 1px solid rgba(34,197,94,.25); }
  .resp-correct-tag.wrong { background: rgba(239,68,68,.08); color: var(--red); border: 1px solid rgba(239,68,68,.2); }

  .correct-row {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px;
    background: rgba(34,197,94,.07);
    border: 1px solid rgba(34,197,94,.2);
    border-radius: 8px;
    font-size: .82rem; color: var(--green); font-weight: 600;
  }

  /* buttons */
  .actions { display: flex; gap: 10px; margin-top: 8px; }
  .btn-primary {
    flex: 1; padding: 14px 0;
    background: var(--navy); border: none; border-radius: 12px;
    font-size: .9rem; font-weight: 800;
    letter-spacing: .03em; color: #fff; cursor: pointer;
    transition: box-shadow .2s, transform .1s;
    box-shadow: 0 4px 24px rgba(13,27,62,.22);
  }
  .btn-primary:hover { box-shadow: 0 6px 32px rgba(13,27,62,.35); transform: translateY(-1px); }
  .btn-primary:active { transform: scale(.97); }

  .btn-secondary {
    flex: 1; padding: 14px 0;
    background: var(--surface);
    border: 1.5px solid var(--border2);
    border-radius: 12px;
    font-size: .9rem; font-weight: 800;
    letter-spacing: .03em; color: var(--navy); cursor: pointer;
    transition: border-color .15s, transform .1s, background .15s, box-shadow .15s;
    box-shadow: 0 2px 8px rgba(13,27,62,.06);
  }
  .btn-secondary:hover { border-color: var(--navy); background: var(--surface2); box-shadow: 0 4px 16px rgba(13,27,62,.1); }
  .btn-secondary:active { transform: scale(.97); }

  /* ── shared ── */
  @keyframes fade-up {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: none; }
  }
`

const SYMBOLS = ["?", "!", "∑", "π", "A", "B", "C", "√", "%", "{ }"];
const colors = ["#0b2a4a", "#123d6b", "#1c4f85", "#2e6bb3"];

function BgSymbols() {
  const items = Array.from({ length: 22 }, (_, i) => {
    const sym = SYMBOLS[i % SYMBOLS.length]
    const color = colors[i % colors.length]   // 👈 pick a color by index
    const left = (i * 4.5 + 2) % 98
    const delay = (i * 1.1) % 14
    const dur = 12 + (i % 7)
    const size = 0.8 + (i % 3) * 0.4
    return (
      <span
        key={i}
        style={{
          left: `${left}%`,
          bottom: '-10%',
          fontSize: `${size}rem`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          color: color,
        }}
      >
        {sym}
      </span>
    )
  })
  return <div className="cr-bg">{items}</div>
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function CompetitionPage({ onQuizStart }) {
  const [phase, setPhase] = useState(PHASES.FINDING)
  const [matchData, setMatchData] = useState(null)
  const [count, setCount] = useState(3)
  const [dots, setDots] = useState('')
  const countRef = useRef(null)
  const navigate = useNavigate()

  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [userAnswers, setUserAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(600)
  const [resultData, setResultData] = useState(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const timerRef = useRef(null)

  /* dots */
  useEffect(() => {
    if (phase !== PHASES.FINDING) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(id)
  }, [phase])

  /* quiz timer */
  useEffect(() => {
    if (phase !== PHASES.QUIZ) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  /* socket */
  useEffect(() => {
    const examId = localStorage.getItem('examId') || 'demo'
    const name = localStorage.getItem('name')
    socket.emit('find_match', { exam_id: examId, name })

    socket.on('opponent_left', () => {
      alert('Opponent disconnected ')
      window.location.reload()
    })

    socket.on('match_found', (data) => {
      const mySocketId = socket.id
      const me = data.player.socketId === mySocketId ? data.player : data.opponent
      const opponent = data.player.socketId === mySocketId ? data.opponent : data.player
      setMatchData({ ...data, player: me, opponent })
      setPhase(PHASES.MATCH_FOUND)
      setTimeout(() => { setPhase(PHASES.COUNTDOWN); setCount(3) }, 1800)
    })

    socket.on('result', (data) => {
      if (data.msg === 'Waiting for Opponent') {
        setWaitingForOpponent(true); setPhase(PHASES.WAITING)
      } else if (data.msg === 'success') {
        setResultData(data.result); setWaitingForOpponent(false); setPhase(PHASES.RESULT)
      }
    })

    return () => {
      socket.off('match_found')
      socket.off('result')
      socket.off('opponent_left')
    }
  }, [])

  /* countdown */
  useEffect(() => {
    if (phase !== PHASES.COUNTDOWN) return
    countRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(countRef.current)
          setPhase(PHASES.START)
          setTimeout(() => setPhase(PHASES.QUIZ), 650)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countRef.current)
  }, [phase])

  /* quiz helpers */
  const questions = matchData?.questions || []

  function handleNext() {
    if (selected === null) return
    const answerIndex = selected + 1
    setUserAnswers(prev => [...prev, answerIndex])
    if (currentQ + 1 >= questions.length) {
      handleSubmit([...userAnswers, answerIndex])
      return
    }
    setCurrentQ(q => q + 1)
    setSelected(null)
  }

  function handleSubmit(answers = userAnswers) {
    clearInterval(timerRef.current)
    const roomId = matchData?.roomId || localStorage.getItem('roomId')
    socket.emit('submit', { result: answers, roomId })
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const timerPct = (timeLeft / 600) * 100
  const isWarn = timeLeft <= 60

  /* ── render ── */
  return (
    <>
      <style>{css}</style>
      <div className="cr">
        <BgSymbols />
        <div className="cr-blob a" />
        <div className="cr-blob b" />

        {/* ── timer (quiz only) ── */}
        {phase === PHASES.QUIZ && (
          <>
            <div className="timer-bar">
              <div
                className={`timer-bar-fill${isWarn ? ' warn' : ''}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
            <div className={`timer-pill${isWarn ? ' warn' : ''}`}>
              <span className="timer-icon">⏱</span>
              {formatTime(timeLeft)}
            </div>
          </>
        )}

        <div className="cr-inner">

          {/* ── FINDING ── */}
          {phase === PHASES.FINDING && (
            <div className="finding">
              <div className="sonar">
                <div className="sonar-ring" />
                <div className="sonar-ring" />
                <div className="sonar-ring" />
                <div className="sonar-core">🧠</div>
              </div>
              <div>
                <p className="finding-h">Finding Opponent</p>
                <p className="finding-sub">Searching for a match{dots}</p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => {navigate('/homepage'); io.emit("disconnect")}}
                style={{ marginTop: '12px', minWidth: '180px' }}
              >
                Cancel Search
              </button>
            </div>
          )}

          {/* ── MATCH FOUND / COUNTDOWN / START ── */}
          {[PHASES.MATCH_FOUND, PHASES.COUNTDOWN, PHASES.START].includes(phase) && matchData && (
            <div className="versus">
              <p className="found-label">⚡ Match Found</p>

              <div className="players-row">
                {/* You */}
                <div className="pcard left">
                  <div className="avatar you">
                    {matchData.player?.avatar || matchData.player?.name?.[0]?.toUpperCase() || 'ME'}
                  </div>
                  <span className="pname">{matchData.player?.name || 'You'}</span>
                  <span className="ptag you">You</span>
                </div>

                {/* VS */}
                <div className="vs-zone">
                  <div className="vs-line" />
                  <span className="vs-word">VS</span>
                  <div className="vs-line" />
                </div>

                {/* Opponent */}
                <div className="pcard right">
                  <div className="avatar opp">
                    {matchData.opponent?.avatar || matchData.opponent?.name?.[0]?.toUpperCase() || 'OP'}
                  </div>
                  <span className="pname">{matchData.opponent?.name || 'Opponent'}</span>
                  <span className="ptag opp">Opponent</span>
                </div>
              </div>

              {[PHASES.COUNTDOWN, PHASES.START].includes(phase) && (
                <div className="cd-wrap">
                  <span className="cd-lbl">Starting in</span>
                  {phase === PHASES.COUNTDOWN && (
                    <span key={count} className="cd-num">{count}</span>
                  )}
                  {phase === PHASES.START && (
                    <span className="cd-num go">GO!</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── QUIZ ── */}
          {phase === PHASES.QUIZ && questions.length > 0 && (() => {
            const q = questions[currentQ]
            const options = [q.Option_1, q.Option_2, q.Option_3, q.Option_4]
            return (
              <div className="quiz" key={currentQ}>
                <div className="quiz-head">
                  <span className="quiz-step">Q {currentQ + 1} / {questions.length}</span>
                  <span className="quiz-player">{matchData?.player?.name || 'You'}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div className="q-text">
                  {q.Question_Statement.split('\n').map((line, i) =>
                    line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
                  )}
                </div>

                {q.Image && (
                  <div className="q-image">
                    <img src={q.Image} alt="diagram" />
                  </div>
                )}

                {options.map((opt, i) => (
                  <button
                    key={i}
                    className={`opt${selected === i ? ' sel' : ''}`}
                    onClick={() => setSelected(i)}
                  >
                    <span className="opt-badge">{OPTION_LABELS[i]}</span>
                    <span className="opt-txt">{opt?.trim()}</span>
                  </button>
                ))}

                <button
                  className={`next-btn${selected !== null ? ' show' : ''}`}
                  onClick={handleNext}
                >
                  {currentQ + 1 >= questions.length ? 'Finish Quiz →' : 'Next Question →'}
                </button>
              </div>
            )
          })()}

          {/* ── WAITING ── */}
          {phase === PHASES.WAITING && (
            <div className="waiting">
              <div className="spin-ring" />
              <div>
                <p className="wait-h">Waiting for Opponent</p>
                <p className="wait-sub">
                  {matchData?.opponent?.name || 'Your opponent'} is still completing the quiz…
                </p>
              </div>
            </div>
          )}

          {/* ── RESULT ── */}
          {phase === PHASES.RESULT && resultData && (() => {
            const mySocketId = socket.id
            const myResult = resultData[mySocketId]
            const oppResult = resultData[Object.keys(resultData).find(id => id !== mySocketId)]
            const myScore = myResult?.filter((a, i) => Number(a) === Number(questions[i]?.Answer)).length || 0
            const oppScore = oppResult?.filter((a, i) => Number(a) === Number(questions[i]?.Answer)).length || 0
            const outcome = myScore > oppScore ? 'win' : oppScore > myScore ? 'lose' : 'tie'

            return (
              <div className="result">
                <div className="result-top">
                  <p className="result-title">Quiz Complete</p>

                  <div className={`winner-banner ${outcome}`}>
                    {outcome === 'win' && <><span>🏆</span> You Win!</>}
                    {outcome === 'lose' && <><span>😤</span> {matchData?.opponent?.name || 'Opponent'} Wins</>}
                    {outcome === 'tie' && <><span>🤝</span> It's a Tie!</>}
                  </div>

                  <div className="scores-row">
                    <div className="score-col">
                      <p className="score-lbl">Your Score</p>
                      <p className="score-num you">{myScore}</p>
                      <p className="score-denom">out of {questions.length}</p>
                    </div>
                    <div className="score-col">
                      <p className="score-lbl">{matchData?.opponent?.name || 'Opponent'}</p>
                      <p className="score-num opp">{oppScore}</p>
                      <p className="score-denom">out of {questions.length}</p>
                    </div>
                  </div>
                </div>

                {questions.map((q, idx) => {
                  const myAns = myResult?.[idx]
                  const oppAns = oppResult?.[idx]
                  const correct = q.Answer
                  return (
                    <div key={idx} className="rcard">
                      <p className="rcard-num">Question {idx + 1}</p>
                      <div className="rcard-responses">
                        <div className="rcard-resp">
                          <span className="resp-who you">You</span>
                          <span className="resp-ans">
                            {OPTION_LABELS[myAns - 1]} — {q[`Option_${myAns}`]?.trim()}
                          </span>
                          <span className={`resp-correct-tag ${Number(myAns) === Number(correct) ? 'right' : 'wrong'}`}>
                            {Number(myAns) === Number(correct) ? '✓ Correct' : '✗ Wrong'}
                          </span>
                        </div>
                        <div className="rcard-resp">
                          <span className="resp-who opp">
                            {matchData?.opponent?.name?.split(' ')[0] || 'Opponent'}
                          </span>
                          <span className="resp-ans">
                            {OPTION_LABELS[oppAns - 1]} — {q[`Option_${oppAns}`]?.trim()}
                          </span>
                          <span className={`resp-correct-tag ${Number(oppAns) === Number(correct) ? 'right' : 'wrong'}`}>
                            {Number(oppAns) === Number(correct) ? '✓ Correct' : '✗ Wrong'}
                          </span>
                        </div>
                      </div>
                      <div className="correct-row">
                        <span>✓</span>
                        <span>
                          Correct: <strong>{OPTION_LABELS[correct - 1]}</strong> — {q[`Option_${correct}`]?.trim()}
                        </span>
                      </div>
                    </div>
                  )
                })}

                <div className="actions">
                  <button className="btn-primary" onClick={() => navigate('/homepage')}>
                    🏠 Home
                  </button>
                  <button className="btn-secondary" onClick={() => window.location.reload()}>
                    🔄 Rematch
                  </button>
                </div>
              </div>
            )
          })()}

          {phase === PHASES.QUIZ && questions.length === 0 && (
            <p style={{ color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', fontSize: '.8rem' }}>
              No questions found.
            </p>
          )}
        </div>
      </div>
    </>
  )
}