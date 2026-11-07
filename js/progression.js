/**
 * ECLIPSE: THE LAST SHINOBI - PROGRESSION & INVENTORY SYSTEM
 * Leveling, Stats, Equipment, Interactive Skill Tree,
 * Currency Wallet (Gold & Void Shards), and LocalStorage Persistence.
 */

class ProgressionManager {
  constructor(combatEngine) {
    this.combat = combatEngine;

    // Active Character Profile
    this.activeChar = 'ren'; // 'ren', 'ayame', 'kaito'

    // Base Progression Stats
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 200;
    this.skillPoints = 1;

    // Currencies
    this.gold = 250;
    this.voidShards = 5;

    // Character Base Stats
    this.baseStats = {
      maxHp: 1000,
      maxStamina: 200,
      attackPower: 125,
      defense: 45,
      voidPower: 80,
      critRate: 0.15
    };

    // Equipped Gear
    this.equipped = {
      weapon: { id: 'w_shadow_katana', name: 'Shadow Katana', type: 'weapon', atk: 25, rarity: 'Common' },
      offhand: { id: 'w_sunburst_wakizashi', name: 'Sunburst Wakizashi', type: 'offhand', atk: 15, rarity: 'Rare' },
      armor: { id: 'a_shinobi_gi', name: 'Shinobi Shadow Gi', type: 'armor', def: 30, rarity: 'Common' },
      relic: { id: 'r_seven_seal', name: 'Seven Sovereigns Seal', type: 'relic', hp: 50, void: 10, rarity: 'Epic' }
    };

    // Inventory Items Array
    this.inventory = [
      { id: 'pot_heal_1', name: 'Healing Elixir', type: 'consumable', count: 3, desc: 'Restores 400 HP instantly.', icon: '🧪' },
      { id: 'w_thunder_nodachi', name: 'Thunder Dragon Nodachi', type: 'weapon', atk: 65, rarity: 'Epic', desc: 'Heavy two-handed greatsword surging with lightning.', icon: '⚡' },
      { id: 'w_gale_daggers', name: 'Gale Kunoichi Daggers', type: 'offhand', atk: 35, rarity: 'Rare', desc: 'Light razor-sharp daggers that strike like wind.', icon: '🗡️' },
      { id: 'a_eclipse_armor', name: 'Eclipse Sovereign Plate', type: 'armor', def: 85, rarity: 'Legendary', desc: 'Forged from corrupted obsidian and fallen stars.', icon: '🥋' },
      { id: 'r_void_heart', name: 'Heart of the Umbral Core', type: 'relic', hp: 200, void: 25, rarity: 'Legendary', desc: 'Pulsing core of ancient void energy.', icon: '🔮' }
    ];

    // Unlocked Skill Tree Nodes
    this.unlockedSkills = new Set(['flurry', 'void_wave', 'shadow_dash']);

    this.recalculateStats();
    this.loadFromStorage();
  }

  // =========================================================================
  // EXPERIENCE & LEVELING
  // =========================================================================

