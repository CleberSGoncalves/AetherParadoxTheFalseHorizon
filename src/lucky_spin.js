/**
 * @fileoverview Quantum Singularity Lucky Wheel for Aether Paradox: The False Horizon
 * Free spin every 12 hours + extra spins via CrazyGames Rewarded Ads.
 */

import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { crazyGames } from './crazygames.js';
import { i18n } from './i18n.js';

export const WHEEL_SEGMENTS = [
  { orbs: 25, color: '#0284c7', label: '25 Orbs' },
  { orbs: 50, color: '#38bdf8', label: '50 Orbs' },
  { orbs: 100, color: '#00f5ff', label: '100 Orbs' },
  { orbs: 150, color: '#10b981', label: '150 Orbs' },
  { orbs: 200, color: '#facc15', label: '200 Orbs' },
  { orbs: 300, color: '#a855f7', label: '300 Orbs' },
  { orbs: 500, color: '#ec4899', label: '500 Orbs' },
  { orbs: 1000, color: '#f43f5e', label: '★ 1000 ★' }
];

export class LuckySpin {
  static render(container, onFinished) {
    if (!container) return;
    const canFree = SaveManager.canFreeSpin();

    container.innerHTML = `
      <h3 style="color: #38bdf8; font-size: 18px; margin: 0 0 12px 0; text-align: center;">
        ${i18n.t('spinTitle')}
      </h3>

      <div style="position: relative; width: 280px; height: 280px; margin: 0 auto 16px auto;">
        <canvas id="lucky-wheel-canvas" width="280" height="280" style="display: block; width: 100%; height: 100%;"></canvas>
        <div style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 20px solid #facc15; z-index: 10;"></div>
      </div>

      <div id="spin-actions" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
        ${canFree
          ? `<button id="btn-spin-free" class="btn-primary" style="width: 220px; font-size: 14px;">
              ${i18n.t('freeSpin')}
            </button>`
          : `<button disabled class="hud-btn" style="width: 220px; opacity: 0.6; cursor: not-allowed;">
              ⏳ RECARREGANDO GIRO GRÁTIS
            </button>`
        }
        <button id="btn-spin-ad" class="hud-btn" style="width: 220px; border-color: #facc15; color: #facc15; font-size: 13px;">
          ${i18n.t('spinAd')}
        </button>
      </div>

      <div id="spin-result" style="text-align: center; margin-top: 12px; font-weight: 800; font-size: 15px; min-height: 24px; color: #facc15;"></div>
    `;

    const canvas = container.querySelector('#lucky-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentAngle = 0;
    let isSpinning = false;

    const drawWheel = (angle) => {
      ctx.clearRect(0, 0, 280, 280);
      const cx = 140;
      const cy = 140;
      const radius = 130;
      const segAngle = (Math.PI * 2) / WHEEL_SEGMENTS.length;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
        const seg = WHEEL_SEGMENTS[i];
        const startA = i * segAngle;
        const endA = startA + segAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#080d1a';
        ctx.stroke();

        // Label
        ctx.save();
        ctx.rotate(startA + segAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(seg.label, radius - 15, 4);
        ctx.restore();
      }

      // Center Hub
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00f5ff';
      ctx.stroke();

      ctx.restore();
    };

    drawWheel(currentAngle);

    const performSpin = (isFree) => {
      if (isSpinning) return;
      isSpinning = true;

      const btnFree = container.querySelector('#btn-spin-free');
      const btnAd = container.querySelector('#btn-spin-ad');
      if (btnFree) btnFree.disabled = true;
      if (btnAd) btnAd.disabled = true;

      const targetIdx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
      const segAngle = (Math.PI * 2) / WHEEL_SEGMENTS.length;
      // Needle is at top (angle -Math.PI / 2)
      const targetSegAngle = (WHEEL_SEGMENTS.length - targetIdx) * segAngle - segAngle / 2 - Math.PI / 2;
      const totalRotations = (Math.floor(Math.random() * 4) + 5) * Math.PI * 2;
      const finalAngle = totalRotations + targetSegAngle;

      const duration = 4000;
      const startT = performance.now();
      let lastTickAngle = 0;

      const animate = (now) => {
        const elapsed = now - startT;
        const t = Math.min(1.0, elapsed / duration);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        currentAngle = ease * finalAngle;

        if (Math.abs(currentAngle - lastTickAngle) > segAngle) {
          lastTickAngle = currentAngle;
          sound.playSpinTick();
        }

        drawWheel(currentAngle);

        if (t < 1.0) {
          requestAnimationFrame(animate);
        } else {
          isSpinning = false;
          if (isFree) SaveManager.recordSpin();
          const prize = WHEEL_SEGMENTS[targetIdx];
          SaveManager.addOrbs(prize.orbs);
          sound.playRewardFanfare();

          const resultEl = container.querySelector('#spin-result');
          if (resultEl) {
            resultEl.textContent = `🎉 Parabéns! Você ganhou ${prize.label}!`;
          }

          setTimeout(() => {
            LuckySpin.render(container, onFinished);
            if (onFinished) onFinished(prize.orbs);
          }, 1800);
        }
      };

      requestAnimationFrame(animate);
    };

    const btnFree = container.querySelector('#btn-spin-free');
    if (btnFree) {
      btnFree.addEventListener('click', () => {
        performSpin(true);
      });
    }

    const btnAd = container.querySelector('#btn-spin-ad');
    if (btnAd) {
      btnAd.addEventListener('click', () => {
        crazyGames.requestRewardedAd(
          () => {
            performSpin(false);
          },
          () => {
            console.log('Rewarded ad dismissed.');
          }
        );
      });
    }
  }
}
