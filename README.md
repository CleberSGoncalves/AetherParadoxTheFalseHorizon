# Aether Paradox: The False Horizon

[![CrazyGames](https://img.shields.io/badge/Platform-CrazyGames%20SDK%20v3-00f5ff)](https://crazygames.com)
[![Engine](https://img.shields.io/badge/Engine-Godot%204.7.2%20%7C%20HTML5%20Vite-22c55e)](https://godotengine.org)
[![Status](https://img.shields.io/badge/Homologação-100%25%20Completa-facc15)](https://aetherparadoxthefalsehorizon.kinomuse.com.br)

> 🎮 **Título Comercial**: *Aether Paradox: The False Horizon*  
> **Estilo / Gênero**: Troll / Subversive Platformer (Level Devil Evolution)  
> **Selo Oficial**: FluidCleb Interactive  
> **URL Pública de Entrega**: [https://aetherparadoxthefalsehorizon.kinomuse.com.br](https://aetherparadoxthefalsehorizon.kinomuse.com.br)  
> **Portal Oficial**: [https://kinomuse.com.br](https://kinomuse.com.br)

---

## 🌌 1. Lore & Ambientação

Em um futuro simulado onde a própria gravidade mente, um operador cibernético deve cruzar corredores quânticos instáveis onde as leis da física mudam a cada salto.
- **Ato I: O Horizonte Corrompido** — A rede neural profunda de Aether entrou em colapso paradoxal. A gravidade não é mais constante: é uma ilusão cibernética.
- **Ato II: Operador Quântico** — Cada setor de testes desafia os reflexos do operador. O piso evapora, tetos desabam e portas zombam do seu avanço.
- **Ato III: O Falso Horizonte** — Colete Orbes Estelares físicos, supere armadilhas psicológicas e alcance o Núcleo da Singularidade antes do colapso da realidade.

---

## 🕹️ 2. Core Gameplay Loop & Controles

- **Loop Viciante**: Iniciar o nível ➔ Tentar saltar sobre um obstáculo aparentemente seguro que subitamente muda de comportamento ➔ Morte cômica instantânea ➔ Rir do engano ➔ **Fast Retry (< 40ms)** ➔ Coletar as 3 Estrelas Físicas ➔ Conquistar a vitória!
- **Controles Desktop**:
  - `[A]` / `[D]` ou `[Setas Esquerda / Direita]`: Mover horizontalmente
  - `[W]` / `[Seta Cima]` / `[Espaço]`: Pulo elástico com Jump Buffer & Coyote Time
  - `[R]`: Reinício rápido instantâneo (< 40ms)
- **Controles Mobile**:
  - D-Pad virtual flutuante transparente nos cantos inferiores (botões `◀` e `▶` à esquerda, botão de pulo `▲ BOING` à direita).
  - Ocultados automaticamente em desktops com mouse/teclado.

---

## ⚙️ 3. Módulos & Features Componentes

- **Canvas Edge-to-Edge 100% Fullscreen Responsivo**: Renderizado em `100vw` e `100dvh` com `ResizeObserver` e `window.devicePixelRatio` para nitidez máxima sem barras de corte.
- **HUD Flutuante Sobreposto (`#in-game-hud`)**: Camada translúcida flutuante (`pointer-events: none`) com botões interativos (`pointer-events: auto`).
- **Sintetizador Web Audio API Procedural Embutido**: Sons 100% sintetizados via código (jump, land, pop cômico, gatilhos de armadilha, arpeggios pentatônicos de estrelas, fanfarras e BGM cyber ambient procedural). Zero arquivos 404.
- **Game Juice & Feel Engine**:
  - Câmera com Trauma² Screen Shake exponencial
  - Micro-freezes táteis de Hit-Stop (40ms - 70ms)
  - Squash & Stretch elástico Spring-Damper
  - Partículas procedurais ricas (detritos com gravidade, faíscas incandescentes, vortex de portais, confetes de vitória)
  - Textos flutuantes de feedback dinâmico
- **Física Determinística com Delta Time**: Timestep determinístico garantindo comportamento idêntico em telas de 60Hz, 120Hz, 144Hz e 165Hz.
- **Coyote Time (120ms)** e **Jump Buffer (120ms)** para responsividade cirúrgica.
- **Sistema de 1★, 2★ e 3★ Físicos (Zero Estrelas Grátis)**: Estrelas são orbes físicos no cenário com colisão da hitbox. Atingir ★ 1 Estrela desbloqueia o botão pulsante `"✅ CONCLUIR FASE (★) ➔"` na HUD.
- **15 Fases Inéditas e Subversivas**:
  - Setor 1: Distorções Quânticas (Fases 1 a 5: Portas tímidas, piso de isopor, teto traiçoeiro, emboscada de espinhos, inversão neural)
  - Setor 2: Gravidade Mentirosa (Fases 6 a 10: Salto de fé, corrida no teto, trampolim enganador, portas falsas, esteira rápida)
  - Setor 3: Paradoxo Temporal (Fases 11 a 15: Eco paradoxal, simulação no escuro, elevador de fuga, labirinto deslizante, o falso horizonte)
- **Meta-Game & Economia**:
  - Loja de Skins Cibernéticas e Upgrades Passivos (Escudo de Emergência, Magnetismo Estelar, Molas Quânticas)
  - Protocolo de 7 Dias (Daily Login Supply com recompensas progressivas)
  - Roleta da Singularidade (Lucky Spin a cada 12h ou via Rewarded Ad)
  - Missões e Diretrizes Diárias/Semanais com botão de dobrar recompensa
  - SaveManager versionado com persistência local segura
- **Intro FluidCleb Interactive (0.0s a 2.8s) & Lore Interativa (2.8s+)**:
  - Orbes cósmicos (#00f5ff, #38bdf8), fusão central, gota metálica (#94a3b8) e texto neon ciano 'FLUIDCLEB INTERACTIVE'.
  - Botão 'Skip Story / Pular História ➔' permitindo entrada na gameplay em no máximo 1 clique (Land in Gameplay).
- **Máquina de Estados Anti-Softlock (ModalController)**: Resolução completa do problema "Trava e Não Volta". Fechar seletor ou menus com 'X' reabre a tela de vitória anterior se a fase foi concluída, e reset incondicional de flags em `loadLevel()`.
- **Blindagem CrazyGames SDK v3**:
  - Watchdog de 2.5s garantindo que o jogo nunca congele se o anúncio demorar a responder.
  - Cláusula `finally` para desmutar áudio e despausar física.
  - Rewarded Ad 1: Reviver com Escudo Protetor (3.5s de invulnerabilidade).
  - Rewarded Ad 2: Dobrar Orbes coletados na vitória.
  - Midgame Ads com cooldown de 3 minutos apenas em telas de transição.
- **Suporte Bilíngue**: Inglês (EN) por padrão com detecção automática e alternador para Português (PT-BR).

---

## 🛠️ 4. Build e Execução

```bash
# Instalação das dependências
npm install

# Desenvolvimento local
npm run dev

# Compilação otimizada para CrazyGames
npm run build
```

O build gerado na pasta `dist/` possui caminhos estritamente relativos (`base: './'`) e bundle ultra-compacto (< 100 KB total), pronto para upload direto na plataforma CrazyGames Developer Portal.
