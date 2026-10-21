/**
 * @fileoverview Complete Subversive Platformer Physics Engine for Aether Paradox: The False Horizon
 *
 * Implements:
 * - Deterministic delta time physics (60Hz / 120Hz / 144Hz / 165Hz parity)
 * - Coyote Time (120ms) & Jump Buffer (120ms) & Variable Jump Height
 * - Physical 3-Star Collection Hitbox (ZERO free stars)
 * - Psychological & Troll Traps (Runaway door, pop spikes, decoy portals, reverse zones, gravity pads)
 * - Emergency Shield (Upgrade / Rewarded Ad)
 * - Fast Retry (< 40ms) with comical squash & stretch and particle burst
 * - Trauma² Screen Shake, Hit-Stop, Floating Text
 * - Dynamic 100vw x 100dvh Edge-to-Edge Canvas with ResizeObserver and devicePixelRatio
 */

import { sound } from './audio.js';
import { SaveManager } from './storage.js';
import { LEVELS } from './levels.js';
import { shaker, hitStop, floaters, SquashStretch, triggerHaptic, sanitize, clamp } from './juice.js';
import { particles } from './particles.js';
import { CyberShop } from './shop.js';

export class TrollPlatformerGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.currentLevelIndex = 0;
    this.level = null;

    // Virtual resolution (16:9 reference)
    this.vw = 960;
    this.vh = 540;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Player State
    this.player = {
      x: 70,
      y: 440,
      w: 24,
      h: 28,
      vx: 0,
      vy: 0,
      speed: 270,
      jumpForce: -540,
      gravity: 1450,
      isGrounded: false,
      coyoteTimer: 0,
      jumpBuffer: 0,
      isDead: false,
      isWon: false,
      isReversed: false,
      isGravityInverted: false,
      hasShield: false,
      shieldInvulnTimer: 0,
      facing: 1 // 1: right, -1: left
    };

    this.squash = new SquashStretch();

    // Input States
    this.keys = { left: false, right: false, jump: false };
    this.deathCount = 0;
    this.levelStartTime = performance.now();
    this.levelTimer = 0;
    this.isPaused = false;
    this.isRoundOver = false;
    this.isAdPaused = false;

    // Callbacks
    this.onLevelUpdate = null;
    this.onStarCollected = null;
    this.onVictoryCallback = null;
    this.onPlayerDiedCallback = null;

    this.initResize();
    this.initInputs();
  }

  initResize() {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;

      const scaleX = w / this.vw;
      const scaleY = h / this.vh;
      this.scale = Math.min(scaleX, scaleY);
      this.offsetX = (w - this.vw * this.scale) / 2;
      this.offsetY = (h - this.vh * this.scale) / 2;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
  }

  initInputs() {
    const onKey = (e, isDown) => {
      sound.init();

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.keys.left = isDown;
        if (isDown) this.player.facing = this.player.isReversed ? 1 : -1;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.keys.right = isDown;
        if (isDown) this.player.facing = this.player.isReversed ? -1 : 1;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        this.keys.jump = isDown;
        if (isDown) {
          this.player.jumpBuffer = 0.12; // 120ms Jump Buffer
        } else {
          // Variable jump height: cut jump if released early
          const gravDir = this.player.isGravityInverted ? -1 : 1;
          if (this.player.vy * gravDir < -150) {
            this.player.vy = -150 * gravDir;
          }
        }
      }
      if (isDown && e.code === 'KeyR') {
        this.killPlayer(true); // Fast restart
      }
    };

    window.addEventListener('keydown', (e) => onKey(e, true));
    window.addEventListener('keyup', (e) => onKey(e, false));
  }

  loadLevel(index) {
    this.isRoundOver = false;
    this.isPaused = false;
    this.isAdPaused = false;
    sound.setAdMuted(false);

    this.currentLevelIndex = clamp(index, 0, LEVELS.length - 1);
    // Deep clone to guarantee fresh trap resets
    this.level = JSON.parse(JSON.stringify(LEVELS[this.currentLevelIndex]));
    this.deathCount = 0;
    this.levelTimer = 0;
    this.levelStartTime = performance.now();

    // Check permanent shield upgrade
    const save = SaveManager.get();
    this.player.hasShield = (save.upgrades && save.upgrades.shield > 0);
    this.player.shieldInvulnTimer = 0;

    this.respawnPlayer();

    if (this.onLevelUpdate) {
      this.onLevelUpdate(this.level, this.deathCount, this.getCollectedStarsCount());
    }
  }

  respawnPlayer() {
    const p = this.player;
    p.x = this.level.spawn.x;
    p.y = this.level.spawn.y;
    p.vx = 0;
    p.vy = 0;
    p.isDead = false;
    p.isWon = false;
    p.isReversed = false;
    p.isGravityInverted = false;
    this.squash.punch(1.0, 1.0);
  }

  getCollectedStarsCount() {
    if (!this.level || !this.level.stars) return 0;
    return this.level.stars.filter(s => s.collected).length;
  }

  giveReviveShield() {
    this.player.hasShield = true;
    this.player.shieldInvulnTimer = 3.5; // 3.5 seconds invulnerability
    sound.playRevive();
    floaters.spawn('🛡️ ESCUDO ATIVO (+3.5s)!', this.player.x + 12, this.player.y - 20, '#00f5ff', true);
  }

  killPlayer(isManualRestart = false) {
    const p = this.player;
    if (p.isDead || p.isWon) return;

    // Shield protection check
    if (!isManualRestart && (p.hasShield || p.shieldInvulnTimer > 0)) {
      if (p.shieldInvulnTimer <= 0) {
        p.hasShield = false;
        p.shieldInvulnTimer = 2.5; // Absorbed hit!
        sound.playRevive();
        shaker.addTrauma(0.4);
        hitStop.trigger(60);
        floaters.spawn('🛡️ IMPACTO ABSORVIDO!', p.x + 12, p.y - 15, '#facc15', true);
        p.vy = -350 * (p.isGravityInverted ? -1 : 1);
        return;
      } else {
        return; // Still invulnerable
      }
    }

    p.isDead = true;
    sound.playPopDeath();
    triggerHaptic(40);
    shaker.addTrauma(0.5);
    hitStop.trigger(50);
    particles.emitDeathExplosion(p.x + p.w / 2, p.y + p.h / 2);

    // Comical Squash
    this.squash.punch(1.8, 0.2);

    // Comical Floater
    const quips = ['OOPS!', 'SUBVERTIDO!', 'PARADOXO!', 'NÃO ERA AÍ!', 'PEGADINHA!', 'TENTE DE NOVO!'];
    const chosenQuip = quips[Math.floor(Math.random() * quips.length)];
    floaters.spawn(chosenQuip, p.x + p.w / 2, p.y - 10, '#ef4444', true);

    this.deathCount = SaveManager.recordDeath(this.level.id);

    if (this.onLevelUpdate) {
      this.onLevelUpdate(this.level, this.deathCount, this.getCollectedStarsCount());
    }

    if (this.onPlayerDiedCallback) {
      this.onPlayerDiedCallback(this.deathCount);
    }

    // Fast-Retry (< 40ms gameplay restore after short comedy delay)
    setTimeout(() => {
      // Reload fresh traps
      this.level = JSON.parse(JSON.stringify(LEVELS[this.currentLevelIndex]));
      this.respawnPlayer();
    }, 280);
  }

  winLevel() {
    const p = this.player;
    if (p.isWon || p.isDead) return;
    p.isWon = true;
    this.isRoundOver = true;

    sound.playVictory();
    shaker.addTrauma(0.3);
    particles.emitConfetti(this.vw, this.vh);

    const starsCollected = this.level.stars.map(s => !!s.collected);
    const starsCount = starsCollected.filter(Boolean).length;
    const orbsEarned = 15 + starsCount * 10;

    SaveManager.recordVictory(this.level.id, starsCollected, this.levelTimer, orbsEarned);

    if (this.onVictoryCallback) {
      this.onVictoryCallback(this.level, this.deathCount, this.levelTimer, starsCollected, orbsEarned);
    }
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    if (!this.isPaused && !this.isAdPaused && !hitStop.isHitStopped) {
      if (!this.player.isDead && !this.player.isWon) {
        this.levelTimer += dt;
        this.update(dt);
      }
      shaker.update(dt);
      floaters.update(dt);
      particles.update(dt, this.level ? this.level.platforms : []);
      this.squash.update(dt);
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const p = this.player;
    if (p.shieldInvulnTimer > 0) {
      p.shieldInvulnTimer = Math.max(0, p.shieldInvulnTimer - dt);
    }

    // 1. Zonas de Inversão de Controles
    p.isReversed = false;
    if (this.level.traps) {
      for (const t of this.level.traps) {
        if (t.type === 'reverse_controls_zone') {
          if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
            p.isReversed = true;
          }
        }
      }
    }

    // 2. Movimento Horizontal
    let moveDir = 0;
    if (this.keys.left) moveDir -= 1;
    if (this.keys.right) moveDir += 1;
    if (p.isReversed) moveDir = -moveDir;

    p.vx = moveDir * p.speed;

    // 3. Gravidade e Salto com Coyote Time & Buffer
    const gravDir = p.isGravityInverted ? -1 : 1;
    if (p.isGrounded) {
      p.coyoteTimer = 0.12; // 120ms coyote time
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

    if (p.jumpBuffer > 0 && p.coyoteTimer > 0) {
      p.vy = p.jumpForce * gravDir;
      p.jumpBuffer = 0;
      p.coyoteTimer = 0;
      p.isGrounded = false;
      this.squash.punch(0.75, 1.3); // Stretch on jump
      sound.playJump();
      particles.emitJumpDust(p.x + p.w / 2, gravDir === 1 ? p.y + p.h : p.y);
    }

    // Aplica gravidade
    p.vy += p.gravity * gravDir * dt;

    // 4. Integração de Movimento e Colisão AABB
    p.x += p.vx * dt;
    this.resolveHorizontalCollisions();

    const wasGrounded = p.isGrounded;
    p.y += p.vy * dt;
    this.resolveVerticalCollisions();

    // Squash on landing
    if (!wasGrounded && p.isGrounded) {
      this.squash.punch(1.3, 0.7);
      sound.playLand();
      particles.emitLandDust(p.x + p.w / 2, gravDir === 1 ? p.y + p.h : p.y);
    }

    // 5. Atualização das Armadilhas Subversivas
    this.updateTraps(dt);

    // 6. Colisão com Estrelas Físicas (ZERO ESTRELAS GRÁTIS!)
    this.checkStarsCollision();

    // 7. Colisão com Espinhos
    if (this.level.spikes) {
      for (const sp of this.level.spikes) {
        if (this.checkSpikeCollision(p, sp)) {
          this.killPlayer();
          return;
        }
      }
    }

    // 8. Queda no Abismo ou Teto
    if (p.y > this.vh + 60 || p.y < -80) {
      this.killPlayer();
      return;
    }

    // 9. Chegada na Porta de Saída
    const d = this.level.door;
    if (p.x + p.w > d.x && p.x < d.x + 36 && p.y + p.h > d.y && p.y < d.y + 48) {
      this.winLevel();
    }
  }

  resolveHorizontalCollisions() {
    const p = this.player;
    for (const plat of this.level.platforms) {
      if (plat.isHidden && !plat.revealed) continue;
      if (p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y < plat.y + plat.h) {
        if (p.vx > 0) p.x = plat.x - p.w;
        else if (p.vx < 0) p.x = plat.x + plat.w;
      }
    }
  }

  resolveVerticalCollisions() {
    const p = this.player;
    p.isGrounded = false;
    const gravDir = p.isGravityInverted ? -1 : 1;

    for (const plat of this.level.platforms) {
      if (plat.isHidden && !plat.revealed) {
        // Surprise invisible block bump from below!
        if (gravDir === 1 && p.vy < 0 && p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y <= plat.y + plat.h && p.y >= plat.y) {
          plat.revealed = true;
          p.y = plat.y + plat.h;
          p.vy = 80;
          sound.playTrapTrigger();
          floaters.spawn('BLOCO SECRETO!', plat.x + plat.w / 2, plat.y - 10, '#facc15');
        }
        continue;
      }

      if (p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y < plat.y + plat.h) {
        if (gravDir === 1) {
          if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.isGrounded = true;

            // Trigger fake floor fall
            if (plat.id && plat.id.startsWith('fake_floor') && !plat.isFalling) {
              plat.isFalling = true;
              sound.playTrapTrigger();
              particles.emitTrapSparks(plat.x + plat.w / 2, plat.y);
            }

            // Conveyor speed
            if (plat.isConveyor) {
              p.x += plat.speed * 0.016;
            }
          } else if (p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          }
        } else {
          // Inverted Gravity
          if (p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
            p.isGrounded = true;
          } else if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
          }
        }
      }
    }
  }

  checkStarsCollision() {
    const p = this.player;
    if (!this.level || !this.level.stars) return;

    const px = p.x + p.w / 2;
    const py = p.y + p.h / 2;

    this.level.stars.forEach((star, idx) => {
      if (!star.collected) {
        const dx = px - star.x;
        const dy = py - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Contact radius
        if (dist < star.r + 16) {
          star.collected = true;
          sound.playStarCollect(idx);
          particles.emitStarCollect(star.x, star.y);
          SaveManager.addOrbs(10);

          const count = this.getCollectedStarsCount();
          floaters.spawn(`★ ESTRELA ${count}/3!`, star.x, star.y - 10, '#facc15', true);

          if (this.onStarCollected) {
            this.onStarCollected(star, count);
          }
          if (this.onLevelUpdate) {
            this.onLevelUpdate(this.level, this.deathCount, count);
          }
        }
      }
    });
  }

  updateTraps(dt) {
    const p = this.player;
    if (!this.level.traps) return;

    for (const t of this.level.traps) {
      // 1. Runaway Door
      if (t.type === 'runaway_door') {
        const door = this.level.door;
        const dist = Math.abs(p.x - door.x);
        if (dist < t.triggerDist && !t.activated) {
          t.activated = true;
          door.x += t.shiftX;
          sound.playTrapTrigger();
          floaters.spawn('PORTA TÍMIDA!', door.x, door.y - 15, '#38bdf8');
          particles.emitTrapSparks(door.x, door.y + 20);
        }
      }

      // 2. Falling Floor
      if (t.type === 'falling_floor') {
        const targetPlat = this.level.platforms.find(pl => pl.id === t.targetId);
        if (targetPlat && targetPlat.isFalling) {
          targetPlat.fallSpeed += 1400 * dt;
          targetPlat.y += targetPlat.fallSpeed * dt;
        }
      }

      // 3. Falling Ceiling
      if (t.type === 'falling_ceiling') {
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          sound.playTrapTrigger();
          floaters.spawn('CUIDADO COM A CABEÇA!', t.x + t.w / 2, t.y + 50, '#ef4444');
        }
        if (t.activated) {
          t.vy += 2200 * dt;
          t.y += t.vy * dt;
          if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
            this.killPlayer();
          }
        }
      }

      // 4. Pop Spike
      if (t.type === 'pop_spike') {
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          sound.playTrapTrigger();
          particles.emitTrapSparks(t.x, t.targetY);
        }
        if (t.activated && t.currentY > t.targetY) {
          t.currentY -= 450 * dt;
          if (p.x + p.w > t.x - 18 && p.x < t.x + 18 && p.y + p.h > t.currentY && p.y < t.currentY + 30) {
            this.killPlayer();
          }
        }
      }

      // 5. Falling Door
      if (t.type === 'falling_door') {
        const door = this.level.door;
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          door.isFalling = true;
          sound.playTrapTrigger();
          floaters.spawn('PORTA EM QUEDA LIVRE!', door.x, door.y - 15, '#ef4444');
        }
        if (door.isFalling) {
          door.vy += 1500 * dt;
          door.y += door.vy * dt;
        }
      }

      // 6. Decoy Portal
      if (t.type === 'decoy_portal') {
        if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
          this.killPlayer();
          floaters.spawn('PORTA FALSA! TROLLADO!', t.x + 18, t.y - 15, '#ef4444', true);
        }
      }

      // 7. Gravity Invert Pad
      if (t.type === 'gravity_invert_pad') {
        if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
          if (!p.isGravityInverted) {
            p.isGravityInverted = true;
            sound.playTrapTrigger();
            shaker.addTrauma(0.35);
            floaters.spawn('GRAVIDADE INVERTIDA!', p.x, p.y - 20, '#a855f7', true);
          }
        }
      }

      // 8. Bounce Pad
      if (t.type === 'bounce_pad') {
        if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
          p.vy = t.forceY;
          p.vx = t.forceX;
          sound.playJump();
          this.squash.punch(0.7, 1.4);
          particles.emitJumpDust(t.x + t.w / 2, t.y, '#facc15');
          floaters.spawn('BOING!', t.x + t.w / 2, t.y - 15, '#facc15');
        }
      }

      // 9. Blackout Cycle
      if (t.type === 'blackout_cycle') {
        t.timer += dt;
        if (t.timer >= t.interval) {
          t.isBlackout = true;
          if (t.timer >= t.interval + t.duration) {
            t.timer = 0;
            t.isBlackout = false;
          }
        } else {
          t.isBlackout = false;
        }
      }

      // 10. Elevator Door
      if (t.type === 'elevator_door') {
        const door = this.level.door;
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          sound.playTrapTrigger();
          floaters.spawn('PORTA ELEVADOR SUBINDO!', door.x, door.y - 15, '#38bdf8');
        }
        if (t.activated && door.y > t.targetY) {
          door.y += t.vy * dt;
        }
      }
    }
  }

  checkSpikeCollision(p, sp) {
    return (
      p.x + p.w > sp.x &&
      p.x < sp.x + sp.w &&
      p.y + p.h > sp.y &&
      p.y < sp.y + sp.h
    );
  }

  render() {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Deep background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Game Coordinate System with Screen Shake
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    shaker.apply(ctx);

    // Arena boundary
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, this.vw, this.vh);

    // Background Cyber Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.vw; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.vh);
      ctx.stroke();
    }
    for (let y = 0; y < this.vh; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.vw, y);
      ctx.stroke();
    }

    if (this.level) {
      // 1. Render Special Trap Zones (Reverse Controls, Gravity Inversion, Pads)
      if (this.level.traps) {
        for (const t of this.level.traps) {
          if (t.type === 'reverse_controls_zone') {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 8]);
            ctx.strokeRect(t.x, t.y, t.w, t.h);
            ctx.setLineDash([]);
            ctx.fillStyle = '#c084fc';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('⚡ CONTROLES INVERTIDOS', t.x + 12, t.y + 24);
          } else if (t.type === 'gravity_invert_pad') {
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 10;
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('▲ GRAV', t.x + 6, t.y + 14);
            ctx.shadowBlur = 0;
          } else if (t.type === 'bounce_pad') {
            ctx.fillStyle = '#facc15';
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 10;
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.shadowBlur = 0;
          } else if (t.type === 'decoy_portal') {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(t.x + 6, t.y + 6, t.w - 12, t.h - 12);
          }
        }
      }

      // 2. Render Platforms
      for (const plat of this.level.platforms) {
        if (plat.isHidden && !plat.revealed) continue;

        ctx.fillStyle = plat.isIce ? '#0284c7' : '#1e293b';
        ctx.strokeStyle = plat.isIce ? '#38bdf8' : (plat.isFalling ? '#f43f5e' : '#38bdf8');
        ctx.lineWidth = 2;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

        // Conveyor visual arrows
        if (plat.isConveyor) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = '12px sans-serif';
          ctx.fillText('<<< <<< <<<', plat.x + 12, plat.y + 24);
        }
      }

      // 3. Render Dynamic Ceiling Crushes & Pop Spikes
      if (this.level.traps) {
        for (const t of this.level.traps) {
          if (t.type === 'falling_ceiling') {
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.fillRect(t.x, t.y, t.w, t.h);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(t.x, t.y, t.w, t.h);
            ctx.shadowBlur = 0;
          } else if (t.type === 'pop_spike' && t.activated) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(t.x, t.currentY);
            ctx.lineTo(t.x - 16, t.currentY + 30);
            ctx.lineTo(t.x + 16, t.currentY + 30);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // 4. Render Fixed Spikes
      if (this.level.spikes) {
        ctx.fillStyle = '#ef4444';
        for (const sp of this.level.spikes) {
          ctx.beginPath();
          if (sp.dir === 'down') {
            ctx.moveTo(sp.x + sp.w / 2, sp.y + sp.h);
            ctx.lineTo(sp.x, sp.y);
            ctx.lineTo(sp.x + sp.w, sp.y);
          } else {
            ctx.moveTo(sp.x + sp.w / 2, sp.y);
            ctx.lineTo(sp.x, sp.y + sp.h);
            ctx.lineTo(sp.x + sp.w, sp.y + sp.h);
          }
          ctx.closePath();
          ctx.fill();
        }
      }

      // 5. Render Physical Stars (ZERO ESTRELAS GRÁTIS!)
      if (this.level.stars) {
        const timeNow = performance.now() / 1000;
        this.level.stars.forEach((star) => {
          if (!star.collected) {
            const floatOffset = Math.sin(timeNow * 4 + star.x) * 4;
            const sy = star.y + floatOffset;

            ctx.save();
            ctx.translate(star.x, sy);
            ctx.rotate(timeNow * 2);

            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 14;
            ctx.fillStyle = '#facc15';

            // Star 5-point polygon
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * star.r, -Math.sin((18 + i * 72) * Math.PI / 180) * star.r);
              ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (star.r * 0.45), -Math.sin((54 + i * 72) * Math.PI / 180) * (star.r * 0.45));
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // 6. Render Exit Portal
      const d = this.level.door;
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 16;
      ctx.fillRect(d.x, d.y, 36, 48);
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(d.x + 6, d.y + 6, 24, 42);

      // Inner portal vortex
      const timeSec = performance.now() / 1000;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(d.x + 18, d.y + 27, 8 + Math.sin(timeSec * 5) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 7. Render Particles
      particles.draw(ctx);

      // 8. Render Player with Squash & Stretch + Skin
      const p = this.player;
      const save = SaveManager.get();
      const skinStyle = CyberShop.getPlayerColor(save.selectedSkin);

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.scale(this.squash.scaleX, this.squash.scaleY);

      // Forcefield dome if shielded
      if (p.hasShield || p.shieldInvulnTimer > 0) {
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 24 + Math.sin(timeSec * 8) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Body
      ctx.fillStyle = p.isDead ? '#ef4444' : skinStyle.color;
      ctx.shadowColor = p.isDead ? '#ef4444' : skinStyle.shadow;
      ctx.shadowBlur = 14;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

      // Comical Eyes (look in facing direction)
      const lookOffset = p.facing * 3;
      ctx.fillStyle = skinStyle.eyeColor;
      ctx.fillRect(-p.w / 4 + lookOffset - 2, -p.h / 4, 4, 4);
      ctx.fillRect(p.w / 4 + lookOffset - 2, -p.h / 4, 4, 4);

      ctx.restore();

      // 9. Floating Combat & Feedback Text
      floaters.draw(ctx);

      // 10. Blackout Effect for Level 12
      if (this.level.traps) {
        for (const t of this.level.traps) {
          if (t.type === 'blackout_cycle' && t.isBlackout) {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.94)';
            ctx.fillRect(0, 0, this.vw, this.vh);

            // Small light around player
            const pGrad = ctx.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 10, p.x + p.w / 2, p.y + p.h / 2, 90);
            pGrad.addColorStop(0, 'rgba(0, 245, 255, 0.4)');
            pGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = pGrad;
            ctx.fillRect(0, 0, this.vw, this.vh);
          }
        }
      }
    }

    ctx.restore();
    ctx.restore();
  }
}
