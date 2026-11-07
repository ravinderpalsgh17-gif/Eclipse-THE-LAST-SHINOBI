/**
 * ECLIPSE: THE LAST SHINOBI - 3D ENEMIES & BOSS ENGINE
 * Void Lurkers, Corrupted Ninjas, Void Sorcerers, and Legendary Multi-Phase Bosses:
 * General Kurogane & Malakor (Voidborn Dragon Sovereign).
 */

class EnemyManager {
  constructor(scene, particleSystem, world = null) {
    this.scene = scene;
    this.particles = particleSystem;
    this.world = world;
    this.enemies = [];
    this.activeBoss = null;
  }

  // =========================================================================
  // ENEMY SPAWNING FACTORY
  // =========================================================================

  spawnEnemy(type, x, z, y = null) {
    let enemy = null;
    const groundY = (y !== null && y !== undefined && y !== 0) 
      ? y 
      : ((this.world && typeof this.world.getTerrainHeight === 'function') ? this.world.getTerrainHeight(x, z) : 0);

    if (type === 'void_lurker') {
      enemy = this.createVoidLurker(x, groundY, z);
    } else if (type === 'corrupted_ninja') {
      enemy = this.createCorruptedNinja(x, groundY, z);
    } else if (type === 'void_sorcerer') {
      enemy = this.createVoidSorcerer(x, groundY + 1.2, z);
    } else if (type === 'boss_kurogane') {
      enemy = this.createBossKurogane(x, groundY, z);
      this.activeBoss = enemy;
    } else if (type === 'boss_malakor') {
      enemy = this.createBossMalakor(x, groundY + 2.0, z);
      this.activeBoss = enemy;
    }

    if (enemy) {
      this.enemies.push(enemy);
      this.scene.add(enemy.mesh);
    }
    return enemy;
  }

  // =========================================================================
  // TYPE 1: VOID LURKER (QUADRUPEDAL SHADOW PREDATOR)
  // =========================================================================

