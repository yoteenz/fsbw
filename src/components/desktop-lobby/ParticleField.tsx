import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      size: Math.random() * 3 + 1.5,
      speedY: -(Math.random() * 0.5 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0,
      maxOpacity: Math.random() * 0.35 + 0.15,
      life: 0,
      maxLife: Math.random() * 200 + 120,
    });

    // Initial particles
    for (let i = 0; i < 45; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.6, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y);
      ctx.closePath();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;

        // Fade in/out
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.opacity = (lifeRatio / 0.1) * p.maxOpacity;
        } else if (lifeRatio > 0.85) {
          p.opacity = ((1 - lifeRatio) / 0.15) * p.maxOpacity;
        } else {
          p.opacity = p.maxOpacity;
        }

        // Reset when dead
        if (p.life >= p.maxLife) {
          particlesRef.current[i] = spawnParticle();
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;

        // Crystal diamond shape
        drawDiamond(ctx, p.x, p.y, p.size);

        // Gradient fill
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.6, 'rgba(240,240,255,0.7)');
        grad.addColorStop(1, 'rgba(220,220,240,0)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
