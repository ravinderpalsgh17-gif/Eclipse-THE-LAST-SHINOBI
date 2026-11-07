/**
 * ECLIPSE: THE LAST SHINOBI - 3D ANIME CHARACTER GENERATOR & RIG
 * Hierarchical skeletal mesh, anime hair physics, dual-wield weapons,
 * comprehensive martial arts & sword animations, and Eclipse Awakening transformation.
 */

class Character3D {
  constructor(scene, charType = 'ren') {
    this.scene = scene;
    this.charType = charType;

    this.root = new THREE.Group();
    this.nodes = {};
    this.weapons = {};
    this.wings = null;

    // Animation States
    this.animState = 'idle'; // 'idle', 'run', 'sprint', 'jump', 'fall', 'attack', 'heavy', 'dash', 'guard', 'parry', 'hit'
    this.animTime = 0;
    this.attackIndex = 0;
    this.attackTimer = 0;
    this.isAwakened = false;
    this.isTalking = false;

    // Movement & Combat physics
    this.position = this.root.position;
    this.rotation = this.root.rotation;
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;

    this.buildCharacterMesh();
    this.scene.add(this.root);
  }

  setCharacterType(charType) {
    this.charType = charType;
    while (this.root.children.length > 0) {
      this.root.remove(this.root.children[0]);
    }
    this.nodes = {};
    this.weapons = {};
    this.wings = null;
    this.buildCharacterMesh();
  }

  // =========================================================================
  // SKELETAL RIG GENERATION
  // =========================================================================

