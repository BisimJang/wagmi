import React, { useEffect, useRef } from 'react';

const HomePage_Premium = ({ stats, user, certificates, showPage }) => {
  const sectionRef = useRef(null);
  const fLeftRef = useRef(null);
  const reelRef = useRef(null);
  const labelsRef = useRef([]);

  useEffect(() => {
    const SLIDES = 3;
    const track = document.getElementById('features-track');
    const section = sectionRef.current;
    const fLeft = fLeftRef.current;
    const reel = reelRef.current;   // now the SVG wrapper div
    const labels = labelsRef.current;

    if (!track || !section || !fLeft || !reel || !labels.length) return;

    let current = -1;

    function centreOn(idx, animate) {
      let acc = 0;
      labels.forEach((el, i) => {
        if (!el) return;
        if (i === idx) {
          const mid = acc + el.offsetHeight / 2;
          const pinMid = section.offsetHeight / 2;
          fLeft.style.transition = animate
            ? 'transform .6s cubic-bezier(.77,0,.175,1)'
            : 'none';
          fLeft.style.transform = `translateY(${pinMid - mid}px)`;
        }
        acc += el.offsetHeight;
      });
    }

    function goTo(idx) {
      if (idx === current) return;
      current = idx;

      // rotate the compass ring: 120° per step clockwise
      const deg = idx * 120;
      reel.style.transition = current === 0 && idx === 0
        ? 'none'
        : 'transform .7s cubic-bezier(.77,0,.175,1)';
      reel.style.transform = `rotate(${deg}deg)`;

      // counter-rotate each label group so text stays upright
      reel.querySelectorAll('.compass-label').forEach((g) => {
        g.style.transition = reel.style.transition;
        g.style.transform = `rotate(-${deg}deg)`;
      });

      // highlight active dot
      reel.querySelectorAll('.compass-dot').forEach((d, i) => {
        d.classList.toggle('dot-active', i === (idx % SLIDES));
      });

      // text labels left
      labels.forEach((l, i) => {
        if (l) l.classList.toggle('active', i === idx);
      });

      centreOn(idx, idx !== 0);
    }

    function onScroll() {
      const trackRect = track.getBoundingClientRect();
      const trackH = track.offsetHeight;
      const vpH = window.innerHeight;
      const scrolled = -trackRect.top;

      if (scrolled < 0 || scrolled > trackH - vpH) return;

      const band = (trackH - vpH) / SLIDES;
      const idx = Math.min(Math.floor(scrolled / band), SLIDES - 1);
      goTo(idx);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    requestAnimationFrame(() => requestAnimationFrame(() => {
      centreOn(0, false);
      goTo(0);
    }));

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sv-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        /* Hide bottom nav so this page is standalone */
        .bottom-nav { display: none !important; }

        .sv-landing {
          font-family: 'Poppins', sans-serif;
          background: #fff;
          color: #0d0d0d;
          min-height: 100vh;
        }

        .sv-landing * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .sv-landing {
          --green: #3EC636;
          --blue: #3B5BDB;
          /* Fixed viewport padding for strict left-alignment */
          --pad: 22vw;
        }
        
        @media (max-width: 1024px) {
            .sv-landing {
                --pad: 12vw;
            }
        }
        @media (max-width: 768px) {
            .sv-landing {
                --pad: 6vw;
            }
        }

        /* ── HERO ────────────────────────────────────────── */
        .hero { position: relative; min-height: 100vh; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; z-index: 0; }
        .hero-bg img { width: 100%; height: 100%; object-fit: cover; object-position: center bottom; transform: scale(0.895); transform-origin: bottom right; }
        .hero-content {
          position: relative; z-index: 1;
          padding-top: 140px;
          padding-bottom: 60px;
          padding-left: var(--pad);
          padding-right: var(--pad);
        }
        .hero-content h1 {
          font-size: clamp(60px, 8.37vw, 102px); font-weight: 700;
          line-height: .95; letter-spacing: -.02em;
        }
        .hero-content p {
          margin-top: 20px; font-size: 14px; font-weight: 300;
          color: #333; max-width: 260px; line-height: 1.65;
        }

        /* ── TAGLINE ─────────────────────────────────────── */
        .tagline {
          padding-top: 110px; padding-bottom: 110px;
          padding-left: var(--pad); padding-right: var(--pad);
          text-align: center;
        }
        .tagline h2 { font-size: clamp(32px, 4vw, 52px); font-weight: 700; line-height: 1.25; }
        .hl { position: relative; display: inline-block; }
        .hl::after {
          content: ''; position: absolute; inset: -6px -10px;
          border: 2.5px solid #0d0d0d; border-radius: 50%; pointer-events: none;
        }
        .ul { text-decoration: underline; text-underline-offset: 6px; }
        .tagline p { max-width: 420px; margin: 20px auto 0; font-size: 14px; color: #555; line-height: 1.7; }
        .btn-row { display: flex; gap: 14px; justify-content: center; margin-top: 32px; }
        .sv-landing .btn {
          padding: 13px 24px; border-radius: 100px; font-size: 13px; font-weight: 500;
          cursor: pointer; border: none; background: var(--green); color: #fff;
          font-family: 'Poppins', sans-serif; transition: transform .2s;
        }
        .sv-landing .btn:hover { transform: scale(1.03); }

        /* ── FEATURES ────────────────────────────────────────────────────── */

        #features-track {
          height: 400vh;
          position: relative;
        }

        #features {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: #fff;
        }

        .f-left {
          position: relative;
          z-index: 2;
          padding-left: var(--pad);
          width: calc(var(--pad) + 380px);
          flex-shrink: 0;
        }

        .f-label {
          padding: 28px 0;
          max-width: 300px;
          min-height: 120px;
          transition: filter .5s ease, opacity .5s ease, transform .5s ease;
          filter: blur(4px);
          opacity: .18;
          transform: scale(.93);
        }
        .f-label.active {
          filter: blur(0);
          opacity: 1;
          transform: scale(1);
        }
        .f-label h3 {
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .f-label p {
          font-size: 13.5px;
          color: #555;
          line-height: 1.7;
          max-width: 260px;
        }

        /* Compass circle — dark background so the SVG reads clearly */
        .f-circle {
          position: absolute;
          left: calc(var(--pad) + 420px);
          top: 50%;
          transform: translateY(-50%);
          width: 600px;
          height: 600px;
          border-radius: 50%;
          overflow: hidden;
          background: #0d0d0d;
          flex-shrink: 0;
        }

        /* The reel is now a plain div we rotate */
        .c-reel {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: center center;
          will-change: transform;
        }

        .c-reel svg {
          width: 80%;
          height: 80%;
        }

        /* Active dot brightness handled inline via fillOpacity transition */

        @media (max-width: 1200px) {
          .f-circle {
            left: calc(var(--pad) + 360px);
            width: 480px;
            height: 480px;
          }
        }

        @media (max-width: 1024px) {
          .f-circle {
            left: calc(var(--pad) + 320px);
            width: 400px;
            height: 400px;
          }
        }

        @media (max-width: 768px) {
          #features-track { height: auto; }
          #features {
            position: relative;
            height: auto;
            flex-direction: column;
            padding: 80px 0 60px;
            overflow: visible;
            background: #fff;
          }
          .f-left {
            width: 100%;
            padding-right: var(--pad);
            margin-bottom: 48px;
          }
          .f-label {
            filter: none !important;
            opacity: 1 !important;
            transform: none !important;
            min-height: unset;
          }
          .f-circle {
            position: relative;
            left: auto;
            top: auto;
            transform: none;
            width: min(300px, 85vw);
            height: min(300px, 85vw);
            margin: 0 auto;
          }
        }

        /* ── INSTITUTIONS ────────────────────────────────── */
        .institutions { display: flex; min-height: 90vh; align-items: center; }
        .inst-text {
          flex: 0 0 calc(var(--pad) + 320px);
          padding-top: 80px; padding-bottom: 80px;
          padding-left: var(--pad); padding-right: 32px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .inst-text h2 { font-size: clamp(44px, 5vw, 68px); font-weight: 900; line-height: 1; margin-bottom: 20px; }
        .inst-text p { font-size: 14px; color: #555; line-height: 1.75; max-width: 280px; margin-bottom: 24px; }
        .inst-text .cta-label { font-size: 12px; color: #888; margin-bottom: 8px; }
        .btn-here {
          background: var(--green); color: #fff; padding: 11px 24px; border-radius: 100px;
          border: none; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; display: inline-block; transition: transform .2s;
          align-self: flex-start;
        }
        .btn-here:hover { transform: scale(1.04); }
        .inst-image {
          flex: 1;
          align-self: stretch;
          display: flex; align-items: center; justify-content: flex-end;
          padding: 0;
          min-height: 90vh;
        }
        .inst-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }
          cursor: pointer; transition: all .2s;
        }
        .btn-mail:hover { background: #0d0d0d; color: #fff; }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"><img src="/sv-hero.png" alt="Books" /></div>
        <div className="hero-content">
          <h1>Study<br />Verse</h1>
          <p>A seamless ecosystem designed to help you accelerate your learning and prove your competence to the world.</p>
        </div>
      </section>

      {/* TAGLINE */}
      <section className="tagline">
        <h2><span className="hl">Learn</span>, Build, and<br />Track Your <span className="ul">Growth</span>.</h2>
        <p>Studyverse is an innovative platform designed for anyone. It enables users to learn master new skills, earn verifiable certificates, and establish their own independent institutions.</p>
        <div className="btn-row">
          <button className="btn" onClick={() => showPage('study-bubbles')}>Quick study bubble</button>
          <button className="btn" onClick={() => showPage(user ? 'instructor' : 'profile')}>Deploy School</button>
        </div>
      </section>

      {/* FEATURES */}
      <div id="features-track">
        <section id="features" ref={sectionRef}>

          {/* Left text column — unchanged structure */}
          <div className="f-left" ref={fLeftRef}>
            <div className="f-label active" ref={(el) => (labelsRef.current[0] = el)}>
              <h3>Immersive<br />Learning</h3>
              <p>Dive deep into subjects through interactive lessons and hands-on projects that keep you engaged and progressing.</p>
            </div>
            <div className="f-label" ref={(el) => (labelsRef.current[1] = el)}>
              <h3>Verifiable<br />Credentials</h3>
              <p>Your achievements are minted as immutable, cryptographic certificates. Prove your skills to employers with unquestionable authenticity.</p>
            </div>
            <div className="f-label" ref={(el) => (labelsRef.current[2] = el)}>
              <h3>AI Assisted</h3>
              <p>Leverage AI-powered tutors, adaptive quizzes, and personalised study paths to reach mastery faster than ever.</p>
            </div>
          </div>

          {/* Compass circle */}
          <div className="f-circle">
            {/*
              reelRef is now on this div so we can rotate it and access
              .compass-label and .compass-dot children in the useEffect.
            */}
            <div className="c-reel" ref={reelRef}>
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">

                {/* ── outer ring ── */}
                <circle cx="200" cy="200" r="168" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
                <circle cx="200" cy="200" r="148" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />

                {/* ── inner hub ── */}
                <circle cx="200" cy="200" r="28" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
                <circle cx="200" cy="200" r="5" fill="white" fillOpacity="0.9" />

                {/* ── tick marks at 30° intervals ── */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const r1 = 148, r2 = i % 3 === 0 ? 136 : 141;
                  return (
                    <line
                      key={i}
                      x1={200 + r1 * Math.sin(angle)}
                      y1={200 - r1 * Math.cos(angle)}
                      x2={200 + r2 * Math.sin(angle)}
                      y2={200 - r2 * Math.cos(angle)}
                      stroke="white"
                      strokeWidth={i % 3 === 0 ? 2 : 1}
                      strokeOpacity={i % 3 === 0 ? 0.7 : 0.3}
                    />
                  );
                })}

                {/* ── spoke lines to each point ── */}
                {/* E  (0°  from top = north, so E is at 90° = right) → at start, E is top */}
                {/* Points are at 0° (top/active), 120° (lower-right), 240° (lower-left)   */}
                {[0, 120, 240].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x2 = 200 + 120 * Math.sin(rad);
                  const y2 = 200 - 120 * Math.cos(rad);
                  return (
                    <line
                      key={i}
                      x1="200" y1="200"
                      x2={x2} y2={y2}
                      stroke="white"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* ── the 3 feature points ── */}
                {/* 
                  Point layout (before any rotation):
                    i=0  deg=0    → top    (12 o'clock) — slide 0 active here
                    i=1  deg=120  → lower-right          — slide 1
                    i=2  deg=240  → lower-left           — slide 2
                  
                  Compass letters: E, S, W mapped to slides 0, 1, 2
                  (N is the "active top" position — not a labelled feature point)
                */}
                {[
                  { deg: 0, letter: 'E', label: 'Learn' },
                  { deg: 120, letter: 'S', label: 'Prove' },
                  { deg: 240, letter: 'W', label: 'Assist' },
                ].map(({ deg, letter, label }, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const cx = 200 + 148 * Math.sin(rad);
                  const cy = 200 - 148 * Math.cos(rad);
                  const lx = 200 + 172 * Math.sin(rad);
                  const ly = 200 - 172 * Math.cos(rad);
                  return (
                    <g key={i} className="compass-label" style={{ transformOrigin: `${cx}px ${cy}px` }}>
                      {/* dot */}
                      <circle
                        cx={cx} cy={cy} r="7"
                        fill="white" fillOpacity={i === 0 ? 1 : 0.25}
                        className={`compass-dot${i === 0 ? ' dot-active' : ''}`}
                        style={{ transition: 'fill-opacity .5s' }}
                      />
                      {/* cardinal letter */}
                      <text
                        x={lx} y={ly}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="13"
                        fontWeight="600"
                        fontFamily="Poppins, sans-serif"
                        opacity={i === 0 ? 1 : 0.4}
                      >
                        {letter}
                      </text>
                    </g>
                  );
                })}

                {/* ── N marker (fixed top — the "active" arrival point) ── */}
                <text
                  x="200" y="22"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Poppins, sans-serif"
                  opacity="0.9"
                  letterSpacing="2"
                >
                  ▲
                </text>

              </svg>
            </div>
          </div>

        </section>
      </div>

      {/* STUDY BUBBLES PROMO */}
      <section className="sb-promo" style={{ display: 'flex', flexWrap: 'wrap', minHeight: '60vh', background: '#fff' }}>
        {/* Left side: Green solid block */}
        <div style={{ flex: '1 1 50%', background: 'var(--green)', minHeight: '300px' }}></div>
        
        {/* Right side: Text content */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 8vw', minWidth: '300px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: '14px' }}>
              PERSONALIZED SYNTHESIS
            </div>
            <h2 style={{ fontSize: 'clamp(48px, 7vw, 84px)', fontWeight: '700', lineHeight: '.93', letterSpacing: '-.03em', marginBottom: '22px' }}>
              Study<br/><span style={{ color: 'var(--green)' }}>bubbles.</span>
            </h2>
            <p style={{ fontSize: '14px', fontWeight: '300', color: '#444', maxWidth: '320px', lineHeight: '1.7', marginBottom: '32px' }}>
              Your personal knowledge nodes. Upload a concept or file to build a learning environment shaped around your goals.
            </p>
            <div>
              <button 
                onClick={() => showPage('study-bubbles')} 
                style={{ padding: '12px 28px', background: '#0d0d0d', color: '#fff', borderRadius: '100px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', border: 'none', transition: 'opacity 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Open Study Bubbles
              </button>
            </div>
        </div>
      </section>

      {/* INSTITUTIONS */}
      <section className="institutions">
        <div className="inst-text">
          <h2>Institutions</h2>
          <p>Institutions assist organizations and schools in onboarding their students or users to effectively utilize Studyverse, a highly reliable study and AI framework. Launch your own Institution in seconds. Deploy curriculum and monetize your knowledge globally without friction.</p>
          <p className="cta-label">Click here to get started</p>
          <button className="btn-here" onClick={() => showPage('institutions')}>here!</button>
        </div>
        <div className="inst-image">
          <img src="/sv-institutions.png" alt="Building" />
        </div>
      </section>
    </div>
  );
};

export default HomePage_Premium;
