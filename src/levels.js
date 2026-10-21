/**
 * @fileoverview 15 Subversive / Troll Levels for Aether Paradox: The False Horizon
 * Inspired by Level Devil, Cat Mario, and subversive platforming physics.
 * Every level features:
 * - 3 PHYSICAL STARS that require actual hitbox contact to collect (ZERO free stars!).
 * - Dynamic psychological traps (runaway doors, fake floors, pop spikes, gravity inverters, etc.)
 * - Fast-paced comedy and rapid retries (< 40ms).
 */

export const LEVELS = [
  // ── SECTOR 1: QUANTUM GLITCHES (Levels 1 to 5) ──
  {
    id: 1,
    nameKey: 'lvl1_name',
    descKey: 'lvl1_desc',
    name: 'Level 1: The Shy Portal',
    parTime: 8.0,
    spawn: { x: 70, y: 440 },
    door: { x: 820, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 280, y: 420, r: 12, collected: false },
      { id: 's2', x: 540, y: 360, r: 12, collected: false },
      { id: 's3', x: 800, y: 310, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 240, h: 40 },
      { x: 360, y: 480, w: 240, h: 40 },
      { x: 680, y: 480, w: 240, h: 40 },
      { x: 500, y: 390, w: 90, h: 20 }
    ],
    spikes: [
      { x: 300, y: 510, w: 40, h: 30, dir: 'up' },
      { x: 620, y: 510, w: 40, h: 30, dir: 'up' }
    ],
    traps: [
      { type: 'runaway_door', triggerDist: 110, shiftX: 130, activated: false }
    ]
  },
  {
    id: 2,
    nameKey: 'lvl2_name',
    descKey: 'lvl2_desc',
    name: 'Level 2: Polystyrene Ground',
    parTime: 9.0,
    spawn: { x: 70, y: 440 },
    door: { x: 850, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 200, y: 420, r: 12, collected: false },
      { id: 's2', x: 440, y: 380, r: 12, collected: false },
      { id: 's3', x: 720, y: 330, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 200, h: 40 },
      { x: 290, y: 480, w: 200, h: 40, isFalling: false, fallSpeed: 0, id: 'fake_floor_2' },
      { x: 550, y: 480, w: 200, h: 40 },
      { x: 800, y: 480, w: 140, h: 40 },
      { x: 700, y: 370, w: 80, h: 20 }
    ],
    spikes: [
      { x: 250, y: 515, w: 30, h: 30, dir: 'up' },
      { x: 505, y: 515, w: 30, h: 30, dir: 'up' },
      { x: 765, y: 515, w: 30, h: 30, dir: 'up' }
    ],
    traps: [
      { type: 'falling_floor', targetId: 'fake_floor_2', delay: 0.05, activated: false }
    ]
  },
  {
    id: 3,
    nameKey: 'lvl3_name',
    descKey: 'lvl3_desc',
    name: 'Level 3: The Falling Ceiling',
    parTime: 10.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 260, y: 430, r: 12, collected: false },
      { id: 's2', x: 540, y: 430, r: 12, collected: false },
      { id: 's3', x: 760, y: 360, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 900, h: 40 },
      { x: 720, y: 400, w: 90, h: 20 }
    ],
    spikes: [
      { x: 380, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 412, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 670, y: 480, w: 32, h: 32, dir: 'up' }
    ],
    traps: [
      {
        type: 'falling_ceiling',
        x: 480,
        y: 100,
        w: 150,
        h: 40,
        triggerX: 430,
        vy: 0,
        activated: false
      }
    ]
  },
  {
    id: 4,
    nameKey: 'lvl4_name',
    descKey: 'lvl4_desc',
    name: 'Level 4: Spike Ambush',
    parTime: 9.5,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 230, y: 420, r: 12, collected: false },
      { id: 's2', x: 510, y: 370, r: 12, collected: false },
      { id: 's3', x: 760, y: 420, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 280, h: 40 },
      { x: 380, y: 480, w: 260, h: 40 },
      { x: 700, y: 480, w: 250, h: 40 },
      { x: 470, y: 410, w: 80, h: 20 }
    ],
    spikes: [
      { x: 335, y: 515, w: 35, h: 30, dir: 'up' }
    ],
    traps: [
      {
        type: 'pop_spike',
        x: 520,
        y: 480,
        hiddenY: 510,
        targetY: 450,
        currentY: 510,
        triggerX: 470,
        activated: false
      }
    ]
  },
  {
    id: 5,
    nameKey: 'lvl5_name',
    descKey: 'lvl5_desc',
    name: 'Level 5: Neural Inversion',
    parTime: 11.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 220, y: 430, r: 12, collected: false },
      { id: 's2', x: 480, y: 300, r: 12, collected: false },
      { id: 's3', x: 780, y: 430, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 900, h: 40 },
      { x: 420, y: 350, w: 160, h: 25 }
    ],
    spikes: [
      { x: 340, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 620, y: 480, w: 32, h: 32, dir: 'up' }
    ],
    traps: [
      {
        type: 'reverse_controls_zone',
        x: 350,
        y: 180,
        w: 300,
        h: 300
      }
    ]
  },

  // ── SECTOR 2: LYING GRAVITY (Levels 6 to 10) ──
  {
    id: 6,
    nameKey: 'lvl6_name',
    descKey: 'lvl6_desc',
    name: 'Level 6: Leap of Faith',
    parTime: 10.5,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 240, y: 420, r: 12, collected: false },
      { id: 's2', x: 480, y: 350, r: 12, collected: false },
      { id: 's3', x: 780, y: 280, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 240, h: 40 },
      { x: 340, y: 480, w: 230, h: 40 },
      { x: 670, y: 480, w: 240, h: 40 },
      { x: 450, y: 390, w: 90, h: 20 },
      { x: 740, y: 330, w: 80, h: 20, isHidden: true, revealed: false } // Hidden platform
    ],
    spikes: [
      { x: 295, y: 515, w: 35, h: 30, dir: 'up' },
      { x: 585, y: 515, w: 35, h: 30, dir: 'up' }
    ],
    traps: [
      { type: 'falling_door', triggerX: 740, activated: false }
    ]
  },
  {
    id: 7,
    nameKey: 'lvl7_name',
    descKey: 'lvl7_desc',
    name: 'Level 7: Inverse Ceiling Run',
    parTime: 12.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 150, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 280, y: 430, r: 12, collected: false },
      { id: 's2', x: 500, y: 190, r: 12, collected: false },
      { id: 's3', x: 780, y: 150, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 300, h: 40 },
      { x: 400, y: 480, w: 200, h: 40 },
      { x: 200, y: 160, w: 700, h: 30 } // Ceiling highway
    ],
    spikes: [
      { x: 450, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 650, y: 190, w: 32, h: 32, dir: 'down' }
    ],
    traps: [
      {
        type: 'gravity_invert_pad',
        x: 480,
        y: 450,
        w: 50,
        h: 20,
        targetGravity: -1400
      }
    ]
  },
  {
    id: 8,
    nameKey: 'lvl8_name',
    descKey: 'lvl8_desc',
    name: 'Level 8: Deceptive Trampoline',
    parTime: 9.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 260, y: 420, r: 12, collected: false },
      { id: 's2', x: 490, y: 220, r: 12, collected: false },
      { id: 's3', x: 750, y: 420, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 260, h: 40 },
      { x: 420, y: 480, w: 160, h: 40 },
      { x: 680, y: 480, w: 250, h: 40 }
    ],
    spikes: [
      { x: 310, y: 515, w: 40, h: 30, dir: 'up' },
      { x: 470, y: 260, w: 40, h: 30, dir: 'down' } // Spike on ceiling right above bounce
    ],
    traps: [
      {
        type: 'bounce_pad',
        x: 460,
        y: 460,
        w: 60,
        h: 15,
        forceX: -180, // Boings backwards if careless!
        forceY: -720
      }
    ]
  },
  {
    id: 9,
    nameKey: 'lvl9_name',
    descKey: 'lvl9_desc',
    name: 'Level 9: The Decoy Portal',
    parTime: 11.5,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 240, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 250, y: 430, r: 12, collected: false },
      { id: 's2', x: 600, y: 420, r: 12, collected: false },
      { id: 's3', x: 860, y: 170, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 350, h: 40 },
      { x: 480, y: 480, w: 400, h: 40 },
      { x: 760, y: 310, w: 160, h: 25 }
    ],
    spikes: [
      { x: 400, y: 515, w: 40, h: 30, dir: 'up' }
    ],
    traps: [
      {
        type: 'decoy_portal',
        x: 820,
        y: 420,
        w: 36,
        h: 48
      }
    ]
  },
  {
    id: 10,
    nameKey: 'lvl10_name',
    descKey: 'lvl10_desc',
    name: 'Level 10: Conveyor Chaos',
    parTime: 13.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 220, y: 420, r: 12, collected: false },
      { id: 's2', x: 520, y: 350, r: 12, collected: false },
      { id: 's3', x: 760, y: 420, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 220, h: 40 },
      { x: 310, y: 480, w: 320, h: 40, isConveyor: true, speed: -180 }, // Moves left!
      { x: 690, y: 480, w: 240, h: 40 }
    ],
    spikes: [
      { x: 270, y: 515, w: 35, h: 30, dir: 'up' },
      { x: 640, y: 515, w: 35, h: 30, dir: 'up' }
    ],
    traps: [
      {
        type: 'pop_spike',
        x: 480,
        y: 480,
        hiddenY: 510,
        targetY: 450,
        currentY: 510,
        triggerX: 430,
        activated: false
      }
    ]
  },

  // ── SECTOR 3: PARADOX SINGULARITY (Levels 11 to 15) ──
  {
    id: 11,
    nameKey: 'lvl11_name',
    descKey: 'lvl11_desc',
    name: 'Level 11: The Paradox Echo',
    parTime: 12.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 250, y: 420, r: 12, collected: false },
      { id: 's2', x: 500, y: 360, r: 12, collected: false },
      { id: 's3', x: 780, y: 350, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 300, h: 40 },
      { x: 400, y: 480, w: 240, h: 40 },
      { x: 700, y: 480, w: 240, h: 40 },
      { x: 460, y: 400, w: 80, h: 20 }
    ],
    spikes: [
      { x: 350, y: 515, w: 35, h: 30, dir: 'up' },
      { x: 650, y: 515, w: 35, h: 30, dir: 'up' }
    ],
    traps: [
      {
        type: 'falling_ceiling',
        x: 440,
        y: 120,
        w: 120,
        h: 30,
        triggerX: 410,
        vy: 0,
        activated: false
      }
    ]
  },
  {
    id: 12,
    nameKey: 'lvl12_name',
    descKey: 'lvl12_desc',
    name: 'Level 12: Blackout Simulation',
    parTime: 14.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 260, y: 420, r: 12, collected: false },
      { id: 's2', x: 520, y: 340, r: 12, collected: false },
      { id: 's3', x: 780, y: 420, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 220, h: 40 },
      { x: 330, y: 480, w: 180, h: 40 },
      { x: 570, y: 480, w: 180, h: 40 },
      { x: 800, y: 480, w: 150, h: 40 }
    ],
    spikes: [
      { x: 275, y: 515, w: 40, h: 30, dir: 'up' },
      { x: 520, y: 515, w: 40, h: 30, dir: 'up' },
      { x: 760, y: 515, w: 30, h: 30, dir: 'up' }
    ],
    traps: [
      {
        type: 'blackout_cycle',
        interval: 3.5,
        duration: 1.2,
        timer: 0,
        isBlackout: false
      }
    ]
  },
  {
    id: 13,
    nameKey: 'lvl13_name',
    descKey: 'lvl13_desc',
    name: 'Level 13: Elevator Portal',
    parTime: 12.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0, isElevator: true },
    stars: [
      { id: 's1', x: 280, y: 420, r: 12, collected: false },
      { id: 's2', x: 540, y: 320, r: 12, collected: false },
      { id: 's3', x: 860, y: 220, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 300, h: 40 },
      { x: 400, y: 480, w: 260, h: 40 },
      { x: 720, y: 480, w: 220, h: 40 },
      { x: 780, y: 350, w: 100, h: 20 },
      { x: 780, y: 240, w: 100, h: 20 }
    ],
    spikes: [
      { x: 350, y: 515, w: 40, h: 30, dir: 'up' },
      { x: 670, y: 515, w: 40, h: 30, dir: 'up' }
    ],
    traps: [
      {
        type: 'elevator_door',
        triggerX: 450,
        vy: -90,
        targetY: 180,
        activated: false
      }
    ]
  },
  {
    id: 14,
    nameKey: 'lvl14_name',
    descKey: 'lvl14_desc',
    name: 'Level 14: Zero-Friction Maze',
    parTime: 13.5,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 240, y: 420, r: 12, collected: false },
      { id: 's2', x: 530, y: 340, r: 12, collected: false },
      { id: 's3', x: 780, y: 420, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 900, h: 40, isIce: true }, // Slippery ground!
      { x: 470, y: 380, w: 110, h: 20 }
    ],
    spikes: [
      { x: 320, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 620, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 652, y: 480, w: 32, h: 32, dir: 'up' }
    ],
    traps: [
      {
        type: 'reverse_controls_zone',
        x: 420,
        y: 200,
        w: 220,
        h: 280
      }
    ]
  },
  {
    id: 15,
    nameKey: 'lvl15_name',
    descKey: 'lvl15_desc',
    name: 'Level 15: The False Horizon',
    parTime: 16.0,
    spawn: { x: 70, y: 440 },
    door: { x: 860, y: 420, isFalling: false, vy: 0 },
    stars: [
      { id: 's1', x: 260, y: 420, r: 12, collected: false },
      { id: 's2', x: 520, y: 280, r: 12, collected: false },
      { id: 's3', x: 780, y: 240, r: 12, collected: false }
    ],
    platforms: [
      { x: 40, y: 480, w: 240, h: 40 },
      { x: 330, y: 480, w: 240, h: 40, isFalling: false, fallSpeed: 0, id: 'final_fake' },
      { x: 650, y: 480, w: 270, h: 40 },
      { x: 460, y: 350, w: 120, h: 25 },
      { x: 720, y: 300, w: 100, h: 20 }
    ],
    spikes: [
      { x: 290, y: 515, w: 35, h: 30, dir: 'up' },
      { x: 580, y: 515, w: 35, h: 30, dir: 'up' },
      { x: 600, y: 200, w: 32, h: 32, dir: 'down' }
    ],
    traps: [
      { type: 'runaway_door', triggerDist: 100, shiftX: 80, activated: false },
      { type: 'falling_floor', targetId: 'final_fake', delay: 0.06, activated: false },
      {
        type: 'pop_spike',
        x: 740,
        y: 480,
        hiddenY: 510,
        targetY: 450,
        currentY: 510,
        triggerX: 690,
        activated: false
      }
    ]
  }
];