  buildCharacterMesh() {
    // Character Color Palettes
    let giColor = 0x161224;
    let trimColor = 0x9d4edd;
    let hairColor = 0x1b1924;
    let skinColor = 0xffdfba;
    let eyeColor = 0xc77dff;

    if (this.charType === 'ayame') {
      giColor = 0x0f2b38;
      trimColor = 0x00f0ff;
      hairColor = 0x223344;
      eyeColor = 0x00f0ff;
    } else if (this.charType === 'kaito') {
      giColor = 0x291d14;
      trimColor = 0xffd166;
      hairColor = 0x3d2b1f;
      eyeColor = 0xffd166;
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.65 });
    const giMat = new THREE.MeshStandardMaterial({ color: giColor, roughness: 0.7 });
    const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.4 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.5 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.15 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.25 });

    // 1. Hips (Central parent node)
    const hips = new THREE.Group();
    hips.position.y = 1.05;
    this.root.add(hips);
    this.nodes.hips = hips;

    const pelvisGeom = new THREE.BoxGeometry(0.55, 0.35, 0.38);
    const pelvis = new THREE.Mesh(pelvisGeom, giMat);
    pelvis.castShadow = true;
    hips.add(pelvis);

    // Sash / Belt
    const beltGeom = new THREE.BoxGeometry(0.58, 0.12, 0.4);
    const belt = new THREE.Mesh(beltGeom, trimMat);
    hips.add(belt);

    // 2. Torso & Chest
    const torso = new THREE.Group();
    torso.position.y = 0.22;
    hips.add(torso);
    this.nodes.torso = torso;

    const chestGeom = new THREE.BoxGeometry(0.62, 0.55, 0.42);
    const chest = new THREE.Mesh(chestGeom, giMat);
    chest.position.y = 0.28;
    chest.castShadow = true;
    torso.add(chest);

    // Shinobi Armor Plate on chest
    const armorPlateGeom = new THREE.BoxGeometry(0.52, 0.38, 0.08);
    const armorPlate = new THREE.Mesh(armorPlateGeom, trimMat);
    armorPlate.position.set(0, 0.3, 0.2);
    torso.add(armorPlate);

    // 3. Neck & Sculpted Anime Head
    const neck = new THREE.Group();
    neck.position.y = 0.56;
    torso.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.18;
    neck.add(headGroup);
    this.nodes.head = headGroup;

    // Face / Jaw
    const headGeom = new THREE.SphereGeometry(0.24, 12, 12);
    headGeom.scale(1.0, 1.15, 1.05);
    const headMesh = new THREE.Mesh(headGeom, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Anime Eyes
    const eyeGeom = new THREE.BoxGeometry(0.08, 0.04, 0.02);
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.09, 0.02, 0.23);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.09, 0.02, 0.23);
    headGroup.add(rightEye);

    // Shinobi Face Mask
    const maskGeom = new THREE.BoxGeometry(0.32, 0.18, 0.18);
    const mask = new THREE.Mesh(maskGeom, giMat);
    mask.position.set(0, -0.08, 0.14);
    headGroup.add(mask);

    // Headband with metal plate
    const headbandGeom = new THREE.BoxGeometry(0.5, 0.08, 0.5);
    const headband = new THREE.Mesh(headbandGeom, trimMat);
    headband.position.set(0, 0.14, 0);
    headGroup.add(headband);

    const plateGeom = new THREE.BoxGeometry(0.18, 0.06, 0.02);
    const plate = new THREE.Mesh(plateGeom, metalMat);
    plate.position.set(0, 0.14, 0.26);
    headGroup.add(plate);

    // Headband fluttering tails
    const ribbonGeom = new THREE.BoxGeometry(0.08, 0.55, 0.02);
    const ribbon = new THREE.Mesh(ribbonGeom, trimMat);
    ribbon.position.set(0, 0.05, -0.32);
    ribbon.rotation.x = -0.3;
    headGroup.add(ribbon);
    this.nodes.ribbon = ribbon;

    // Sculpted Anime Hair & Headgear by Character
    const hairGroup = new THREE.Group();
    if (this.charType === 'ayame') {
      // Ayame Twin-Tails
      const pigtailL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 6), hairMat);
      pigtailL.position.set(-0.28, 0.1, -0.1);
      pigtailL.rotation.set(-0.2, 0, 0.5);
      hairGroup.add(pigtailL);

      const pigtailR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 6), hairMat);
      pigtailR.position.set(0.28, 0.1, -0.1);
      pigtailR.rotation.set(-0.2, 0, -0.5);
      hairGroup.add(pigtailR);

      // Front Bangs
      for (let i = 0; i < 5; i++) {
        const bang = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 4), hairMat);
        bang.position.set((i - 2) * 0.08, 0.16, 0.22);
        bang.rotation.x = -0.2;
        hairGroup.add(bang);
      }
    } else if (this.charType === 'kaito') {
      // Kaito Ronin Straw Sedge Hat (Kasa)
      const hatGeom = new THREE.ConeGeometry(0.58, 0.22, 10);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
      const hat = new THREE.Mesh(hatGeom, hatMat);
      hat.position.set(0, 0.28, 0);
      hairGroup.add(hat);

      // Long Ronin Ponytail
      const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.8, 6), hairMat);
      ponytail.position.set(0, 0.0, -0.32);
      ponytail.rotation.x = -0.4;
      hairGroup.add(ponytail);
    } else {
      // Ren Spiky Shinobi Hair
      const spikeCount = 9;
      for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 1.8 - Math.PI * 0.9;
        const spikeGeom = new THREE.ConeGeometry(0.1, 0.38, 4);
        const spike = new THREE.Mesh(spikeGeom, hairMat);
        spike.position.set(Math.sin(angle) * 0.18, 0.22, Math.cos(angle) * 0.18);
        spike.rotation.x = -0.4;
        spike.rotation.z = -Math.sin(angle) * 0.6;
        hairGroup.add(spike);
      }
    }
    headGroup.add(hairGroup);

    // 4. Arms & Hands (Left & Right)
    this.buildArm(torso, 'left', -0.38, giMat, skinMat, trimMat);
    this.buildArm(torso, 'right', 0.38, giMat, skinMat, trimMat);

    // 5. Legs & Feet (Left & Right)
    this.buildLeg(hips, 'left', -0.18, giMat, trimMat);
    this.buildLeg(hips, 'right', 0.18, giMat, trimMat);

    // 6. Weapons by Character
    if (this.charType === 'ayame') {
      this.buildWakizashi('right', metalMat, goldMat, trimMat);
      this.buildWakizashi('left', metalMat, goldMat, trimMat);
    } else if (this.charType === 'kaito') {
      this.buildNodachi('right', metalMat, goldMat, trimMat);
    } else {
      this.buildKatana('right', metalMat, goldMat, trimMat);
      this.buildWakizashi('left', metalMat, goldMat, trimMat);
    }

    // 7. Sheathed Katana on Hips
    const sheathGeom = new THREE.BoxGeometry(0.08, 0.08, 1.1);
    const sheath = new THREE.Mesh(sheathGeom, giMat);
    sheath.position.set(-0.32, -0.05, 0.1);
    sheath.rotation.x = 0.35;
    sheath.rotation.y = -0.2;
    hips.add(sheath);

    // 8. Eclipse Awakening Wings (Hidden until transformation)
    this.buildAwakeningWings();
  }

  buildArm(parent, side, offsetX, giMat, skinMat, trimMat) {
    const shoulder = new THREE.Group();
    shoulder.position.set(offsetX, 0.48, 0);
    parent.add(shoulder);
    this.nodes[`${side}Shoulder`] = shoulder;

    // Upper Arm
    const upperArmGeom = new THREE.BoxGeometry(0.18, 0.38, 0.18);
    const upperArm = new THREE.Mesh(upperArmGeom, giMat);
    upperArm.position.y = -0.19;
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    // Forearm & Elbow
    const forearm = new THREE.Group();
    forearm.position.y = -0.38;
    shoulder.add(forearm);
    this.nodes[`${side}Forearm`] = forearm;

    const forearmGeom = new THREE.BoxGeometry(0.16, 0.35, 0.16);
    const forearmMesh = new THREE.Mesh(forearmGeom, skinMat);
    forearmMesh.position.y = -0.175;
    forearmMesh.castShadow = true;
    forearm.add(forearmMesh);

    // Arm Bracers
    const bracerGeom = new THREE.BoxGeometry(0.18, 0.22, 0.18);
    const bracer = new THREE.Mesh(bracerGeom, trimMat);
    bracer.position.y = -0.18;
    forearm.add(bracer);

    // Hand
    const hand = new THREE.Group();
    hand.position.y = -0.36;
    forearm.add(hand);
    this.nodes[`${side}Hand`] = hand;

    const handGeom = new THREE.BoxGeometry(0.12, 0.14, 0.12);
    const handMesh = new THREE.Mesh(handGeom, skinMat);
    hand.add(handMesh);
  }

  buildLeg(parent, side, offsetX, giMat, trimMat) {
    const hipJoint = new THREE.Group();
    hipJoint.position.set(offsetX, -0.15, 0);
    parent.add(hipJoint);
    this.nodes[`${side}Leg`] = hipJoint;

    // Thigh
    const thighGeom = new THREE.BoxGeometry(0.24, 0.48, 0.24);
    const thigh = new THREE.Mesh(thighGeom, giMat);
    thigh.position.y = -0.24;
    thigh.castShadow = true;
    hipJoint.add(thigh);

    // Knee & Shin
    const shin = new THREE.Group();
    shin.position.y = -0.48;
    hipJoint.add(shin);
    this.nodes[`${side}Shin`] = shin;

    const shinGeom = new THREE.BoxGeometry(0.2, 0.48, 0.2);
    const shinMesh = new THREE.Mesh(shinGeom, giMat);
    shinMesh.position.y = -0.24;
    shinMesh.castShadow = true;
    shin.add(shinMesh);

    // Shin Wraps (Kyahan)
    const wrapGeom = new THREE.BoxGeometry(0.22, 0.32, 0.22);
    const wrap = new THREE.Mesh(wrapGeom, trimMat);
    wrap.position.y = -0.26;
    shin.add(wrap);

    // Foot (Tabi boot)
    const footGeom = new THREE.BoxGeometry(0.2, 0.12, 0.35);
    const foot = new THREE.Mesh(footGeom, giMat);
    foot.position.set(0, -0.52, 0.06);
    foot.castShadow = true;
    shin.add(foot);
  }

  buildKatana(handSide, metalMat, goldMat, trimMat) {
    const weaponGroup = new THREE.Group();

    // Tsuka (Hilt)
    const hiltGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
    const hilt = new THREE.Mesh(hiltGeom, trimMat);
    hilt.position.y = 0.15;
    weaponGroup.add(hilt);

    // Tsuba (Guard)
    const tsubaGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12);
    const tsuba = new THREE.Mesh(tsubaGeom, goldMat);
    tsuba.position.y = 0.38;
    weaponGroup.add(tsuba);

    // Katana Blade (Curved steel)
    const bladeGeom = new THREE.BoxGeometry(0.04, 1.25, 0.08);
    const blade = new THREE.Mesh(bladeGeom, metalMat);
    blade.position.set(0, 1.0, 0);
    blade.castShadow = true;
    weaponGroup.add(blade);

    // Glowing Katana Edge / Hamon Line
    const edgeGeom = new THREE.BoxGeometry(0.01, 1.25, 0.02);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xc77dff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const edge = new THREE.Mesh(edgeGeom, edgeMat);
    edge.position.set(0, 1.0, 0.042);
    weaponGroup.add(edge);

    // Orient blade forward from hand
    weaponGroup.rotation.x = Math.PI * 0.5;
    weaponGroup.position.set(0, -0.05, 0.1);

    this.nodes[`${handSide}Hand`].add(weaponGroup);
    this.weapons.katana = weaponGroup;
  }

  buildWakizashi(handSide, metalMat, goldMat, trimMat) {
    const weaponGroup = new THREE.Group();

    // Wakizashi Hilt
    const hiltGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.32, 8);
    const hilt = new THREE.Mesh(hiltGeom, trimMat);
    hilt.position.y = 0.12;
    weaponGroup.add(hilt);

    // Tsuba
    const tsubaGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.025, 12);
    const tsuba = new THREE.Mesh(tsubaGeom, goldMat);
    tsuba.position.y = 0.28;
    weaponGroup.add(tsuba);

    // Wakizashi Blade
    const bladeGeom = new THREE.BoxGeometry(0.035, 0.85, 0.07);
    const blade = new THREE.Mesh(bladeGeom, metalMat);
    blade.position.set(0, 0.7, 0);
    blade.castShadow = true;
    weaponGroup.add(blade);

    // Orient in off-hand
    weaponGroup.rotation.x = Math.PI * 0.5;
    weaponGroup.position.set(0, -0.05, 0.08);

    this.nodes[`${handSide}Hand`].add(weaponGroup);
    this.weapons.wakizashi = weaponGroup;
  }

  buildNodachi(handSide, metalMat, goldMat, trimMat) {
    const weaponGroup = new THREE.Group();

    // Two-handed long hilt
    const hiltGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.65, 8);
    const hilt = new THREE.Mesh(hiltGeom, trimMat);
    hilt.position.y = 0.25;
    weaponGroup.add(hilt);

    // Golden Dragon Tsuba
    const tsubaGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12);
    const tsuba = new THREE.Mesh(tsubaGeom, goldMat);
    tsuba.position.y = 0.58;
    weaponGroup.add(tsuba);

    // Massive Nodachi Blade
    const bladeGeom = new THREE.BoxGeometry(0.06, 1.95, 0.12);
    const blade = new THREE.Mesh(bladeGeom, metalMat);
    blade.position.set(0, 1.55, 0);
    blade.castShadow = true;
    weaponGroup.add(blade);

    // Thunder glowing hamon edge
    const edgeGeom = new THREE.BoxGeometry(0.015, 1.95, 0.03);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const edge = new THREE.Mesh(edgeGeom, edgeMat);
    edge.position.set(0, 1.55, 0.062);
    weaponGroup.add(edge);

    weaponGroup.rotation.x = Math.PI * 0.5;
    weaponGroup.position.set(0, -0.05, 0.12);

    this.nodes[`${handSide}Hand`].add(weaponGroup);
    this.weapons.nodachi = weaponGroup;
  }

  buildAwakeningWings() {
    this.wings = new THREE.Group();

    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    // Left Wing
    const leftWingGeom = new THREE.BufferGeometry();
    const leftVertices = new Float32Array([
      0, 0, 0,
      -1.8, 1.4, -0.4,
      -0.8, -0.6, -0.2,
      -2.4, 2.2, -0.6,
      -1.2, 0.4, -0.3,
      -3.0, 1.2, -0.8
    ]);
    leftWingGeom.setAttribute('position', new THREE.BufferAttribute(leftVertices, 3));
    leftWingGeom.computeVertexNormals();
    const leftWing = new THREE.Mesh(leftWingGeom, wingMat);
    this.wings.add(leftWing);

    // Right Wing
    const rightWingGeom = new THREE.BufferGeometry();
    const rightVertices = new Float32Array([
      0, 0, 0,
      1.8, 1.4, -0.4,
      0.8, -0.6, -0.2,
      2.4, 2.2, -0.6,
      1.2, 0.4, -0.3,
      3.0, 1.2, -0.8
    ]);
    rightWingGeom.setAttribute('position', new THREE.BufferAttribute(rightVertices, 3));
    rightWingGeom.computeVertexNormals();
    const rightWing = new THREE.Mesh(rightWingGeom, wingMat);
    this.wings.add(rightWing);

    this.wings.position.set(0, 0.35, -0.22);
    this.wings.visible = false;
    this.nodes.torso.add(this.wings);
  }

  setAwakened(state) {
    this.isAwakened = state;
    if (this.wings) {
      this.wings.visible = state;
    }
  }

  // =========================================================================
  // ANIMATION SYSTEM (FRAME-BY-FRAME PROCEDURAL SKELETON POSE)
  // =========================================================================

  playAnimation(state, duration = 0.3) {
    this.animState = state;
    this.animTime = 0;
    this.attackTimer = duration;
  }

  triggerAttackCombo(index = 0) {
    this.attackIndex = index;
    this.playAnimation('attack', 0.28);
  }

  update(delta) {
    this.animTime += delta;

    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.animState = 'idle';
      }
    }

    const t = this.animTime;
    const n = this.nodes;

    // Reset base rotations
    n.hips.position.y = 1.05;
    n.hips.rotation.set(0, 0, 0);
    n.torso.rotation.set(0, 0, 0);
    n.leftShoulder.rotation.set(0, 0, 0);
    n.rightShoulder.rotation.set(0, 0, 0);
    n.leftForearm.rotation.set(0, 0, 0);
    n.rightForearm.rotation.set(0, 0, 0);
    n.leftLeg.rotation.set(0, 0, 0);
    n.rightLeg.rotation.set(0, 0, 0);
    n.leftShin.rotation.set(0, 0, 0);
    n.rightShin.rotation.set(0, 0, 0);

    // Headband ribbon physics
    if (n.ribbon) {
      n.ribbon.rotation.x = -0.3 + Math.sin(t * 8) * 0.15;
      n.ribbon.rotation.z = Math.cos(t * 6) * 0.1;
    }

    // Wing flutter if awakened
    if (this.isAwakened && this.wings) {
      this.wings.rotation.z = Math.sin(t * 12) * 0.2;
      this.wings.scale.setScalar(1.0 + Math.sin(t * 14) * 0.1);
    }

    // Talking rig
    if (this.isTalking && n.head) {
      n.head.rotation.x = Math.sin(t * 14) * 0.08;
      n.head.rotation.y = Math.cos(t * 10) * 0.06;
      n.head.position.y = 0.18 + Math.sin(t * 12) * 0.02;
    }

    // Apply Animation States
    switch (this.animState) {
      case 'idle':
        // Gentle breathing & combat readiness
        n.torso.position.y = 0.22 + Math.sin(t * 3) * 0.015;
        n.leftShoulder.rotation.x = 0.2 + Math.sin(t * 3) * 0.03;
        n.rightShoulder.rotation.x = 0.2 + Math.sin(t * 3) * 0.03;
        n.leftForearm.rotation.x = -0.35;
        n.rightForearm.rotation.x = -0.35;
        break;

      case 'run':
      case 'sprint': {
        const speed = this.animState === 'sprint' ? 14 : 9;
        const cycle = t * speed;

        // Ninja forward lean
        n.hips.position.y = 1.0 + Math.abs(Math.sin(cycle)) * 0.08;
        n.hips.rotation.x = 0.25;
        n.torso.rotation.x = 0.15;

        // Arm swing
        n.leftShoulder.rotation.x = Math.sin(cycle) * 0.8;
        n.rightShoulder.rotation.x = -Math.sin(cycle) * 0.8;
        n.leftForearm.rotation.x = -0.5;
        n.rightForearm.rotation.x = -0.5;

        // Leg stride
        n.leftLeg.rotation.x = -Math.sin(cycle) * 0.9;
        n.rightLeg.rotation.x = Math.sin(cycle) * 0.9;
        n.leftShin.rotation.x = Math.max(0, Math.sin(cycle) * 0.8);
        n.rightShin.rotation.x = Math.max(0, -Math.sin(cycle) * 0.8);
        break;
      }

      case 'jump':
        n.hips.rotation.x = -0.2;
        n.leftLeg.rotation.x = -0.5;
        n.rightLeg.rotation.x = -0.3;
        n.leftShin.rotation.x = 0.6;
        n.rightShin.rotation.x = 0.5;
        n.leftShoulder.rotation.x = -0.8;
        n.rightShoulder.rotation.x = -0.8;
        break;

      case 'fall':
        n.leftLeg.rotation.x = 0.2;
        n.rightLeg.rotation.x = 0.1;
        n.leftShoulder.rotation.x = -0.4;
        n.rightShoulder.rotation.x = -0.4;
        break;

      case 'dash':
        // Low ninja sliding dash
        n.hips.position.y = 0.65;
        n.hips.rotation.x = 0.65;
        n.torso.rotation.x = 0.2;
        n.leftLeg.rotation.x = -0.8;
        n.rightLeg.rotation.x = 0.8;
        n.leftShoulder.rotation.x = -1.2;
        n.rightShoulder.rotation.x = -1.2;
        break;

      case 'guard':
        // Forward Crossed Dual-Blade X-Guard
        n.hips.position.y = 0.98;
        n.leftShoulder.rotation.set(0.7, 0.4, -0.3);
        n.rightShoulder.rotation.set(0.7, -0.4, 0.3);
        n.leftForearm.rotation.set(-1.1, 0, 0.4);
        n.rightForearm.rotation.set(-1.1, 0, -0.4);
        break;

      case 'attack':
        // 4-Hit Sword Combo Stages
        if (this.attackIndex === 0) {
          // Right-to-left horizontal slash
          n.torso.rotation.y = -0.6 + t * 4.0;
          n.rightShoulder.rotation.set(0.6, 0.4, -0.5);
          n.rightForearm.rotation.x = -0.8;
          n.leftShoulder.rotation.x = -0.3;
        } else if (this.attackIndex === 1) {
          // Left-to-right rising cross slash
          n.torso.rotation.y = 0.6 - t * 4.0;
          n.leftShoulder.rotation.set(0.8, -0.4, 0.4);
          n.leftForearm.rotation.x = -0.7;
          n.rightShoulder.rotation.set(-0.4, 0, 0);
        } else if (this.attackIndex === 2) {
          // Dual whirlwind spin
          n.hips.rotation.y = t * 18.0;
          n.leftShoulder.rotation.set(0.4, 0, -1.2);
          n.rightShoulder.rotation.set(0.4, 0, 1.2);
        } else {
          // Leaping overhead cleave
          n.hips.position.y = 1.2 - t * 1.5;
          n.torso.rotation.x = 0.6;
          n.rightShoulder.rotation.set(1.4, 0, 0);
          n.leftShoulder.rotation.set(1.4, 0, 0);
          n.rightForearm.rotation.x = -0.4;
          n.leftForearm.rotation.x = -0.4;
        }
        break;

      case 'heavy':
        // Powerful iaido thrust
        n.hips.position.y = 0.9;
        n.hips.rotation.y = -0.4;
        n.rightShoulder.rotation.set(1.2, 0.2, 0);
        n.rightForearm.rotation.x = -0.1;
        n.leftShoulder.rotation.set(-0.6, 0, 0);
        break;

      case 'hit':
        // Knockback recoil
        n.hips.position.y = 1.0;
        n.hips.rotation.x = -0.35;
        n.torso.rotation.x = -0.25;
        n.leftShoulder.rotation.set(-0.5, 0, -0.4);
        n.rightShoulder.rotation.set(-0.5, 0, 0.4);
        break;
    }
  }
}

window.Character3D = Character3D;
