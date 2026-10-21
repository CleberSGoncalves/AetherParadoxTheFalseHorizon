/**
 * @fileoverview CrazyGames SDK v3 Integration Bridge for Aether Paradox: The False Horizon
 * Strict compliance with CrazyGames publishing specifications:
 * - Asynchronous initialization with resilient offline/AdBlock fallback
 * - Gameplay cycle: gameplayStart() on first player motion, gameplayStop() on pause/death/victory
 * - Mute audio and pause physics during ads, restoring on finish or error
 * - Rewarded Ad 1: Quantum Revive (3s invulnerability shield)
 * - Rewarded Ad 2: Double Quantum Orbs on level clear
 * - Watchdog Timeout of 2.5s in requestMidgameAd & requestRewardedAd
 * - Midgame Ads strictly in transition menus with 3-minute cooldown, never during active jumps
 * - Under adError (AdBlock), NEVER grant reward
 */

import { sound } from './audio.js';

class CrazyGamesBridge {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
    this.isLiveCrazyGamesHost = false;
    this.hasAdblock = false;
    this.inGameplay = false;
    this.lastMidgameTime = performance.now();
    this.onAdPauseCallback = null;
    this.onAdResumeCallback = null;
  }

  setAdCallbacks(onPause, onResume) {
    this.onAdPauseCallback = onPause;
    this.onAdResumeCallback = onResume;
  }

  _canRequestLiveAds() {
    if (!this.sdk || !this.sdk.ad || typeof this.sdk.ad.requestAd !== 'function') {
      return false;
    }
    const env = this.sdk.environment;
    if (env === 'disabled') {
      return false;
    }
    if (typeof window !== 'undefined' && window.location) {
      const host = (window.location.hostname || '').toLowerCase();
      const isCgHost = host.includes('crazygames') || host.includes('1001juegos');
      if (!isCgHost && env !== 'crazygames' && env !== 'local') {
        return false;
      }
      if (!isCgHost && env === 'local' && !window.location.search.includes('crazygames')) {
        return false;
      }
    }
    return true;
  }

  async init() {
    if (this.isInitialized) return true;

    try {
      if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK) {
        this.sdk = window.CrazyGames.SDK;
        if (typeof this.sdk.init === 'function') {
          await Promise.race([
            this.sdk.init(),
            new Promise((resolve) => setTimeout(resolve, 2000))
          ]);
        }
        if (this.sdk.ad && typeof this.sdk.ad.hasAdblock === 'function') {
          try {
            this.hasAdblock = await Promise.race([
              this.sdk.ad.hasAdblock(),
              new Promise((resolve) => setTimeout(() => resolve(false), 1200))
            ]);
          } catch (_) {
            this.hasAdblock = false;
          }
        }
        this.isInitialized = true;
        this.isLiveCrazyGamesHost = this._canRequestLiveAds();
        console.log(`[CrazyGames] SDK v3 initialized (env=${this.sdk.environment || 'unknown'}, liveAds=${this.isLiveCrazyGamesHost}).`);
        return true;
      } else {
        console.warn('[CrazyGames] SDK v3 not found on window (Fallback mode active).');
        this.isInitialized = false;
        return false;
      }
    } catch (err) {
      console.warn('[CrazyGames] SDK v3 init error:', err);
      this.hasAdblock = true;
      this.isInitialized = false;
      return false;
    }
  }

  gameplayStart() {
    if (this.inGameplay) return;
    this.inGameplay = true;
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStart === 'function') {
        this.sdk.game.gameplayStart();
      }
    } catch (_) {}
  }

  gameplayStop() {
    if (!this.inGameplay) return;
    this.inGameplay = false;
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStop === 'function') {
        this.sdk.game.gameplayStop();
      }
    } catch (_) {}
  }

  happyTime() {
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.happytime === 'function') {
        this.sdk.game.happytime();
      }
    } catch (_) {}
  }

  /**
   * Rewarded Ad with strict 2.5s watchdog timeout and finally restoration.
   * If adError or AdBlock occurs, onReward is NEVER called.
   */
  requestRewardedAd(onReward, onDismiss) {
    this.gameplayStop();

    if (!this._canRequestLiveAds()) {
      console.log('[CrazyGames] Host/environment bypass for rewarded ads.');
      if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        const confirmed = window.confirm('[DEV MODE] Simular Rewarded Ad?\nClique OK para simular visualização com recompensa, ou Cancelar para dispensar.');
        if (confirmed) {
          if (onReward) onReward();
        } else {
          if (onDismiss) onDismiss();
        }
      } else {
        if (onDismiss) onDismiss();
      }
      return;
    }

    let hasFinished = false;
    if (this.onAdPauseCallback) this.onAdPauseCallback();
    sound.setAdMuted(true);

    const finish = (rewardEarned) => {
      if (!hasFinished) {
        hasFinished = true;
        clearTimeout(watchdogTimer);
        sound.setAdMuted(false);
        if (this.onAdResumeCallback) this.onAdResumeCallback();

        if (rewardEarned) {
          if (onReward) onReward();
        } else {
          if (onDismiss) onDismiss();
        }
      }
    };

    // 2.5s Watchdog Timeout in case SDK hangs
    const watchdogTimer = setTimeout(() => {
      console.warn('[CrazyGames] Rewarded ad watchdog triggered: SDK did not respond in 2.5s.');
      finish(false);
    }, 2500);

    try {
      this.sdk.ad.requestAd('rewarded', {
        adStarted: () => {
          clearTimeout(watchdogTimer);
          console.log('[CrazyGames] Rewarded ad started.');
        },
        adFinished: () => {
          console.log('[CrazyGames] Rewarded ad finished successfully.');
          finish(true);
        },
        adError: (error) => {
          console.warn('[CrazyGames] Rewarded ad error (AdBlock or failed):', error);
          finish(false); // NEVER reward on error
        }
      });
    } catch (e) {
      console.warn('[CrazyGames] Rewarded ad request exception:', e);
      finish(false);
    }
  }

  /**
   * Midgame Ad between levels with 3-minute cooldown and 2.5s watchdog.
   */
  requestMidgameAd(onComplete) {
    const now = performance.now();
    const cooldownMs = 180000; // 3 minutes

    if (now - this.lastMidgameTime < cooldownMs || !this._canRequestLiveAds()) {
      if (onComplete) onComplete();
      return;
    }

    this.gameplayStop();
    let hasFinished = false;
    if (this.onAdPauseCallback) this.onAdPauseCallback();
    sound.setAdMuted(true);

    const finish = () => {
      if (!hasFinished) {
        hasFinished = true;
        clearTimeout(watchdogTimer);
        this.lastMidgameTime = performance.now();
        sound.setAdMuted(false);
        if (this.onAdResumeCallback) this.onAdResumeCallback();
        if (onComplete) onComplete();
      }
    };

    const watchdogTimer = setTimeout(() => {
      console.warn('[CrazyGames] Midgame ad watchdog triggered in 2.5s.');
      finish();
    }, 2500);

    try {
      this.sdk.ad.requestAd('midgame', {
        adStarted: () => {
          clearTimeout(watchdogTimer);
          console.log('[CrazyGames] Midgame ad started.');
        },
        adFinished: () => {
          console.log('[CrazyGames] Midgame ad finished.');
          finish();
        },
        adError: (err) => {
          console.warn('[CrazyGames] Midgame ad error:', err);
          finish();
        }
      });
    } catch (e) {
      console.warn('[CrazyGames] Midgame ad request exception:', e);
      finish();
    }
  }
}

export const crazyGames = new CrazyGamesBridge();
