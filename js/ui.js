/**
 * ECLIPSE: THE LAST SHINOBI - USER INTERFACE & HUD CONTROLLER
 * Real-time HUD updates, 2D Radar Minimap, Boss Health, Combo counter,
 * Inventory drag & equip, Interactive Skill Tree, World Map canvas, and Settings.
 */

class UIController {
  constructor(game, combat, prog, world, enemies, story) {
    this.game = game;
    this.combat = combat;
    this.prog = prog;
    this.world = world;
    this.enemies = enemies;
    this.story = story;

    this.isMenuOpen = false;
    this.selectedItem = null;

    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.worldMapCanvas = document.getElementById('worldMapCanvas');
    this.worldMapCtx = this.worldMapCanvas ? this.worldMapCanvas.getContext('2d') : null;

    this.initEventListeners();
    this.renderInventory();
    this.renderWorldMap();
  }

  initEventListeners() {
    // Menu Tab Switching
    document.querySelectorAll('.menu-tab').forEach(tab => {
      tab.addEventListener('click', e => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchMenuTab(targetTab);
        if (window.soundEngine) window.soundEngine.playUiClick();
      });
    });

    // Close Menu Button
    const btnClose = document.getElementById('btnCloseMenu');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.toggleMenu(false));
    }

    // Character Switcher Cards
    document.querySelectorAll('.roster-card').forEach(card => {
      card.addEventListener('click', e => {
        const charKey = e.currentTarget.getAttribute('data-char');
        this.selectCharacter(charKey);
        if (window.soundEngine) window.soundEngine.playUiClick();
      });
    });

    // Skill Tree Unlock Buttons (Delegated on grid container)
    const treeGrid = document.querySelector('.skilltree-branches-grid');
    if (treeGrid) {
      treeGrid.addEventListener('click', e => {
        const btn = e.target.closest('.btn-unlock-skill');
        if (btn && !btn.disabled) {
          const skillId = btn.getAttribute('data-skill');
          if (this.prog.unlockSkill(skillId)) {
            this.refreshSkillTreeUI();
            this.showToast('🔮 New Skill Mastered!');
          } else {
            this.showToast('⚠️ Not enough Skill Points!');
          }
        }
      });
    }

    // Combat Hotbar Clicks
    const slot1 = document.getElementById('slotSkill1');
    if (slot1) slot1.addEventListener('click', () => this.combat.useSkill1());

    const slot2 = document.getElementById('slotSkill2');
    if (slot2) slot2.addEventListener('click', () => this.combat.useSkill2());

    const slot3 = document.getElementById('slotSkill3');
    if (slot3) slot3.addEventListener('click', () => this.combat.useSkill3());

    const slotUlt = document.getElementById('slotUltimate');
    if (slotUlt) slotUlt.addEventListener('click', () => this.combat.useUltimate());

    const slotAwake = document.getElementById('slotAwakening');
    if (slotAwake) slotAwake.addEventListener('click', () => this.combat.toggleAwakening());

    const slotPot = document.getElementById('slotPotion');
    if (slotPot) slotPot.addEventListener('click', () => this.prog.useQuickPotion());

    // Graphics Settings Listeners
    const selGfx = document.getElementById('selectGraphicsPreset');
    if (selGfx) {
      selGfx.addEventListener('change', e => {
        const val = e.target.value;
        if (this.game && this.game.renderer) {
          if (val === 'ultra') {
            this.game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
            this.game.renderer.shadowMap.enabled = true;
          } else if (val === 'high') {
            this.game.renderer.setPixelRatio(1.25);
            this.game.renderer.shadowMap.enabled = true;
          } else {
            this.game.renderer.setPixelRatio(1.0);
            this.game.renderer.shadowMap.enabled = false;
          }
          this.showToast(`Graphics set to ${val.toUpperCase()}`);
        }
      });
    }

    const tglShadows = document.getElementById('toggleShadows');
    if (tglShadows) {
      tglShadows.addEventListener('change', e => {
        if (this.game && this.game.renderer) {
          this.game.renderer.shadowMap.enabled = e.target.checked;
        }
      });
    }

    const tglWeather = document.getElementById('toggleWeather');
    if (tglWeather) {
      tglWeather.addEventListener('change', e => {
        if (this.game && this.game.particles) {
          this.game.particles.setRainActive(e.target.checked);
        }
      });
    }

    const tglVoice = document.getElementById('toggleVoice');
    if (tglVoice) {
      tglVoice.addEventListener('change', e => {
        if (window.voiceEngine) {
          window.voiceEngine.enabled = e.target.checked;
        }
      });
    }

    // World Map Interactive Fast Travel
    if (this.worldMapCanvas) {
      this.worldMapCanvas.addEventListener('click', e => {
        const rect = this.worldMapCanvas.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * this.worldMapCanvas.width;
        const clickY = ((e.clientY - rect.top) / rect.height) * this.worldMapCanvas.height;
        this.handleWorldMapFastTravel(clickX, clickY);
      });
    }

    // Item Action Buttons
    const btnEquip = document.getElementById('btnEquipItem');
    if (btnEquip) {
      btnEquip.addEventListener('click', () => {
        if (this.selectedItem) {
          this.prog.equipItem(this.selectedItem);
          this.renderInventory();
          this.selectInventoryItem(null);
        }
      });
    }

    const btnUse = document.getElementById('btnUseItem');
    if (btnUse) {
      btnUse.addEventListener('click', () => {
        if (this.selectedItem) {
          this.prog.useConsumable(this.selectedItem);
          this.renderInventory();
          this.selectInventoryItem(null);
        }
      });
    }

    // Audio Sliders
    const sldMaster = document.getElementById('sliderMasterVol');
    if (sldMaster) {
      sldMaster.addEventListener('input', e => {
        if (window.soundEngine) window.soundEngine.setMasterVolume(e.target.value / 100);
      });
    }
    const sldMusic = document.getElementById('sliderMusicVol');
    if (sldMusic) {
      sldMusic.addEventListener('input', e => {
        if (window.soundEngine) window.soundEngine.setMusicVolume(e.target.value / 100);
      });
    }
    const sldSfx = document.getElementById('sliderSfxVol');
    if (sldSfx) {
      sldSfx.addEventListener('input', e => {
        if (window.soundEngine) window.soundEngine.setSfxVolume(e.target.value / 100);
      });
    }

    // Save & Load Buttons
    const btnSave = document.getElementById('btnManualSave');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (this.prog.saveToStorage()) {
          this.showToast('💾 Game Saved Successfully!');
        }
      });
    }
    const btnLoad = document.getElementById('btnManualLoad');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        if (this.prog.loadFromStorage()) {
          this.showToast('📂 Game Loaded Successfully!');
          this.renderInventory();
        }
      });
    }
    const btnReset = document.getElementById('btnResetProgress');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress?')) {
          this.prog.resetProgress();
        }
      });
    }
  }

  toggleMenu(forceState = null) {
    this.isMenuOpen = forceState !== null ? forceState : !this.isMenuOpen;
    const modal = document.getElementById('pauseMenuModal');

    if (modal) {
      if (this.isMenuOpen) {
        modal.classList.remove('hidden');
        this.renderInventory();
        this.renderWorldMap();
      } else {
        modal.classList.add('hidden');
      }
    }
    if (window.soundEngine) window.soundEngine.playUiClick();
  }

  switchMenuTab(tabId) {
    document.querySelectorAll('.menu-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  selectCharacter(charKey) {
    this.prog.activeChar = charKey;
    document.querySelectorAll('.roster-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-char') === charKey);
    });

    const nameEl = document.getElementById('statHeaderName');
    const hudName = document.getElementById('hudCharName');
    const avatarEl = document.getElementById('hudCharAvatar');

    if (charKey === 'ren') {
      if (nameEl) nameEl.textContent = 'REN - ATTRIBUTES';
      if (hudName) hudName.textContent = 'REN';
      if (avatarEl) avatarEl.className = 'avatar-img ren-avatar';
    } else if (charKey === 'ayame') {
      if (nameEl) nameEl.textContent = 'AYAME - ATTRIBUTES';
      if (hudName) hudName.textContent = 'AYAME';
      if (avatarEl) avatarEl.className = 'avatar-img ayame-avatar';
    } else if (charKey === 'kaito') {
      if (nameEl) nameEl.textContent = 'KAITO - ATTRIBUTES';
      if (hudName) hudName.textContent = 'KAITO';
      if (avatarEl) avatarEl.className = 'avatar-img kaito-avatar';
    }

    if (this.game && this.game.char && typeof this.game.char.setCharacterType === 'function') {
      this.game.char.setCharacterType(charKey);
    }

    this.showToast(`Switched fighter to ${charKey.toUpperCase()}!`);
  }

  // =========================================================================
  // INVENTORY UI RENDERING
  // =========================================================================

  renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const invCount = document.getElementById('invCount');
    if (invCount) invCount.textContent = this.prog.inventory.length;

    const goldEl = document.getElementById('invGold');
    if (goldEl) goldEl.textContent = this.prog.gold;
    const shardEl = document.getElementById('invVoidShards');
    if (shardEl) shardEl.textContent = this.prog.voidShards;

    this.prog.inventory.forEach(item => {
      const card = document.createElement('div');
      card.className = `inv-card ${this.selectedItem === item ? 'selected' : ''}`;

      const icon = document.createElement('div');
      icon.className = 'inv-item-icon';
      icon.textContent = item.icon || '📦';
      card.appendChild(icon);

      if (item.count && item.count > 1) {
        const count = document.createElement('div');
        count.className = 'inv-item-count';
        count.textContent = `x${item.count}`;
        card.appendChild(count);
      }

      card.addEventListener('click', () => {
        this.selectInventoryItem(item);
        this.renderInventory();
      });

      grid.appendChild(card);
    });

    // Update Equipped Slots UI
    const eqWpn = document.getElementById('equippedWeaponName');
    if (eqWpn && this.prog.equipped.weapon) eqWpn.textContent = `⚔️ ${this.prog.equipped.weapon.name}`;

    const eqOff = document.getElementById('equippedOffhandName');
    if (eqOff && this.prog.equipped.offhand) eqOff.textContent = `🗡️ ${this.prog.equipped.offhand.name}`;

    const eqArm = document.getElementById('equippedArmorName');
    if (eqArm && this.prog.equipped.armor) eqArm.textContent = `🥋 ${this.prog.equipped.armor.name}`;

    const eqRel = document.getElementById('equippedRelicName');
    if (eqRel && this.prog.equipped.relic) eqRel.textContent = `📿 ${this.prog.equipped.relic.name}`;
  }

  selectInventoryItem(item) {
    this.selectedItem = item;
    const title = document.getElementById('detailTitle');
    const desc = document.getElementById('detailDesc');
    const actions = document.getElementById('detailActionRow');
    const btnEquip = document.getElementById('btnEquipItem');
    const btnUse = document.getElementById('btnUseItem');

    if (!item) {
      if (title) title.textContent = 'Select an item to view stats';
      if (desc) desc.textContent = 'Hover or click on equipment, potions, or treasures in your bag.';
      if (actions) actions.classList.add('hidden');
      return;
    }

    if (title) title.textContent = item.name;
    if (desc) desc.textContent = item.desc || (item.atk ? `+${item.atk} Attack Power` : `+${item.def} Defense Rating`);
    if (actions) actions.classList.remove('hidden');

    if (btnEquip) btnEquip.style.display = item.type !== 'consumable' ? 'block' : 'none';
    if (btnUse) btnUse.style.display = item.type === 'consumable' ? 'block' : 'none';
  }

  refreshSkillTreeUI() {
    const spCount = document.getElementById('skillPointsCount');
    if (spCount) spCount.textContent = this.prog.skillPoints;

    document.querySelectorAll('.skill-node').forEach(node => {
      const skillId = node.getAttribute('data-skill');
      if (this.prog.unlockedSkills.has(skillId)) {
        node.className = 'skill-node unlocked';
        const btn = node.querySelector('.btn-unlock-skill');
        if (btn) btn.outerHTML = '<div class="node-status">MASTERED</div>';
      }
    });

    // Check tier 3 unlocks
    if (this.prog.unlockedSkills.has('parry_counter')) {
      const node = document.querySelector('.skill-node[data-skill="aerial_cleave"]');
      if (node && !this.prog.unlockedSkills.has('aerial_cleave')) {
        node.className = 'skill-node available';
        const btn = node.querySelector('.btn-unlock-skill');
        if (btn) { btn.disabled = false; btn.textContent = 'UNLOCK (1 SP)'; }
      }
    }
    if (this.prog.unlockedSkills.has('dragon_fire')) {
      const node = document.querySelector('.skill-node[data-skill="thunder_god"]');
      if (node && !this.prog.unlockedSkills.has('thunder_god')) {
        node.className = 'skill-node available';
        const btn = node.querySelector('.btn-unlock-skill');
        if (btn) { btn.disabled = false; btn.textContent = 'UNLOCK (1 SP)'; }
      }
    }
    if (this.prog.unlockedSkills.has('void_core')) {
      const node = document.querySelector('.skill-node[data-skill="dimensional_sever"]');
      if (node && !this.prog.unlockedSkills.has('dimensional_sever')) {
        node.className = 'skill-node available';
        const btn = node.querySelector('.btn-unlock-skill');
        if (btn) { btn.disabled = false; btn.textContent = 'UNLOCK (1 SP)'; }
      }
    }
  }

  handleWorldMapFastTravel(clickX, clickY) {
    if (!this.world || !this.game || !this.game.char) return;
    const w = this.worldMapCanvas.width;
    const h = this.worldMapCanvas.height;

    // Shrine target points on the 2D map
    const targets = [
      { name: 'Kamitsuki Sanctuary Shrine', mapX: w * 0.45, mapY: h * 0.45, worldX: 0, worldZ: 5 },
      { name: 'Whispering Bamboo Shrine', mapX: w * 0.75, mapY: h * 0.45, worldX: 60, worldZ: -10 },
      { name: 'Citadel Rampart Shrine', mapX: w * 0.22, mapY: h * 0.25, worldX: -60, worldZ: -50 },
      { name: 'Void Crater Gate Shrine', mapX: w * 0.8, mapY: h * 0.8, worldX: 70, worldZ: 80 }
    ];

    let closest = null;
    let minDist = 90;

    targets.forEach(t => {
      const dist = Math.hypot(clickX - t.mapX, clickY - t.mapY);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    });

    if (closest) {
      const groundY = this.world.getTerrainHeight(closest.worldX, closest.worldZ);
      this.game.char.position.set(closest.worldX, groundY, closest.worldZ);
      if (window.soundEngine) window.soundEngine.playLevelUp();
      this.showToast(`🌸 Fast Travelled to ${closest.name}!`);
      this.toggleMenu(false);
    }
  }

  // =========================================================================
  // WORLD MAP 2D CANVAS
  // =========================================================================

  renderWorldMap() {
    if (!this.worldMapCtx) return;
    const ctx = this.worldMapCtx;
    const w = this.worldMapCanvas.width;
    const h = this.worldMapCanvas.height;

    ctx.fillStyle = '#0a0815';
    ctx.fillRect(0, 0, w, h);

    // Map Biome Regions
    // Kamitsuki (Center-North)
    ctx.fillStyle = '#2d1e2f';
    ctx.beginPath();
    ctx.arc(w * 0.45, h * 0.45, 90, 0, Math.PI * 2);
    ctx.fill();

    // Bamboo Forest (East)
    ctx.fillStyle = '#1c3320';
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.45, 80, 0, Math.PI * 2);
    ctx.fill();

    // Citadel of the Forgotten (North-West)
    ctx.fillStyle = '#1f1b2b';
    ctx.beginPath();
    ctx.arc(w * 0.22, h * 0.25, 70, 0, Math.PI * 2);
    ctx.fill();

    // Void Crater (South-East)
    ctx.fillStyle = '#240046';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.8, 85, 0, Math.PI * 2);
    ctx.fill();

    // Region Labels
    ctx.font = 'bold 13px "Cinzel", sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.fillText('🌸 KAMITSUKI SANCTUARY', w * 0.45, h * 0.45);
    ctx.fillText('🎋 BAMBOO FOREST', w * 0.75, h * 0.45);
    ctx.fillText('🏰 CITADEL', w * 0.22, h * 0.25);
    ctx.fillText('🌑 VOID CRATER', w * 0.8, h * 0.8);

    // Player Blip
    if (this.game && this.game.char) {
      const px = this.game.char.position.x;
      const pz = this.game.char.position.z;

      const mapX = (px / 200 + 0.5) * w;
      const mapY = (pz / 200 + 0.5) * h;

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(mapX, mapY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // =========================================================================
  // 2D RADAR MINIMAP RENDERING
  // =========================================================================

  updateMinimap() {
    if (!this.minimapCtx || !this.game || !this.game.char) return;
    const ctx = this.minimapCtx;
    const cx = 80;
    const cy = 80;
    const scale = 1.4;

    ctx.clearRect(0, 0, 160, 160);

    const playerPos = this.game.char.position;
    const playerAngle = this.game.char.root.rotation.y;

    // Draw Enemies as Red Dots
    ctx.fillStyle = '#ff0055';
    this.enemies.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const dx = (e.mesh.position.x - playerPos.x) * scale;
      const dz = (e.mesh.position.z - playerPos.z) * scale;
      if (Math.hypot(dx, dz) < 68) {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dz, e.isBoss ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Shrines as Green Dots
    ctx.fillStyle = '#06d6a0';
    this.world.shrines.forEach(s => {
      const dx = (s.position.x - playerPos.x) * scale;
      const dz = (s.position.z - playerPos.z) * scale;
      if (Math.hypot(dx, dz) < 68) {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dz, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Player Facing Pointer
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerAngle);
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // HUD FRAME UPDATE
  // =========================================================================

  updateHUD() {
    // 1. Vitality Meters
    const hpPct = Math.max(0, Math.min(100, (this.combat.hp / this.combat.maxHp) * 100));
    const hpFill = document.getElementById('hudHpFill');
    const hpText = document.getElementById('hudHpText');
    if (hpFill) hpFill.style.width = `${hpPct}%`;
    if (hpText) hpText.textContent = `${Math.floor(this.combat.hp)} / ${this.combat.maxHp}`;

    const stPct = Math.max(0, Math.min(100, (this.combat.stamina / this.combat.maxStamina) * 100));
    const stFill = document.getElementById('hudStaminaFill');
    const stText = document.getElementById('hudStaminaText');
    if (stFill) stFill.style.width = `${stPct}%`;
    if (stText) stText.textContent = `${Math.floor(this.combat.stamina)} / ${this.combat.maxStamina}`;

    const voidPct = Math.max(0, Math.min(100, this.combat.voidEnergy));
    const voidFill = document.getElementById('hudVoidFill');
    const voidText = document.getElementById('hudVoidText');
    if (voidFill) voidFill.style.width = `${voidPct}%`;
    if (voidText) voidText.textContent = this.combat.isAwakened ? `AWAKENED ${Math.ceil(this.combat.awakenedTimer)}s` : `VOID ${Math.floor(voidPct)}% [T]`;

    // 2. Currencies, Biome & Weather
    const gold = document.getElementById('hudGold');
    if (gold) gold.textContent = this.prog.gold;
    const shards = document.getElementById('hudVoidShards');
    if (shards) shards.textContent = this.prog.voidShards;

    const zoneEl = document.getElementById('hudZoneName');
    if (zoneEl) zoneEl.textContent = this.world.currentBiome;

    const weatherEl = document.getElementById('hudTimeWeather');
    if (weatherEl) {
      if (this.world.isEclipse) {
        weatherEl.textContent = '🌑 ECLIPSE | VOID STORM';
      } else {
        const tod = this.world.timeOfDay;
        if (tod < 0.3) weatherEl.textContent = '🌅 SUNRISE | CLEAR';
        else if (tod < 0.65) weatherEl.textContent = '☀️ NOON | SAKURA BREEZE';
        else if (tod < 0.8) weatherEl.textContent = '🌇 TWILIGHT | RAIN';
        else weatherEl.textContent = '🌙 MIDNIGHT | STARRY';
      }
    }

    // Hotbar Potion Counter
    const pot = this.prog.inventory.find(i => i.id.startsWith('pot_heal'));
    const potEl = document.getElementById('potionCount');
    if (potEl) {
      potEl.textContent = pot ? `x${pot.count}` : 'x0';
    }

    // Player Level Badge
    const lvlBadge = document.getElementById('hudCharLevel');
    if (lvlBadge) lvlBadge.textContent = `LV.${this.prog.level}`;

    // Update Stats in Pause Menu Character tab
    const sLvl = document.getElementById('statLevel');
    if (sLvl) sLvl.textContent = this.prog.level;
    const sXp = document.getElementById('statXp');
    if (sXp) sXp.textContent = `${this.prog.xp} / ${this.prog.xpToNextLevel}`;
    const sHp = document.getElementById('statHp');
    if (sHp) sHp.textContent = this.prog.currentStats ? this.prog.currentStats.hp : 1000;
    const sSt = document.getElementById('statStamina');
    if (sSt) sSt.textContent = this.prog.currentStats ? this.prog.currentStats.stamina : 200;
    const sAtk = document.getElementById('statAtk');
    if (sAtk) sAtk.textContent = this.prog.currentStats ? this.prog.currentStats.atk : 125;
    const sDef = document.getElementById('statDef');
    if (sDef) sDef.textContent = this.prog.currentStats ? this.prog.currentStats.def : 45;
    const sVoid = document.getElementById('statVoidPower');
    if (sVoid) sVoid.textContent = this.prog.currentStats ? this.prog.currentStats.voidPower : 80;
    const sCrit = document.getElementById('statCrit');
    if (sCrit) sCrit.textContent = this.prog.currentStats ? this.prog.currentStats.crit : '15%';

    // 3. Cooldown Overlays
    this.updateCdSlot('cdSkill1', this.combat.cooldowns.skill1, this.combat.maxCooldowns.skill1);
    this.updateCdSlot('cdSkill2', this.combat.cooldowns.skill2, this.combat.maxCooldowns.skill2);
    this.updateCdSlot('cdSkill3', this.combat.cooldowns.skill3, this.combat.maxCooldowns.skill3);
    this.updateCdSlot('cdUltimate', this.combat.cooldowns.ultimate, this.combat.maxCooldowns.ultimate);

    // 4. Boss Health HUD
    const bossHud = document.getElementById('bossHud');
    if (this.enemies.activeBoss && this.enemies.activeBoss.hp > 0) {
      if (bossHud) {
        bossHud.classList.remove('hidden');
        const b = this.enemies.activeBoss;
        const bFill = document.getElementById('bossHpFill');
        const bStagger = document.getElementById('bossStaggerFill');
        const bName = document.getElementById('bossName');
        const bTitle = document.getElementById('bossTitle');

        if (bName) bName.textContent = b.name;
        if (bTitle) bTitle.textContent = b.title || 'SOVEREIGN OF THE VOID';
        if (bFill) bFill.style.width = `${(b.hp / b.maxHp) * 100}%`;
        if (bStagger) bStagger.style.width = `${(b.stagger / b.maxStagger) * 100}%`;
      }
    } else {
      if (bossHud) bossHud.classList.add('hidden');
    }

    // 5. Combo Counter
    const comboContainer = document.getElementById('comboContainer');
    if (this.combat.comboCount > 0) {
      if (comboContainer) comboContainer.classList.remove('hidden');
      const hitsEl = document.getElementById('comboHits');
      const rankEl = document.getElementById('comboRank');
      const dmgEl = document.getElementById('comboDamage');

      if (hitsEl) hitsEl.textContent = this.combat.comboCount;
      if (rankEl) rankEl.textContent = this.combat.comboRank;
      if (dmgEl) dmgEl.textContent = `+${this.combat.comboDamageTotal} DMG`;
    } else {
      if (comboContainer) comboContainer.classList.add('hidden');
    }

    // 6. Interaction Prompts
    this.checkInteractionPrompts();

    // 7. Radar Minimap Update
    this.updateMinimap();
  }

  updateCdSlot(elementId, current, max) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (current > 0) {
      el.style.height = `${(current / max) * 100}%`;
    } else {
      el.style.height = '0%';
    }
  }

  checkInteractionPrompts() {
    const prompt = document.getElementById('interactPrompt');
    const textEl = document.getElementById('interactText');
    if (!prompt || !this.game || !this.game.char) return;

    const p = this.game.char.position;
    let found = false;

    // Check Chests
    for (const c of this.world.chests) {
      if (!c.userData.isOpened && p.distanceTo(c.position) < 3.2) {
        if (textEl) textEl.textContent = `Open ${c.userData.name}`;
        prompt.classList.remove('hidden');
        found = true;
        break;
      }
    }

    // Check Shrines
    if (!found) {
      for (const s of this.world.shrines) {
        if (p.distanceTo(s.position) < 4.0) {
          if (textEl) textEl.textContent = `Pray at ${s.userData.name} (Heal & Save)`;
          prompt.classList.remove('hidden');
          found = true;
          break;
        }
      }
    }

    // Check NPCs
    if (!found) {
      for (const n of this.world.npcs) {
        if (p.distanceTo(n.position) < 3.5) {
          if (textEl) textEl.textContent = `Speak with ${n.userData.name}`;
          prompt.classList.remove('hidden');
          found = true;
          break;
        }
      }
    }

    if (!found) {
      prompt.classList.add('hidden');
    }
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3200);
  }
}

window.UIController = UIController;
