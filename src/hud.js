/**
 * @fileoverview Complete HUD & Modal Controller for Aether Paradox: The False Horizon
 *
 * Implements:
 * - Anti-Softlock Central ModalController (solves "Trava e Não Volta")
 * - Safe DOM helpers (safeSetText, safeSetHtml)
 * - Real-time 3-Star physical objective progress indicators
 * - Pulsating "✅ CONCLUIR FASE (★) ➔" button when ≥ 1 star is collected
 * - Bilingual locale switcher (EN / PT-BR)
 * - Level selection, Victory, Shop, Quests, Daily, and Spin modal controllers
 * - On-screen mobile touch D-Pad and Jump controls
 */

import { LEVELS } from './levels.js';
import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { crazyGames } from './crazygames.js';
import { i18n } from './i18n.js';
import { CyberShop } from './shop.js';
import { DailyRewards } from './daily_rewards.js';
import { LuckySpin } from './lucky_spin.js';
import { QuestsManager } from './quests.js';

export function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function safeSetHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

export class ModalController {
  constructor(game) {
    this.game = game;
    this.activeModal = null;
    this.modalStack = [];
    this.previousState = null;
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (this.activeModal && this.activeModal !== modal) {
      this.activeModal.classList.add('hidden');
      this.modalStack.push(this.activeModal.id);
    }

    modal.classList.remove('hidden');
    this.activeModal = modal;
    this.game.isPaused = true;
    crazyGames.gameplayStop();
  }

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');

    if (this.modalStack.length > 0) {
      const prevId = this.modalStack.pop();
      const prevModal = document.getElementById(prevId);
      if (prevModal) {
        prevModal.classList.remove('hidden');
        this.activeModal = prevModal;
        return;
      }
    }

    this.activeModal = null;

    // ANTI-SOFTLOCK FIX:
    // If the round is over (Victory screen was active), reopen Victory instead of freezing
    if (this.game.isRoundOver) {
      const vic = document.getElementById('modal-victory');
      if (vic && modalId !== 'modal-victory') {
        vic.classList.remove('hidden');
        this.activeModal = vic;
        return;
      }
    }

    this.game.isPaused = false;
    crazyGames.gameplayStart();
  }

  closeAll() {
    document.querySelectorAll('.game-modal').forEach(m => m.classList.add('hidden'));
    this.activeModal = null;
    this.modalStack.length = 0;
    this.game.isPaused = false;
  }
}

export class HudManager {
  constructor(game) {
    this.game = game;
    this.modals = new ModalController(game);
    this.currentStarsCount = 0;

    this.initDOM();
    this.initEvents();
  }

  initDOM() {
    this.updateHUDLabels();
    this.renderStarsHUD(0);
    this.renderOrbs();
  }

  updateHUDLabels() {
    safeSetText('btn-open-menu', i18n.t('levelsMenu'));
    safeSetText('btn-open-shop', i18n.t('shopBtn'));
    safeSetText('btn-open-quests', i18n.t('questsBtn'));
    safeSetText('btn-open-daily', i18n.t('dailyBtn'));
    safeSetText('btn-open-spin', i18n.t('spinBtn'));
    safeSetText('hud-fast-retry-btn', i18n.t('fastRetryHint'));
    safeSetText('hud-controls-hint', i18n.t('desktopControls'));
    safeSetText('btn-early-finish', i18n.t('completeLevelBtn'));
  }

  renderStarsHUD(count) {
    this.currentStarsCount = count;
    const s1 = document.getElementById('star-icon-1');
    const s2 = document.getElementById('star-icon-2');
    const s3 = document.getElementById('star-icon-3');

    if (s1) s1.className = count >= 1 ? 'star-gold' : 'star-dim';
    if (s2) s2.className = count >= 2 ? 'star-gold' : 'star-dim';
    if (s3) s3.className = count >= 3 ? 'star-gold' : 'star-dim';

    // Toggle pulsating early finish button
    const btnEarly = document.getElementById('btn-early-finish');
    if (btnEarly) {
      if (count >= 1 && !this.game.isRoundOver) {
        btnEarly.classList.remove('hidden');
      } else {
        btnEarly.classList.add('hidden');
      }
    }
  }

  renderOrbs() {
    const save = SaveManager.get();
    safeSetText('hud-orbs-val', `✦ ${save.orbs || 0}`);
  }

