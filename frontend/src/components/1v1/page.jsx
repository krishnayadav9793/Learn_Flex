import React, { useEffect, useState, useRef } from 'react'
import socket from '../../socket.js'

// ── Inline mock socket for preview (remove when integrating) ──────────────────
// const socket = {
//   _handlers: {},
//   emit(event, data) {
//     console.log('[socket.emit]', event, data)
//     if (event === 'find_match') {
//       setTimeout(() => {
//         const h = this._handlers['match_found']
//         if (h) h({ opponent: { name: 'PlayerOne', avatar: 'PO' }, player: { name: 'You', avatar: 'YO' } })
//       }, 3000)
//     }
//   },
//   on(event, cb) { this._handlers[event] = cb },
//   off(event)    { delete this._handlers[event] },
// }
// ─────────────────────────────────────────────────────────────────────────────

const PHASES = {
  FINDING:    'FINDING',
  MATCH_FOUND:'MATCH_FOUND',
  COUNTDOWN:  'COUNTDOWN',
  START:      'START',
}

// ── tiny CSS-in-JS helper ─────────────────────────────────────────────────────
const style = (obj) => Object.entries(obj).reduce((s,[k,v])=>`${s}${k.replace(/([A-Z])/g,'-$1').toLowerCase()}:${v};`,'')

