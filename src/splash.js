/**
 * @fileoverview Cinematic Intro & FluidCleb Interactive Splash Screen for Aether Paradox: The False Horizon
 *
 * 1. Official FluidCleb Interactive Splash (0.0s to 2.8s):
 *    - Cosmic energy orbs (#00f5ff, #38bdf8, #0284c7) converging
 *    - Central fusion flash with shockwave ring and radiant sparks
 *    - Metallic water droplet emblem (#94a3b8) with liquid cyan core (#00f5ff)
 *    - Neon cyan typography 'FLUIDCLEB' and 'INTERACTIVE'
 *    - Procedural synthetic audio cue
 * 2. Interactive 3-Act Lore Presentation (2.8s+) with prominent 'Skip Story ➔' button
 *    allowing immediate entry into gameplay in at most 1 click (CrazyGames Land in Gameplay rule).
 */

import { sound } from './audio.js';
import { i18n } from './i18n.js';

export class CinematicIntro {
  constructor(containerOrOptions, maybeOnComplete) {
    if (containerOrOptions && (containerOrOptions instanceof HTMLElement || containerOrOptions.nodeType === 1)) {
      this.container = containerOrOptions;
      this.onComplete = maybeOnComplete || null;
    } else if (containerOrOptions && typeof containerOrOptions === 'object') {
      this.container = containerOrOptions.container || document.body;
      this.onComplete = containerOrOptions.onComplete || maybeOnComplete || null;
    } else {
      this.container = document.body;
      this.onComplete = maybeOnComplete || null;
    }

    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.startTime = null;
    this.finished = false;

    this.soundPlayed = false;
    this.phase = 'splash'; // 'splash' (0.0s - 2.8s) -> 'lore' (2.8s+)
    this.loreAct = 1;

    this.particles = [];
    for (let i = 0; i < 65; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.04,
        speedY: -Math.random() * 0.05 - 0.015,
        color: ['#00f5ff', '#38bdf8', '#0284c7', '#a855f7', '#facc15'][Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.65 + 0.25,
        pulse: Math.random() * Math.PI * 2
      });
    }

    this.initDOM();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.id = 'cinematic-overlay';
    this.wrapper.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 99999;
      background: #030712;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
      touch-action: none;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; display: block;';
    this.ctx = this.canvas.getContext('2d');
    this.wrapper.appendChild(this.canvas);

