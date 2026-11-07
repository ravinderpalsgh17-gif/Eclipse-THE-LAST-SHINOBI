/**
 * ECLIPSE: THE LAST SHINOBI - REAL-TIME COMBAT ENGINE
 * Sword combos, Hitstop time-dilation, Perfect Parry, Target Lock-on,
 * Ninjutsu skills, Ultimate Cleave, and Combo Ranking System.
 */

class CombatEngine {
  constructor(game, character, enemies, world, particles) {
    this.game = game;
    this.char = character;
    this.enemyManager = enemies;
    this.world = world;
    this.particles = particles;

    // Combat Stats & Resources
    this.hp = 1000;
    this.maxHp = 1000;
    this.stamina = 200;
    this.maxStamina = 200;
    this.voidEnergy = 0; // 0 - 100%
    this.isAwakened = false;
    this.awakenedTimer = 0;

    // Defense & Parry States
    this.isGuarding = false;
    this.parryWindow = 0; // Active parry timing frame
    this.isDodging = false;
    this.dodgeTimer = 0;
    this.iFrames = false;

    // Combo Tracking
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboDamageTotal = 0;
    this.comboRank = 'D';

    // Skill Cooldowns (in seconds)
    this.cooldowns = {
      skill1: 0, // Shadow Dash (5s)
      skill2: 0, // Void Wave (7s)
      skill3: 0, // Thunder Step (9s)
      ultimate: 0 // Eclipse Cleave (25s)
    };
    this.maxCooldowns = {
      skill1: 5.0,
      skill2: 7.0,
      skill3: 9.0,
      ultimate: 25.0
    };

    // Target Lock-On
    this.lockedTarget = null;

    // Hitstop / Time Dilation
    this.hitstopTimer = 0;
  }

  // =========================================================================
  // BASIC ATTACKS & COMBOS
  // =========================================================================

  performLightAttack() {
    if (this.stamina < 15 || this.isDodging) return;

    // Check combo sequence
    const comboStep = this.char.animState === 'attack' ? (this.char.attackIndex + 1) % 4 : 0;
    this.char.triggerAttackCombo(comboStep);

    this.consumeStamina(15);
    this.addVoidEnergy(4);

    if (window.soundEngine) {
      window.soundEngine.playSlash(comboStep === 3 ? 'heavy' : 'light');
    }

    // Direction facing
    const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);

    // Spawn 3D sword arc
    const arcColor = this.isAwakened ? 0xc77dff : 0x00f0ff;
    this.particles.spawnSlashArc(this.char.position, forward, 2.6, arcColor);

    // Hit detection against enemies (with aerial_cleave passive support)
    const hasAerial = this.game && this.game.prog && this.game.prog.unlockedSkills.has('aerial_cleave');
    const baseDamage = 85 + comboStep * 20 + (hasAerial && comboStep === 3 ? 60 : 0);
    this.checkHitbox(forward, 2.8, baseDamage, false);

