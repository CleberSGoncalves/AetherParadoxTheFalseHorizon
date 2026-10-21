/**
 * @fileoverview Cyber Shop & Skins System for Aether Paradox: The False Horizon
 */

import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { i18n } from './i18n.js';

export const SKINS = [
  { id: 'skin_default', nameKey: 'skin_default', color: '#00f5ff', shadow: '#00f5ff', eyeColor: '#000', cost: 0 },
  { id: 'skin_neon_pink', nameKey: 'skin_neon_pink', color: '#ec4899', shadow: '#f43f5e', eyeColor: '#fff', cost: 100 },
  { id: 'skin_golden', nameKey: 'skin_golden', color: '#facc15', shadow: '#eab308', eyeColor: '#000', cost: 250 },
  { id: 'skin_shadow', nameKey: 'skin_shadow', color: '#64748b', shadow: '#94a3b8', eyeColor: '#ef4444', cost: 400 },
  { id: 'skin_emerald', nameKey: 'skin_emerald', color: '#10b981', shadow: '#059669', eyeColor: '#fff', cost: 600 }
];

export const UPGRADES = [
  { id: 'shield', nameKey: 'upg_shield', maxLevel: 1, baseCost: 150, desc: 'Absorbs 1 deadly hit per run' },
  { id: 'magnet', nameKey: 'upg_magnet', maxLevel: 3, baseCost: 120, desc: 'Pulls quantum stars from further away' },
  { id: 'spring', nameKey: 'upg_spring', maxLevel: 3, baseCost: 100, desc: 'Increases coyote time and springiness' }
];

export class CyberShop {
  static getPlayerColor(skinId) {
    const s = SKINS.find(item => item.id === skinId) || SKINS[0];
    return {
      color: s.color,
      shadow: s.shadow,
      eyeColor: s.eyeColor
    };
  }

  static render(container, onUpdate) {
    if (!container) return;
    const save = SaveManager.get();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="color: #38bdf8; font-size: 18px; margin: 0;">${i18n.t('shopTitle')}</h3>
        <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; padding: 4px 12px; border-radius: 999px; font-weight: 800; color: #facc15; font-size: 14px;">
          ✦ ${save.orbs || 0} ${i18n.t('orbsLabel')}
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button id="shop-tab-skins" class="hud-btn active" style="flex: 1;">${i18n.t('skinsTab')}</button>
        <button id="shop-tab-upgrades" class="hud-btn" style="flex: 1;">${i18n.t('upgradesTab')}</button>
      </div>

      <div id="shop-content-area" style="max-height: 340px; overflow-y: auto; padding-right: 4px;"></div>
    `;

    const area = container.querySelector('#shop-content-area');
    const tabSkins = container.querySelector('#shop-tab-skins');
    const tabUpgrades = container.querySelector('#shop-tab-upgrades');

    const renderSkins = () => {
      tabSkins.classList.add('active');
      tabUpgrades.classList.remove('active');
      const curSave = SaveManager.get();

      area.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
          ${SKINS.map(s => {
            const isOwned = curSave.unlockedSkins.includes(s.id);
            const isEquipped = curSave.selectedSkin === s.id;
            const canBuy = curSave.orbs >= s.cost;

            return `
              <div class="level-card" style="border-color: ${isEquipped ? '#00f5ff' : 'rgba(255,255,255,0.1)'}; background: #0f172a; text-align: center; padding: 14px;">
                <div style="width: 32px; height: 32px; background: ${s.color}; box-shadow: 0 0 14px ${s.shadow}; margin: 0 auto 10px auto; border-radius: 6px;"></div>
                <div style="font-weight: 800; font-size: 13px; color: #fff; margin-bottom: 4px;">${i18n.t(s.nameKey)}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">${isOwned ? i18n.t('owned') : `✦ ${s.cost} Orbs`}</div>
                ${isEquipped
                  ? `<button disabled class="hud-btn" style="width: 100%; border-color: #00f5ff; color: #00f5ff; opacity: 0.85;">${i18n.t('equipped')}</button>`
                  : isOwned
                    ? `<button data-equip="${s.id}" class="hud-btn" style="width: 100%; background: #0284c7;">${i18n.t('equip')}</button>`
                    : `<button data-buy="${s.id}" data-cost="${s.cost}" class="hud-btn" style="width: 100%; background: ${canBuy ? '#16a34a' : '#334155'}; cursor: ${canBuy ? 'pointer' : 'not-allowed'};">${i18n.t('unlockFor')} ✦${s.cost}</button>`
                }
              </div>
            `;
          }).join('')}
        </div>
      `;

      area.querySelectorAll('[data-equip]').forEach(btn => {
        btn.addEventListener('click', () => {
          sound.playClick();
          SaveManager.equipSkin(btn.getAttribute('data-equip'));
          renderSkins();
          if (onUpdate) onUpdate();
        });
      });

      area.querySelectorAll('[data-buy]').forEach(btn => {
        btn.addEventListener('click', () => {
          const skinId = btn.getAttribute('data-buy');
          const cost = parseInt(btn.getAttribute('data-cost'), 10);
          if (SaveManager.buySkin(skinId, cost)) {
            sound.playRewardFanfare();
            renderSkins();
            if (onUpdate) onUpdate();
          }
        });
      });
    };

    const renderUpgrades = () => {
      tabUpgrades.classList.add('active');
      tabSkins.classList.remove('active');
      const curSave = SaveManager.get();

      area.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${UPGRADES.map(u => {
            const currentLevel = curSave.upgrades[u.id] || 0;
            const isMax = currentLevel >= u.maxLevel;
            const cost = u.baseCost * (currentLevel + 1);
            const canAfford = curSave.orbs >= cost;

            return `
              <div class="level-card" style="background: #0f172a; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; font-size: 14px; color: #38bdf8;">${i18n.t(u.nameKey)}</div>
                  <div style="font-size: 12px; color: #94a3b8; margin: 2px 0 6px 0;">${u.desc}</div>
                  <div style="font-size: 11px; color: #cbd5e1; font-weight: 700;">
                    Nível: ${currentLevel} / ${u.maxLevel}
                  </div>
                </div>
                <div>
                  ${isMax
                    ? `<button disabled class="hud-btn" style="border-color: #22c55e; color: #22c55e;">MÁXIMO</button>`
                    : `<button data-upg="${u.id}" data-cost="${cost}" class="hud-btn" style="background: ${canAfford ? '#16a34a' : '#334155'}; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                        UPGRADE ✦${cost}
                      </button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      area.querySelectorAll('[data-upg]').forEach(btn => {
        btn.addEventListener('click', () => {
          const upgId = btn.getAttribute('data-upg');
          const cost = parseInt(btn.getAttribute('data-cost'), 10);
          if (SaveManager.buyUpgrade(upgId, cost)) {
            sound.playRewardFanfare();
            renderUpgrades();
            if (onUpdate) onUpdate();
          }
        });
      });
    };

    tabSkins.addEventListener('click', () => {
      sound.playClick();
      renderSkins();
    });

    tabUpgrades.addEventListener('click', () => {
      sound.playClick();
      renderUpgrades();
    });

    renderSkins();
  }
}
