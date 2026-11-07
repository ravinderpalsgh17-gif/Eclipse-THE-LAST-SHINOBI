# 🌑 ECLIPSE: THE LAST SHINOBI

> **AAA-Quality 3D Anime Action RPG** &bull; Built with Three.js WebGL &bull; Unreal Engine 5-Inspired Aesthetics &bull; Seamless Open World &bull; Real-Time Voice Synthesis & Dynamic Audio

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-4K_Ultra-9d4edd?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Synth-ffd166?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Web Speech API](https://img.shields.io/badge/Voices-Live_Speech_Synthesis-00f0ff?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## ⛩️ Lore & Storyline: The Calamity of Aetheria

The realm of **Aetheria** was protected for centuries by the **Seven Legendary Shinobi Sovereigns**, maintaining balance across sacred shrines, mist-veiled forests, and ancient sky fortresses.

One fateful day, a cataclysmic rift tore through the heavens—the **Eclipse**. Corrupted creatures known as the **Voidborn** surged into Aetheria, slaying six of the Sovereigns and seducing General Kurogane into eternal darkness.

You awaken as **Ren**, the **Last Shinobi of the Eclipse Clan**, carrying the ancient, slumbering **Umbral Core** within your soul. Alongside the gale kunoichi **Ayame** and the thunder ronin **Kaito**, you must master dual-wielding swordsmanship, unlock forbidden Ninjutsu, discover your true heritage, and sever the dark cord binding Aetheria to the Void before the final Eclipse consumes reality.

---

## ⚔️ Key Features & Innovations

### 1. 🌟 Ultra-Detailed 3D Anime Graphics
- **Unreal Engine 5-Inspired Aesthetic**: Hybrid anime cel-shading combined with Physically Based Rendering (PBR), specular highlights, and anisotropic hair sheens.
- **Dynamic Volumetric Lighting & Atmospheric Fog**: Cascaded soft shadow maps (`PCFSoftShadowMap`), volumetric light shafts, and height fog adjusting smoothly across biomes.
- **Dynamic Celestial Cycles & The Eclipse**:
  - Real-time Day/Night progression: Golden Sunrise, Vibrant Cel-Shaded Noon, Twilight Sunset, Star-filled Midnight.
  - **The Eclipse Event**: The sky deepens into midnight violet, casting eerie ambient shadows as a glowing black sun ring with blazing ultraviolet coronas appears in the heavens.
- **Dynamic Weather**: Procedural cherry blossom petal storms, falling rain streaks with ground splashes, lightning flashes, and void ash motes.

### 2. 🤺 Deep Real-Time 3D Combat System
- **Dual-Wielding & 4-Hit Sword Chains**:
  - **Light Attack Chain** (<kbd>LMB</kbd>): Horizontal Slash ➔ Rising Cross Slash ➔ Dual-Wield 360 Whirlwind ➔ Leaping Overhead Cleave.
  - **Heavy Iaido Attack** (<kbd>RMB</kbd>): Charged piercing thrust with high stagger damage and knockback.
- **Defensive Arts**:
  - **Ninja Slide Dash** (<kbd>Shift</kbd> / <kbd>Space</kbd>): High-speed low-profile dash with **invulnerability frames (i-frames)** and motion ghost trails.
  - **Crossed X-Guard** (<kbd>C</kbd>): Forward dual-blade barrier reducing incoming damage by 80%.
  - **Perfect Parry & Witch Time**: Parrying within 220ms of an impact triggers a crystalline chime, slows down time for 1.2 seconds, refills stamina, and breaks the attacker's posture!
- **Ninjutsu Elemental Arts**:
  - <kbd>Q</kbd> **Shadow Dash**: Instant teleport dash leaving an explosive decoy clone.
  - <kbd>E</kbd> **Void Crescent Wave**: Piercing crescent arc projectile of dark flame cutting through multiple enemies.
  - <kbd>R</kbd> **Thunder Step**: High-speed lightning strike piercing through space with chain shock damage.
  - <kbd>F</kbd> **Secret Art: Eclipse Horizon Cleave**: Cinematic letterbox cut, time dilation, 8-directional multi-slash frenzy, and a cataclysmic dimensional explosion.
- **Transformation: Eclipse Awakening** (<kbd>T</kbd>):
  - Unleashes the Umbral Core: Spawns dark flame wings, glowing violet eyes, +50% attack power, infinite stamina, and auto-firing void crescent projectiles for 20 seconds.
- **Destructible World Physics**:
  - Wooden crates, stone lanterns, training dummies, bamboo stalks, and void crystals shatter into physics-driven debris upon blade impact.

### 3. 🗺️ Seamless 3D Open World Biomes
1. **Kamitsuki Sanctuary**: Traditional Japanese multi-tiered pagoda, vermillion torii gates, bridges, stone lanterns with glowing fireflies, lush sakura trees, training dojo, and a reflective koi pond.
2. **Citadel of the Forgotten**: Ancient feudal fortress keep atop mountain crags with stone watchtowers and clan battlements.
3. **Whispering Bamboo Forest**: Dense groves of destructible tall bamboo stalks and mystic stone shrines.
4. **Aetherial Zenith (Floating Sky Islands)**: Inverted levitating rock monoliths connected by radiant light beams high above the clouds.
5. **The Void Crater (Ground Zero)**: Calamity breach filled with obsidian spires, purple crystal clusters, and shattered terrain fissures.

### 4. 👥 Playable Characters & Progression
- **Ren (Shadow Shinobi)**: Master of dual katanas and shadow ninjutsu. Balanced, fluid, deadly.
- **Ayame (Gale Kunoichi)**: Extreme agility, dual wind daggers, swift aerial maneuvers.
- **Kaito (Thunder Ronin)**: Colossal two-handed Great Nodachi, high poise, heavy lightning shockwaves.
- **Progression Systems**:
  - Level up progression (up to Level 50) with stat scaling (HP, Stamina, ATK, DEF, Void Power, Crit).
  - Interactive Skill Tree with 3 branches: *Kenjutsu (Blade Mastery)*, *Ninjutsu (Elemental Arts)*, *Umbral Arts (Eclipse)*.
  - Complete Inventory & Gear Slots (Weapons, Off-hand, Body Armor, Relics, Consumable Potions).
  - Auto-saving & persistent save state with `localStorage`.

### 5. 👹 Intelligent Enemies & Legendary Bosses
- **Void Lurker**: Agile quadrupedal shadow predator that flanks, leaps, and pounces.
- **Corrupted Shinobi**: Humanoid warrior with spear and naginata, capable of guarding and counter-striking.
- **Voidborn Sorcerer**: Levitating warlock casting homing dark orbs.
- **Boss: General Kurogane (The Corrupted Blade)**: Multi-phase warlord with colossal demonic Odachi, iaido ground fissures, and blood-tempest rage mode.
- **Boss: Malakor (Voidborn Dragon Sovereign)**: Colossal horned dragon with ground tail sweeps, void fire breath, and aerial meteor showers.

### 6. 🎵 Audio & Voice Acting
- **Procedural Orchestral Synthesizer**: Japanese pentatonic koto & flute exploration theme, high-octane anime battle drums and brass, and dark apocalyptic choir for Bosses.
- **Live Web Speech API Voice Synthesis**: Full spoken character dialogues for Ren, Ayame, Kaito, Kurogane, Malakor, Elder Genzo, and Shrine Maiden Saki.

---

## 🎮 Controls & Keybindings

| Action | Keyboard / Mouse | Gamepad (Xbox / PS) |
| :--- | :--- | :--- |
| **Move** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Left Analog Stick |
| **Look / Camera** | Mouse Movement | Right Analog Stick |
| **Light Attack Combo** | <kbd>Left Mouse Button</kbd> | <kbd>X</kbd> / <kbd>Square</kbd> |
| **Heavy Iaido Attack** | <kbd>Right Mouse Button</kbd> | <kbd>Y</kbd> / <kbd>Triangle</kbd> |
| **Jump** | <kbd>Space</kbd> | <kbd>A</kbd> / <kbd>Cross</kbd> |
| **Dash / Dodge** | <kbd>Shift</kbd> (while moving) | <kbd>B</kbd> / <kbd>Circle</kbd> |
| **Guard / Perfect Parry** | <kbd>C</kbd> | <kbd>LB</kbd> / <kbd>L1</kbd> |
| **Lock-On Target** | <kbd>Tab</kbd> / <kbd>Middle Click</kbd> | <kbd>Right Stick Click (R3)</kbd> |
| **Shadow Dash (Skill 1)** | <kbd>Q</kbd> | <kbd>D-Pad Up</kbd> |
| **Void Wave (Skill 2)** | <kbd>E</kbd> | <kbd>D-Pad Right</kbd> |
| **Thunder Step (Skill 3)** | <kbd>R</kbd> | <kbd>D-Pad Down</kbd> |
| **Secret Art: Ultimate** | <kbd>F</kbd> | <kbd>LT</kbd> + <kbd>RT</kbd> |
| **Eclipse Awakening** | <kbd>T</kbd> | <kbd>Left Stick Click (L3)</kbd> |
| **Interact (Chest/NPC/Shrine)** | <kbd>E</kbd> | <kbd>X</kbd> / <kbd>Square</kbd> |
| **Use Heal Potion** | <kbd>1</kbd> | <kbd>D-Pad Left</kbd> |
| **Pause Menu / Inventory** | <kbd>M</kbd> / <kbd>Escape</kbd> | <kbd>Start / Options</kbd> |

---

## 🚀 How to Play

### Option 1: Instant Local Launcher
Double-click `play_game.bat` to launch the game directly in your default browser.

### Option 2: Web Server
Run any local static server:
```bash
python -m http.server 8080
# Open http://localhost:8080 in your browser
```

### Option 3: Deploy to GitHub Pages
1. Create a repository called `Eclipse-THE-LAST-SHINOBI` on your GitHub account.
2. Double click `push_to_github.bat` and paste your GitHub Personal Access Token (PAT).
3. Under repository **Settings ➔ Pages**, enable GitHub Pages from the `main` branch.

---

## 📂 Repository Structure

```
Eclipse-THE-LAST-SHINOBI/
├── index.html              # Main game HTML5 entrypoint & HUD layout
├── play_game.bat           # Instant 1-click launcher
├── push_to_github.bat      # Git remote push helper
├── README.md               # Game documentation & architecture guide
├── .gitignore              # Git ignore rules
├── css/
│   └── style.css           # AAA anime aesthetic, HUD, post-processing styling
└── js/
    ├── lib/
    │   └── three.min.js    # Three.js 3D WebGL engine (offline bundled)
    ├── audio.js            # Procedural orchestral synth & Web Speech voice engine
    ├── particles.js        # Sword slashes, clash sparks, rain, petals, debris VFX
    ├── world3d.js          # Open-world biomes, procedural terrain, shrines & chests
    ├── character3d.js      # Anatomical anime rigs, animations, dual katanas, wings
    ├── enemies3d.js        # Void Lurkers, Sorcerers, General Kurogane & Malakor Bosses
    ├── combat.js           # Combos, hitstop, perfect parry, skills, awakening, lock-on
    ├── progression.js      # XP, leveling, inventory, skill tree, localStorage save
    ├── story.js            # 5-Chapter campaign, in-engine cutscenes & dialogue director
    ├── ui.js               # HUD meters, radar minimap, inventory grid, world map canvas
    └── game.js             # Master game engine lifecycle, camera, input & game loop
```

---

## 🏆 Credits & Engine Specifications

- **Engine**: Three.js WebGL (r128) with PCFSoftShadowMap & ACESFilmic Tone Mapping
- **Audio Engine**: Web Audio API Procedural Synthesizer (Zero external audio files required!)
- **Voice Acting**: HTML5 Web Speech API (`SpeechSynthesisUtterance`)
- **Target Performance**: 60 FPS target at 4K Ultra resolutions
- **Developer**: ravinderpalsgh17-gif

*May the shadow of the Eclipse guide your blade.*