  addXp(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNextLevel && this.level < 50) {
      this.xp -= this.xpToNextLevel;
      this.levelUp();
    }
  }

  levelUp() {
    this.level += 1;
    this.skillPoints += 1;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.4);

    // Stat bonuses
    this.baseStats.maxHp += 100;
    this.baseStats.attackPower += 20;
    this.baseStats.defense += 8;
    this.baseStats.voidPower += 15;

    this.recalculateStats();

    // Full restore on level up
    if (this.combat) {
      this.combat.hp = this.combat.maxHp;
      this.combat.stamina = this.combat.maxStamina;
    }

    if (window.soundEngine) window.soundEngine.playLevelUp();

    // Trigger visual banner
    const banner = document.getElementById('levelUpBanner');
    const sub = document.getElementById('levelUpSub');
    if (banner && sub) {
      sub.textContent = `You have reached Level ${this.level}`;
      banner.classList.remove('hidden');
      setTimeout(() => { banner.classList.add('hidden'); }, 3000);
    }
  }

  addCurrencies(gold, shards) {
    this.gold += gold;
    this.voidShards += shards;
  }

  // =========================================================================
  // STAT RECALCULATION
  // =========================================================================

  recalculateStats() {
    let totalHp = this.baseStats.maxHp;
    let totalAtk = this.baseStats.attackPower;
    let totalDef = this.baseStats.defense;
    let totalVoid = this.baseStats.voidPower;
    let crit = this.baseStats.critRate;

    // Apply equipment bonuses
    if (this.equipped.weapon) totalAtk += this.equipped.weapon.atk || 0;
    if (this.equipped.offhand) totalAtk += this.equipped.offhand.atk || 0;
    if (this.equipped.armor) totalDef += this.equipped.armor.def || 0;
    if (this.equipped.relic) {
      totalHp += this.equipped.relic.hp || 0;
      totalVoid += this.equipped.relic.void || 0;
    }

    // Apply Skill Tree passives
    if (this.unlockedSkills.has('void_core')) {
      totalVoid += 30;
    }

    if (this.combat) {
      this.combat.maxHp = totalHp;
      this.combat.hp = Math.min(this.combat.hp, totalHp);
    }

    this.currentStats = {
      hp: totalHp,
      stamina: this.baseStats.maxStamina,
      atk: totalAtk,
      def: totalDef,
      voidPower: totalVoid,
      crit: Math.floor(crit * 100) + '%'
    };
  }

  // =========================================================================
  // INVENTORY & EQUIPMENT ACTIONS
  // =========================================================================

  equipItem(item) {
    if (!item) return;

    if (item.type === 'weapon') {
      const old = this.equipped.weapon;
      this.equipped.weapon = item;
      this.removeItem(item);
      if (old) this.addItem(old);
    } else if (item.type === 'offhand') {
      const old = this.equipped.offhand;
      this.equipped.offhand = item;
      this.removeItem(item);
      if (old) this.addItem(old);
    } else if (item.type === 'armor') {
      const old = this.equipped.armor;
      this.equipped.armor = item;
      this.removeItem(item);
      if (old) this.addItem(old);
    } else if (item.type === 'relic') {
      const old = this.equipped.relic;
      this.equipped.relic = item;
      this.removeItem(item);
      if (old) this.addItem(old);
    }

    this.recalculateStats();
    if (window.soundEngine) window.soundEngine.playUiClick();
  }

  useConsumable(item) {
    if (item.id.startsWith('pot_heal')) {
      if (this.combat) {
        this.combat.hp = Math.min(this.combat.maxHp, this.combat.hp + 400);
      }
      item.count -= 1;
      if (item.count <= 0) {
        this.removeItem(item);
      }
      if (window.soundEngine) window.soundEngine.playChestOpen();
    }
  }

  useQuickPotion() {
    const pot = this.inventory.find(i => i.id.startsWith('pot_heal'));
    if (pot) {
      this.useConsumable(pot);
    }
  }

  addItem(item) {
    const existing = this.inventory.find(i => i.id === item.id);
    if (existing && existing.type === 'consumable') {
      existing.count += (item.count || 1);
    } else {
      this.inventory.push(item);
    }
  }

  removeItem(item) {
    const idx = this.inventory.indexOf(item);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
    }
  }

  // =========================================================================
  // SKILL TREE UNLOCKS
  // =========================================================================

  unlockSkill(skillId) {
    if (this.skillPoints <= 0 || this.unlockedSkills.has(skillId)) return false;

    this.skillPoints -= 1;
    this.unlockedSkills.add(skillId);
    this.recalculateStats();

    if (window.soundEngine) window.soundEngine.playLevelUp();
    return true;
  }

  // =========================================================================
  // PERSISTENCE (LOCAL STORAGE)
  // =========================================================================

  saveToStorage() {
    const data = {
      level: this.level,
      xp: this.xp,
      xpToNextLevel: this.xpToNextLevel,
      skillPoints: this.skillPoints,
      gold: this.gold,
      voidShards: this.voidShards,
      activeChar: this.activeChar,
      equipped: this.equipped,
      inventory: this.inventory,
      unlockedSkills: Array.from(this.unlockedSkills)
    };
    try {
      localStorage.setItem('eclipse_shinobi_save', JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
      return false;
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('eclipse_shinobi_save');
      if (!saved) return false;

      const data = JSON.parse(saved);
      this.level = data.level || 1;
      this.xp = data.xp || 0;
      this.xpToNextLevel = data.xpToNextLevel || 200;
      this.skillPoints = data.skillPoints || 0;
      this.gold = data.gold || 0;
      this.voidShards = data.voidShards || 0;
      this.activeChar = data.activeChar || 'ren';
      if (data.equipped) this.equipped = data.equipped;
      if (data.inventory) this.inventory = data.inventory;
      if (data.unlockedSkills) this.unlockedSkills = new Set(data.unlockedSkills);

      this.recalculateStats();
      return true;
    } catch (e) {
      console.warn('Failed to load save:', e);
      return false;
    }
  }

  resetProgress() {
    localStorage.removeItem('eclipse_shinobi_save');
    location.reload();
  }
}

window.ProgressionManager = ProgressionManager;