  initEvents() {
    const g = this.game;

    // Level Update hook
    g.onLevelUpdate = (lvl, deaths, starsCount) => {
      safeSetText('hud-level-title', `${i18n.t('level')} ${lvl.id}: ${i18n.t(lvl.nameKey || 'lvl1_name')}`);
      safeSetText('hud-death-val', `${i18n.t('deaths')}: ${deaths}`);
      this.renderStarsHUD(starsCount);
      this.renderOrbs();
    };

    // Star collection hook
    g.onStarCollected = (star, totalStars) => {
      this.renderStarsHUD(totalStars);
      this.renderOrbs();
    };

    // Early Finish Button
    const btnEarly = document.getElementById('btn-early-finish');
    if (btnEarly) {
      btnEarly.addEventListener('click', () => {
        sound.playClick();
        g.winLevel();
      });
    }

    // Fast Retry in HUD
    const btnRetry = document.getElementById('hud-fast-retry-btn');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        g.killPlayer(true);
      });
    }

    // Sound toggle
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        btnSound.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Language toggle
    const btnLang = document.getElementById('btn-lang-toggle');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        sound.playClick();
        const newLang = i18n.toggleLocale();
        btnLang.textContent = newLang === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN';
        this.updateHUDLabels();
        if (g.level) {
          safeSetText('hud-level-title', `${i18n.t('level')} ${g.level.id}: ${i18n.t(g.level.nameKey || 'lvl1_name')}`);
        }
      });
    }

    // Level Select Menu Modal
    const btnMenu = document.getElementById('btn-open-menu');
    const btnCloseMenu = document.getElementById('btn-close-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        sound.playClick();
        this.renderLevelsGrid();
        this.modals.open('modal-level-select');
      });
    }
    if (btnCloseMenu) {
      btnCloseMenu.addEventListener('click', () => {
        sound.playClick();
        this.modals.close('modal-level-select');
      });
    }

    // Cyber Shop Modal
    const btnShop = document.getElementById('btn-open-shop');
    const btnCloseShop = document.getElementById('btn-close-shop');
    if (btnShop) {
      btnShop.addEventListener('click', () => {
        sound.playClick();
        CyberShop.render(document.getElementById('shop-modal-body'), () => {
          this.renderOrbs();
        });
        this.modals.open('modal-shop');
      });
    }
    if (btnCloseShop) {
      btnCloseShop.addEventListener('click', () => {
        sound.playClick();
        this.modals.close('modal-shop');
        this.renderOrbs();
      });
    }

    // Daily Supply Modal
    const btnDaily = document.getElementById('btn-open-daily');
    const btnCloseDaily = document.getElementById('btn-close-daily');
    if (btnDaily) {
      btnDaily.addEventListener('click', () => {
        sound.playClick();
        DailyRewards.render(document.getElementById('daily-modal-body'), () => {
          this.renderOrbs();
        });
        this.modals.open('modal-daily');
      });
    }
    if (btnCloseDaily) {
      btnCloseDaily.addEventListener('click', () => {
        sound.playClick();
        this.modals.close('modal-daily');
      });
    }

    // Lucky Spin Modal
    const btnSpin = document.getElementById('btn-open-spin');
    const btnCloseSpin = document.getElementById('btn-close-spin');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        sound.playClick();
        LuckySpin.render(document.getElementById('spin-modal-body'), () => {
          this.renderOrbs();
        });
        this.modals.open('modal-spin');
      });
    }
    if (btnCloseSpin) {
      btnCloseSpin.addEventListener('click', () => {
        sound.playClick();
        this.modals.close('modal-spin');
      });
    }

    // Quests Modal
    const btnQuests = document.getElementById('btn-open-quests');
    const btnCloseQuests = document.getElementById('btn-close-quests');
    if (btnQuests) {
      btnQuests.addEventListener('click', () => {
        sound.playClick();
        QuestsManager.render(document.getElementById('quests-modal-body'), () => {
          this.renderOrbs();
        });
        this.modals.open('modal-quests');
      });
    }
    if (btnCloseQuests) {
      btnCloseQuests.addEventListener('click', () => {
        sound.playClick();
        this.modals.close('modal-quests');
      });
    }

    // Victory Callback hook
    g.onVictoryCallback = (lvl, deaths, timeSec, starsArray, orbsEarned) => {
      this.renderOrbs();
      crazyGames.happyTime();

      const starsCount = starsArray.filter(Boolean).length;
      const starsString = '★'.repeat(starsCount) + '☆'.repeat(3 - starsCount);

      safeSetText('vic-title', `${lvl.name.toUpperCase()} ${i18n.t('completedLevel')}!`);
      safeSetHtml('vic-stats', `
        <div style="font-size: 24px; color: #facc15; margin: 8px 0; letter-spacing: 4px;">${starsString}</div>
        <div>${i18n.t('deaths')}: <strong>${deaths}</strong> • ${i18n.t('time')}: <strong>${timeSec.toFixed(1)}s</strong></div>
        <div style="margin-top: 6px; color: #22c55e; font-weight: 800;">+${orbsEarned} ${i18n.t('orbsLabel')}!</div>
      `);

      this.modals.open('modal-victory');

      // Request midgame ad on level victory if eligible
      crazyGames.requestMidgameAd();
    };

    // Victory Next Level Button
    const btnNext = document.getElementById('btn-vic-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        sound.playClick();
        this.modals.closeAll();
        const nextIdx = (g.currentLevelIndex + 1) % LEVELS.length;
        g.loadLevel(nextIdx);
      });
    }

    // Victory Double Orbs Button (Rewarded Ad)
    const btnDoubleOrbs = document.getElementById('btn-vic-double');
    if (btnDoubleOrbs) {
      btnDoubleOrbs.addEventListener('click', () => {
        sound.playClick();
        crazyGames.requestRewardedAd(
          () => {
            SaveManager.addOrbs(30);
            this.renderOrbs();
            sound.playRewardFanfare();
            btnDoubleOrbs.disabled = true;
            btnDoubleOrbs.textContent = '✓ ORBES DOBRADOS!';
          },
          () => {}
        );
      });
    }

    // Mobile Virtual Touch Controls
    this.initTouchControls();
  }

  initTouchControls() {
    const g = this.game;
    const touchLayer = document.getElementById('touch-controls-layer');
    const btnLeft = document.getElementById('touch-btn-left');
    const btnRight = document.getElementById('touch-btn-right');
    const btnJump = document.getElementById('touch-btn-jump');

    // Only activate touch layer when genuine touch is detected (mobile devices)
    const showTouch = () => {
      if (touchLayer) {
        touchLayer.classList.remove('touch-controls-hidden');
        touchLayer.classList.add('touch-controls-visible');
      }
    };

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024);

    if (isMobile) {
      showTouch();
    } else {
      window.addEventListener('touchstart', () => {
        showTouch();
      }, { once: true, passive: true });
    }

    const bindTouch = (el, onDown, onUp) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sound.init();
        onDown();
      }, { passive: false });

      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onUp();
      }, { passive: false });

      el.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        onUp();
      }, { passive: false });
    };

    bindTouch(btnLeft, () => { g.keys.left = true; g.player.facing = -1; }, () => { g.keys.left = false; });
    bindTouch(btnRight, () => { g.keys.right = true; g.player.facing = 1; }, () => { g.keys.right = false; });
    bindTouch(btnJump, () => {
      g.keys.jump = true;
      g.player.jumpBuffer = 0.12;
    }, () => {
      g.keys.jump = false;
    });
  }

  renderLevelsGrid() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const save = SaveManager.get();
    const unlocked = save.unlockedLevel || 1;

    LEVELS.forEach((lvl, idx) => {
      const isLocked = lvl.id > unlocked;
      const data = save.levels[lvl.id] || { deaths: 0, completed: false, stars: [false, false, false], bestTime: 999 };
      const starsCount = (data.stars || []).filter(Boolean).length;
      const starsString = '★'.repeat(starsCount) + '☆'.repeat(3 - starsCount);

      const card = document.createElement('div');
      card.className = `level-card ${isLocked ? 'locked' : ''} ${this.game.currentLevelIndex === idx ? 'current' : ''}`;
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 16px; font-weight: 900; color: #38bdf8;">0${lvl.id}</span>
          <span style="color: #facc15; font-size: 13px;">${starsString}</span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #fff; margin: 4px 0;">${i18n.t(lvl.nameKey || 'lvl1_name')}</div>
        <div style="font-size: 11px; color: ${data.completed ? '#22c55e' : '#94a3b8'};">
          ${isLocked ? i18n.t('lockedLevel') : (data.completed ? i18n.t('completedLevel') : i18n.t('pendingLevel'))} • ${data.deaths} mortes
        </div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          sound.playClick();
          this.modals.closeAll();
          this.game.loadLevel(idx);
        });
      }

      grid.appendChild(card);
    });
  }
}
