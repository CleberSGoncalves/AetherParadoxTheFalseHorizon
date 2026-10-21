/**
 * @fileoverview Internationalization (i18n) for Aether Paradox: The False Horizon
 * Default language: English (EN) - CrazyGames Publishing Requirement.
 * Auto-detects Portuguese (PT-BR) for Brazilian/Portuguese players, with manual toggle.
 */

class I18nManager {
  constructor() {
    this.locale = 'en';
    this.detectLocale();
  }

  detectLocale() {
    try {
      const saved = localStorage.getItem('aether_paradox_locale');
      if (saved && (saved === 'en' || saved === 'pt')) {
        this.locale = saved;
        return;
      }
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('pt')) {
        this.locale = 'pt';
      } else {
        this.locale = 'en';
      }
    } catch (_) {
      this.locale = 'en';
    }
  }

  setLocale(loc) {
    if (loc === 'en' || loc === 'pt') {
      this.locale = loc;
      try {
        localStorage.setItem('aether_paradox_locale', loc);
      } catch (_) {}
    }
  }

  toggleLocale() {
    this.setLocale(this.locale === 'en' ? 'pt' : 'en');
    return this.locale;
  }

  t(key, params = {}) {
    const dict = TRANSLATIONS[this.locale] || TRANSLATIONS.en;
    let str = dict[key] || TRANSLATIONS.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return str;
  }
}

