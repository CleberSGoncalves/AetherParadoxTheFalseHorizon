/**
 * @fileoverview Main Bootstrap Entry Point for Aether Paradox: The False Horizon
 *
 * Sequence:
 * 1. Initialize CrazyGames SDK v3 asynchronously with offline/adblock fallback.
 * 2. Setup Canvas, Audio, Game physics engine, and HUD manager.
 * 3. Play Official FluidCleb Interactive Splash Screen (0.0s - 2.8s) + Lore (2.8s+).
 * 4. Land in gameplay in <= 1 click (CrazyGames Official Publishing Rule).
 * 5. Start background cybernetic ambient synthesizer BGM.
 */

import { sound } from './audio.js';
import { crazyGames } from './crazygames.js';
import { CinematicIntro } from './splash.js';
import { TrollPlatformerGame } from './game.js';
import { HudManager } from './hud.js';
import { i18n } from './i18n.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // Initialize CrazyGames SDK v3
  await crazyGames.init();

  const game = new TrollPlatformerGame(canvas);
  const hud = new HudManager(game);

  // Wire CrazyGames Ad Pause / Resume hooks
  crazyGames.setAdCallbacks(
    () => {
      game.isAdPaused = true;
    },
    () => {
      game.isAdPaused = false;
    }
  );

  const inGameHud = document.getElementById('in-game-hud');

  // Launch Cinematic Intro: FluidCleb (0.0s - 2.8s) + Interactive Lore
  const intro = new CinematicIntro(document.body, () => {
    // Land in gameplay
    if (inGameHud) {
      inGameHud.classList.remove('hidden');
    }

    sound.init();
    sound.startCyberBgm();

    game.loadLevel(0);
    game.start();
    crazyGames.gameplayStart();
  });

  intro.start();
});
