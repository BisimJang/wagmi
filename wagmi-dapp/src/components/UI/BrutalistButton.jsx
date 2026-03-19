import React, { useRef, useState, useEffect, useCallback } from 'react';

const PAD = 22;
const DURATION = 2400;
const hotspots = [0.07, 0.19, 0.33, 0.51, 0.64, 0.78, 0.93];

const BrutalistButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  className = '', 
  style = {},
  arcColor,
  glowColor
}) => {
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const animIdRef = useRef(null);
  const phaseRef = useRef(0);
  const startTimeRef = useRef(0);

  const hsBoost = (u) => {
    let v = 0;
    for (const h of hotspots) {
      const d = Math.abs(u - h);
      const d2 = Math.min(d, 1 - d);
      v += Math.exp(-d2 * d2 * 130) * 1.3;
    }
    return v;
  };

  const buildPerimeter = (bw, bh, steps) => {
    const perim = 2 * (bw + bh);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const d = u * perim;
      let x, y, nx, ny;
      if (d <= bw) {
        x = d; y = 0; nx = 0; ny = -1;
      } else if (d <= bw + bh) {
        x = bw; y = d - bw; nx = 1; ny = 0;
      } else if (d <= 2 * bw + bh) {
        x = bw - (d - bw - bh); y = bh; nx = 0; ny = 1;
      } else {
        x = 0; y = bh - (d - 2 * bw - bh); nx = -1; ny = 0;
      }
      pts.push({ x: PAD + x, y: PAD + y, nx, ny, u });
    }
    return pts;
  };

  const drawLoop = (ctx, bw, bh, progress) => {
    const base = buildPerimeter(bw, bh, 320);
    const phase = phaseRef.current;

    const pts = base.map(({ x, y, nx, ny, u }) => {
      const amp = (4 + hsBoost(u) * 6.5) * progress;
      const j = amp * (
        Math.sin(u * 20 + phase * 4.0) +
        0.4 * Math.sin(u * 47 + phase * 8.5 + 1.2) +
        0.18 * Math.sin(u * 95 + phase * 14 + 2.6)
      );
      return [x + nx * j, y + ny * j];
    });

    const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#39ff14';
    const finalArcColor = arcColor || defaultColor;
    const finalGlowColor = glowColor || defaultColor;

    // wide glow
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.strokeStyle = finalArcColor;
    ctx.lineWidth = 5;
    ctx.shadowColor = finalGlowColor;
    ctx.shadowBlur = 28;
    ctx.globalAlpha = 0.18 * progress;
    ctx.stroke();
    ctx.restore();

    // sharp core
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.strokeStyle = finalArcColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = finalGlowColor;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.97 * progress;
    ctx.stroke();
    ctx.restore();
  };

  const animate = useCallback((now) => {
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!canvas || !btn) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const elapsed = now - startTimeRef.current;
    const rawP = Math.min(elapsed / DURATION, 1);

    let progress;
    if (rawP < 0.10) progress = rawP / 0.10;
    else if (rawP < 0.78) progress = 1;
    else progress = 1 - (rawP - 0.78) / 0.22;

    drawLoop(ctx, btn.offsetWidth, btn.offsetHeight, progress);
    phaseRef.current += 0.026;

    if (rawP < 1) {
      animIdRef.current = requestAnimationFrame(animate);
    } else {
      setActive(false);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const handleClick = (e) => {
    if (active || disabled) return;
    
    // Trigger animation
    setActive(true);
    startTimeRef.current = performance.now();
    phaseRef.current = 0;
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    animIdRef.current = requestAnimationFrame(animate);

    // Call original onClick
    if (onClick) onClick(e);
  };

  useEffect(() => {
    const handleResize = () => {
      const btn = btnRef.current;
      const canvas = canvasRef.current;
      if (btn && canvas) {
        canvas.width = btn.offsetWidth + PAD * 2;
        canvas.height = btn.offsetHeight + PAD * 2;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  return (
    <div className="brutalist-btn-wrap" style={style}>
      <button
        ref={btnRef}
        type={type}
        className={`brutalist-btn ${active ? 'fired' : ''} ${className}`}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
      </button>
      <canvas ref={canvasRef} className="brutalist-canvas" />
    </div>
  );
};

export default BrutalistButton;
