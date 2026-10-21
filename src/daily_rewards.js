/**
 * @fileoverview 7-Day Protocol Supply (Daily Login Rewards) for Aether Paradox: The False Horizon
 */

import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { i18n } from './i18n.js';

export class DailyRewards {
  static render(container, onClaimed) {
    if (!container) return;
    const save = SaveManager.get();
    const canClaim = SaveManager.canClaimDaily();
    const currentStreak = save.daily.streak || 0;
    const rewards = [20, 35, 50, 75, 100, 150, 250];

    container.innerHTML = `
      <h3 style="color: #38bdf8; font-size: 18px; margin: 0 0 8px 0; text-align: center;">
        ${i18n.t('dailyTitle')}
      </h3>
      <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 20px;">
        Sequência Atual: <strong style="color: #facc15;">${currentStreak} dias</strong> • Volte diariamente para orbes quânticos extras!
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px; margin-bottom: 24px;">
        ${rewards.map((amount, idx) => {
          const dayNum = idx + 1;
          const isPassed = dayNum <= currentStreak && !canClaim;
          const isToday = canClaim ? (dayNum === (currentStreak % 7) + 1) : (dayNum === currentStreak);

          return `
            <div style="
              background: ${isToday ? 'rgba(56, 189, 248, 0.2)' : '#0f172a'};
              border: 1.5px solid ${isToday ? '#00f5ff' : isPassed ? '#22c55e' : 'rgba(255,255,255,0.1)'};
              border-radius: 10px;
              padding: 10px 4px;
              text-align: center;
              box-shadow: ${isToday ? '0 0 12px rgba(0, 245, 255, 0.3)' : 'none'};
            ">
              <div style="font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">DIA ${dayNum}</div>
              <div style="font-size: 16px;">✦</div>
              <div style="font-size: 12px; font-weight: 900; color: #facc15; margin-top: 4px;">+${amount}</div>
              <div style="font-size: 10px; margin-top: 4px; color: ${isPassed ? '#22c55e' : isToday ? '#38bdf8' : '#64748b'};">
                ${isPassed ? '✓' : isToday ? 'HOJE' : 'BLOQ'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="text-align: center;">
        ${canClaim
          ? `<button id="btn-claim-daily-action" class="btn-primary" style="padding: 12px 32px; font-size: 15px;">
              ${i18n.t('claimDaily')}
            </button>`
          : `<button disabled class="hud-btn" style="padding: 12px 32px; opacity: 0.6; cursor: not-allowed;">
              ✓ SUPRIMENTO JÁ COLETADO HOJE
            </button>`
        }
      </div>
    `;

    const btnClaim = container.querySelector('#btn-claim-daily-action');
    if (btnClaim) {
      btnClaim.addEventListener('click', () => {
        const result = SaveManager.claimDaily();
        if (result) {
          sound.playRewardFanfare();
          DailyRewards.render(container, onClaimed);
          if (onClaimed) onClaimed(result.rewardOrbs);
        }
      });
    }
  }
}
