/**
 * ECLIPSE: THE LAST SHINOBI - MASTER GAME ENGINE & LIFECYCLE
 * Three.js WebGL Renderer, Third-Person Combat Camera, Gamepad & Input Controller,
 * Interactive Triggers, Game Loop, and State Machine.
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Subsystems
    this.particles = null;
    this.world = null;
    this.char = null;
    this.enemies = null;
    this.combat = null;
    this.prog = null;
    this.story = null;
    this.ui = null;

    // Camera Orbit & Smoothing
    this.cameraDistance = 7.5;
    this.cameraPitch = 0.28; // Radians
    this.cameraYaw = 0;
    this.cameraTarget = new THREE.Vector3();
    this.isPointerLocked = false;

    // Movement & Input State
    this.keys = {};
    this.mouse = { x: 0, y: 0, isDown: false, rightDown: false };
    this.gamepadIndex = null;

    // Timing
    this.clock = new THREE.Clock();
    this.isRunning = false;

    this.initThree();
    this.initSubsystems();
    this.initInputListeners();
    this.initTitleScreen();
  }

  // =========================================================================
  // THREE.JS WEBGL RENDERER INITIALIZATION
  // =========================================================================

  initThree() {
    this.scene = new THREE.Scene();

    // Perspective Camera (FOV 60, optimal for anime action RPG)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 4K high-DPI
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // =========================================================================
  // SUBSYSTEM INITIALIZATION
  // =========================================================================

  initSubsystems() {
    this.particles = new ParticleSystem(this.scene);
    this.world = new World3D(this.scene, this.particles);
    this.char = new Character3D(this.scene, 'ren');
    this.enemies = new EnemyManager(this.scene, this.particles);
    this.combat = new CombatEngine(this, this.char, this.enemies, this.world, this.particles);
    this.prog = new ProgressionManager(this.combat);
    this.story = new StoryDirector(this, this.combat, this.prog, this.enemies, this.world);
    this.ui = new UIController(this, this.combat, this.prog, this.world, this.enemies, this.story);

    // Initial player placement at Kamitsuki Sacred Pond
    this.char.position.set(0, this.world.getTerrainHeight(0, 0), 0);
  }

  // =========================================================================
  // INPUT HANDLING (KEYBOARD, MOUSE & GAMEPAD API)
  // =========================================================================

  initInputListeners() {
    // Keyboard Down
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;

      // Menu Toggle [M] or [Escape]
      if (e.code === 'KeyM' || e.code === 'Escape') {
        if (this.story.isCutsceneActive) {
          this.story.endCutscene();
        } else {
          this.ui.toggleMenu();
        }
        return;
      }

      // Cutscene Advance [Space]
      if (this.story.isCutsceneActive && e.code === 'Space') {
        this.story.advanceDialogue();
        return;
      }

      // Interaction [E]
      if (e.code === 'KeyE') {
        this.handleWorldInteraction();
        return;
      }

      // Ninjutsu Skills & Combat Hotkeys
      if (e.code === 'KeyQ') this.combat.useSkill1();
      if (e.code === 'KeyR') this.combat.useSkill3();
      if (e.code === 'KeyF') this.combat.useUltimate();
      if (e.code === 'KeyT') this.combat.toggleAwakening();
      if (e.code === 'Digit1') this.prog.useQuickPotion();
      if (e.code === 'Tab') {
        e.preventDefault();
        this.combat.toggleLockOn();
      }

      // Guard / Parry [KeyC]
      if (e.code === 'KeyC') {
        this.combat.startGuard();
      }
    });

    // Keyboard Up
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      if (e.code === 'KeyC') {
        this.combat.stopGuard();
      }
    });

    // Mouse Down (Combat Attacks)
    window.addEventListener('mousedown', e => {
      if (this.story.isCutsceneActive) {
        this.story.advanceDialogue();
        return;
      }
      if (this.ui.isMenuOpen) return;

      if (e.button === 0) {
        // Left Click: Light Attack
        this.combat.performLightAttack();
      } else if (e.button === 2) {
        // Right Click: Heavy Attack
        e.preventDefault();
        this.combat.performHeavyAttack();
      } else if (e.button === 1) {
        // Middle Click: Lock-on
        e.preventDefault();
        this.combat.toggleLockOn();
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', e => e.preventDefault());

    // Mouse Move (Camera Orbit)
    window.addEventListener('mousemove', e => {
      if (this.ui.isMenuOpen || this.story.isCutsceneActive) return;

      const sensitivity = 0.0035;
      this.cameraYaw -= e.movementX * sensitivity;
      this.cameraPitch = Math.max(0.08, Math.min(1.2, this.cameraPitch + e.movementY * sensitivity));
    });

    // Gamepad Connection Listeners
    window.addEventListener('gamepadconnected', e => {
      this.gamepadIndex = e.gamepad.index;
      this.ui.showToast('🎮 Gamepad Connected: ' + e.gamepad.id);
    });
    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadIndex = null;
    });

    // Respawn button
    const btnRespawn = document.getElementById('btnRespawnShrine');
    if (btnRespawn) {
      btnRespawn.addEventListener('click', () => this.respawnAtShrine());
    }
  }

  // =========================================================================
  // WORLD INTERACTION (CHESTS, SHRINES, NPCS)
  // =========================================================================

  handleWorldInteraction() {
    const p = this.char.position;

    // 1. Check Treasure Chests
    for (const c of this.world.chests) {
      if (!c.userData.isOpened && p.distanceTo(c.position) < 3.2) {
        c.userData.isOpened = true;
        c.userData.lidMesh.rotation.x = -Math.PI * 0.45; // Open lid

        const r = c.userData.reward;
        this.prog.addCurrencies(r.gold || 0, r.shards || 0);
        if (r.potion) this.prog.addItem({ id: 'pot_heal_loot', name: 'Healing Elixir', type: 'consumable', count: r.potion, desc: 'Restores 400 HP instantly.', icon: '🧪' });
        if (r.weapon) this.prog.addItem({ id: 'w_muramasa', name: r.weapon, type: 'weapon', atk: 75, rarity: 'Legendary', desc: 'Ancient demonic katana with razor edge.', icon: '⚔️' });

        this.particles.spawnSparks(c.position, 25, 0xffd166);
        if (window.soundEngine) window.soundEngine.playChestOpen();
        this.ui.showToast(`Looted: 🪙 ${r.gold} Gold &bull; 🔮 ${r.shards} Void Shards!`);
        this.ui.renderInventory();
        return;
      }
    }

    // 2. Check Shrines
    for (const s of this.world.shrines) {
      if (p.distanceTo(s.position) < 4.0) {
        this.combat.hp = this.combat.maxHp;
        this.combat.stamina = this.combat.maxStamina;
        this.prog.saveToStorage();

        this.particles.spawnSparks(s.position, 30, 0x06d6a0);
        if (window.soundEngine) window.soundEngine.playLevelUp();
        this.ui.showToast('🌸 Shrine Activated: Full Vitality Restored & Game Saved!');
        return;
      }
    }

    // 3. Check NPCs
    for (const n of this.world.npcs) {
      if (p.distanceTo(n.position) < 3.5) {
        this.story.playCutscene([
          { speaker: n.userData.name, role: n.userData.title, text: n.userData.dialogue, char: n.userData.npcId }
        ]);
        return;
      }
    }
  }

  // =========================================================================
  // TITLE SCREEN & LAUNCH
  // =========================================================================

  initTitleScreen() {
    const btnStart = document.getElementById('btnStartAdventure');
    const btnCont = document.getElementById('btnContinueGame');
    const btnCodex = document.getElementById('btnCodexControls');

    if (btnStart) {
      btnStart.addEventListener('click', () => this.startGame(false));
    }
    if (btnCont) {
      btnCont.addEventListener('click', () => this.startGame(true));
    }
    if (btnCodex) {
      btnCodex.addEventListener('click', () => {
        alert('ECLIPSE CONTROLS:\nWASD - Move | LMB - Attack | RMB - Heavy Attack\nSPACE - Jump | SHIFT - Dash | C - Guard/Parry\nQ - Shadow Dash | E - Void Wave / Interact | R - Thunder Step\nF - Ultimate Cleave | T - Awakening | TAB - Lock On\nM / ESC - Pause Menu / Inventory');
      });
    }
  }

  startGame(isContinue = false) {
    // Resume audio context
    if (window.soundEngine) {
      window.soundEngine.resume();
      window.soundEngine.startMusic('explore');
    }

    // Hide Title Screen
    const title = document.getElementById('titleScreen');
    if (title) title.classList.add('hidden');

    const hud = document.getElementById('gameHud');
    if (hud) hud.classList.remove('hidden');

    if (isContinue) {
      this.prog.loadFromStorage();
    }

    // Start Chapter 1
    this.story.startChapter(1);

    this.isRunning = true;
    this.loop();
  }

  // =========================================================================
  // GAMEPAD POLLING
  // =========================================================================

  pollGamepad() {
    if (this.gamepadIndex === null) return { x: 0, z: 0 };
    const gp = navigator.getGamepads()[this.gamepadIndex];
    if (!gp) return { x: 0, z: 0 };

    // Left stick movement
    const lx = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
    const ly = Math.abs(gp.axes[1]) > 0.15 ? gp.axes[1] : 0;

    // Right stick camera
    if (Math.abs(gp.axes[2]) > 0.15) this.cameraYaw -= gp.axes[2] * 0.04;
    if (Math.abs(gp.axes[3]) > 0.15) this.cameraPitch = Math.max(0.08, Math.min(1.2, this.cameraPitch + gp.axes[3] * 0.03));

    // Buttons: [0] Jump, [1] Dash, [2] Attack, [3] Heavy
    if (gp.buttons[2].pressed && !this.gpAttackPressed) {
      this.combat.performLightAttack();
      this.gpAttackPressed = true;
    } else if (!gp.buttons[2].pressed) {
      this.gpAttackPressed = false;
    }

    if (gp.buttons[3].pressed && !this.gpHeavyPressed) {
      this.combat.performHeavyAttack();
      this.gpHeavyPressed = true;
    } else if (!gp.buttons[3].pressed) {
      this.gpHeavyPressed = false;
    }

    return { x: lx, z: ly };
  }

  // =========================================================================
  // PLAYER MOVEMENT & CAMERA SYSTEM
  // =========================================================================

  updatePlayer(delta) {
    if (this.combat.isDodging || this.story.isCutsceneActive) return;

    const gpInput = this.pollGamepad();

    // Movement Vector
    const move = new THREE.Vector3();
    if (this.keys['KeyW'] || gpInput.z < -0.2) move.z += 1;
    if (this.keys['KeyS'] || gpInput.z > 0.2) move.z -= 1;
    if (this.keys['KeyA'] || gpInput.x < -0.2) move.x -= 1;
    if (this.keys['KeyD'] || gpInput.x > 0.2) move.x += 1;

    const isMoving = move.lengthSq() > 0.01;
    const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];

    if (isMoving) {
      move.normalize();

      // Camera-relative direction
      const forward = new THREE.Vector3(
        -Math.sin(this.cameraYaw),
        0,
        -Math.cos(this.cameraYaw)
      );
      const right = new THREE.Vector3(
        Math.cos(this.cameraYaw),
        0,
        -Math.sin(this.cameraYaw)
      );

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, move.z)
        .addScaledVector(right, move.x)
        .normalize();

      const speed = isSprinting ? 12.0 : 7.2;
      this.char.position.addScaledVector(moveDir, speed * delta);

      // Smooth rotation towards movement direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.char.root.rotation.y = THREE.MathUtils.lerp(
        this.char.root.rotation.y,
        targetAngle,
        14 * delta
      );

      if (this.char.animState !== 'attack' && this.char.animState !== 'guard') {
        this.char.animState = isSprinting ? 'sprint' : 'run';
      }

      // Footstep sound tick
      this.footstepTimer = (this.footstepTimer || 0) + delta;
      if (this.footstepTimer > (isSprinting ? 0.25 : 0.38)) {
        this.footstepTimer = 0;
        if (window.soundEngine) window.soundEngine.playFootstep();
      }
    } else {
      if (this.char.animState !== 'attack' && this.char.animState !== 'guard') {
        this.char.animState = 'idle';
      }
    }

    // Jump
    if (this.keys['Space'] && this.char.isGrounded) {
      this.char.velocity.y = 10.5;
      this.char.isGrounded = false;
      this.char.animState = 'jump';
      if (window.soundEngine) window.soundEngine.playDash();
    }

    // Gravity
    this.char.velocity.y -= 26 * delta;
    this.char.position.y += this.char.velocity.y * delta;

    // Ground Adherence
    const floorY = this.world.getTerrainHeight(this.char.position.x, this.char.position.z);
    if (this.char.position.y <= floorY) {
      this.char.position.y = floorY;
      this.char.velocity.y = 0;
      this.char.isGrounded = true;
    }
  }

  updateCamera(delta) {
    // Target Lock-On Override
    if (this.combat.lockedTarget && this.combat.lockedTarget.hp > 0) {
      const ePos = this.combat.lockedTarget.mesh.position;
      const pPos = this.char.position;

      // Center between player and target
      const midpoint = new THREE.Vector3().addVectors(pPos, ePos).multiplyScalar(0.5);
      this.cameraTarget.lerp(midpoint, 8 * delta);

      // Compute yaw to look at enemy
      const diff = new THREE.Vector3().subVectors(ePos, pPos);
      this.cameraYaw = Math.atan2(-diff.x, -diff.z);
    } else {
      this.cameraTarget.lerp(
        this.char.position.clone().add(new THREE.Vector3(0, 1.6, 0)),
        10 * delta
      );
    }

    // Spherical coordinates
    const cx = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    const cy = this.cameraTarget.y + this.cameraDistance * Math.sin(this.cameraPitch);
    const cz = this.cameraTarget.z + this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.cameraTarget);
  }

  // =========================================================================
  // RESPAWN / REAWAKEN
  // =========================================================================

  respawnAtShrine() {
    this.combat.hp = this.combat.maxHp;
    this.combat.stamina = this.combat.maxStamina;
    this.char.position.set(0, this.world.getTerrainHeight(0, 0), 0);

    const modal = document.getElementById('gameOverModal');
    if (modal) modal.classList.add('hidden');
  }

  // =========================================================================
  // MASTER GAME LOOP
  // =========================================================================

  loop() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.loop());

    const rawDelta = this.clock.getDelta();
    // Hitstop time-dilation
    const delta = this.combat.hitstopTimer > 0 ? rawDelta * 0.2 : Math.min(rawDelta, 0.1);

    // Check Player Death
    if (this.combat.hp <= 0) {
      const modal = document.getElementById('gameOverModal');
      if (modal) modal.classList.remove('hidden');
      return;
    }

    // Subsystem updates
    this.updatePlayer(delta);
    this.updateCamera(delta);
    this.char.update(delta);
    this.combat.update(delta);
    this.world.update(delta, this.char.position);
    this.particles.update(delta, this.char.position);

    // Enemies update
    this.enemies.update(delta, this.char.position, enemy => {
      this.combat.takeDamageFromEnemy(enemy);
    });

    // Check defeated enemies for story triggers
    this.enemies.enemies.forEach(e => {
      if (e.hp <= 0 && !e.hasTriggeredStory) {
        e.hasTriggeredStory = true;
        this.story.onEnemyDefeated(e);
      }
    });

    // UI Updates
    this.ui.updateHUD();

    // Render WebGL Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
