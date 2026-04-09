import React, { useEffect, useRef } from 'react';

export default function SeasonalParticles({ monthName, isFullScreen = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize handling for window-level bounds
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
    
    let season = 'winter';
    if (m >= 2 && m <= 4) season = 'spring';
    else if (m >= 5 && m <= 7) season = 'summer';
    else if (m >= 8 && m <= 10) season = 'autumn';

    const p = [];
    let req;

    // Heavily reduced density for ambient soothing full-screen effect (70% cut)
    const n = season === 'winter' ? 75 : (season === 'summer' ? 36 : 54);

    for (let i = 0; i < n; i++) {
      p.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + (isFullScreen ? 2 : 1),
        // Very lazy smooth drifting velocities
        vx: (Math.random() - 0.5) * 0.4,
        vy: season === 'summer' ? -(Math.random() * 0.2 + 0.1) : (Math.random() * 0.4 + 0.2),
        o: Math.random() * Math.PI * 2,
        rot: Math.random() * 360
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      for (let i = 0; i < n; i++) {
        const c = p[i];
        
        c.x += c.vx + Math.sin(c.o) * 0.6;
        c.y += c.vy;
        c.o += 0.02;
        c.rot += 1.5;

        // Reset positions gracefully
        if (c.y > h + 20 && season !== 'summer') {
          c.y = -20;
          c.x = Math.random() * w;
        } else if (c.y < -20 && season === 'summer') {
          c.y = h + 20;
          c.x = Math.random() * w;
        }
        if (c.x > w + 20) c.x = -20;
        if (c.x < -20) c.x = w + 20;
        
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);

        if (season === 'winter') {
          ctx.beginPath();
          ctx.arc(0, 0, c.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();
        } else if (season === 'spring') {
          ctx.beginPath();
          ctx.ellipse(0, 0, c.r * 1.8, c.r * 1.0, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 170, 200, 0.7)';
          ctx.fill();
        } else if (season === 'autumn') {
          ctx.beginPath();
          ctx.moveTo(0, -c.r);
          ctx.lineTo(c.r, 0);
          ctx.lineTo(0, c.r);
          ctx.lineTo(-c.r, 0);
          ctx.fillStyle = i % 2 === 0 ? 'rgba(235, 100, 36, 0.65)' : 'rgba(215, 160, 30, 0.65)';
          ctx.fill();
        } else if (season === 'summer') {
          ctx.beginPath();
          ctx.arc(0, 0, c.r * 2.5, 0, Math.PI * 2);
          const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r * 2.5);
          grd.addColorStop(0, 'rgba(255, 250, 200, 0.9)');
          grd.addColorStop(1, 'rgba(255, 250, 200, 0)');
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.restore();
      }

      req = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener('resize', handleResize);
    };
  }, [monthName, isFullScreen]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
