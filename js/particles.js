/**
 * ECLIPSE: THE LAST SHINOBI - 3D PARTICLE & VISUAL EFFECTS SYSTEM
 * Manages sword slash arcs, weapon clash sparks, elemental bursts,
 * environmental weather particles (Cherry blossoms, Rain, Void ashes),
 * destructible debris, and 3D floating damage numbers.
 */

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    // Active particle groups
    this.sparks = [];
    this.slashes = [];
    this.elementals = [];
    this.ambientParticles = null;
    this.rainParticles = null;
    this.debrisList = [];
    this.damageNumbers = [];

    this.initAmbientParticles();
    this.initRainSystem();
  }

  // =========================================================================
  // AMBIENT PARTICLES (CHERRY BLOSSOMS & VOID ASH)
  // =========================================================================

  initAmbientParticles() {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = [];

    const color1 = new THREE.Color(0xffb7b2); // Sakura Pink
    const color2 = new THREE.Color(0xffdac1); // Soft peach

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 30 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

      const c = Math.random() > 0.5 ? color1 : color2;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      velocities.push({
        vx: (Math.random() - 0.5) * 0.15 + 0.05,
        vy: -(Math.random() * 0.08 + 0.04),
        vz: (Math.random() - 0.5) * 0.15,
        swaySpeed: Math.random() * 2 + 1,
        swayOffset: Math.random() * Math.PI * 2
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending
    });

    this.ambientParticles = new THREE.Points(geometry, material);
    this.ambientVelocities = velocities;
    this.scene.add(this.ambientParticles);
  }

  // =========================================================================
  // DYNAMIC WEATHER: RAIN SYSTEM
  // =========================================================================

  initRainSystem() {
    const rainCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 6); // Line segments (2 vertices per streak)
    
    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * 140;
      const y = Math.random() * 40;
      const z = (Math.random() - 0.5) * 140;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y - 1.2;
      positions[i * 6 + 5] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.rainLines = new THREE.LineSegments(geometry, material);
    this.rainLines.visible = false;
    this.scene.add(this.rainLines);
  }

  setRainActive(active) {
    if (this.rainLines) {
      this.rainLines.visible = active;
    }
  }

  // =========================================================================
  // COMBAT SPARKS & WEAPON IMPACTS
  // =========================================================================

  spawnSparks(position, count = 18, colorHex = 0xffd166) {
    for (let i = 0; i < count; i++) {
      const geom = new THREE.SphereGeometry(0.08, 4, 4);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 1.0
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.3) * Math.PI;
      const speed = Math.random() * 8 + 4;

      const velocity = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elev) * speed,
        Math.sin(elev) * speed + 3,
        Math.sin(angle) * Math.cos(elev) * speed
      );

      this.scene.add(mesh);
      this.sparks.push({
        mesh: mesh,
        velocity: velocity,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.35 + Math.random() * 0.2
      });
    }
  }

  // =========================================================================
  // SWORD SLASH ARC RIBBONS
  // =========================================================================

  spawnSlashArc(origin, direction, radius = 2.4, colorHex = 0xc77dff) {
    const arcSegments = 16;
    const geom = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const baseColor = new THREE.Color(colorHex);
    const tipColor = new THREE.Color(0xffffff);

    const normal = new THREE.Vector3(0, 1, 0);
    const tangent = new THREE.Vector3().crossVectors(direction, normal).normalize();

    const startAngle = -Math.PI * 0.35;
    const endAngle = Math.PI * 0.35;

    for (let i = 0; i <= arcSegments; i++) {
      const t = i / arcSegments;
      const angle = startAngle + (endAngle - startAngle) * t;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Inner and outer ribbon edge
      const rInner = radius * 0.65;
      const rOuter = radius * 1.15;

      const pInner = new THREE.Vector3()
        .copy(origin)
        .addScaledVector(direction, cosA * rInner)
        .addScaledVector(tangent, sinA * rInner)
        .add(new THREE.Vector3(0, 1.2, 0));

      const pOuter = new THREE.Vector3()
        .copy(origin)
        .addScaledVector(direction, cosA * rOuter)
        .addScaledVector(tangent, sinA * rOuter)
        .add(new THREE.Vector3(0, 1.2, 0));

      vertices.push(pInner.x, pInner.y, pInner.z);
      vertices.push(pOuter.x, pOuter.y, pOuter.z);

      const edgeColor = t < 0.5 ? tipColor : baseColor;
      colors.push(edgeColor.r, edgeColor.g, edgeColor.b);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Triangle strip indices
    const indices = [];
    for (let i = 0; i < arcSegments; i++) {
      const idx = i * 2;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx + 1, idx + 3, idx + 2);
    }
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geom, mat);
    this.scene.add(mesh);

    this.slashes.push({
      mesh: mesh,
      life: 0.22,
      maxLife: 0.22
    });
  }

  // =========================================================================
  // ELEMENTAL BURSTS (VOID CRESCENT & THUNDER STEP)
  // =========================================================================

  spawnVoidWaveProjectile(origin, direction) {
    const group = new THREE.Group();
    group.position.copy(origin).add(new THREE.Vector3(0, 1.2, 0));

    // Dark crescent wave mesh
    const crescentGeom = new THREE.TorusGeometry(1.6, 0.2, 8, 24, Math.PI * 0.7);
    const crescentMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: false,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const crescentMesh = new THREE.Mesh(crescentGeom, crescentMat);
    crescentMesh.rotation.x = Math.PI * 0.5;
    group.add(crescentMesh);

    // Glowing core sphere
    const coreGeom = new THREE.SphereGeometry(0.4, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Mesh(coreGeom, coreMat));

    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(group);
    this.elementals.push({
      type: 'projectile',
      mesh: group,
      velocity: direction.clone().multiplyScalar(28),
      damage: 180,
      radius: 1.8,
      life: 1.5
    });
  }

  spawnThunderDashTrail(startPos, endPos) {
    const points = [];
    const segments = 12;
    const diff = new THREE.Vector3().subVectors(endPos, startPos);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = new THREE.Vector3().copy(startPos).addScaledVector(diff, t);
      if (i > 0 && i < segments) {
        p.x += (Math.random() - 0.5) * 1.5;
        p.y += (Math.random() - 0.5) * 1.5;
        p.z += (Math.random() - 0.5) * 1.5;
      }
      points.push(p);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 20, 0.12, 6, false);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geom, mat);
    this.scene.add(mesh);

    this.slashes.push({
      mesh: mesh,
      life: 0.35,
      maxLife: 0.35
    });
  }

  // =========================================================================
  // DESTRUCTIBLE OBJECT DEBRIS
  // =========================================================================

  spawnDebris(origin, count = 12, colorHex = 0x8b5a2b) {
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry(
        0.2 + Math.random() * 0.3,
        0.2 + Math.random() * 0.3,
        0.2 + Math.random() * 0.3
      );
      const mat = new THREE.MeshLambertMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(origin).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        Math.random() * 0.8,
        (Math.random() - 0.5) * 0.6
      ));

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 3,
        (Math.random() - 0.5) * 8
      );

      const rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      this.scene.add(mesh);
      this.debrisList.push({
        mesh: mesh,
        velocity: vel,
        rotVelocity: rotVel,
        life: 2.0
      });
    }
  }

  // =========================================================================
  // 3D FLOATING DAMAGE NUMBERS
  // =========================================================================

  spawnDamageNumber(position, amount, isCrit = false, isVoid = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 36px "Cinzel", "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let textColor = '#ffffff';
    let strokeColor = '#000000';

    if (isCrit) {
      textColor = '#ffd166';
      strokeColor = '#b38200';
    } else if (isVoid) {
      textColor = '#c77dff';
      strokeColor = '#5a189a';
    }

    ctx.lineWidth = 6;
    ctx.strokeStyle = strokeColor;
    ctx.strokeText(amount, 64, 32);

    ctx.fillStyle = textColor;
    ctx.fillText(amount, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(position).add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.6,
      1.8 + Math.random() * 0.4,
      (Math.random() - 0.5) * 0.6
    ));
    sprite.scale.set(isCrit ? 2.2 : 1.6, isCrit ? 1.1 : 0.8, 1);

    this.scene.add(sprite);

    this.damageNumbers.push({
      sprite: sprite,
      velocity: new THREE.Vector3(0, 1.8, 0),
      life: 0.85,
      maxLife: 0.85
    });
  }

  // =========================================================================
  // UPDATE LOOP (CALLED EVERY FRAME)
  // =========================================================================

  update(delta, playerPos) {
    // 1. Ambient particles update
    if (this.ambientParticles && playerPos) {
      const positions = this.ambientParticles.geometry.attributes.position.array;
      const count = this.ambientVelocities.length;
      const time = performance.now() * 0.001;

      for (let i = 0; i < count; i++) {
        const vel = this.ambientVelocities[i];
        const sway = Math.sin(time * vel.swaySpeed + vel.swayOffset) * 0.05;

        positions[i * 3] += (vel.vx + sway);
        positions[i * 3 + 1] += vel.vy;
        positions[i * 3 + 2] += (vel.vz + sway);

        // Wrap around player if too far or hit ground
        if (positions[i * 3 + 1] < 0.2 || Math.abs(positions[i * 3] - playerPos.x) > 80 || Math.abs(positions[i * 3 + 2] - playerPos.z) > 80) {
          positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 120;
          positions[i * 3 + 1] = Math.random() * 25 + 10;
          positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 120;
        }
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Rain streak update
    if (this.rainLines && this.rainLines.visible && playerPos) {
      const positions = this.rainLines.geometry.attributes.position.array;
      const lineCount = positions.length / 6;

      for (let i = 0; i < lineCount; i++) {
        const idx = i * 6;
        positions[idx + 1] -= 28 * delta;
        positions[idx + 4] = positions[idx + 1] - 1.2;

        if (positions[idx + 1] < 0) {
          positions[idx] = playerPos.x + (Math.random() - 0.5) * 100;
          positions[idx + 1] = 30 + Math.random() * 10;
          positions[idx + 2] = playerPos.z + (Math.random() - 0.5) * 100;

          positions[idx + 3] = positions[idx];
          positions[idx + 4] = positions[idx + 1] - 1.2;
          positions[idx + 5] = positions[idx + 2];
        }
      }
      this.rainLines.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Sparks update
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.life -= delta;

      spark.velocity.y -= 22 * delta; // Gravity
      spark.mesh.position.addScaledVector(spark.velocity, delta);

      // Bounce on floor
      if (spark.mesh.position.y < 0.1) {
        spark.mesh.position.y = 0.1;
        spark.velocity.y *= -0.4;
      }

      spark.mesh.material.opacity = spark.life / spark.maxLife;

      if (spark.life <= 0) {
        this.scene.remove(spark.mesh);
        spark.mesh.geometry.dispose();
        spark.mesh.material.dispose();
        this.sparks.splice(i, 1);
      }
    }

    // 4. Slashes update
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const slash = this.slashes[i];
      slash.life -= delta;
      slash.mesh.material.opacity = Math.max(0, slash.life / slash.maxLife);

      if (slash.life <= 0) {
        this.scene.remove(slash.mesh);
        slash.mesh.geometry.dispose();
        slash.mesh.material.dispose();
        this.slashes.splice(i, 1);
      }
    }

    // 5. Elementals update
    for (let i = this.elementals.length - 1; i >= 0; i--) {
      const el = this.elementals[i];
      el.life -= delta;
      el.mesh.position.addScaledVector(el.velocity, delta);

      // Projectile collision detection
      if (el.type === 'projectile' && window.game && window.game.enemies) {
        for (const enemy of window.game.enemies.enemies) {
          if (enemy.hp > 0) {
            const dist = el.mesh.position.distanceTo(enemy.mesh.position);
            if (dist < (el.radius || 2.2)) {
              window.game.enemies.applyDamageToEnemy(enemy, el.damage || 180, true, true);
              this.spawnSparks(enemy.mesh.position, 16, 0xc77dff);
              el.life = 0; // Consume projectile on hit
              break;
            }
          }
        }
      }

      if (el.life <= 0) {
        this.scene.remove(el.mesh);
        this.elementals.splice(i, 1);
      }
    }

    // 6. Debris update
    for (let i = this.debrisList.length - 1; i >= 0; i--) {
      const deb = this.debrisList[i];
      deb.life -= delta;

      deb.velocity.y -= 18 * delta;
      deb.mesh.position.addScaledVector(deb.velocity, delta);

      deb.mesh.rotation.x += deb.rotVelocity.x * delta;
      deb.mesh.rotation.y += deb.rotVelocity.y * delta;
      deb.mesh.rotation.z += deb.rotVelocity.z * delta;

      if (deb.mesh.position.y < 0.1) {
        deb.mesh.position.y = 0.1;
        deb.velocity.y *= -0.3;
        deb.velocity.x *= 0.7;
        deb.velocity.z *= 0.7;
      }

      if (deb.life <= 0) {
        this.scene.remove(deb.mesh);
        deb.mesh.geometry.dispose();
        deb.mesh.material.dispose();
        this.debrisList.splice(i, 1);
      }
    }

    // 7. Damage numbers update
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const num = this.damageNumbers[i];
      num.life -= delta;

      num.sprite.position.addScaledVector(num.velocity, delta);
      num.sprite.material.opacity = Math.max(0, num.life / num.maxLife);

      if (num.life <= 0) {
        this.scene.remove(num.sprite);
        num.sprite.material.map.dispose();
        num.sprite.material.dispose();
        this.damageNumbers.splice(i, 1);
      }
    }
  }
}

window.ParticleSystem = ParticleSystem;
