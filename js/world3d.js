/**
 * ECLIPSE: THE LAST SHINOBI - 3D OPEN WORLD ENVIRONMENT
 * Features 5 distinct biomes (Kamitsuki Sanctuary, Citadel of the Forgotten,
 * Whispering Bamboo Forest, Aetherial Floating Islands, and Void Crater),
 * Dynamic Day-Night & Eclipse cycles, destructibles, interactive chests, and shrines.
 */

class World3D {
  constructor(scene, particleSystem) {
    this.scene = scene;
    this.particles = particleSystem;

    // Environmental Lights
    this.ambientLight = null;
    this.sunLight = null;
    this.hemiLight = null;
    this.eclipseLight = null;

    // Sky & Celestial
    this.skyMesh = null;
    this.sunMesh = null;
    this.eclipseRing = null;

    // Interactive & Destructible Entities
    this.destructibles = [];
    this.chests = [];
    this.shrines = [];
    this.npcs = [];
    this.colliders = [];

    // Time & Weather State
    this.timeOfDay = 0.35; // 0.0 - 1.0 (0.25 = sunrise, 0.5 = noon, 0.75 = sunset, 0.9 = midnight, 1.0 = eclipse)
    this.timeCycleSpeed = 0.005; // Progression speed
    this.isEclipse = false;
    this.currentBiome = 'Kamitsuki Sanctuary';

    this.initLighting();
    this.initSkyAndAtmosphere();
    this.buildTerrain();
    this.buildKamitsukiSanctuary();
    this.buildCitadelOfTheForgotten();
    this.buildBambooForest();
    this.buildAetherialFloatingIslands();
    this.buildVoidCrater();
    this.spawnInteractiveEntities();
  }

  // =========================================================================
  // LIGHTING & VOLUMETRIC ATMOSPHERE
  // =========================================================================

  initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xdcd6f7, 0.6);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xa6b1e1, 0x424874, 0.5);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Primary Sun / Directional Shadow Light
    this.sunLight = new THREE.DirectionalLight(0xfffae0, 1.3);
    this.sunLight.position.set(60, 90, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 280;
    this.sunLight.shadow.camera.left = -90;
    this.sunLight.shadow.camera.right = 90;
    this.sunLight.shadow.camera.top = 90;
    this.sunLight.shadow.camera.bottom = -90;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Eclipse Point / Directional Aura Light
    this.eclipseLight = new THREE.DirectionalLight(0x9d4edd, 0.0);
    this.eclipseLight.position.set(-40, 80, -40);
    this.scene.add(this.eclipseLight);

    // Atmospheric Fog
    this.scene.fog = new THREE.FogExp2(0x191825, 0.0065);
  }

  initSkyAndAtmosphere() {
    // Dynamic Sky Dome
    const skyGeom = new THREE.SphereGeometry(300, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x221a36,
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeom, skyMat);
    this.scene.add(this.skyMesh);

    // Glowing Celestial Sun
    const sunGeom = new THREE.SphereGeometry(12, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunMesh.position.set(160, 220, 80);
    this.scene.add(this.sunMesh);

    // Eclipse Black Hole / Corona Ring
    const ringGeom = new THREE.RingGeometry(13, 20, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.eclipseRing = new THREE.Mesh(ringGeom, ringMat);
    this.eclipseRing.position.set(160, 220, 78);
    this.eclipseRing.lookAt(0, 0, 0);
    this.scene.add(this.eclipseRing);
  }

  // =========================================================================
  // CONTINENTAL TERRAIN
  // =========================================================================

  buildTerrain() {
    // Primary continental ground plane
    const terrainGeom = new THREE.PlaneGeometry(360, 360, 64, 64);
    terrainGeom.rotateX(-Math.PI * 0.5);

    // Procedural hills and river beds
    const pos = terrainGeom.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const z = pos[i + 2];

      // Subtle rolling hills
      let y = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2.5;

      // Mountain ridge to the North-West (Citadel)
      if (x < -30 && z < -30) {
        y += Math.max(0, (-x - 30) * 0.18 + (-z - 30) * 0.18);
      }

      // Void Crater depression to the South-East
      const distToCrater = Math.hypot(x - 80, z - 100);
      if (distToCrater < 45) {
        y -= Math.cos((distToCrater / 45) * Math.PI * 0.5) * 6;
      }

      pos[i + 1] = y;
    }
    terrainGeom.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x2e382b, // Lush mossy green-gray
      roughness: 0.85,
      metalness: 0.05
    });

    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);

    // Reflective Water Plane for Kamitsuki Koi Pond
    const waterGeom = new THREE.CircleGeometry(16, 32);
    waterGeom.rotateX(-Math.PI * 0.5);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0077b6,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.set(14, 0.15, -12);
    water.receiveShadow = true;
    this.scene.add(water);
  }

  getTerrainHeight(x, z) {
    let y = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2.5;
    if (x < -30 && z < -30) {
      y += Math.max(0, (-x - 30) * 0.18 + (-z - 30) * 0.18);
    }
    const distToCrater = Math.hypot(x - 80, z - 100);
    if (distToCrater < 45) {
      y -= Math.cos((distToCrater / 45) * Math.PI * 0.5) * 6;
    }
    return y;
  }

  // =========================================================================
  // BIOME 1: KAMITSUKI SANCTUARY (JAPANESE VILLAGE & PAGODA)
  // =========================================================================

  buildKamitsukiSanctuary() {
    const villageGroup = new THREE.Group();

    // 1. Great Multi-Tiered Pagoda (Center landmark)
    const pagoda = this.createPagoda();
    pagoda.position.set(-15, 0, 15);
    villageGroup.add(pagoda);

    // 2. Grand Vermillion Torii Gates (Entrance avenue)
    const torii1 = this.createToriiGate(1.4);
    torii1.position.set(0, 0, -25);
    villageGroup.add(torii1);

    const torii2 = this.createToriiGate(1.1);
    torii2.position.set(0, 0, -10);
    villageGroup.add(torii2);

    // 3. Cherry Blossom Trees (Sakura)
    const treePositions = [
      [-10, -5], [10, -8], [-25, 5], [20, 10], [-5, 28], [24, -20], [-18, -25]
    ];
    treePositions.forEach(([tx, tz]) => {
      const tree = this.createSakuraTree();
      tree.position.set(tx, this.getTerrainHeight(tx, tz), tz);
      villageGroup.add(tree);
    });

    // 4. Stone Lanterns (Toro) with warm light
    const lanternPositions = [
      [-3, -22], [3, -22], [-3, -8], [3, -8], [8, -12], [-10, 8]
    ];
    lanternPositions.forEach(([lx, lz]) => {
      const lantern = this.createStoneLantern();
      lantern.position.set(lx, this.getTerrainHeight(lx, lz), lz);
      villageGroup.add(lantern);

      // Light source
      const ptLight = new THREE.PointLight(0xffa200, 0.7, 12);
      ptLight.position.set(lx, this.getTerrainHeight(lx, lz) + 1.8, lz);
      this.scene.add(ptLight);
    });

    // 5. Training Dojo Platform & Mats
    const dojo = this.createDojoPlatform();
    dojo.position.set(22, 0, -6);
    villageGroup.add(dojo);

    this.scene.add(villageGroup);
  }

  createPagoda() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a1e1b, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.2 });

    const tiers = 4;
    for (let i = 0; i < tiers; i++) {
      const y = i * 4.5;
      const scale = 1.0 - i * 0.15;

      // Wall block
      const wallGeom = new THREE.BoxGeometry(7 * scale, 3.8, 7 * scale);
      const wall = new THREE.Mesh(wallGeom, woodMat);
      wall.position.y = y + 1.9;
      wall.castShadow = true;
      group.add(wall);

      // Curved Eaves / Roof
      const roofGeom = new THREE.ConeGeometry(6.2 * scale, 1.8, 4);
      roofGeom.rotateY(Math.PI * 0.25);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.y = y + 4.2;
      roof.castShadow = true;
      group.add(roof);
    }

    // Pagoda Finial Spire
    const spireGeom = new THREE.CylinderGeometry(0.1, 0.4, 4, 8);
    const spire = new THREE.Mesh(spireGeom, goldMat);
    spire.position.y = tiers * 4.5 + 2.5;
    group.add(spire);

    return group;
  }

  createToriiGate(scale = 1.0) {
    const group = new THREE.Group();
    const vermillionMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.6 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });

    // Pillars
    const pillarGeom = new THREE.CylinderGeometry(0.35 * scale, 0.4 * scale, 6 * scale, 12);
    const leftPillar = new THREE.Mesh(pillarGeom, vermillionMat);
    leftPillar.position.set(-2.4 * scale, 3 * scale, 0);
    leftPillar.castShadow = true;
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeom, vermillionMat);
    rightPillar.position.set(2.4 * scale, 3 * scale, 0);
    rightPillar.castShadow = true;
    group.add(rightPillar);

    // Crossbeam (Kasagi)
    const beamGeom = new THREE.BoxGeometry(6.8 * scale, 0.5 * scale, 0.8 * scale);
    const beam = new THREE.Mesh(beamGeom, vermillionMat);
    beam.position.set(0, 5.8 * scale, 0);
    beam.castShadow = true;
    group.add(beam);

    // Top Ridge (Black cap)
    const capGeom = new THREE.BoxGeometry(7.2 * scale, 0.2 * scale, 0.9 * scale);
    const cap = new THREE.Mesh(capGeom, blackMat);
    cap.position.set(0, 6.1 * scale, 0);
    group.add(cap);

    return group;
  }

  createSakuraTree() {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2618, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0xffb7b2,
      roughness: 0.8,
      bumpScale: 0.05
    });

    // Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.35, 0.6, 4.5, 8);
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage Clusters
    const clusterPositions = [
      [0, 4.5, 0, 2.2],
      [-1.4, 4.0, 0.8, 1.8],
      [1.3, 4.2, -0.7, 1.7],
      [0.6, 4.8, 1.2, 1.6],
      [-0.8, 4.2, -1.1, 1.5]
    ];

    clusterPositions.forEach(([cx, cy, cz, radius]) => {
      const folGeom = new THREE.DodecahedronGeometry(radius, 1);
      const fol = new THREE.Mesh(folGeom, foliageMat);
      fol.position.set(cx, cy, cz);
      fol.castShadow = true;
      group.add(fol);
    });

    return group;
  }

  createStoneLantern() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.9 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

    // Base
    const baseGeom = new THREE.BoxGeometry(0.9, 0.4, 0.9);
    const base = new THREE.Mesh(baseGeom, stoneMat);
    base.position.y = 0.2;
    group.add(base);

    // Pillar
    const pilGeom = new THREE.CylinderGeometry(0.2, 0.25, 1.0, 6);
    const pil = new THREE.Mesh(pilGeom, stoneMat);
    pil.position.y = 0.9;
    group.add(pil);

    // Light chamber
    const lightBoxGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const lightBox = new THREE.Mesh(lightBoxGeom, fireMat);
    lightBox.position.y = 1.6;
    group.add(lightBox);

    // Cap roof
    const roofGeom = new THREE.ConeGeometry(0.8, 0.4, 4);
    roofGeom.rotateY(Math.PI * 0.25);
    const roof = new THREE.Mesh(roofGeom, stoneMat);
    roof.position.y = 2.1;
    group.add(roof);

    return group;
  }

  createDojoPlatform() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
    const tatamiMat = new THREE.MeshStandardMaterial({ color: 0xc8b88a, roughness: 0.9 });

    // Raised wood deck
    const deckGeom = new THREE.BoxGeometry(14, 0.6, 14);
    const deck = new THREE.Mesh(deckGeom, woodMat);
    deck.position.y = 0.3;
    deck.receiveShadow = true;
    group.add(deck);

    // Tatami center mat
    const tatamiGeom = new THREE.BoxGeometry(11, 0.05, 11);
    const tatami = new THREE.Mesh(tatamiGeom, tatamiMat);
    tatami.position.y = 0.63;
    group.add(tatami);

    return group;
  }

  // =========================================================================
  // BIOME 2: CITADEL OF THE FORGOTTEN (ANCIENT CASTLE & FORTRESS)
  // =========================================================================

  buildCitadelOfTheForgotten() {
    const citadelGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3d3a45, roughness: 0.85 });
    const bannerMat = new THREE.MeshStandardMaterial({ color: 0x9e2a2b, roughness: 0.6 });

    // Main Keep
    const keepGeom = new THREE.BoxGeometry(22, 28, 22);
    const keep = new THREE.Mesh(keepGeom, stoneMat);
    keep.position.set(-80, 14, -80);
    keep.castShadow = true;
    keep.receiveShadow = true;
    citadelGroup.add(keep);

    // Fortress Towers
    const towerCoords = [
      [-65, -65], [-95, -65], [-65, -95], [-95, -95]
    ];
    towerCoords.forEach(([tx, tz]) => {
      const towerGeom = new THREE.CylinderGeometry(3.5, 4.0, 32, 12);
      const tower = new THREE.Mesh(towerGeom, stoneMat);
      tower.position.set(tx, 16, tz);
      tower.castShadow = true;
      citadelGroup.add(tower);

      // Battlements cap
      const capGeom = new THREE.ConeGeometry(4.8, 3.5, 6);
      const cap = new THREE.Mesh(capGeom, bannerMat);
      cap.position.set(tx, 33.5, tz);
      citadelGroup.add(cap);
    });

    // Massive Curtain Walls
    const wallGeomH = new THREE.BoxGeometry(30, 12, 3);
    const wall1 = new THREE.Mesh(wallGeomH, stoneMat);
    wall1.position.set(-80, 6, -65);
    citadelGroup.add(wall1);

    const wall2 = new THREE.Mesh(wallGeomH, stoneMat);
    wall2.position.set(-80, 6, -95);
    citadelGroup.add(wall2);

    this.scene.add(citadelGroup);
  }

  // =========================================================================
  // BIOME 3: WHISPERING BAMBOO FOREST
  // =========================================================================

  buildBambooForest() {
    const forestGroup = new THREE.Group();
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x4f772d, roughness: 0.6 });

    // Dense bamboo grove
    const stalkCount = 120;
    for (let i = 0; i < stalkCount; i++) {
      const bx = 45 + Math.random() * 65;
      const bz = -30 + Math.random() * 80;
      const by = this.getTerrainHeight(bx, bz);
      const height = 12 + Math.random() * 8;

      const stalkGeom = new THREE.CylinderGeometry(0.18, 0.22, height, 6);
      const stalk = new THREE.Mesh(stalkGeom, bambooMat);
      stalk.position.set(bx, by + height * 0.5, bz);
      stalk.castShadow = true;

      // Register as destructible bamboo
      stalk.userData = {
        isDestructible: true,
        type: 'bamboo',
        hp: 30,
        color: 0x4f772d
      };
      this.destructibles.push(stalk);
      forestGroup.add(stalk);
    }

    this.scene.add(forestGroup);
  }

  // =========================================================================
  // BIOME 4: AETHERIAL FLOATING SKY ISLANDS
  // =========================================================================

  buildAetherialFloatingIslands() {
    const skyGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.9 });
    const crystalMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const islands = [
      [-50, 28, 90, 16],
      [-20, 36, 110, 22],
      [-70, 42, 130, 18],
      [0, 48, 135, 14]
    ];

    islands.forEach(([ix, iy, iz, radius]) => {
      // Floating Inverted Rock Island
      const islandGeom = new THREE.ConeGeometry(radius, radius * 1.4, 7);
      islandGeom.rotateX(Math.PI);
      const island = new THREE.Mesh(islandGeom, rockMat);
      island.position.set(ix, iy, iz);
      island.castShadow = true;
      skyGroup.add(island);

      // Glowing Aetherial Crystal Spire
      const crystalGeom = new THREE.OctahedronGeometry(2.5, 0);
      const crystal = new THREE.Mesh(crystalGeom, crystalMat);
      crystal.position.set(ix, iy + 3.5, iz);
      skyGroup.add(crystal);
    });

    this.scene.add(skyGroup);
  }

  // =========================================================================
  // BIOME 5: THE VOID CRATER / ECLIPSE GROUND ZERO
  // =========================================================================

  buildVoidCrater() {
    const craterGroup = new THREE.Group();
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x120c1f,
      roughness: 0.3,
      metalness: 0.8
    });
    const voidGlowMat = new THREE.MeshBasicMaterial({
      color: 0xc77dff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    // Corrupted Obsidian Spires
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 28 + Math.random() * 12;
      const sx = 80 + Math.cos(angle) * dist;
      const sz = 100 + Math.sin(angle) * dist;
      const sy = this.getTerrainHeight(sx, sz);

      const spireGeom = new THREE.ConeGeometry(1.8, 14 + Math.random() * 8, 5);
      const spire = new THREE.Mesh(spireGeom, obsidianMat);
      spire.position.set(sx, sy + 7, sz);
      spire.rotation.x = (Math.random() - 0.5) * 0.4;
      spire.rotation.z = (Math.random() - 0.5) * 0.4;
      spire.castShadow = true;
      craterGroup.add(spire);

      // Void Crystal core on some spires
      if (i % 3 === 0) {
        const shardGeom = new THREE.OctahedronGeometry(1.5, 0);
        const shard = new THREE.Mesh(shardGeom, voidGlowMat);
        shard.position.set(sx, sy + 14, sz);
        craterGroup.add(shard);
      }
    }

    this.scene.add(craterGroup);
  }

  // =========================================================================
  // INTERACTIVE ENTITIES (CHESTS, SHRINES, CRATES, NPCS)
  // =========================================================================

  spawnInteractiveEntities() {
    // 1. Destructible Training Dummies at Dojo
    const dummyPositions = [
      [19, -4], [23, -4], [21, -8]
    ];
    dummyPositions.forEach(([dx, dz]) => {
      const dummy = this.createTrainingDummy();
      dummy.position.set(dx, 0.6, dz);
      dummy.userData = {
        isDestructible: true,
        type: 'dummy',
        hp: 150,
        color: 0xa67c52
      };
      this.destructibles.push(dummy);
      this.scene.add(dummy);
    });

    // 2. Destructible Wooden Crates
    const cratePositions = [
      [-12, -2], [-14, -2], [8, 14], [26, -15], [52, 10], [-68, -60]
    ];
    cratePositions.forEach(([cx, cz]) => {
      const crate = this.createWoodenCrate();
      crate.position.set(cx, this.getTerrainHeight(cx, cz) + 0.6, cz);
      crate.userData = {
        isDestructible: true,
        type: 'crate',
        hp: 50,
        color: 0x8b5a2b
      };
      this.destructibles.push(crate);
      this.scene.add(crate);
    });

    // 3. Lootable Treasure Chests
    const chestData = [
      { pos: [12, -18], type: 'gold', name: 'Sanctuary Golden Cache', reward: { gold: 300, shards: 5, potion: 2 } },
      { pos: [68, 25], type: 'scroll', name: 'Bamboo Shrine Reliquary', reward: { gold: 500, shards: 12, item: 'Amulet of the Gale' } },
      { pos: [-88, -75], type: 'obsidian', name: 'Citadel Warlord Coffer', reward: { gold: 800, shards: 20, weapon: 'Muramasa of the Eclipse' } }
    ];
    chestData.forEach(c => {
      const chest = this.createChest(c.type);
      chest.position.set(c.pos[0], this.getTerrainHeight(c.pos[0], c.pos[1]) + 0.35, c.pos[1]);
      chest.userData = {
        isChest: true,
        isOpened: false,
        name: c.name,
        reward: c.reward
      };
      this.chests.push(chest);
      this.scene.add(chest);
    });

    // 4. Rest & Fast Travel Torii Shrines
    const shrineData = [
      { pos: [0, 5], name: '🌸 Kamitsuki Sanctuary Shrine', id: 'shrine_kamitsuki' },
      { pos: [60, -10], name: '🎋 Whispering Bamboo Shrine', id: 'shrine_bamboo' },
      { pos: [-60, -50], name: '🏰 Citadel Rampart Shrine', id: 'shrine_citadel' },
      { pos: [70, 80], name: '🌑 Void Crater Gate Shrine', id: 'shrine_void' }
    ];
    shrineData.forEach(s => {
      const shrine = this.createShrine(s.name);
      shrine.position.set(s.pos[0], this.getTerrainHeight(s.pos[0], s.pos[1]), s.pos[1]);
      shrine.userData = {
        isShrine: true,
        name: s.name,
        id: s.id
      };
      this.shrines.push(shrine);
      this.scene.add(shrine);
    });

    // 5. Friendly Village NPCs
    this.spawnNPCs();
  }

  createTrainingDummy() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 });

    // Post
    const postGeom = new THREE.CylinderGeometry(0.25, 0.25, 2.2, 8);
    const post = new THREE.Mesh(postGeom, woodMat);
    post.position.y = 1.1;
    post.castShadow = true;
    group.add(post);

    // Cross arms
    const armGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8);
    armGeom.rotateZ(Math.PI * 0.5);
    const arm = new THREE.Mesh(armGeom, woodMat);
    arm.position.y = 1.4;
    group.add(arm);

    // Rope wrap
    const ropeGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.6, 8);
    const rope = new THREE.Mesh(ropeGeom, ropeMat);
    rope.position.y = 1.1;
    group.add(rope);

    return group;
  }

  createWoodenCrate() {
    const geom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createChest(type) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: type === 'obsidian' ? 0x1f1b24 : 0x8b4513,
      roughness: 0.6
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: type === 'obsidian' ? 0x9d4edd : 0xffd166,
      metalness: 0.9,
      roughness: 0.2
    });

    // Chest box base
    const baseGeom = new THREE.BoxGeometry(1.4, 0.7, 0.9);
    const base = new THREE.Mesh(baseGeom, bodyMat);
    base.position.y = 0.35;
    base.castShadow = true;
    group.add(base);

    // Lid (animatable)
    const lidGeom = new THREE.CylinderGeometry(0.46, 0.46, 1.4, 12, 1, false, 0, Math.PI);
    lidGeom.rotateZ(Math.PI * 0.5);
    const lid = new THREE.Mesh(lidGeom, trimMat);
    lid.position.set(0, 0.7, 0);
    lid.castShadow = true;
    group.add(lid);

    group.userData.lidMesh = lid;
    return group;
  }

  createShrine(name) {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5d64, roughness: 0.8 });
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x06d6a0,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    // Multi-step stone base
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 3.0), stoneMat);
    base1.position.y = 0.2;
    group.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 2.2), stoneMat);
    base2.position.y = 0.6;
    group.add(base2);

    // Mini Torii Arch
    const torii = this.createToriiGate(0.5);
    torii.position.y = 0.8;
    group.add(torii);

    // Glowing Sacred Lotus Stone in center
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), runeMat);
    stone.position.y = 1.6;
    group.add(stone);

    // Sacred beacon light
    const beacon = new THREE.PointLight(0x06d6a0, 0.8, 8);
    beacon.position.y = 2.0;
    group.add(beacon);

    return group;
  }

  spawnNPCs() {
    // Elder Genzo (Kamitsuki Pagoda)
    const elder = this.createNPCMesh(0x2a3d45, 0xffffff);
    elder.position.set(-10, 0, 10);
    elder.userData = {
      isNPC: true,
      npcId: 'genzo',
      name: 'Elder Genzo',
      title: 'Grandmaster of Kamitsuki',
      dialogue: 'Ren... You have awakened. The Seven Warriors have fallen, and the Voidborn now siege our ancestral lands. Take your blade and purge the gate!'
    };
    this.npcs.push(elder);
    this.scene.add(elder);

    // Shrine Maiden Saki (Sacred Pond)
    const saki = this.createNPCMesh(0xd90429, 0x111111);
    saki.position.set(10, 0, -8);
    saki.userData = {
      isNPC: true,
      npcId: 'saki',
      name: 'Shrine Maiden Saki',
      title: 'Keeper of the Lotus Shrine',
      dialogue: 'May the light of Aetheria guide your blade, Shinobi. Rest by our sacred torii shrines to restore your vitality and purge corruption.'
    };
    this.npcs.push(saki);
    this.scene.add(saki);
  }

  createNPCMesh(robeColor, hairColor) {
    const group = new THREE.Group();
    const robeMat = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd5b5, roughness: 0.7 });

    // Torso / Robes
    const bodyGeom = new THREE.CylinderGeometry(0.35, 0.5, 1.6, 8);
    const body = new THREE.Mesh(bodyGeom, robeMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(0.25, 8, 8);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    // Hair / Hat
    const hairGeom = new THREE.ConeGeometry(0.6, 0.3, 6);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.y = 2.05;
    group.add(hair);

    return group;
  }

  // =========================================================================
  // ENVIRONMENT UPDATE LOOP & CELESTIAL ECLIPSE CYCLE
  // =========================================================================

  update(delta, playerPos) {
    // Progress Time of Day
    this.timeOfDay = (this.timeOfDay + this.timeCycleSpeed * delta * 0.1) % 1.0;

    // Check Biome based on player coordinates
    if (playerPos) {
      if (playerPos.x > 35 && playerPos.z > 50) {
        this.currentBiome = 'Void Crater - Ground Zero';
        this.setEclipseState(true);
      } else if (playerPos.x > 35 && playerPos.z <= 50) {
        this.currentBiome = 'Whispering Bamboo Forest';
        this.setEclipseState(false);
      } else if (playerPos.x < -35 && playerPos.z < -35) {
        this.currentBiome = 'Citadel of the Forgotten';
        this.setEclipseState(false);
      } else if (playerPos.y > 22) {
        this.currentBiome = 'Aetherial Sky Islands';
        this.setEclipseState(false);
      } else {
        this.currentBiome = 'Kamitsuki Sanctuary';
        this.setEclipseState(false);
      }
    }

    // Dynamic Sun orbit
    const sunAngle = this.timeOfDay * Math.PI * 2;
    const sunDist = 240;
    this.sunMesh.position.set(
      Math.cos(sunAngle) * sunDist,
      Math.sin(sunAngle) * sunDist,
      80
    );
    this.sunLight.position.copy(this.sunMesh.position);

    // Eclipse visual effects
    if (this.isEclipse) {
      this.skyMesh.material.color.setHex(0x0a0515);
      this.sunMesh.material.color.setHex(0x10002b);
      this.eclipseRing.material.opacity = THREE.MathUtils.lerp(this.eclipseRing.material.opacity, 0.95, 0.05);
      this.scene.fog.color.setHex(0x120824);
      this.ambientLight.color.setHex(0x7b2cbf);
      this.ambientLight.intensity = 0.45;
      this.eclipseLight.intensity = 1.2;
    } else {
      this.skyMesh.material.color.setHex(0x221a36);
      this.sunMesh.material.color.setHex(0xfff3b0);
      this.eclipseRing.material.opacity = THREE.MathUtils.lerp(this.eclipseRing.material.opacity, 0.0, 0.05);
      this.scene.fog.color.setHex(0x191825);
      this.ambientLight.color.setHex(0xdcd6f7);
      this.ambientLight.intensity = 0.65;
      this.eclipseLight.intensity = 0.0;
    }
  }

  setEclipseState(active) {
    this.isEclipse = active;
  }
}

window.World3D = World3D;