    // Progress bar for 0.0s - 2.8s splash
    this.progressWrap = document.createElement('div');
    this.progressWrap.style.cssText = `
      position: absolute;
      bottom: 36px;
      width: 240px;
      height: 5px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
      z-index: 10;
    `;
    this.progressFill = document.createElement('div');
    this.progressFill.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #00f5ff);
      box-shadow: 0 0 12px #00f5ff;
    `;
    this.progressWrap.appendChild(this.progressFill);
    this.wrapper.appendChild(this.progressWrap);

    // 1-Click Skip Button (CrazyGames Land in Gameplay compliance)
    this.skipBtn = document.createElement('button');
    this.skipBtn.id = 'btn-skip-intro';
    this.skipBtn.textContent = i18n.t('skipStory');
    this.skipBtn.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      z-index: 20;
      padding: 10px 22px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #00f5ff;
      background: rgba(3, 7, 18, 0.85);
      border: 1.5px solid #00f5ff;
      border-radius: 999px;
      box-shadow: 0 0 16px rgba(0, 245, 255, 0.35);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s ease;
    `;
    this.skipBtn.addEventListener('mouseenter', () => {
      this.skipBtn.style.background = '#00f5ff';
      this.skipBtn.style.color = '#030712';
      this.skipBtn.style.boxShadow = '0 0 24px #00f5ff';
    });
    this.skipBtn.addEventListener('mouseleave', () => {
      this.skipBtn.style.background = 'rgba(3, 7, 18, 0.85)';
      this.skipBtn.style.color = '#00f5ff';
      this.skipBtn.style.boxShadow = '0 0 16px rgba(0, 245, 255, 0.35)';
    });
    this.skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      this.finish();
    });
    this.wrapper.appendChild(this.skipBtn);

    // Lore container (2.8s+)
    this.loreCard = document.createElement('div');
    this.loreCard.id = 'cinematic-lore-card';
    this.loreCard.style.cssText = `
      position: absolute;
      bottom: 50px;
      max-width: 620px;
      width: 90%;
      background: rgba(10, 15, 30, 0.9);
      border: 1.5px solid rgba(0, 245, 255, 0.4);
      border-radius: 16px;
      padding: 24px 28px;
      box-shadow: 0 0 35px rgba(0, 245, 255, 0.2), inset 0 0 20px rgba(0, 245, 255, 0.08);
      backdrop-filter: blur(12px);
      display: none;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 15;
    `;

    this.loreTitle = document.createElement('h2');
    this.loreTitle.style.cssText = `
      font-size: 19px;
      font-weight: 800;
      color: #00f5ff;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0 0 10px 0;
      text-shadow: 0 0 14px rgba(0, 245, 255, 0.6);
    `;

    this.loreBody = document.createElement('p');
    this.loreBody.style.cssText = `
      font-size: 15px;
      font-weight: 500;
      line-height: 1.5;
      color: #cbd5e1;
      margin: 0 0 20px 0;
    `;

    this.loreActions = document.createElement('div');
    this.loreActions.style.cssText = 'display: flex; gap: 14px;';

    this.nextActBtn = document.createElement('button');
    this.nextActBtn.style.cssText = `
      padding: 10px 24px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #030712;
      background: linear-gradient(135deg, #00f5ff, #0284c7);
      border: none;
      border-radius: 999px;
      box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
      cursor: pointer;
    `;
    this.nextActBtn.textContent = i18n.t('nextAct');
    this.nextActBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      this.advanceLore();
    });

    this.loreActions.appendChild(this.nextActBtn);
    this.loreCard.appendChild(this.loreTitle);
    this.loreCard.appendChild(this.loreBody);
    this.loreCard.appendChild(this.loreActions);
    this.wrapper.appendChild(this.loreCard);

    this.container.appendChild(this.wrapper);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
  }

  start() {
    this.startTime = performance.now();
    this.animId = requestAnimationFrame((t) => this.loop(t));
  }

  advanceLore() {
    if (this.loreAct === 1) {
      this.loreAct = 2;
      this.updateLoreContent();
    } else if (this.loreAct === 2) {
      this.loreAct = 3;
      this.updateLoreContent();
      this.nextActBtn.textContent = i18n.t('enterGame');
      this.nextActBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      this.nextActBtn.style.boxShadow = '0 0 22px rgba(34, 197, 94, 0.6)';
    } else {
      this.finish();
    }
  }

  updateLoreContent() {
    if (this.loreAct === 1) {
      this.loreTitle.textContent = i18n.t('loreAct1Title');
      this.loreBody.textContent = i18n.t('loreAct1Text');
    } else if (this.loreAct === 2) {
      this.loreTitle.textContent = i18n.t('loreAct2Title');
      this.loreBody.textContent = i18n.t('loreAct2Text');
    } else if (this.loreAct === 3) {
      this.loreTitle.textContent = i18n.t('loreAct3Title');
      this.loreBody.textContent = i18n.t('loreAct3Text');
    }
  }

  loop(currentTime) {
    if (this.finished) return;
    const elapsed = (currentTime - this.startTime) / 1000;

    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    // Deep cosmic dark background
    this.ctx.fillStyle = '#030712';
    this.ctx.fillRect(0, 0, w, h);

    // Background cosmic particles
    this.drawCosmicParticles(w, h, elapsed);

    if (elapsed < 2.8) {
      // ── Phase 1: FluidCleb Interactive Splash Screen (0.0s to 2.8s) ──
      this.drawFluidClebSplash(w, h, elapsed);
      const progress = Math.min(1.0, elapsed / 2.8);
      this.progressFill.style.width = `${(progress * 100).toFixed(1)}%`;
    } else {
      // ── Phase 2: Interactive Lore Presentation (2.8s+) ──
      if (this.phase !== 'lore') {
        this.phase = 'lore';
        this.progressWrap.style.display = 'none';
        this.loreCard.style.display = 'flex';
        this.updateLoreContent();
      }
      this.drawInteractiveLoreVisuals(w, h, elapsed);
    }

    this.animId = requestAnimationFrame((t) => this.loop(t));
  }

  drawCosmicParticles(w, h, elapsed) {
    this.ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y < 0) p.y = 1;
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;

      const px = p.x * w;
      const py = p.y * h;
      const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse + elapsed * 3));

      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawFluidClebSplash(w, h, elapsed) {
    const cx = w / 2;
    const cy = h / 2 - 25;

    // Trigger synthetic audio cue at 0.1s
    if (elapsed >= 0.1 && !this.soundPlayed) {
      this.soundPlayed = true;
      sound.playFluidClebIntro();
    }

    // Converging Orbs (0.0s to 1.3s)
    if (elapsed < 1.4) {
      const converge = Math.min(1.0, elapsed / 1.3);
      const ease = Math.pow(converge, 2.5);
      const orbDist = (1 - ease) * 160;

      const orbColors = ['#00f5ff', '#38bdf8', '#0284c7', '#00f5ff'];
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + elapsed * 2;
        const ox = cx + Math.cos(ang) * orbDist;
        const oy = cy + Math.sin(ang) * orbDist;

        this.ctx.save();
        this.ctx.shadowColor = orbColors[i];
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = orbColors[i];
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, 10 + ease * 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // Central Fusion Flash & Shockwave (1.3s to 2.8s)
    if (elapsed >= 1.3) {
      const fuseTime = elapsed - 1.3;
      const shockRadius = fuseTime * 280;
      const shockAlpha = Math.max(0, 1 - fuseTime / 1.4);

      if (shockAlpha > 0) {
        this.ctx.save();
        this.ctx.strokeStyle = '#00f5ff';
        this.ctx.lineWidth = 3.5 * shockAlpha;
        this.ctx.shadowColor = '#00f5ff';
        this.ctx.shadowBlur = 18;
        this.ctx.globalAlpha = shockAlpha;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Metallic Droplet Emblem (#94a3b8 / #00f5ff)
      const emblemAlpha = Math.min(1.0, (elapsed - 1.4) / 0.4);
      this.ctx.save();
      this.ctx.globalAlpha = emblemAlpha;
      this.ctx.translate(cx, cy);

      // Droplet shape
      this.ctx.beginPath();
      this.ctx.moveTo(0, -32);
      this.ctx.bezierCurveTo(24, -8, 24, 22, 0, 32);
      this.ctx.bezierCurveTo(-24, 22, -24, -8, 0, -32);
      this.ctx.closePath();

      const dropGrad = this.ctx.createLinearGradient(0, -32, 0, 32);
      dropGrad.addColorStop(0, '#94a3b8');
      dropGrad.addColorStop(0.5, '#38bdf8');
      dropGrad.addColorStop(1, '#0284c7');
      this.ctx.fillStyle = dropGrad;
      this.ctx.shadowColor = '#00f5ff';
      this.ctx.shadowBlur = 24;
      this.ctx.fill();

      // Glowing liquid cyan core
      this.ctx.beginPath();
      this.ctx.arc(0, 8, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = '#00f5ff';
      this.ctx.shadowBlur = 16;
      this.ctx.fill();
      this.ctx.restore();

      // Neon Cyan Typography
      const textAlpha = Math.min(1.0, (elapsed - 1.6) / 0.4);
      this.ctx.save();
      this.ctx.globalAlpha = textAlpha;
      this.ctx.textAlign = 'center';

      this.ctx.font = '900 36px sans-serif';
      this.ctx.fillStyle = '#00f5ff';
      this.ctx.shadowColor = '#00f5ff';
      this.ctx.shadowBlur = 20;
      this.ctx.fillText('FLUIDCLEB', cx, cy + 85);

      this.ctx.font = '800 13px sans-serif';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.shadowBlur = 8;
      this.ctx.fillText('INTERACTIVE', cx, cy + 108);
      this.ctx.restore();
    }
  }

  drawInteractiveLoreVisuals(w, h, elapsed) {
    const cx = w / 2;
    const cy = h / 2 - 80;

    // Animated rotating quantum horizon rings
    this.ctx.save();
    this.ctx.translate(cx, cy);

    for (let i = 0; i < 3; i++) {
      const radius = 60 + i * 26;
      const rot = (elapsed * (0.7 - i * 0.2) * (i % 2 === 0 ? 1 : -1));
      this.ctx.save();
      this.ctx.rotate(rot);
      this.ctx.strokeStyle = i === 0 ? '#00f5ff' : (i === 1 ? '#a855f7' : '#38bdf8');
      this.ctx.lineWidth = 2.5;
      this.ctx.setLineDash([16, 12, 6, 12]);
      this.ctx.shadowColor = this.ctx.strokeStyle;
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Singularity Core
    const pulse = 1 + Math.sin(elapsed * 4) * 0.08;
    this.ctx.scale(pulse, pulse);
    const grad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, 44);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#00f5ff');
    grad.addColorStop(0.7, '#a855f7');
    grad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 44, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    cancelAnimationFrame(this.animId);

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.style.transition = 'opacity 0.35s ease';
      this.wrapper.style.opacity = '0';
      setTimeout(() => {
        if (this.wrapper && this.wrapper.parentNode) {
          this.wrapper.parentNode.removeChild(this.wrapper);
        }
        if (this.onComplete) {
          this.onComplete();
        }
      }, 350);
    } else {
      if (this.onComplete) {
        this.onComplete();
      }
    }
  }
}