export default function CompetitionPage({ onQuizStart }) {
  const [phase, setPhase]         = useState(PHASES.FINDING)
  const [matchData, setMatchData] = useState(null)
  const [count, setCount]         = useState(3)
  const [dots, setDots]           = useState('')
  const countRef                  = useRef(null)

  // ── pulsing dots while searching ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.FINDING) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(id)
  }, [phase])
  
  // ── socket logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    const examId = localStorage.getItem('examId') || 'demo'
    const name = localStorage.getItem('name');
    socket.emit('find_match', { exam_id: examId ,name:name})

    socket.on('match_found', (data) => {
      setMatchData(data)
      setPhase(PHASES.MATCH_FOUND)

      // after reveal animation (~1.8 s) → start countdown
      setTimeout(() => {
        setPhase(PHASES.COUNTDOWN)
        setCount(3)
      }, 1800)
    })

    return () => socket.off('match_found')
  }, [])

  // ── countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.COUNTDOWN) return
    countRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(countRef.current)
          setPhase(PHASES.START)
          setTimeout(() => onQuizStart?.(), 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countRef.current)
  }, [phase])

  return (
    <>
      {/* ── global styles injected once ───────────────────────────────────── */}
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

        /* ── scanline overlay ── */
        .comp-root::before {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 2px,
            rgba(255,255,255,.018) 2px, rgba(255,255,255,.018) 4px
          );
          pointer-events: none; z-index: 0;
        }

        /* ── noise grain ── */
        .comp-root::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        .comp-inner {
          position: relative; z-index: 1;
          width: min(92vw, 560px);
          text-align: center;
        }

        /* ── FINDING PHASE ── */
        .finding-wrap { display: flex; flex-direction: column; align-items: center; gap: 36px; }

        .radar-ring {
          position: relative; width: 160px; height: 160px;
          display: flex; align-items: center; justify-content: center;
        }

        .radar-ring::before, .radar-ring::after {
          content: '';
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(250,200,0,.35);
          animation: radar-pulse 2s ease-out infinite;
        }
        .radar-ring::after { animation-delay: 1s; }

        @keyframes radar-pulse {
          0%  { width: 60px; height: 60px; opacity: .9; }
          100%{ width: 160px; height: 160px; opacity: 0; }
        }

        .radar-core {
          width: 60px; height: 60px; border-radius: 50%;
          background: #fac800;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          box-shadow: 0 0 32px rgba(250,200,0,.55);
          animation: core-breathe 2s ease-in-out infinite;
        }
        @keyframes core-breathe {
          0%,100% { box-shadow: 0 0 32px rgba(250,200,0,.5); }
          50%      { box-shadow: 0 0 56px rgba(250,200,0,.85); }
        }

        .finding-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 8vw, 3.2rem);
          letter-spacing: .12em;
          color: #fff;
          text-shadow: 0 0 28px rgba(250,200,0,.4);
        }

        .finding-sub {
          font-size: .95rem; color: rgba(255,255,255,.45);
          letter-spacing: .08em; text-transform: uppercase;
          margin-top: -16px;
          min-width: 180px;
        }

        /* ── MATCH FOUND + COUNTDOWN ── */
        .versus-wrap {
          display: flex; align-items: center; justify-content: center;
          gap: clamp(12px, 5vw, 32px);
        }

        .player-card {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          opacity: 0;
          transform: translateY(24px) scale(.92);
          animation: card-in .6s cubic-bezier(.22,1,.36,1) forwards;
        }
        .player-card.right { animation-delay: .15s; }

        @keyframes card-in {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .avatar {
          width: 88px; height: 88px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: .06em;
          border: 2.5px solid;
          position: relative;
        }
        .avatar.you {
          background: rgba(250,200,0,.12);
          border-color: #fac800;
          color: #fac800;
          box-shadow: 0 0 28px rgba(250,200,0,.35);
        }
        .avatar.opp {
          background: rgba(0,190,255,.1);
          border-color: #00beff;
          color: #00beff;
          box-shadow: 0 0 28px rgba(0,190,255,.3);
        }

        .p-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem; letter-spacing: .1em;
          color: #fff;
        }
        .p-tag {
          font-size: .7rem; letter-spacing: .15em; text-transform: uppercase;
          margin-top: -10px;
        }
        .p-tag.you { color: rgba(250,200,0,.7); }
        .p-tag.opp { color: rgba(0,190,255,.7); }

        /* VS badge */
        .vs-badge {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 8vw, 3.5rem);
          color: #fff;
          text-shadow: 0 0 24px rgba(255,255,255,.3);
          position: relative;
          opacity: 0;
          animation: vs-pop .4s cubic-bezier(.34,1.56,.64,1) .3s forwards;
          flex-shrink: 0;
        }
        @keyframes vs-pop {
          to { opacity: 1; }
        }
        .vs-badge::before {
          content: '';
          position: absolute; inset: -6px -10px;
          border: 1.5px solid rgba(255,255,255,.15);
          border-radius: 4px;
          animation: vs-glow 1.5s ease-in-out .3s infinite alternate;
        }
        @keyframes vs-glow {
          from { box-shadow: 0 0 8px rgba(255,255,255,.1); }
          to   { box-shadow: 0 0 28px rgba(255,255,255,.35); }
        }

        /* lightning streak */
        .lightning {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(90deg,
            rgba(250,200,0,.12) 0%, transparent 35%,
            transparent 65%, rgba(0,190,255,.12) 100%);
          animation: lt-flicker 2.5s ease-in-out infinite;
        }
        @keyframes lt-flicker {
          0%,100% { opacity: 1; }
          48%,52% { opacity: .3; }
          50%      { opacity: .9; }
        }

        /* ── COUNTDOWN DIGIT ── */
        .countdown-wrap {
          margin-top: 40px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }

        .cd-label {
          font-size: .75rem; letter-spacing: .2em; text-transform: uppercase;
          color: rgba(255,255,255,.4);
        }

        .cd-digit {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 18vw, 7rem);
          line-height: 1;
          color: #fac800;
          text-shadow: 0 0 48px rgba(250,200,0,.7);
          animation: digit-bump .25s cubic-bezier(.22,1,.36,1);
          display: inline-block;
        }
        @keyframes digit-bump {
          0%   { transform: scale(1.45); opacity: .5; }
          100% { transform: scale(1);    opacity: 1; }
        }

        .cd-digit.go {
          color: #00e887;
          text-shadow: 0 0 56px rgba(0,232,135,.8);
          animation: go-pop .5s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes go-pop {
          0%   { transform: scale(.5);  opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* ── decorative corner lines ── */
        .corner { position: fixed; width: 48px; height: 48px; }
        .corner.tl { top:20px; left:20px; border-top:1.5px solid rgba(250,200,0,.3); border-left:1.5px solid rgba(250,200,0,.3); }
        .corner.tr { top:20px; right:20px; border-top:1.5px solid rgba(0,190,255,.3); border-right:1.5px solid rgba(0,190,255,.3); }
        .corner.bl { bottom:20px; left:20px; border-bottom:1.5px solid rgba(250,200,0,.3); border-left:1.5px solid rgba(250,200,0,.3); }
        .corner.br { bottom:20px; right:20px; border-bottom:1.5px solid rgba(0,190,255,.3); border-right:1.5px solid rgba(0,190,255,.3); }
      `}</style>

      <div className="comp-root">
        {/* corner decorations */}
        <div className="corner tl"/><div className="corner tr"/>
        <div className="corner bl"/><div className="corner br"/>

        <div className="comp-inner">

          {/* ── FINDING OPPONENT ─────────────────────────────────────────── */}
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

          {/* ── MATCH FOUND + VERSUS + COUNTDOWN ────────────────────────── */}
          {(phase === PHASES.MATCH_FOUND || phase === PHASES.COUNTDOWN || phase === PHASES.START) && matchData && (
            <div style={{position:'relative'}}>
              <div className="lightning"/>

              <p style={{
                fontFamily:'Bebas Neue, sans-serif',
                fontSize:'clamp(1rem,4vw,1.3rem)',
                letterSpacing:'.25em',
                color:'rgba(255,255,255,.5)',
                marginBottom:28,
                textTransform:'uppercase',
              }}>
                Match Found!
              </p>

              <div className="versus-wrap">
                {/* YOU */}
                <div className="player-card left">
                  <div className="avatar you">
                    {matchData.player?.avatar || 'ME'}
                  </div>
                  <span className="p-name">{matchData.player?.name || 'You'}</span>
                  <span className="p-tag you">Player</span>
                </div>

                <div className="vs-badge">VS</div>

                {/* OPPONENT */}
                <div className="player-card right">
                  <div className="avatar opp">
                    {matchData.opponent?.avatar || 'OP'}
                  </div>
                  <span className="p-name">{matchData.opponent?.name || 'Opponent'}</span>
                  <span className="p-tag opp">Rival</span>
                </div>
              </div>

              {/* countdown */}
              {(phase === PHASES.COUNTDOWN || phase === PHASES.START) && (
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

        </div>
      </div>
    </>
  )
}