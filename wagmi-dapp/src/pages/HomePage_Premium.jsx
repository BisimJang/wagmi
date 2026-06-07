import React, { useEffect, useRef } from 'react';

const HomePage_Premium = ({ stats, user, certificates, showPage }) => {
  const sectionRef = useRef(null);
  const fLeftRef = useRef(null);
  const reelRef = useRef(null);
  const labelsRef = useRef([]);

  useEffect(() => {
    const SLIDES = 3;
    const SLIDE_H = 540;
    const section = sectionRef.current;
    const fLeft = fLeftRef.current;
    const reel = reelRef.current;
    const labels = labelsRef.current;

    if (!section || !fLeft || !reel || labels.length === 0) return;

    let current = 0;
    let busy = false;   // locked during transition animation
    let jacked = false;   // are we currently intercepting scroll?
    let cooldown = false;   // brief cooldown after releasing scroll-jack

    /* ── centre text column on active label ── */
    function centreOn(idx, animate) {
      let acc = 0;
      labels.forEach((el, i) => {
        if (!el) return;
        if (i === idx) {
          const mid = acc + el.offsetHeight / 2;
          const pinMid = section.offsetHeight / 2;
          fLeft.style.transition = animate ? 'transform .65s cubic-bezier(.77,0,.175,1)' : 'none';
          fLeft.style.transform = `translateY(${pinMid - mid}px)`;
        }
        acc += el.offsetHeight;
      });
    }

    /* ── go to slide idx ── */
    function goTo(idx) {
      current = idx;
      const slides = reel.querySelectorAll('.c-slide');
      slides.forEach((s, i) => {
        if (i === idx) s.classList.add('active');
        else s.classList.remove('active');
      });
      labels.forEach((l, i) => {
        if (l) {
          if (i === idx) l.classList.add('active');
          else l.classList.remove('active');
        }
      });
      centreOn(idx, true);
    }

    /* ── release scroll-jack and move to adjacent section ── */
    function release(dir) {
      jacked = false;
      cooldown = true;
      const target = dir > 0
        ? section.nextElementSibling
        : section.previousElementSibling;
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      // cooldown prevents re-entry for 900ms after release
      setTimeout(() => { cooldown = false; }, 900);
    }

    /* ── check if features section fully fills the viewport ── */
    function isActive() {
      const r = section.getBoundingClientRect();
      return r.top <= 1 && r.bottom >= window.innerHeight - 1;
    }

    /* ── wheel ── */
    function onWheel(e) {
      if (cooldown) return;

      // entering: section top is scrolling into view from below
      const r = section.getBoundingClientRect();
      if (!jacked && r.top > 0 && r.top < window.innerHeight && e.deltaY > 0) {
        e.preventDefault();
        jacked = true;
        goTo(0);
        section.scrollIntoView({ behavior: 'smooth' });
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 700);
        return;
      }

      // entering: section bottom is scrolling into view from above
      if (!jacked && r.bottom > 0 && r.bottom < window.innerHeight && e.deltaY < 0) {
        e.preventDefault();
        jacked = true;
        goTo(SLIDES - 1);
        section.scrollIntoView({ behavior: 'smooth' });
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 700);
        return;
      }

      if (!jacked && !isActive()) return;

      // snap section into view if it drifted slightly
      if (!jacked && isActive()) jacked = true;

      if (!jacked) return;
      
      // We must check if the event is cancelable to avoid Chrome errors
      if (e.cancelable) {
        e.preventDefault();
      }

      if (busy) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = current + dir;

      if (next >= 0 && next < SLIDES) {
        busy = true;
        goTo(next);
        setTimeout(() => { busy = false; }, 750);
      } else {
        // exhausted slides — release
        release(dir);
      }
    }

    /* ── touch ── */
    let ty0 = 0;
    function onTouchStart(e) { ty0 = e.touches[0].clientY; }
    function onTouchMove(e) {
      if (cooldown || !jacked) return;
      const dy = ty0 - e.touches[0].clientY;
      if (Math.abs(dy) < 40) return;
      if (e.cancelable) {
          e.preventDefault();
      }
      onWheel({ deltaY: dy, preventDefault() {}, cancelable: false });
      ty0 = e.touches[0].clientY;
    }

    /* ── re-evaluate on native scroll (e.g. keyboard, scrollbar) ── */
    const onScroll = () => {
      if (cooldown) return;
      if (isActive() && !jacked) { jacked = true; }
      if (!isActive() && jacked) { jacked = false; }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // For wheel and touchmove we need `{ passive: false }` to call preventDefault
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    /* init */
    goTo(0);
    // Use setTimeout instead of requestAnimationFrame for React initial render sync
    setTimeout(() => centreOn(0, false), 50);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div className="sv-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        /* Hide global header so this page is standalone */
        header { display: none !important; }
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

        /* ── NAV ─────────────────────────────────────────── */
        .sv-landing nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          display: flex; align-items: center; justify-content: center; gap: 36px;
          padding: 18px var(--pad);
          background: rgba(255,255,255,.93); backdrop-filter: blur(10px);
        }
        .sv-landing nav a { color: #0d0d0d; font-size: 13px; transition: opacity .2s; font-weight: 500; text-decoration: none; }
        .sv-landing nav a:hover { opacity: .4; }
        .ul-rest { text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; }
        .nav-avatar {
          position: absolute; right: var(--pad);
          width: 32px; height: 32px; border-radius: 50%;
          background: #0d0d0d; color: #fff; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .nav-signin {
          position: absolute; right: var(--pad);
          padding: 8px 20px; border-radius: 100px;
          background: #0d0d0d; color: #fff;
          font-size: 12px; font-weight: 600;
          font-family: 'Poppins', sans-serif;
          border: none; cursor: pointer; transition: opacity .2s;
        }
        .nav-signin:hover { opacity: .75; }

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

        /* ── FEATURES (scroll-jacked) ────────────────────── */
        #features {
          position: relative;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        /* text lives within the left half of the content zone */
        .f-left {
          padding-left: var(--pad);
          width: calc(var(--pad) + 400px);
          position: relative; z-index: 2;
          transition: transform .65s cubic-bezier(.77,0,.175,1);
        }
        .f-label {
          padding: 26px 0; max-width: 300px;
          transition: filter .5s ease, opacity .5s ease, transform .5s ease;
          filter: blur(4px); opacity: .18; transform: scale(.93);
        }
        .f-label.active { filter: blur(0); opacity: 1; transform: scale(1); }
        .f-label h3 { font-size: 26px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; }
        .f-label p { font-size: 13.5px; color: #555; line-height: 1.7; max-width: 260px; }

        /* circle — anchored right, half clipped by section overflow:hidden */
        .f-circle {
          position: absolute;
          right: -260px;
          top: 50%; transform: translateY(-50%);
          width: 720px; height: 720px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        .c-reel {
          position: relative; width: 100%; height: 100%;
        }
        .c-slide {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity .65s ease, transform .65s ease;
          transform: scale(0.95);
        }
        .c-slide.active {
          opacity: 1;
          transform: scale(1);
          z-index: 1;
        }
        .c-slide svg { width: 240px; height: 240px; }
        .s0 { background: #3B5BDB; }
        .s1 { background: #1a1a2e; }
        .s2 { background: #1e3a2f; }

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

        /* ── FOOTER ──────────────────────────────────────── */
        .sv-landing footer {
          border-top: 1px solid #eee;
          padding-top: 60px; padding-bottom: 60px;
          padding-left: var(--pad); padding-right: var(--pad);
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px;
        }
        .footer-brand h4 { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-width: 76px; }
        .soc {
          width: 32px; height: 32px; background: #0d0d0d; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: opacity .2s;
        }
        .soc:hover { opacity: .6; }
        .soc svg { width: 15px; height: 15px; fill: #fff; }
        .footer-links h5 { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #999; margin-bottom: 14px; }
        .footer-links a { display: block; color: #0d0d0d; font-size: 13px; margin-bottom: 10px; transition: opacity .2s; text-decoration: none; }
        .footer-links a:hover { opacity: .45; }
        .footer-contact p { font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 14px; }
        .btn-mail {
          padding: 9px 20px; border: 1.5px solid #0d0d0d; border-radius: 100px;
          background: transparent; font-family: 'Poppins', sans-serif; font-size: 13px;
          cursor: pointer; transition: all .2s;
        }
        .btn-mail:hover { background: #0d0d0d; color: #fff; }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="#" onClick={(e) => { e.preventDefault(); showPage('home'); }}>Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); showPage('courses'); }}>Explore</a>
        
        {user && (
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('my_courses'); }}>My Courses</a>
        )}
        
        {user && (!user.is_institution) && (
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('study-bubbles'); }}>Study Bubble</a>
        )}

        {user && (
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('instructor'); }}>Studio</a>
        )}
        
        {user
          ? <div className="nav-avatar" onClick={() => showPage('profile')}>{user?.display_name?.[0]?.toUpperCase() || user?.address?.[2]?.toUpperCase() || 'U'}</div>
          : <button className="nav-signin" onClick={() => showPage('login')}>Sign In</button>
        }
      </nav>

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
        <h2><span className="hl">Learn</span>, Build, and<br />Prove Your <span className="ul">Mastery</span>.</h2>
        <p>Studyverse is an innovative platform designed for builders and creatives. It enables users to master new skills, earn verifiable certificates, and establish their own independent institutions.</p>
        <div className="btn-row">
          <button className="btn" onClick={() => showPage('study-bubbles')}>Quick study bubble</button>
          <button className="btn" onClick={() => showPage(user ? 'instructor' : 'profile')}>Deploy School</button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={sectionRef}>
        <div className="f-left" id="fLeft" ref={fLeftRef}>
          <div className="f-label active" data-i="0" ref={(el) => (labelsRef.current[0] = el)}>
            <h3>Immersive<br />Learning</h3>
            <p>Dive deep into subjects through interactive lessons and hands-on projects that keep you engaged and progressing.</p>
          </div>
          <div className="f-label" data-i="1" ref={(el) => (labelsRef.current[1] = el)}>
            <h3>Verifiable<br />Credentials</h3>
            <p>Your achievements are minted as immutable, cryptographic certificates. Prove your skills to employers with unquestionable authenticity.</p>
          </div>
          <div className="f-label" data-i="2" ref={(el) => (labelsRef.current[2] = el)}>
            <h3>AI Assisted</h3>
            <p>Leverage AI-powered tutors, adaptive quizzes, and personalised study paths to reach mastery faster than ever.</p>
          </div>
        </div>

        <div className="f-circle">
          <div className="c-reel" id="cReel" ref={reelRef}>
            <div className="c-slide s0">
              <svg viewBox="0 0 180 180" fill="none">
                <rect x="28" y="28" width="38" height="38" rx="7" stroke="white" strokeWidth="3" />
                <rect x="71" y="71" width="38" height="38" rx="7" stroke="white" strokeWidth="3" />
                <rect x="114" y="28" width="38" height="38" rx="7" stroke="white" strokeWidth="3" />
                <rect x="114" y="114" width="38" height="38" rx="7" stroke="white" strokeWidth="3" />
                <rect x="28" y="114" width="38" height="38" rx="7" stroke="white" strokeWidth="3" />
                <line x1="47" y1="66" x2="71" y2="83" stroke="white" strokeWidth="2.5" />
                <line x1="109" y1="83" x2="133" y2="66" stroke="white" strokeWidth="2.5" />
                <line x1="109" y1="97" x2="133" y2="114" stroke="white" strokeWidth="2.5" />
                <line x1="71" y1="97" x2="47" y2="114" stroke="white" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="c-slide s1">
              <svg viewBox="0 0 180 180" fill="none">
                <circle cx="90" cy="76" r="40" stroke="white" strokeWidth="3" />
                <circle cx="90" cy="76" r="27" stroke="white" strokeWidth="2" />
                <polyline points="74,76 86,90 110,62" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M68 112 L56 152 L90 136 L124 152 L112 112" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="c-slide s2">
              <svg viewBox="0 0 180 180" fill="none">
                <ellipse cx="90" cy="82" rx="44" ry="40" stroke="white" strokeWidth="3" />
                <line x1="90" y1="42" x2="90" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="90" y1="122" x2="90" y2="154" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="79" y1="152" x2="101" y2="152" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="72" cy="70" r="7" stroke="white" strokeWidth="2" />
                <circle cx="108" cy="70" r="7" stroke="white" strokeWidth="2" />
                <circle cx="90" cy="96" r="7" stroke="white" strokeWidth="2" />
                <line x1="79" y1="70" x2="83" y2="96" stroke="white" strokeWidth="1.5" />
                <line x1="101" y1="70" x2="97" y2="96" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
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

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          <h4>Study Verse</h4>
          <div className="social-grid">
            <div className="soc"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>
            <div className="soc"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>
            <div className="soc"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
            <div className="soc"><svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div>
          </div>
        </div>
        <div className="footer-links">
          <h5>Protocol</h5>
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('courses'); }}>T<span className="ul-rest">he Grid</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('instructor'); }}>S<span className="ul-rest">tudio</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('schools'); }}>L<span className="ul-rest">earning Engine</span></a>
          <a href="#" onClick={(e) => { e.preventDefault(); showPage('profile'); }}>P<span className="ul-rest">ortfolio</span></a>
        </div>
        <div className="footer-contact">
          <p>Something else? Specify by sending us a mail</p>
          <button className="btn-mail" onClick={() => window.location.href = 'mailto:hello@studyverse.com'}>Mail us</button>
        </div>
      </footer>
    </div>
  );
};

export default HomePage_Premium;
