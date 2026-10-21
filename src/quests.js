/**
 * @fileoverview Quests & Directives System for Aether Paradox: The False Horizon
 */

import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { crazyGames } from './crazygames.js';
import { i18n } from './i18n.js';

export const QUESTS_DEF = [
  { id: 'q1', title: 'Coletar 6 Estrelas Físicas', target: 6, reward: 50, type: 'stars' },
  { id: 'q2', title: 'Completar 3 Fases Diferentes', target: 3, reward: 60, type: 'completed_levels' },
  { id: 'q3', title: 'Sobreviver ao Nível 5 (Inversão Neural)', target: 1, reward: 80, type: 'beat_lvl_5' },
  { id: 'q4', title: 'Experimentar 10 Mortes Cômicas', target: 10, reward: 40, type: 'deaths' },
  { id: 'q5', title: 'Conquistar ★★★ em Qualquer Fase', target: 1, reward: 100, type: 'three_stars' }
];

export class QuestsManager {
  static getProgress(q, save) {
    if (q.type === 'stars') {
      let count = 0;
      Object.values(save.levels).forEach(l => {
        if (l.stars) l.stars.forEach(s => { if (s) count++; });
      });
      return count;
    }
    if (q.type === 'completed_levels') {
      let count = 0;
      Object.values(save.levels).forEach(l => {
        if (l.completed) count++;
      });
      return count;
    }
    if (q.type === 'beat_lvl_5') {
      return (save.levels[5] && save.levels[5].completed) ? 1 : 0;
    }
    if (q.type === 'deaths') {
      return save.totalDeaths || 0;
    }
    if (q.type === 'three_stars') {
      let found = 0;
      Object.values(save.levels).forEach(l => {
        if (l.stars && l.stars[0] && l.stars[1] && l.stars[2]) found++;
      });
      return found;
    }
    return 0;
  }

  static render(container, onUpdate) {
    if (!container) return;
    const save = SaveManager.get();
    if (!save.quests) save.quests = {};

    container.innerHTML = `
      <h3 style="color: #38bdf8; font-size: 18px; margin: 0 0 16px 0; text-align: center;">
        ${i18n.t('questsTitle')}
      </h3>

      <div style="display: flex; flex-direction: column; gap: 12px; max-height: 360px; overflow-y: auto; padding-right: 4px;">
        ${QUESTS_DEF.map(q => {
          const prog = Math.min(q.target, this.getProgress(q, save));
          const isDone = prog >= q.target;
          const isClaimed = !!save.quests[q.id];
          const pct = Math.round((prog / q.target) * 100);

          return `
            <div class="level-card" style="background: #0f172a; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-weight: 800; font-size: 14px; color: #fff;">${q.title}</div>
                <div style="font-weight: 900; color: #facc15; font-size: 13px;">+${q.reward} Orbs</div>
              </div>

              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; margin-bottom: 10px;">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #0284c7, #00f5ff); border-radius: 999px;"></div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: #94a3b8;">Progresso: ${prog} / ${q.target} (${pct}%)</span>
                <div>
                  ${isClaimed
                    ? `<button disabled class="hud-btn" style="border-color: #22c55e; color: #22c55e; padding: 4px 12px; font-size: 11px;">${i18n.t('claimed')}</button>`
                    : isDone
                      ? `<div style="display: flex; gap: 6px;">
                          <button data-claim="${q.id}" data-reward="${q.reward}" class="btn-primary" style="margin: 0; padding: 6px 14px; font-size: 12px;">
                            ${i18n.t('claimReward')}
                          </button>
                          <button data-double="${q.id}" data-reward="${q.reward}" class="hud-btn" style="border-color: #facc15; color: #facc15; padding: 6px 12px; font-size: 11px;">
                            ${i18n.t('doubleReward')}
                          </button>
                        </div>`
                      : `<button disabled class="hud-btn" style="opacity: 0.5; cursor: not-allowed; padding: 4px 12px; font-size: 11px;">EM ANDAMENTO</button>`
                  }
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-claim]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-claim');
        const reward = parseInt(btn.getAttribute('data-reward'), 10);
        save.quests[qId] = true;
        SaveManager.save(save);
        SaveManager.addOrbs(reward);
        sound.playRewardFanfare();
        QuestsManager.render(container, onUpdate);
        if (onUpdate) onUpdate();
      });
    });

    container.querySelectorAll('[data-double]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-double');
        const reward = parseInt(btn.getAttribute('data-reward'), 10);
        crazyGames.requestRewardedAd(
          () => {
            save.quests[qId] = true;
            SaveManager.save(save);
            SaveManager.addOrbs(reward * 2);
            sound.playRewardFanfare();
            QuestsManager.render(container, onUpdate);
            if (onUpdate) onUpdate();
          },
          () => {}
        );
      });
    });
  }
}
