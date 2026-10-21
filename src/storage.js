/**
 * @fileoverview Robust Versioned Storage System for Aether Paradox: The False Horizon
 * Stores player progress, physical star collections, deaths, times, shop unlocks,
 * daily login rewards, and quests with schema migration safety.
 */

const STORAGE_KEY = 'aether_paradox_save_v2';

export class SaveManager {
  static getDefault() {
    return {
      version: 2,
      unlockedLevel: 1,
      totalDeaths: 0,
      orbs: 0,
      selectedSkin: 'skin_default',
      unlockedSkins: ['skin_default'],
      upgrades: {
        shield: 0, // 0 or 1 (1 free hit per level)
        magnet: 0, // 0 to 3
        spring: 0  // 0 to 3
      },
      daily: {
        lastClaimDate: '',
        streak: 0
      },
      luckySpin: {
        lastSpinTime: 0
      },
      levels: {} // { [id]: { completed: false, deaths: 0, bestTime: 999, stars: [false, false, false] } }
    };
  }

  static get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...this.getDefault(), ...parsed };
        }
      }
    } catch (_) {}
    return this.getDefault();
  }

  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  static recordDeath(levelId) {
    const s = this.get();
    s.totalDeaths++;
    if (!s.levels[levelId]) {
      s.levels[levelId] = { completed: false, deaths: 0, bestTime: 999, stars: [false, false, false] };
    }
    s.levels[levelId].deaths++;
    this.save(s);
    return s.levels[levelId].deaths;
  }

  static recordVictory(levelId, starsArray = [true, false, false], timeSeconds = 0, orbsGained = 15) {
    const s = this.get();
    if (!s.levels[levelId]) {
      s.levels[levelId] = { completed: false, deaths: 0, bestTime: 999, stars: [false, false, false] };
    }
    const lvl = s.levels[levelId];
    lvl.completed = true;

    // Merge stars
    if (Array.isArray(starsArray)) {
      lvl.stars = [
        lvl.stars[0] || !!starsArray[0],
        lvl.stars[1] || !!starsArray[1],
        lvl.stars[2] || !!starsArray[2]
      ];
    }

    if (timeSeconds > 0 && timeSeconds < lvl.bestTime) {
      lvl.bestTime = Math.round(timeSeconds * 10) / 10;
    }

    s.orbs += orbsGained;
    s.unlockedLevel = Math.max(s.unlockedLevel || 1, levelId + 1);
    this.save(s);
    return lvl;
  }

  static addOrbs(amount) {
    const s = this.get();
    s.orbs = Math.max(0, (s.orbs || 0) + amount);
    this.save(s);
    return s.orbs;
  }

  static buySkin(skinId, cost) {
    const s = this.get();
    if (s.orbs >= cost && !s.unlockedSkins.includes(skinId)) {
      s.orbs -= cost;
      s.unlockedSkins.push(skinId);
      s.selectedSkin = skinId;
      this.save(s);
      return true;
    }
    return false;
  }

  static equipSkin(skinId) {
    const s = this.get();
    if (s.unlockedSkins.includes(skinId)) {
      s.selectedSkin = skinId;
      this.save(s);
      return true;
    }
    return false;
  }

  static buyUpgrade(upgKey, cost) {
    const s = this.get();
    if (s.orbs >= cost) {
      s.orbs -= cost;
      s.upgrades[upgKey] = (s.upgrades[upgKey] || 0) + 1;
      this.save(s);
      return true;
    }
    return false;
  }

  static canClaimDaily() {
    const s = this.get();
    const today = new Date().toISOString().slice(0, 10);
    return s.daily.lastClaimDate !== today;
  }

  static claimDaily() {
    const s = this.get();
    const today = new Date().toISOString().slice(0, 10);
    if (s.daily.lastClaimDate === today) return null;

    let streak = s.daily.streak || 0;
    // Check if yesterday or first time
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (s.daily.lastClaimDate === yesterday) {
      streak = (streak % 7) + 1;
    } else {
      streak = 1;
    }

    s.daily.lastClaimDate = today;
    s.daily.streak = streak;

    // Daily rewards progression
    const rewards = [20, 35, 50, 75, 100, 150, 250];
    const rewardOrbs = rewards[streak - 1] || 30;
    s.orbs += rewardOrbs;

    this.save(s);
    return { streak, rewardOrbs };
  }

  static canFreeSpin() {
    const s = this.get();
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    return (now - (s.luckySpin.lastSpinTime || 0)) >= twelveHours;
  }

  static recordSpin() {
    const s = this.get();
    s.luckySpin.lastSpinTime = Date.now();
    this.save(s);
  }
}