  createVoidLurker(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const voidMat = new THREE.MeshStandardMaterial({ color: 0x18122b, roughness: 0.4, metalness: 0.7 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xc77dff });

    // Body
    const bodyGeom = new THREE.BoxGeometry(0.8, 0.6, 1.4);
    const body = new THREE.Mesh(bodyGeom, voidMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeom = new THREE.ConeGeometry(0.35, 0.7, 4);
    headGeom.rotateX(Math.PI * 0.5);
    const head = new THREE.Mesh(headGeom, voidMat);
    head.position.set(0, 0.7, 0.9);
    group.add(head);

    // Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
    eyeL.position.set(-0.16, 0.75, 1.05);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
    eyeR.position.set(0.16, 0.75, 1.05);
    group.add(eyeR);

    // 4 Shadow Legs
    const legPositions = [
      [-0.45, 0.3, 0.5], [0.45, 0.3, 0.5],
      [-0.45, 0.3, -0.5], [0.45, 0.3, -0.5]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const legGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6);
      const leg = new THREE.Mesh(legGeom, voidMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    return {
      type: 'void_lurker',
      name: 'Void Lurker',
      mesh: group,
      hp: 350,
      maxHp: 350,
      stagger: 0,
      maxStagger: 100,
      attackPower: 65,
      speed: 8.5,
      attackRange: 2.2,
      cooldown: 0,
      state: 'patrol', // 'patrol', 'chase', 'attack', 'stagger', 'dead'
      stateTimer: 0,
      isBoss: false
    };
  }

  // =========================================================================
  // TYPE 2: CORRUPTED SHADOW NINJA
  // =========================================================================

  createCorruptedNinja(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x221830, roughness: 0.6 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.8 });

    // Torso
    const torsoGeom = new THREE.BoxGeometry(0.65, 0.8, 0.4);
    const torso = new THREE.Mesh(torsoGeom, armorMat);
    torso.position.y = 1.1;
    torso.castShadow = true;
    group.add(torso);

    // Head with demonic horns
    const headGeom = new THREE.SphereGeometry(0.24, 8, 8);
    const head = new THREE.Mesh(headGeom, armorMat);
    head.position.y = 1.75;
    head.castShadow = true;
    group.add(head);

    // Red eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.02), eyeMat);
    eyeL.position.set(-0.09, 1.76, 0.24);
    group.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.02), eyeMat);
    eyeR.position.set(0.09, 1.76, 0.24);
    group.add(eyeR);

    // Spear / Naginata Weapon
    const shaftGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8);
    const shaft = new THREE.Mesh(shaftGeom, armorMat);
    shaft.position.set(0.45, 1.2, 0.3);
    shaft.rotation.x = Math.PI * 0.35;
    group.add(shaft);

    const spearBlade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 4), metalMat);
    spearBlade.position.set(0.45, 2.1, 0.85);
    spearBlade.rotation.x = Math.PI * 0.35;
    group.add(spearBlade);

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), armorMat);
    legL.position.set(-0.2, 0.4, 0);
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), armorMat);
    legR.position.set(0.2, 0.4, 0);
    legR.castShadow = true;
    group.add(legR);

    return {
      type: 'corrupted_ninja',
      name: 'Corrupted Shinobi',
      mesh: group,
      hp: 550,
      maxHp: 550,
      stagger: 0,
      maxStagger: 120,
      attackPower: 90,
      speed: 6.5,
      attackRange: 3.2,
      cooldown: 0,
      state: 'patrol',
      stateTimer: 0,
      isBoss: false
    };
  }

  // =========================================================================
  // TYPE 3: VOIDBORN SORCERER
  // =========================================================================

  createVoidSorcerer(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y + 0.8, z); // Levitating

    const robeMat = new THREE.MeshStandardMaterial({ color: 0x3c096c, roughness: 0.5 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });

    // Flowing Robe cone
    const robeGeom = new THREE.ConeGeometry(0.7, 1.8, 8);
    const robe = new THREE.Mesh(robeGeom, robeMat);
    robe.position.y = 0.9;
    robe.castShadow = true;
    group.add(robe);

    // Floating Grimoire Book
    const bookGeom = new THREE.BoxGeometry(0.4, 0.5, 0.1);
    const book = new THREE.Mesh(bookGeom, robeMat);
    book.position.set(0.6, 1.3, 0.5);
    group.add(book);

    // Levitating Void Orb
    const orbGeom = new THREE.SphereGeometry(0.25, 8, 8);
    const orb = new THREE.Mesh(orbGeom, glowMat);
    orb.position.set(-0.6, 1.4, 0.4);
    group.add(orb);

    return {
      type: 'void_sorcerer',
      name: 'Void Sorcerer',
      mesh: group,
      hp: 420,
      maxHp: 420,
      stagger: 0,
      maxStagger: 80,
      attackPower: 110,
      speed: 4.5,
      attackRange: 16.0,
      cooldown: 0,
      state: 'patrol',
      stateTimer: 0,
      isBoss: false
    };
  }

  // =========================================================================
  // BOSS 1: GENERAL KUROGANE (THE CORRUPTED BLADE)
  // =========================================================================

  createBossKurogane(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.set(1.5, 1.5, 1.5); // Colossal warlord presence

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x1f1a24, roughness: 0.3, metalness: 0.85 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0x9e2a2b, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.9, roughness: 0.2 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.1 });
    const bloodGlow = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    // Heavy Plated Torso
    const torsoGeom = new THREE.BoxGeometry(0.85, 1.0, 0.55);
    const torso = new THREE.Mesh(torsoGeom, armorMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    group.add(torso);

    // Oni Kabuto Helmet with golden crest
    const helmGeom = new THREE.SphereGeometry(0.35, 12, 12);
    const helm = new THREE.Mesh(helmGeom, armorMat);
    helm.position.y = 2.1;
    helm.castShadow = true;
    group.add(helm);

    const crestGeom = new THREE.ConeGeometry(0.4, 0.6, 4);
    const crest = new THREE.Mesh(crestGeom, goldMat);
    crest.position.set(0, 2.5, 0.1);
    group.add(crest);

    // Glowing Crimson Eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.02), bloodGlow);
    eyeL.position.set(-0.12, 2.12, 0.35);
    group.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.02), bloodGlow);
    eyeR.position.set(0.12, 2.12, 0.35);
    group.add(eyeR);

    // Shoulder Armor Plates (Sode)
    const sodeGeom = new THREE.BoxGeometry(0.35, 0.6, 0.5);
    const sodeL = new THREE.Mesh(sodeGeom, redMat);
    sodeL.position.set(-0.65, 1.6, 0);
    group.add(sodeL);

    const sodeR = new THREE.Mesh(sodeGeom, redMat);
    sodeR.position.set(0.65, 1.6, 0);
    group.add(sodeR);

    // Colossal Demonic Odachi Greatsword
    const bladeGeom = new THREE.BoxGeometry(0.08, 2.8, 0.18);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.set(0.75, 1.5, 0.6);
    blade.rotation.x = Math.PI * 0.4;
    blade.castShadow = true;
    group.add(blade);

    // Glowing Red Hamon Edge
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.8, 0.04), bloodGlow);
    edge.position.set(0.75, 1.5, 0.69);
    edge.rotation.x = Math.PI * 0.4;
    group.add(edge);

    // Heavy Armored Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), armorMat);
    legL.position.set(-0.25, 0.45, 0);
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), armorMat);
    legR.position.set(0.25, 0.45, 0);
    legR.castShadow = true;
    group.add(legR);

    return {
      type: 'boss_kurogane',
      name: 'General Kurogane',
      title: 'The Corrupted Sovereign Blade',
      mesh: group,
      hp: 3500,
      maxHp: 3500,
      stagger: 0,
      maxStagger: 250,
      attackPower: 160,
      speed: 7.2,
      attackRange: 4.8,
      phase: 1, // Phase 1: Heavy iaido; Phase 2 (<50% HP): Enraged Blood Tempest
      cooldown: 0,
      state: 'patrol',
      stateTimer: 0,
      isBoss: true
    };
  }

  // =========================================================================
  // BOSS 2: MALAKOR (THE VOIDBORN DRAGON SOVEREIGN)
  // =========================================================================

  createBossMalakor(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y + 2, z);
    group.scale.set(2.4, 2.4, 2.4); // Colossal Dragon scale

    const scalesMat = new THREE.MeshStandardMaterial({ color: 0x0f0b1a, roughness: 0.3, metalness: 0.9 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x3c096c, roughness: 0.2 });
    const voidGlow = new THREE.MeshBasicMaterial({ color: 0xc77dff, transparent: true, opacity: 0.95 });

    // Dragon Torso / Spine
    const bodyGeom = new THREE.ConeGeometry(1.2, 3.4, 8);
    bodyGeom.rotateX(Math.PI * 0.5);
    const body = new THREE.Mesh(bodyGeom, scalesMat);
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Dragon Head with jaws & horns
    const headGeom = new THREE.ConeGeometry(0.65, 1.6, 6);
    headGeom.rotateX(Math.PI * 0.5);
    const head = new THREE.Mesh(headGeom, scalesMat);
    head.position.set(0, 1.8, 2.2);
    head.castShadow = true;
    group.add(head);

    // Horns
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 4), hornMat);
    hornL.position.set(-0.4, 2.4, 1.8);
    hornL.rotation.set(-0.4, 0, -0.4);
    group.add(hornL);

    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 4), hornMat);
    hornR.position.set(0.4, 2.4, 1.8);
    hornR.rotation.set(-0.4, 0, 0.4);
    group.add(hornR);

    // Glowing Void Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), voidGlow);
    eyeL.position.set(-0.35, 1.9, 2.3);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), voidGlow);
    eyeR.position.set(0.35, 1.9, 2.3);
    group.add(eyeR);

    // Spined Tail
    const tailGeom = new THREE.CylinderGeometry(0.2, 0.6, 2.8, 6);
    tailGeom.rotateX(Math.PI * 0.4);
    const tail = new THREE.Mesh(tailGeom, scalesMat);
    tail.position.set(0, 0.8, -2.2);
    tail.castShadow = true;
    group.add(tail);

    // Colossal Void Wings
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x7b2cbf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const wingLGeom = new THREE.BufferGeometry();
    const wingLVertices = new Float32Array([
      0, 1.2, 0,
      -4.5, 3.8, -1.2,
      -2.0, -0.4, -0.6,
      -5.5, 5.2, -1.8,
      -3.0, 1.5, -0.8,
      -6.8, 2.4, -2.2
    ]);
    wingLGeom.setAttribute('position', new THREE.BufferAttribute(wingLVertices, 3));
    wingLGeom.computeVertexNormals();
    const wingL = new THREE.Mesh(wingLGeom, wingMat);
    group.add(wingL);

    const wingRGeom = new THREE.BufferGeometry();
    const wingRVertices = new Float32Array([
      0, 1.2, 0,
      4.5, 3.8, -1.2,
      2.0, -0.4, -0.6,
      5.5, 5.2, -1.8,
      3.0, 1.5, -0.8,
      6.8, 2.4, -2.2
    ]);
    wingRGeom.setAttribute('position', new THREE.BufferAttribute(wingRVertices, 3));
    wingRGeom.computeVertexNormals();
    const wingR = new THREE.Mesh(wingRGeom, wingMat);
    group.add(wingR);

    return {
      type: 'boss_malakor',
      name: 'Malakor, Sovereign of the Void',
      title: 'Ancient Cataclysm Dragon',
      mesh: group,
      hp: 6000,
      maxHp: 6000,
      stagger: 0,
      maxStagger: 400,
      attackPower: 220,
      speed: 6.0,
      attackRange: 8.5,
      phase: 1, // Phase 1: Ground breath; Phase 2 (<50% HP): Sky Meteor Cataclysm
      cooldown: 0,
      state: 'patrol',
      stateTimer: 0,
      isBoss: true
    };
  }

  // =========================================================================
  // AI UPDATE LOOP & COMBAT LOGIC
  // =========================================================================

  update(delta, playerPos, onEnemyAttack) {
    if (!playerPos) return;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp <= 0) {
        // Defeated animation / dissolve
        e.mesh.position.y -= delta * 2.0;
        e.mesh.scale.multiplyScalar(0.95);
        if (e.mesh.scale.x < 0.1) {
          this.scene.remove(e.mesh);
          this.enemies.splice(i, 1);
          if (this.activeBoss === e) {
            this.activeBoss = null;
          }
        }
        continue;
      }

      // Stagger recovery
      if (e.stagger >= e.maxStagger) {
        e.state = 'stagger';
        e.stateTimer = 3.5; // Stunned for 3.5s
        e.stagger = 0;
      }

      if (e.state === 'stagger') {
        e.stateTimer -= delta;
        e.mesh.rotation.x = 0.3; // Dropping to knee
        if (e.stateTimer <= 0) {
          e.state = 'chase';
          e.mesh.rotation.x = 0;
        }
        continue;
      }

      // Distance to Player
      const dist = e.mesh.position.distanceTo(playerPos);
      const dir = new THREE.Vector3().subVectors(playerPos, e.mesh.position);
      dir.y = 0;
      dir.normalize();

      // Look towards player
      if (dist < 35) {
        e.mesh.lookAt(playerPos.x, e.mesh.position.y, playerPos.z);
      }

      // Check Boss Phase transition
      if (e.isBoss && e.hp < e.maxHp * 0.5 && e.phase === 1) {
        e.phase = 2;
        e.speed *= 1.35;
        e.attackPower *= 1.25;
        this.particles.spawnSparks(e.mesh.position, 40, 0xff0055);
        if (window.soundEngine) window.soundEngine.playAwakening();
      }

      // State Machine
      if (dist <= e.attackRange) {
        // In Attack Range
        e.cooldown -= delta;
        if (e.cooldown <= 0) {
          e.cooldown = e.isBoss ? 1.8 : 2.4;
          if (onEnemyAttack) {
            onEnemyAttack(e);
          }
        }
      } else if (dist < 32) {
        // Chase Player
        e.mesh.position.addScaledVector(dir, e.speed * delta);
        if (this.world && typeof this.world.getTerrainHeight === 'function') {
          const groundY = this.world.getTerrainHeight(e.mesh.position.x, e.mesh.position.z);
          e.mesh.position.y = groundY + (e.type === 'malakor' ? 3.5 : 0);
        }
      }
    }
  }

  applyDamageToEnemy(enemy, amount, isCrit = false, isVoid = false) {
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.stagger = Math.min(enemy.maxStagger, enemy.stagger + amount * 0.4);

    this.particles.spawnDamageNumber(enemy.mesh.position, amount, isCrit, isVoid);
    this.particles.spawnSparks(enemy.mesh.position, 14, isCrit ? 0xffd166 : isVoid ? 0xc77dff : 0xffffff);

    if (window.soundEngine) {
      window.soundEngine.playBladeClash();
    }

    if (enemy.hp <= 0) {
      if (window.soundEngine) window.soundEngine.playVoidWave();
    }
  }
}

window.EnemyManager = EnemyManager;