    // If awakened, fire void wave automatically with basic attacks
    if (this.isAwakened) {
      this.particles.spawnVoidWaveProjectile(this.char.position, forward);
    }
  }

  performHeavyAttack() {
    if (this.stamina < 35 || this.isDodging) return;

    this.char.playAnimation('heavy', 0.45);
    this.consumeStamina(35);
    this.addVoidEnergy(8);

    if (window.soundEngine) {
      window.soundEngine.playSlash('heavy');
    }

    const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);
    const hasDragonFire = this.game && this.game.prog && this.game.prog.unlockedSkills.has('dragon_fire');
    if (hasDragonFire) {
      this.particles.spawnSparks(this.char.position, 25, 0xff4500);
      this.particles.spawnSlashArc(this.char.position, forward, 3.6, 0xff4500);
    } else {
      this.particles.spawnSlashArc(this.char.position, forward, 3.4, 0xffd166);
    }

    // Piercing heavy strike (High stagger damage)
    this.checkHitbox(forward, 3.6, hasDragonFire ? 260 : 175, true);
  }

  // =========================================================================
  // DEFENSIVE MECHANICS: DODGE, GUARD & PERFECT PARRY
  // =========================================================================

  startGuard() {
    if (this.stamina < 10) return;
    this.isGuarding = true;
    this.parryWindow = 0.22; // 220ms perfect parry window
    this.char.playAnimation('guard', 999);
  }

  stopGuard() {
    this.isGuarding = false;
    this.parryWindow = 0;
    if (this.char.animState === 'guard') {
      this.char.animState = 'idle';
    }
  }

  performDodge(dirVector) {
    if (this.stamina < 25 || this.isDodging) return;

    this.isDodging = true;
    this.dodgeTimer = 0.38;
    this.iFrames = true;
    this.consumeStamina(25);

    this.char.playAnimation('dash', 0.38);

    if (window.soundEngine) {
      window.soundEngine.playDash();
    }

    // High speed impulse in movement direction
    const dashDir = (dirVector && dirVector.lengthSq() > 0.01) ? dirVector.clone().normalize() : new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);
    this.char.velocity.copy(dashDir.multiplyScalar(22));

    // Spawn shadow decoy sparks if shadow_dash is unlocked
    if (this.game && this.game.prog && this.game.prog.unlockedSkills.has('shadow_dash')) {
      this.particles.spawnSparks(this.char.position, 15, 0x9d4edd);
    }
  }

  // =========================================================================
  // NINJUTSU SPECIAL SKILLS
  // =========================================================================

  useSkill1() {
    // Shadow Dash
    if (this.cooldowns.skill1 > 0 || this.stamina < 30) return;
    this.cooldowns.skill1 = this.maxCooldowns.skill1;
    this.consumeStamina(30);

    const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);
    const startPos = this.char.position.clone();
    const endPos = startPos.clone().addScaledVector(forward, 10);
    if (this.world && typeof this.world.getTerrainHeight === 'function') {
      endPos.y = this.world.getTerrainHeight(endPos.x, endPos.z);
    }

    // Teleport dash & electric trail
    this.particles.spawnThunderDashTrail(startPos, endPos);
    this.char.position.copy(endPos);

    if (window.soundEngine) window.soundEngine.playDash();

    // Damage all targets in path
    this.checkHitbox(forward, 10.0, 160, true);
    this.addCombo(1, 160);
  }

  useSkill2() {
    // Void Crescent Wave
    if (this.cooldowns.skill2 > 0 || this.stamina < 40) return;
    this.cooldowns.skill2 = this.maxCooldowns.skill2;
    this.consumeStamina(40);

    const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);
    this.particles.spawnVoidWaveProjectile(this.char.position, forward);

    if (window.soundEngine) window.soundEngine.playVoidWave();
    if (window.voiceEngine) window.voiceEngine.speak('Void Crescent Wave!', 'ren');

    this.checkHitbox(forward, 8.0, 220, false, true);
  }

  useSkill3() {
    // Thunder Step
    if (this.cooldowns.skill3 > 0 || this.stamina < 50) return;
    this.cooldowns.skill3 = this.maxCooldowns.skill3;
    this.consumeStamina(50);

    const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);
    const targetPos = this.char.position.clone().addScaledVector(forward, 14);
    if (this.world && typeof this.world.getTerrainHeight === 'function') {
      targetPos.y = this.world.getTerrainHeight(targetPos.x, targetPos.z);
    }

    this.particles.spawnThunderDashTrail(this.char.position, targetPos);
    this.char.position.copy(targetPos);

    if (window.soundEngine) window.soundEngine.playThunderStep();
    if (window.voiceEngine) window.voiceEngine.speak('Thunder Step!', 'ren');

    const hasThunderGod = this.game && this.game.prog && this.game.prog.unlockedSkills.has('thunder_god');
    const radius = hasThunderGod ? 10.0 : 6.0;
    const damage = hasThunderGod ? 420 : 280;
    if (hasThunderGod) {
      this.particles.spawnSparks(this.char.position, 35, 0x00f0ff);
    }
    this.checkRadialHitbox(this.char.position, radius, damage, true);
  }

  useUltimate() {
    // Secret Art: Eclipse Horizon Cleave
    if (this.cooldowns.ultimate > 0 || this.voidEnergy < 80) return;
    this.cooldowns.ultimate = this.maxCooldowns.ultimate;
    this.voidEnergy = Math.max(0, this.voidEnergy - 80);

    this.hitstopTimer = 1.4; // Time slow

    if (window.soundEngine) window.soundEngine.playUltimate();
    if (window.voiceEngine) window.voiceEngine.speak('Secret Art: Eclipse Horizon Cleave!', 'ren');

    // Cinematic screen shake & radial slashes
    const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.char.root.rotation);
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const randAngle = (i / 8) * Math.PI * 2;
        const dir = new THREE.Vector3(Math.cos(randAngle), 0, Math.sin(randAngle));
        this.particles.spawnSlashArc(this.char.position, dir, 7.5, 0xc77dff);
      }, i * 100);
    }

    const hasSever = this.game && this.game.prog && this.game.prog.unlockedSkills.has('dimensional_sever');
    const ultDamage = hasSever ? 1350 : 850;
    setTimeout(() => {
      this.checkRadialHitbox(this.char.position, 14.0, ultDamage, true, true);
    }, 900);
  }

  toggleAwakening() {
    if (!this.isAwakened && this.voidEnergy >= 100) {
      this.isAwakened = true;
      const hasCore = this.game && this.game.prog && this.game.prog.unlockedSkills.has('void_core');
      this.awakenedTimer = hasCore ? 30.0 : 20.0;
      this.voidEnergy = 100;
      this.char.setAwakened(true);

      if (window.soundEngine) window.soundEngine.playAwakening();
      if (window.voiceEngine) window.voiceEngine.speak('Awaken, Umbral Core of the Eclipse!', 'ren');

      const overlay = document.getElementById('awakeningOverlay');
      if (overlay) overlay.classList.remove('hidden');
    }
  }

  // =========================================================================
  // HIT DETECTION & DAMAGE CALCULATIONS
  // =========================================================================

  checkHitbox(forward, range, baseDamage, isHeavy = false, isVoid = false) {
    const origin = this.char.position;
    let hitAny = false;

    // 1. Check Enemies
    this.enemyManager.enemies.forEach(enemy => {
      if (enemy.hp <= 0) return;

      const toEnemy = new THREE.Vector3().subVectors(enemy.mesh.position, origin);
      const dist = toEnemy.length();

      if (dist <= range) {
        toEnemy.normalize();
        const dot = forward.dot(toEnemy);

        if (dot > 0.4) { // 90 degree front cone
          const isCrit = Math.random() < 0.25;
          const finalDamage = Math.floor(baseDamage * (isCrit ? 1.8 : 1.0) * (this.isAwakened ? 1.5 : 1.0));

          this.enemyManager.applyDamageToEnemy(enemy, finalDamage, isCrit, isVoid || this.isAwakened);
          this.addCombo(1, finalDamage);
          hitAny = true;

          // Hitstop frame
          this.hitstopTimer = isHeavy ? 0.08 : 0.04;
        }
      }
    });

    // 2. Check Destructibles (Bamboo, Crates, Training Dummies)
    this.world.destructibles.forEach(obj => {
      if (obj.userData && obj.userData.isDestructible) {
        const dist = origin.distanceTo(obj.position);
        if (dist <= range + 1.0) {
          obj.userData.hp -= baseDamage;
          this.particles.spawnSparks(obj.position, 10, obj.userData.color || 0x8b5a2b);

          if (obj.userData.hp <= 0) {
            this.particles.spawnDebris(obj.position, 12, obj.userData.color || 0x8b5a2b);
            this.world.scene.remove(obj);
            obj.userData.isDestructible = false;
          }
        }
      }
    });

    return hitAny;
  }

  checkRadialHitbox(origin, radius, damage, isHeavy = false, isVoid = false) {
    this.enemyManager.enemies.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const dist = origin.distanceTo(enemy.mesh.position);
      if (dist <= radius) {
        const isCrit = Math.random() < 0.3;
        const finalDamage = Math.floor(damage * (isCrit ? 1.75 : 1.0));
        this.enemyManager.applyDamageToEnemy(enemy, finalDamage, isCrit, isVoid);
        this.addCombo(1, finalDamage);
      }
    });
  }

  // =========================================================================
  // ENEMY ATTACK RECEIVER & DAMAGE MITIGATION
  // =========================================================================

  takeDamageFromEnemy(enemy) {
    if (this.iFrames || this.hp <= 0) return;

    // Check Perfect Parry
    if (this.isGuarding && this.parryWindow > 0) {
      // PERFECT PARRY SUCCESS!
      this.hitstopTimer = 1.0; // Slow down time
      this.stamina = Math.min(this.maxStamina, this.stamina + 60);
      this.addVoidEnergy(20);

      this.particles.spawnSparks(this.char.position, 30, 0xffd166);
      if (window.soundEngine) window.soundEngine.playPerfectParry();

      // Stagger attacker
      enemy.stagger = Math.min(enemy.maxStagger, enemy.stagger + 80);

      // Check parry_counter passive
      if (this.game && this.game.prog && this.game.prog.unlockedSkills.has('parry_counter')) {
        const counterDamage = Math.floor(220 * (this.isAwakened ? 1.5 : 1.0));
        this.enemyManager.applyDamageToEnemy(enemy, counterDamage, true, true);
        this.particles.spawnSlashArc(enemy.mesh.position, new THREE.Vector3(0, 0, 1), 3.0, 0xffd166);
        this.addCombo(2, counterDamage);
      }
      return;
    }

    // Standard Block
    if (this.isGuarding) {
      const reducedDamage = Math.floor(enemy.attackPower * 0.2);
      this.hp = Math.max(0, this.hp - reducedDamage);
      this.consumeStamina(20);

      this.particles.spawnSparks(this.char.position, 12, 0x00f0ff);
      if (window.soundEngine) window.soundEngine.playBladeClash();
      return;
    }

    // Full Hit taken
    this.hp = Math.max(0, this.hp - enemy.attackPower);
    this.char.playAnimation('hit', 0.25);
    this.resetCombo();

    // Red vignette flash
    const vignette = document.getElementById('hitVignette');
    if (vignette) {
      vignette.style.opacity = '1.0';
      setTimeout(() => { vignette.style.opacity = '0'; }, 200);
    }

    if (window.soundEngine) window.soundEngine.playBladeClash();
  }

  // =========================================================================
  // TARGET LOCK-ON LOGIC
  // =========================================================================

  toggleLockOn() {
    if (this.lockedTarget) {
      this.lockedTarget = null;
    } else {
      let closest = null;
      let closestDist = 35;

      this.enemyManager.enemies.forEach(e => {
        if (e.hp > 0) {
          const dist = this.char.position.distanceTo(e.mesh.position);
          if (dist < closestDist) {
            closestDist = dist;
            closest = e;
          }
        }
      });

      this.lockedTarget = closest;
    }
  }

  // =========================================================================
  // COMBO SYSTEM
  // =========================================================================

  addCombo(hits, damage) {
    this.comboCount += hits;
    this.comboDamageTotal += damage;
    this.comboTimer = 3.5; // 3.5s window to maintain combo

    if (this.comboCount >= 25) this.comboRank = 'SSS';
    else if (this.comboCount >= 18) this.comboRank = 'SS';
    else if (this.comboCount >= 12) this.comboRank = 'S';
    else if (this.comboCount >= 7) this.comboRank = 'A';
    else if (this.comboCount >= 4) this.comboRank = 'B';
    else this.comboRank = 'C';
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboDamageTotal = 0;
    this.comboTimer = 0;
  }

  consumeStamina(amount) {
    this.stamina = Math.max(0, this.stamina - amount);
  }

  addVoidEnergy(amount) {
    const mult = (this.game && this.game.prog && this.game.prog.unlockedSkills.has('void_core')) ? 1.5 : 1.0;
    this.voidEnergy = Math.min(100, this.voidEnergy + Math.floor(amount * mult));
  }

  // =========================================================================
  // UPDATE LOOP
  // =========================================================================

  update(delta) {
    // Cooldown ticks
    for (const key in this.cooldowns) {
      if (this.cooldowns[key] > 0) {
        this.cooldowns[key] = Math.max(0, this.cooldowns[key] - delta);
      }
    }

    // Parry window tick
    if (this.parryWindow > 0) {
      this.parryWindow -= delta;
    }

    // Dodge timer & i-frames
    if (this.isDodging) {
      this.dodgeTimer -= delta;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.iFrames = false;
      }
    }

    // Awakening duration
    if (this.isAwakened) {
      this.awakenedTimer -= delta;
      const maxAwakenTime = (this.game && this.game.prog && this.game.prog.unlockedSkills.has('void_core')) ? 30.0 : 20.0;
      this.voidEnergy = Math.max(0, (this.awakenedTimer / maxAwakenTime) * 100);
      this.stamina = this.maxStamina; // Unlimited stamina during awakening

      if (this.awakenedTimer <= 0) {
        this.isAwakened = false;
        this.voidEnergy = 0;
        this.char.setAwakened(false);
        const overlay = document.getElementById('awakeningOverlay');
        if (overlay) overlay.classList.add('hidden');
      }
    } else {
      // Natural Stamina Regeneration
      if (!this.isGuarding) {
        this.stamina = Math.min(this.maxStamina, this.stamina + 45 * delta);
      }
    }

    // Combo timer tick
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    // Hitstop tick
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= delta;
    }
  }
}

window.CombatEngine = CombatEngine;
