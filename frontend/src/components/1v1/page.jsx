import React, { useEffect, useState, useRef } from 'react'
import socket from '../../socket.js'

const PHASES = {
  FINDING: 'FINDING',
  MATCH_FOUND: 'MATCH_FOUND',
  COUNTDOWN: 'COUNTDOWN',
  START: 'START',
  QUIZ: 'QUIZ',
}

export default function CompetitionPage({ onQuizStart }) {
  const [phase, setPhase] = useState(PHASES.FINDING)
  const [matchData, setMatchData] = useState(null)
  const [count, setCount] = useState(3)
  const [dots, setDots] = useState('')
  const countRef = useRef(null)

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)

  // ── pulsing dots ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.FINDING) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(id)
  }, [phase])

  // ── socket logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    const examId = localStorage.getItem('examId') || 'demo'
    const name = localStorage.getItem('name')
    socket.emit('find_match', { exam_id: examId, name })
    socket.on("opponent_left", () => {
      alert("Opponent disconnected 😢");
      window.location.reload(); 
    });
    socket.on('match_found', (data) => {
      // ── Identify who is "you" vs "opponent" by matching socket.id ──────────
      const mySocketId = socket.id

      const me = data.player.socketId === mySocketId ? data.player : data.opponent
      const opponent = data.player.socketId === mySocketId ? data.opponent : data.player

      const resolvedData = {
        ...data,
        player: me,
        opponent: opponent,
      }

      setMatchData(resolvedData)
      setPhase(PHASES.MATCH_FOUND)
      setTimeout(() => { setPhase(PHASES.COUNTDOWN); setCount(3) }, 1800)
    })

    return () => socket.off('match_found')
  }, [])

  // ── countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.COUNTDOWN) return
    countRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(countRef.current)
          setPhase(PHASES.START)
          // Show GO! for 600 ms then enter quiz
          setTimeout(() => setPhase(PHASES.QUIZ), 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countRef.current)
  }, [phase])

  // ── quiz helpers ───────────────────────────────────────────────────────────
  const questions = matchData?.questions || []

  function handleNext() {
    if (selected === null) return
    if (currentQ + 1 >= questions.length) {
      // All questions done — hand off to parent
      onQuizStart?.()
      return
    }
    setCurrentQ(q => q + 1)
    setSelected(null)
  }

  const OPTION_LABELS = ['A', 'B', 'C', 'D']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .comp-root {
          min-height: 100vh;
          background: #09090f;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .comp-root::before {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(255,255,255,.018) 2px, rgba(255,255,255,.018) 4px
          );
          pointer-events: none; z-index: 0;
        }

        .comp-inner {
          position: relative; z-index: 1;
          width: min(92vw, 560px);
          text-align: center;
        }

        /* ── FINDING ── */
        .finding-wrap { display: flex; flex-direction: column; align-items: center; gap: 36px; }
        .radar-ring {
          position: relative; width: 160px; height: 160px;
          display: flex; align-items: center; justify-content: center;
        }
        .radar-ring::before, .radar-ring::after {
          content: ''; position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(250,200,0,.35);
          animation: radar-pulse 2s ease-out infinite;
        }
        .radar-ring::after { animation-delay: 1s; }
        @keyframes radar-pulse {
          0%   { width:60px;  height:60px;  opacity:.9; }
          100% { width:160px; height:160px; opacity:0; }
        }
        .radar-core {
          width: 60px; height: 60px; border-radius: 50%;
          background: #fac800;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          animation: core-breathe 2s ease-in-out infinite;
        }
        @keyframes core-breathe {
          0%,100% { box-shadow: 0 0 32px rgba(250,200,0,.5); }
          50%     { box-shadow: 0 0 56px rgba(250,200,0,.85); }
        }
        .finding-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem,8vw,3.2rem); letter-spacing:.12em;
          color: #fff;
        }
        .finding-sub {
          font-size: .95rem; color: rgba(255,255,255,.45);
          letter-spacing: .08em; text-transform: uppercase;
          margin-top: -16px; min-width: 180px;
        }

        /* ── VERSUS ── */
        .versus-wrap {
          display: flex; align-items: center; justify-content: center;
          gap: clamp(12px,5vw,32px);
        }
        .player-card {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          opacity: 0; transform: translateY(24px) scale(.92);
          animation: card-in .6s cubic-bezier(.22,1,.36,1) forwards;
        }
        .player-card.right { animation-delay: .15s; }
        @keyframes card-in { to { opacity:1; transform:translateY(0) scale(1); } }
        .avatar {
          width:88px; height:88px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-family:'Bebas Neue',sans-serif; font-size:1.8rem;
          letter-spacing:.06em; border:2.5px solid; position:relative;
        }
        .avatar.you { background:rgba(250,200,0,.12); border-color:#fac800; color:#fac800; }
        .avatar.opp { background:rgba(0,190,255,.1);  border-color:#00beff; color:#00beff; }
        .p-name { font-family:'Bebas Neue',sans-serif; font-size:1.2rem; letter-spacing:.1em; color:#fff; }
        .p-tag  { font-size:.7rem; letter-spacing:.15em; text-transform:uppercase; margin-top:-10px; }
        .p-tag.you { color:rgba(250,200,0,.7); }
        .p-tag.opp { color:rgba(0,190,255,.7); }

        .vs-badge {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(2rem,8vw,3.5rem); color:#fff;
          opacity:0; animation:vs-pop .4s cubic-bezier(.34,1.56,.64,1) .3s forwards;
          flex-shrink:0; position:relative;
        }
        @keyframes vs-pop { to { opacity:1; } }
        .vs-badge::before {
          content:''; position:absolute; inset:-6px -10px;
          border:1.5px solid rgba(255,255,255,.15); border-radius:4px;
          animation:vs-glow 1.5s ease-in-out .3s infinite alternate;
        }
        @keyframes vs-glow {
          from { box-shadow:0 0 8px  rgba(255,255,255,.1); }
          to   { box-shadow:0 0 28px rgba(255,255,255,.35); }
        }
        .lightning {
          position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(90deg,
            rgba(250,200,0,.12) 0%, transparent 35%,
            transparent 65%, rgba(0,190,255,.12) 100%);
          animation:lt-flicker 2.5s ease-in-out infinite;
        }
        @keyframes lt-flicker {
          0%,100%  { opacity:1; }
          48%,52%  { opacity:.3; }
          50%      { opacity:.9; }
        }

        /* ── COUNTDOWN ── */
        .countdown-wrap { margin-top:40px; display:flex; flex-direction:column; align-items:center; gap:10px; }
        .cd-label { font-size:.75rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.4); }
        .cd-digit {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(4rem,18vw,7rem); line-height:1;
          color:#fac800; animation:digit-bump .25s cubic-bezier(.22,1,.36,1);
          display:inline-block;
        }
        @keyframes digit-bump {
          0%   { transform:scale(1.45); opacity:.5; }
          100% { transform:scale(1);    opacity:1; }
        }
        .cd-digit.go {
          color:#00e887;
          animation:go-pop .5s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes go-pop {
          0%   { transform:scale(.5);  opacity:0; }
          60%  { transform:scale(1.2); opacity:1; }
          100% { transform:scale(1);   opacity:1; }
        }

        /* ── QUIZ ── */
        .quiz-wrap {
          display: flex; flex-direction: column; align-items: stretch;
          gap: 16px; text-align: left;
          animation: quiz-in .45s cubic-bezier(.22,1,.36,1);
        }
        @keyframes quiz-in {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .quiz-meta {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 4px;
        }
        .quiz-progress {
          font-size:.72rem; letter-spacing:.18em; text-transform:uppercase;
          color:rgba(255,255,255,.4);
        }
        .quiz-progress-bar {
          height: 3px; border-radius: 2px;
          background: rgba(255,255,255,.1);
          margin-bottom: 20px; overflow: hidden;
        }
        .quiz-progress-fill {
          height: 100%; background: #fac800;
          border-radius: 2px;
          transition: width .4s ease;
        }

        .quiz-question {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(1rem, 3.5vw, 1.2rem);
          font-weight: 600;
          color: #fff;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .option-btn {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,.04);
          border: 1.5px solid rgba(255,255,255,.1);
          border-radius: 10px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background .15s, border-color .15s, transform .1s;
          width: 100%; text-align: left;
        }
        .option-btn:hover:not(.selected) {
          background: rgba(255,255,255,.09);
          border-color: rgba(255,255,255,.22);
        }
        .option-btn.selected {
          background: rgba(250,200,0,.12);
          border-color: #fac800;
        }
        .option-btn:active { transform: scale(.98); }

        .option-label {
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: .95rem; letter-spacing: .06em; flex-shrink: 0;
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.5);
          transition: background .15s, color .15s;
        }
        .option-btn.selected .option-label {
          background: #fac800;
          color: #09090f;
        }
        .option-text {
          font-size: .92rem; color: rgba(255,255,255,.8); line-height: 1.45;
        }
        .option-btn.selected .option-text { color: #fff; }

        .next-btn {
          margin-top: 8px;
          padding: 13px 0;
          background: #fac800;
          border: none; border-radius: 10px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: .14em;
          color: #09090f; cursor: pointer;
          opacity: 0; pointer-events: none;
          transition: opacity .2s, transform .1s;
        }
        .next-btn.visible { opacity: 1; pointer-events: auto; }
        .next-btn:hover  { transform: scale(1.02); }
        .next-btn:active { transform: scale(.97); }

        /* ── corner deco ── */
        .corner { position: fixed; width: 48px; height: 48px; }
        .corner.tl { top:20px; left:20px;  border-top:1.5px solid rgba(250,200,0,.3); border-left:1.5px solid rgba(250,200,0,.3); }
        .corner.tr { top:20px; right:20px; border-top:1.5px solid rgba(0,190,255,.3); border-right:1.5px solid rgba(0,190,255,.3); }
        .corner.bl { bottom:20px; left:20px;  border-bottom:1.5px solid rgba(250,200,0,.3); border-left:1.5px solid rgba(250,200,0,.3); }
        .corner.br { bottom:20px; right:20px; border-bottom:1.5px solid rgba(0,190,255,.3); border-right:1.5px solid rgba(0,190,255,.3); }
      `}</style>

      <div className="comp-root">
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="comp-inner">

          {/* ── FINDING ─────────────────────────────────────────────────── */}
          {phase === PHASES.FINDING && (
            <div className="finding-wrap">
              <div className="radar-ring">
                <div className="radar-core">🔍</div>
              </div>
              <div>
                <p className="finding-title">Finding Opponent</p>
                <p className="finding-sub">Searching for a match{dots}</p>
              </div>
            </div>
          )}

          {/* ── MATCH FOUND / COUNTDOWN / START ─────────────────────────── */}
          {[PHASES.MATCH_FOUND, PHASES.COUNTDOWN, PHASES.START].includes(phase) && matchData && (
            <div style={{ position: 'relative' }}>
              <div className="lightning" />
              <p style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(1rem,4vw,1.3rem)',
                letterSpacing: '.25em', color: 'rgba(255,255,255,.5)',
                marginBottom: 28, textTransform: 'uppercase',
              }}>Match Found!</p>

              <div className="versus-wrap">
                <div className="player-card left">
                  <div className="avatar you">
                    {matchData.player?.avatar || matchData.player?.name?.[0]?.toUpperCase() || 'ME'}
                  </div>
                  <span className="p-name">{matchData.player?.name || 'You'}</span>
                  <span className="p-tag you">Player 1</span>
                </div>

                <div className="vs-badge">VS</div>

                <div className="player-card right">
                  <div className="avatar opp">
                    {matchData.opponent?.avatar || matchData.opponent?.name?.[0]?.toUpperCase() || 'OP'}
                  </div>
                  <span className="p-name">{matchData.opponent?.name || 'Opponent'}</span>
                  <span className="p-tag opp">Player 2</span>
                </div>
              </div>

              {[PHASES.COUNTDOWN, PHASES.START].includes(phase) && (
                <div className="countdown-wrap">
                  <span className="cd-label">Quiz starts in</span>
                  {phase === PHASES.COUNTDOWN && (
                    <span key={count} className="cd-digit">{count}</span>
                  )}
                  {phase === PHASES.START && (
                    <span className="cd-digit go">GO!</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── QUIZ ─────────────────────────────────────────────────────── */}
          // ── QUIZ phase (replace the existing QUIZ block) ──────────────────────────

          {phase === PHASES.QUIZ && questions.length > 0 && (() => {
            const q = questions[currentQ]
            const options = [q.Option_1, q.Option_2, q.Option_3, q.Option_4]
            const OPTION_LABELS = ['A', 'B', 'C', 'D']

            return (
              <div className="quiz-wrap" key={currentQ}>

                {/* ── progress bar ── */}
                <div className="quiz-meta">
                  <span className="quiz-progress">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  <span className="quiz-progress" style={{ color: 'rgba(250,200,0,.7)' }}>
                    {matchData?.player?.name || 'You'}
                  </span>
                </div>
                <div className="quiz-progress-bar">
                  <div
                    className="quiz-progress-fill"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* ── question statement (supports \n line breaks) ── */}
                <div className="quiz-question">
                  {q.Question_Statement.split('\n').map((line, i) =>
                    line.trim() === ''
                      ? <br key={i} />
                      : <p key={i} style={{ margin: '2px 0' }}>{line}</p>
                  )}
                </div>

                {/* ── optional image ── */}
                {q.Image && (
                  <div style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: '1.5px solid rgba(255,255,255,.1)',
                    background: 'rgba(255,255,255,.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                  }}>
                    <img
                      src={q.Image}
                      alt="question diagram"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 240,
                        objectFit: 'contain',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                )}

                {/* ── options ── */}
                {options.map((opt, i) => {
                  const optionNumber = i + 1  // Answer is 1-indexed
                  const isSelected = selected === i
                  const isRevealed = selected !== null
                  const isCorrect = optionNumber === q.Answer

                  let extraClass = ''
                  let extraStyle = {}

                  if (isRevealed) {
                    if (isCorrect) {
                      extraClass = ' correct'
                      extraStyle = {
                        background: 'rgba(0,232,135,.12)',
                        borderColor: '#00e887',
                      }
                    } else if (isSelected && !isCorrect) {
                      extraClass = ' wrong'
                      extraStyle = {
                        background: 'rgba(255,80,80,.12)',
                        borderColor: '#ff5050',
                      }
                    }
                  } else if (isSelected) {
                    extraClass = ' selected'
                  }

                  return (
                    <button
                      key={i}
                      className={`option-btn${isSelected ? ' selected' : ''}${extraClass}`}
                      style={extraStyle}
                      onClick={() => selected === null && setSelected(i)}
                      disabled={isRevealed && !isSelected}
                    >
                      <span
                        className="option-label"
                        style={
                          isRevealed && isCorrect
                            ? { background: '#00e887', color: '#09090f' }
                            : isRevealed && isSelected && !isCorrect
                              ? { background: '#ff5050', color: '#fff' }
                              : {}
                        }
                      >
                        {isRevealed && isCorrect
                          ? '✓'
                          : isRevealed && isSelected && !isCorrect
                            ? '✗'
                            : OPTION_LABELS[i]}
                      </span>
                      <span className="option-text">{opt?.trim()}</span>
                    </button>
                  )
                })}

                {/* ── next / finish ── */}
                <button
                  className={`next-btn${selected !== null ? ' visible' : ''}`}
                  onClick={handleNext}
                >
                  {currentQ + 1 >= questions.length ? 'Finish' : 'Next →'}
                </button>

              </div>
            )
          })()}

          {/* fallback if no questions in data */}
          {phase === PHASES.QUIZ && questions.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', fontSize: '.85rem' }}>
              No questions found.
            </p>
          )}

        </div>
      </div>
    </>
  )
}