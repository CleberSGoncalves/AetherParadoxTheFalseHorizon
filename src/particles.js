/**
 * @fileoverview Procedural Particle Engine for Aether Paradox: The False Horizon
 * Supports:
 * - Cybernetic Jump & Land dust
 * - Comical Death POP explosion debris (quantum cubes bouncing)
 * - Star Collection golden bursts
 * - Trap activation sparks
 * - Portal vortex energy
 * - Victory celebration confetti
 */

import { sanitize, clamp } from './juice.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  reset() {
    this.particles.length = 0;
  }

  emitJumpDust(x, y, color = '#00f5ff') {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: sanitize(x) + (Math.random() - 0.5) * 16,
        y: sanitize(y),
        vx: (Math.random() - 0.5) * 70,
        vy: -Math.random() * 40 - 10,
        gravity: 80,
        size: Math.random() * 3 + 2,
        color,
        alpha: 0.8,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  emitLandDust(x, y, color = '#38bdf8') {
    for (let i = 0; i < 12; i++) {
      const dir = (i % 2 === 0 ? 1 : -1);
      this.particles.push({
        x: sanitize(x),
        y: sanitize(y),
        vx: dir * (Math.random() * 90 + 30),
        vy: -Math.random() * 30 - 5,
        gravity: 90,
        size: Math.random() * 3 + 1.5,
        color,
        alpha: 0.75,
        life: 0.3,
        maxLife: 0.3
      });
    }
  }

  emitDeathExplosion(x, y, color = '#ef4444') {
    // 30 bouncing quantum bits
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 80;
      this.particles.push({
        x: sanitize(x),
        y: sanitize(y),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 600,
        size: Math.random() * 6 + 3,
        color: i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? color : '#facc15'),
        alpha: 1.0,
        life: 0.75,
        maxLife: 0.75,
        isBounce: true
      });
    }
  }

  emitStarCollect(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.2;
      const speed = Math.random() * 180 + 70;
      this.particles.push({
        x: sanitize(x),
        y: sanitize(y),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 120,
        size: Math.random() * 4 + 2,
        color: ['#facc15', '#fef08a', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        life: 0.55,
        maxLife: 0.55
      });
    }
  }

  emitTrapSparks(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: sanitize(x) + (Math.random() - 0.5) * 20,
        y: sanitize(y) + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 160,
        vy: -Math.random() * 150 - 30,
        gravity: 500,
        size: Math.random() * 3 + 1,
        color: '#ef4444',
        alpha: 1.0,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  emitConfetti(w, h) {
    const colors = ['#00f5ff', '#38bdf8', '#22c55e', '#facc15', '#a855f7', '#ec4899'];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 80,
        vy: Math.random() * 140 + 80,
        gravity: 20,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 2.2,
        maxLife: 2.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }
  }

  update(dt, platforms = []) {
    const safeDt = Math.min(dt, 0.05);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= safeDt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vy += (p.gravity || 0) * safeDt;
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;

      // Platform bounce for death bits
      if (p.isBounce && platforms.length > 0) {
        for (let j = 0; j < platforms.length; j++) {
          const pl = platforms[j];
          if (p.x >= pl.x && p.x <= pl.x + pl.w && p.y >= pl.y && p.y <= pl.y + pl.h) {
            if (p.vy > 0) {
              p.y = pl.y - 1;
              p.vy = -p.vy * 0.45;
              p.vx *= 0.65;
            }
          }
        }
      }

      if (p.rotSpeed) {
        p.rot += p.rotSpeed * safeDt;
      }
    }
  }

  draw(ctx) {
    if (this.particles.length === 0) return;
    ctx.save();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const prog = p.life / p.maxLife;
      const alpha = clamp(prog * (p.alpha || 1), 0, 1);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.rotSpeed) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export const particles = new ParticleSystem();
