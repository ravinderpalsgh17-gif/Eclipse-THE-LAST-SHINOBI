/**
 * ECLIPSE: THE LAST SHINOBI - STORY CAMPAIGN & CUTSCENE DIRECTOR
 * 5 Chapters, Canonical Voice Dialogues, In-Engine 3D Cutscenes,
 * Objectives Tracker, and Multiple Branching Story Endings.
 */

class StoryDirector {
  constructor(game, combat, progression, enemies, world) {
    this.game = game;
    this.combat = combat;
    this.prog = progression;
    this.enemies = enemies;
    this.world = world;

    this.currentChapter = 1;
    this.currentStep = 0;
    this.isCutsceneActive = false;
    this.dialogueQueue = [];
    this.currentDialogue = null;
    this.onCutsceneFinished = null;

    // Quest Objective Trackers
    this.chapter1Kills = 0;
    this.chapter1KillsRequired = 3;
    this.chapter2Kills = 0;
    this.chapter2KillsRequired = 3;
    this.chapter4Kills = 0;
    this.chapter4KillsRequired = 2;

    this.initChapters();
  }

  initChapters() {
    this.chapters = [
      {
        id: 1,
        title: 'Chapter 1: The Awakening in Ash',
        desc: 'Defeat the Voidborn prowlers near the village gate (0/3)',
        zone: '🌸 Kamitsuki Sanctuary',
        objectiveDist: '45m North-East',
        prologue: [
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'Where am I...? The lotus shrine is covered in embers. The Seven Warriors... have they fallen?', char: 'ren' },
          { speaker: 'ELDER GENZO', role: 'GRANDMASTER OF KAMITSUKI', text: 'Ren! You have awakened at last. The seal of Aetheria has shattered. The Voidborn swarm our gates!', char: 'elder' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'Let them come. My blade will purge the shadow from this sanctuary.', char: 'ren' }
        ],
        epilogue: [
          { speaker: 'ELDER GENZO', role: 'GRANDMASTER OF KAMITSUKI', text: 'Extraordinary swordsmanship, Ren. But this was merely the vanguard. Ayame is surrounded in the Bamboo Forest.', char: 'elder' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'I will find her and recover the Sunburst Wakizashi.', char: 'ren' }
        ]
      },
      {
        id: 2,
        title: 'Chapter 2: Whispers in the Bamboo',
        desc: 'Rendezvous with Ayame in the Whispering Bamboo Forest (East)',
        zone: '🎋 Whispering Bamboo Forest',
        objectiveDist: '80m East',
        prologue: [
          { speaker: 'AYAME', role: 'GALE KUNOICHI', text: 'Ren! Behind you! The shadows walk like men here!', char: 'ayame' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'Stand with me, Ayame. Wind and shadow will cut through their ranks!', char: 'ren' }
        ],
        epilogue: [
          { speaker: 'AYAME', role: 'GALE KUNOICHI', text: 'We did it... Here is the Sunburst Wakizashi. General Kurogane has entrenched himself in the Citadel.', char: 'ayame' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'My former master... I must face him myself.', char: 'ren' }
        ]
      },
      {
        id: 3,
        title: 'Chapter 3: The Corrupted Blade',
        desc: 'Confront General Kurogane inside the Citadel of the Forgotten',
        zone: '🏰 Citadel of the Forgotten',
        objectiveDist: '120m North-West',
        prologue: [
          { speaker: 'GENERAL KUROGANE', role: 'CORRUPTED SOVEREIGN', text: 'Ren... Little disciple of light. Did you really believe the Seven Warriors died? We were chosen to become gods of the Void!', char: 'kurogane' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'You surrendered your honor for demonic power, master. Draw your blade!', char: 'ren' }
        ],
        epilogue: [
          { speaker: 'GENERAL KUROGANE', role: 'CORRUPTED SOVEREIGN', text: 'You... have surpassed me, Ren... Beware... Malakor awakens in the skies...', char: 'kurogane' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'Rest in peace, master. The Shinobi code remains unbroken.', char: 'ren' }
        ]
      },
      {
        id: 4,
        title: 'Chapter 4: Aetherial Ascendance',
        desc: 'Ascend to the Floating Sky Islands to unlock Eclipse Awakening',
        zone: '✨ Aetherial Sky Islands',
        objectiveDist: 'Above the Clouds',
        prologue: [
          { speaker: 'KAITO', role: 'THUNDER DRAGON RONIN', text: 'So you are the boy carrying the Umbral Core. Let us see if your spirit can wield thunder and void!', char: 'kaito' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'Test my resolve then, Ronin. I will not falter!', char: 'ren' }
        ],
        epilogue: [
          { speaker: 'KAITO', role: 'THUNDER DRAGON RONIN', text: 'Magnificent! The Umbral Core resonates within you. Your wings of dark flame have awakened!', char: 'kaito' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'The Eclipse is upon us. The sky is turning to pitch... Malakor is here!', char: 'ren' }
        ]
      },
      {
        id: 5,
        title: 'Chapter 5: The Final Convergence',
        desc: 'Defeat Malakor, Sovereign of the Void in the Eclipse Ground Zero!',
        zone: '🌑 Void Crater - Ground Zero',
        objectiveDist: '140m South-East',
        prologue: [
          { speaker: 'MALAKOR', role: 'SOVEREIGN OF THE VOID', text: 'MORTAL INSECT! YOU DARE STAND BENEATH MY ECLIPSE?! CONSUME HIS FLESH, VOID OF AETHERIA!', char: 'malakor' },
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'I AM THE LAST SHINOBI! THROUGHOUT HEAVEN AND EARTH, YOUR ECLIPSE ENDS TODAY!', char: 'ren' }
        ],
        epilogue: [
          { speaker: 'REN', role: 'THE LAST SHINOBI', text: 'The dragon has fallen... The sun returns to Aetheria. The era of the Shinobi shall live forever.', char: 'ren' },
          { speaker: 'AYAME', role: 'GALE KUNOICHI', text: 'You saved us all, Ren. The dawn is ours once more.', char: 'ayame' }
        ]
      }
    ];
  }

  startChapter(chapterIndex = 1) {
    this.currentChapter = chapterIndex;
    const chap = this.chapters[chapterIndex - 1];
    if (!chap) return;

    this.updateTrackerUI(chap.title, chap.desc, chap.objectiveDist);

    // Play Prologue Cutscene
    if (chap.prologue && chap.prologue.length > 0) {
      this.playCutscene(chap.prologue, () => {
        this.spawnChapterEnemies(chapterIndex);
      });
    } else {
      this.spawnChapterEnemies(chapterIndex);
    }
  }

  spawnChapterEnemies(chapterIndex) {
    if (chapterIndex === 1) {
      // Spawn 3 Void Lurkers near village gate
      this.enemies.spawnEnemy('void_lurker', 0, -28, 0);
      this.enemies.spawnEnemy('void_lurker', -6, -32, 0);
      this.enemies.spawnEnemy('void_lurker', 6, -30, 0);
    } else if (chapterIndex === 2) {
      // Spawn Corrupted Ninjas & Sorcerer in Bamboo Forest
      this.enemies.spawnEnemy('corrupted_ninja', 60, 10, 0);
      this.enemies.spawnEnemy('corrupted_ninja', 75, -5, 0);
      this.enemies.spawnEnemy('void_sorcerer', 85, 20, 0);
    } else if (chapterIndex === 3) {
      // Spawn Boss Kurogane at Citadel Keep
      this.enemies.spawnEnemy('boss_kurogane', -80, -70, 0);
      if (window.soundEngine) window.soundEngine.setTheme('boss');
    } else if (chapterIndex === 4) {
      // Spawn Elite Void Sorcerers
      this.enemies.spawnEnemy('void_sorcerer', -20, 110, 36);
      this.enemies.spawnEnemy('corrupted_ninja', -25, 115, 36);
    } else if (chapterIndex === 5) {
      // Spawn Final Boss Malakor at Ground Zero
      this.world.setEclipseState(true);
      this.enemies.spawnEnemy('boss_malakor', 80, 100, 0);
      if (window.soundEngine) window.soundEngine.setTheme('boss');
    }
  }

  onEnemyDefeated(enemy) {
    // Reward player XP & Currencies
    const xpReward = enemy.isBoss ? 800 : 90;
    const goldReward = enemy.isBoss ? 600 : 45;
    const shardReward = enemy.isBoss ? 15 : 2;

    this.prog.addXp(xpReward);
    this.prog.addCurrencies(goldReward, shardReward);

    // Chapter 1 Progress Check
    if (this.currentChapter === 1 && enemy.type === 'void_lurker') {
      this.chapter1Kills += 1;
      const chap = this.chapters[0];
      const newDesc = `Defeat the Voidborn prowlers near the village gate (${this.chapter1Kills}/${this.chapter1KillsRequired})`;
      this.updateTrackerUI(chap.title, newDesc, 'Near Gate');

      if (this.chapter1Kills >= this.chapter1KillsRequired) {
        this.playCutscene(chap.epilogue, () => {
          this.startChapter(2);
        });
      }
    }

    // Chapter 2 Progress Check (Bamboo Forest)
    if (this.currentChapter === 2 && (enemy.type === 'corrupted_ninja' || enemy.type === 'void_sorcerer')) {
      this.chapter2Kills += 1;
      const chap = this.chapters[1];
      const newDesc = `Defeat the ambush in the Bamboo Forest (${this.chapter2Kills}/${this.chapter2KillsRequired})`;
      this.updateTrackerUI(chap.title, newDesc, 'Bamboo Grove');

      if (this.chapter2Kills >= this.chapter2KillsRequired) {
        this.playCutscene(chap.epilogue, () => {
          this.startChapter(3);
        });
      }
    }

    // Chapter 3 Progress Check: Boss Kurogane Defeated
    if (this.currentChapter === 3 && enemy.type === 'boss_kurogane') {
      const chap = this.chapters[2];
      this.playCutscene(chap.epilogue, () => {
        this.startChapter(4);
      });
    }

    // Chapter 4 Progress Check: Sky Island Guardians
    if (this.currentChapter === 4 && (enemy.type === 'void_sorcerer' || enemy.type === 'corrupted_ninja')) {
      this.chapter4Kills += 1;
      const chap = this.chapters[3];
      const newDesc = `Purge the Celestial Island Guardians (${this.chapter4Kills}/${this.chapter4KillsRequired})`;
      this.updateTrackerUI(chap.title, newDesc, 'Sky Islands');

      if (this.chapter4Kills >= this.chapter4KillsRequired) {
        this.playCutscene(chap.epilogue, () => {
          this.startChapter(5);
        });
      }
    }

    // Chapter 5 Progress Check: Final Boss Malakor Defeated
    if (this.currentChapter === 5 && enemy.type === 'boss_malakor') {
      const chap = this.chapters[4];
      this.playCutscene(chap.epilogue, () => {
        this.triggerVictoryEnding();
      });
    }
  }

  // =========================================================================
  // CINEMATIC IN-ENGINE CUTSCENE DIRECTOR
  // =========================================================================

  playCutscene(dialogueList, onComplete = null) {
    this.isCutsceneActive = true;
    this.dialogueQueue = [...dialogueList];
    this.onCutsceneFinished = onComplete;

    document.body.classList.add('cinematic-active');
    const modal = document.getElementById('cinematicDialogue');
    if (modal) modal.classList.remove('hidden');

    this.char.isTalking = true;
    this.advanceDialogue();
  }

  advanceDialogue() {
    if (this.dialogueQueue.length === 0) {
      this.endCutscene();
      return;
    }

    const item = this.dialogueQueue.shift();
    this.currentDialogue = item;

    const speakerEl = document.getElementById('dialogueSpeaker');
    const roleEl = document.getElementById('dialogueRole');
    const textEl = document.getElementById('dialogueText');
    const avatarEl = document.getElementById('dialogueAvatar');

    if (speakerEl) speakerEl.textContent = item.speaker;
    if (roleEl) roleEl.textContent = item.role;
    if (textEl) textEl.textContent = item.text;

    if (avatarEl) {
      if (item.char === 'ayame') avatarEl.textContent = '風';
      else if (item.char === 'kurogane') avatarEl.textContent = '鬼';
      else if (item.char === 'elder') avatarEl.textContent = '翁';
      else if (item.char === 'malakor') avatarEl.textContent = '竜';
      else avatarEl.textContent = '忍';
    }

    // Live Voice Synthesis
    if (window.voiceEngine) {
      window.voiceEngine.speak(item.text, item.char);
    }
  }

  endCutscene() {
    this.isCutsceneActive = false;
    this.char.isTalking = false;
    document.body.classList.remove('cinematic-active');

    const modal = document.getElementById('cinematicDialogue');
    if (modal) modal.classList.add('hidden');

    if (window.voiceEngine) window.voiceEngine.stop();

    if (this.onCutsceneFinished) {
      this.onCutsceneFinished();
      this.onCutsceneFinished = null;
    }
  }

  updateTrackerUI(title, desc, dist) {
    const titleEl = document.getElementById('questName');
    const descEl = document.getElementById('questObjective');
    const distEl = document.getElementById('questDistance');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (distEl) distEl.textContent = dist;
  }

  triggerVictoryEnding() {
    alert('🏆 CONGRATULATIONS! You have completed ECLIPSE: THE LAST SHINOBI!\nAetheria has been liberated from the Void. You can continue freely exploring the open world and mastering all skills!');
    if (window.soundEngine) window.soundEngine.setTheme('explore');
  }
}

window.StoryDirector = StoryDirector;