const TRANSLATIONS = {
  en: {
    // Game Title & Commercial
    gameTitle: 'Aether Paradox: The False Horizon',
    subtitle: 'Cybernetic Subversive Platformer',
    skipStory: 'Skip Story ➔',
    nextAct: 'Continue ➔',
    enterGame: 'ENTER SIMULATION ➔',

    // Cinematic Lore Acts (3-Act Structure)
    loreAct1Title: 'Act I: The Corrupted Horizon',
    loreAct1Text: 'Inside the deep neural mainframe of the Aether Network, gravity is no longer a constant: it is a simulated deception designed to trap cybernetic operators.',
    loreAct2Title: 'Act II: Quantum Operator',
    loreAct2Text: 'Every test corridor rewrites physical laws mid-jump. Platforms crumble, portals mock your advance, and hidden spikes trigger with deceptive timing.',
    loreAct3Title: 'Act III: The False Horizon',
    loreAct3Text: 'Gather physical Quantum Star orbs, outwit psychological traps, and breach the Singularity Core before the simulation collapses your consciousness!',

    // HUD Elements
    level: 'LEVEL',
    sector: 'SECTOR',
    deaths: 'DEATHS',
    time: 'TIME',
    stars: 'STARS',
    fastRetryHint: '[R] Fast Retry',
    desktopControls: '⚡ [A/D] MOVE • [W/SPACE] JUMP • [R] INSTANT RETRY',
    mobileControlsHint: 'TAP ARROWS TO MOVE • TAP BOING TO JUMP',
    completeLevelBtn: '✅ COMPLETE LEVEL (★) ➔',
    paused: 'PAUSED',
    resume: 'RESUME',
    restart: 'RESTART',
    levelsMenu: '☰ LEVELS',
    soundOn: '🔊 SOUND: ON',
    soundOff: '🔇 SOUND: OFF',

    // Objectives / Guidance
    objectiveBase: 'Collect at least 1 ★ to unlock exit & complete level',
    objectiveFull: 'Collect all 3 ★ and reach the Exit Portal for Maximum Score!',
    star1Unlocked: '★ Level Cleared! You can finish now or hunt remaining stars!',
    star3Master: '★★★ Maximum Quantum Mastery!',

    // Modals
    victoryTitle: 'LEVEL CONQUERED!',
    victorySubtitle: 'Quantum corridor stabilized.',
    defeatTitle: 'OPERATOR DESYNCHRONIZED',
    defeatSubtitle: 'Physical anomaly triggered.',
    reviveShieldBtn: 'REVIVE WITH SHIELD [📺 AD]',
    doubleOrbsBtn: 'DOUBLE ORBS (2X) [📺 AD]',
    nextLevelBtn: 'NEXT LEVEL ➔',
    retryLevelBtn: 'RETRY LEVEL',
    levelSelectTitle: 'QUANTUM CORRIDORS (LEVEL SELECT)',
    lockedLevel: 'LOCKED',
    completedLevel: '✓ COMPLETED',
    pendingLevel: 'PENDING',

    // Meta-Game Modals
    shopBtn: 'CYBER SHOP',
    shopTitle: 'OPERATOR UPGRADES & SKINS',
    skinsTab: 'SKINS',
    upgradesTab: 'TECH UPGRADES',
    orbsLabel: 'QUANTUM ORBS',
    equipped: 'EQUIPPED',
    equip: 'EQUIP',
    unlockFor: 'UNLOCK',
    owned: 'OWNED',
    cost: 'Cost',

    questsBtn: 'DIRECTIVES',
    questsTitle: 'DAILY & WEEKLY DIRECTIVES',
    claimReward: 'CLAIM',
    doubleReward: 'DOUBLE 2X [📺 AD]',
    claimed: 'CLAIMED',

    dailyBtn: 'DAILY SUPPLY',
    dailyTitle: '7-DAY PROTOCOL SUPPLY',
    claimDaily: 'CLAIM PROTOCOL',
    day: 'DAY',

    spinBtn: 'LUCKY WHEEL',
    spinTitle: 'QUANTUM SINGULARITY WHEEL',
    freeSpin: 'FREE SPIN (12h)',
    spinAd: 'EXTRA SPIN [📺 AD]',
    spinning: 'SPINNING...',
    youWon: 'REWARD UNLOCKED',

    // Skins Names
    skin_default: 'Cyan Cyber (Default)',
    skin_neon_pink: 'Neon Glitch (Magenta)',
    skin_golden: 'Aether Gold (Champion)',
    skin_shadow: 'Void Phantom (Stealth)',
    skin_emerald: 'Matrix Core (Emerald)',

    // Upgrade Names
    upg_shield: 'Emergency Shield (1 free hit)',
    upg_magnet: 'Star Magnetism (+40% range)',
    upg_spring: 'Quantum Springs (+8% jump juice)',

    // Level Names & Jokes
    lvl1_name: 'Level 1: The Shy Portal',
    lvl1_desc: 'The exit gets stage fright when you approach it.',
    lvl2_name: 'Level 2: Polystyrene Ground',
    lvl2_desc: 'It looks solid until you trust your weight to it.',
    lvl3_name: 'Level 3: The Falling Ceiling',
    lvl3_desc: 'Look up! Gravity doesn\'t always pull down.',
    lvl4_name: 'Level 4: Spike Ambush',
    lvl4_desc: 'What lies beneath waits for your steps.',
    lvl5_name: 'Level 5: Neural Inversion',
    lvl5_desc: 'Left is right, right is left. Don\'t panic.',
    lvl6_name: 'Level 6: Leap of Faith',
    lvl6_desc: 'The portal drops, but invisible bridges believe in you.',
    lvl7_name: 'Level 7: Inverse Ceiling Run',
    lvl7_desc: 'Quantum fields invert the ceiling into a highway.',
    lvl8_name: 'Level 8: Deceptive Trampoline',
    lvl8_desc: 'Bounce pads that spring you into trouble.',
    lvl9_name: 'Level 9: The Decoy Portal',
    lvl9_desc: 'One portal is freedom; the other is a prank.',
    lvl10_name: 'Level 10: Conveyor Chaos',
    lvl10_desc: 'The ground moves faster than your confidence.',
    lvl11_name: 'Level 11: The Paradox Echo',
    lvl11_desc: 'Your past actions become your present hazard.',
    lvl12_name: 'Level 12: Blackout Simulation',
    lvl12_desc: 'Memorize the leap before the lights flicker out.',
    lvl13_name: 'Level 13: Elevator Portal',
    lvl13_desc: 'Catch the elevator before it reaches orbit.',
    lvl14_name: 'Level 14: Zero-Friction Maze',
    lvl14_desc: 'Ice physics in cyberspace. Good luck stopping!',
    lvl15_name: 'Level 15: The False Horizon',
    lvl15_desc: 'The master singularity. Overcome all paradoxes!'
  },
  pt: {
    // Game Title & Commercial
    gameTitle: 'Aether Paradox: The False Horizon',
    subtitle: 'Plataforma Cibernético Subversivo',
    skipStory: 'Pular História ➔',
    nextAct: 'Continuar ➔',
    enterGame: 'ENTRAR NA SIMULAÇÃO ➔',

    // Cinematic Lore Acts (3-Act Structure)
    loreAct1Title: 'Ato I: O Horizonte Corrompido',
    loreAct1Text: 'Dentro da rede neural profunda de Aether, a gravidade mente: é um engano simulado projetado para desafiar operadores cibernéticos.',
    loreAct2Title: 'Ato II: Operador Quântico',
    loreAct2Text: 'Cada corredor de testes reescreve a física a cada salto. O chão esfarela, portas zombam do seu avanço e espinhos brotam no momento exato.',
    loreAct3Title: 'Ato III: O Falso Horizonte',
    loreAct3Text: 'Colete Orbes Estelares físicos, supere armadilhas psicológicas e alcance o Núcleo da Singularidade antes do colapso da realidade!',

    // HUD Elements
    level: 'NÍVEL',
    sector: 'SETOR',
    deaths: 'MORTES',
    time: 'TEMPO',
    stars: 'ESTRELAS',
    fastRetryHint: '[R] Reinício Rápido',
    desktopControls: '⚡ [A/D] MOVER • [W/ESPAÇO] PULAR • [R] REINICIAR',
    mobileControlsHint: 'TOQUE NAS SETAS PARA MOVER • TOQUE NO PULO PARA SALTAR',
    completeLevelBtn: '✅ CONCLUIR FASE (★) ➔',
    paused: 'PAUSADO',
    resume: 'CONTINUAR',
    restart: 'REINICIAR',
    levelsMenu: '☰ FASES',
    soundOn: '🔊 SOM: LIGADO',
    soundOff: '🔇 SOM: MUDO',

    // Objectives / Guidance
    objectiveBase: 'Colete ao menos 1 ★ para liberar a saída e concluir a fase',
    objectiveFull: 'Colete todas as 3 ★ e alcance o Portal para Pontuação Máxima!',
    star1Unlocked: '★ Fase Aprovada! Conclua agora ou busque as estrelas restantes!',
    star3Master: '★★★ Maestria Quântica Máxima!',

    // Modals
    victoryTitle: 'NÍVEL CONCLUÍDO!',
    victorySubtitle: 'Corredor quântico estabilizado.',
    defeatTitle: 'OPERADOR DESSINCRONIZADO',
    defeatSubtitle: 'Anomalia física acionada.',
    reviveShieldBtn: 'REVIVER COM ESCUDO [📺 AD]',
    doubleOrbsBtn: 'DOBRAR ORBES (2X) [📺 AD]',
    nextLevelBtn: 'PRÓXIMO NÍVEL ➔',
    retryLevelBtn: 'TENTAR NOVAMENTE',
    levelSelectTitle: 'CORREDORES QUÂNTICOS (SELEÇÃO DE FASES)',
    lockedLevel: 'BLOQUEADO',
    completedLevel: '✓ CONCLUÍDO',
    pendingLevel: 'PENDENTE',

    // Meta-Game Modals
    shopBtn: 'LOJA CYBER',
    shopTitle: 'UPGRADES & SKINS DO OPERADOR',
    skinsTab: 'SKINS',
    upgradesTab: 'UPGRADES TÉCNICOS',
    orbsLabel: 'ORBES QUÂNTICOS',
    equipped: 'EQUIPADO',
    equip: 'EQUIPAR',
    unlockFor: 'DESBLOQUEAR',
    owned: 'ADQUIRIDO',
    cost: 'Custo',

    questsBtn: 'DIRETRIZES',
    questsTitle: 'MISSÕES DIÁRIAS & SEMANAIS',
    claimReward: 'COLETAR',
    doubleReward: 'DOBRAR 2X [📺 AD]',
    claimed: 'COLETADO',

    dailyBtn: 'SUPRIMENTO',
    dailyTitle: 'PROTOCOLO DE 7 DIAS',
    claimDaily: 'RECEBER SUPRIMENTO',
    day: 'DIA',

    spinBtn: 'ROLETA',
    spinTitle: 'ROLETA DA SINGULARIDADE',
    freeSpin: 'GIRO GRÁTIS (12h)',
    spinAd: 'GIRO EXTRA [📺 AD]',
    spinning: 'GIRANDO...',
    youWon: 'RECOMPENSA LIBERADA',

    // Skins Names
    skin_default: 'Ciano Cyber (Padrão)',
    skin_neon_pink: 'Neon Glitch (Magenta)',
    skin_golden: 'Aether Ouro (Campeão)',
    skin_shadow: 'Fantasma do Vazio (Furtivo)',
    skin_emerald: 'Núcleo Matrix (Esmeralda)',

    // Upgrade Names
    upg_shield: 'Escudo de Emergência (1 hit grátis)',
    upg_magnet: 'Magnetismo Estelar (+40% alcance)',
    upg_spring: 'Molas Quânticas (+8% força de pulo)',

    // Level Names & Jokes
    lvl1_name: 'Nível 1: O Portal Tímido',
    lvl1_desc: 'A saída tem medo de palco quando você se aproxima.',
    lvl2_name: 'Nível 2: O Piso de Isopor',
    lvl2_desc: 'Parece sólido até você colocar todo seu peso.',
    lvl3_name: 'Nível 3: O Teto Traiçoeiro',
    lvl3_desc: 'Olhe para cima! A gravidade nem sempre puxa para baixo.',
    lvl4_name: 'Nível 4: Emboscada de Espinhos',
    lvl4_desc: 'O que jaz oculto espera apenas seus passos.',
    lvl5_name: 'Nível 5: Inversão Neural',
    lvl5_desc: 'Esquerda é direita, direita é esquerda. Não entre em pânico.',
    lvl6_name: 'Nível 6: O Grande Salto de Fé',
    lvl6_desc: 'A saída cai no buraco, mas pontes invisíveis acreditam em você.',
    lvl7_name: 'Nível 7: Corrida no Teto',
    lvl7_desc: 'Campos quânticos transformam o teto em uma rodovia.',
    lvl8_name: 'Level 8: Trampolim Trapaceiro',
    lvl8_desc: 'Molas que te arremessam direto para a confusão.',
    lvl9_name: 'Nível 9: Portas Falsas',
    lvl9_desc: 'Uma porta é a liberdade; a outra é uma pegadinha.',
    lvl10_name: 'Nível 10: Caos na Esteira',
    lvl10_desc: 'O chão se move mais rápido que a sua confiança.',
    lvl11_name: 'Nível 11: O Eco Paradoxal',
    lvl11_desc: 'Suas ações passadas viram seu perigo presente.',
    lvl12_name: 'Nível 12: Simulação no Escuro',
    lvl12_desc: 'Decore o caminho antes das luzes piscarem.',
    lvl13_name: 'Nível 13: Portal Elevador',
    lvl13_desc: 'Alcance o elevador antes que ele suma no teto.',
    lvl14_name: 'Nível 14: Labirinto Deslizante',
    lvl14_desc: 'Física de gelo no ciberespaço. Boa sorte para frear!',
    lvl15_name: 'Nível 15: O Falso Horizonte',
    lvl15_desc: 'A singularidade mestre. Supere todos os paradoxos!'
  }
};

export const i18n = new I18nManager();
