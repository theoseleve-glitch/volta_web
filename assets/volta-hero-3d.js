/*
 * volta-hero-3d.js
 * Three.js 3D hero — 4 clear-glass shot bottles in a horizontal row,
 * scattered fruits, studio background, scroll-synced rotation.
 *
 * Loads as an ES module via the <script type="module"> tag in volta-hero-3d.liquid,
 * which defines an importmap pointing "three" and "three/addons/" at jsDelivr.
 *
 * When the real bottle GLB arrives (assets/volta-bottle.glb), swap the
 * `buildPlaceholderBottle()` call for `loader.load('volta-bottle.glb', …)`.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const BOTTLE_COUNT = 4;
const BOTTLE_SPACING = 1.8;
const LABEL_COLORS = [0xfde047, 0xff9a3c, 0x7fefa8, 0x8b5cf6]; // yellow / orange / green / purple

async function initHero3D() {
  const container = document.querySelector('[data-volta-hero-3d]');
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (reduceMotion || isMobile) {
    // Static fallback — show the fallback image if present, skip WebGL
    container.classList.add('v-hero-3d--static');
    return;
  }

  // ── Scene, camera, renderer ────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = null; // transparent — let the section bg show

  const camera = new THREE.PerspectiveCamera(
    32,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.3, 7);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── Environment (reflections) ──────────────────────────────────────────
  // RoomEnvironment is a built-in Three.js procedural studio — no external HDRI needed.
  // Gives the bottles realistic reflections right away.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ── Lighting rig ───────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(-4, 5, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -6;
  keyLight.shadow.camera.right = 6;
  keyLight.shadow.camera.top = 3;
  keyLight.shadow.camera.bottom = -3;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x7fefa8, 0.6);
  rimLight.position.set(3, 2, -4);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xffd7a3, 0.3);
  fillLight.position.set(2, -1, 3);
  scene.add(fillLight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ── Ground plane (catches shadows, invisible otherwise) ────────────────
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Bottles ────────────────────────────────────────────────────────────
  const bottleGroup = new THREE.Group();
  scene.add(bottleGroup);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.95,
    thickness: 0.4,
    ior: 1.45,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    envMapIntensity: 1.2,
  });

  // Liquid inside (ginger-shot yellow-ish) — sits just inside the glass
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd24a,
    metalness: 0,
    roughness: 0.15,
    transmission: 0.55,
    thickness: 0.8,
    ior: 1.33,
    envMapIntensity: 0.6,
  });

  const corkMat = new THREE.MeshStandardMaterial({
    color: 0x2a1b0d,
    roughness: 0.65,
    metalness: 0.05,
  });

  for (let i = 0; i < BOTTLE_COUNT; i++) {
    const bottle = buildPlaceholderBottle(glassMat, liquidMat, corkMat, LABEL_COLORS[i]);
    bottle.position.x = (i - (BOTTLE_COUNT - 1) / 2) * BOTTLE_SPACING;
    bottle.userData.baseX = bottle.position.x;
    bottle.userData.index = i;
    bottleGroup.add(bottle);
  }

  // ── Fruits (placeholder icospheres — replace with GLBs later) ───────────
  const fruitGroup = new THREE.Group();
  scene.add(fruitGroup);

  const fruits = [
    { color: 0xffd24a, scale: 0.45, pos: [-3.2, -0.9, 0.6] },  // ginger-root-ish
    { color: 0xffeb3b, scale: 0.3,  pos: [ 3.4, -1.0, 0.4] },  // lemon
    { color: 0xff9a3c, scale: 0.42, pos: [ 0.0, -1.0, 1.2] },  // orange
    { color: 0xffd24a, scale: 0.25, pos: [-1.5, -1.0, 1.5] },  // smaller ginger
    { color: 0xffeb3b, scale: 0.22, pos: [ 2.0, -1.05, 1.3] }, // smaller lemon
  ];

  fruits.forEach((f, i) => {
    const geom = new THREE.IcosahedronGeometry(f.scale, 2);
    // Slight deformation for organic look
    const positions = geom.attributes.position;
    for (let v = 0; v < positions.count; v++) {
      const nx = positions.getX(v) + (Math.random() - 0.5) * 0.03;
      const ny = positions.getY(v) + (Math.random() - 0.5) * 0.03;
      const nz = positions.getZ(v) + (Math.random() - 0.5) * 0.03;
      positions.setXYZ(v, nx, ny, nz);
    }
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: f.color,
      roughness: 0.55,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(...f.pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.spin = (Math.random() - 0.5) * 0.004;
    fruitGroup.add(mesh);
  });

  // ── Mouse parallax ──────────────────────────────────────────────────────
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  container.addEventListener('pointermove', (e) => {
    const r = container.getBoundingClientRect();
    mouse.targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouse.targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  // ── Scroll-synced rotation via GSAP ScrollTrigger (if loaded) ──────────
  let scrollProgress = 0;
  if (window.gsap && window.ScrollTrigger) {
    window.ScrollTrigger.create({
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => { scrollProgress = self.progress; },
    });
  }

  // ── Resize ──────────────────────────────────────────────────────────────
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  // ── Render loop ─────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  function tick() {
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    bottleGroup.children.forEach((b, i) => {
      // Idle spin + scroll-driven rotation + a slight bob
      b.rotation.y = t * 0.3 + scrollProgress * Math.PI * 2 + i * 0.4;
      b.position.y = Math.sin(t * 1.2 + i) * 0.06;
      b.position.x = b.userData.baseX + mouse.x * 0.1;
    });

    fruitGroup.children.forEach((f) => {
      f.rotation.y += f.userData.spin || 0;
      f.rotation.x += (f.userData.spin || 0) * 0.6;
    });

    // Gentle camera parallax from mouse
    camera.position.x = mouse.x * 0.4;
    camera.position.y = 0.3 + mouse.y * 0.2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  // Cleanup hook for Shopify section reloads in the Theme Editor
  document.addEventListener('shopify:section:unload', (e) => {
    if (e.target.contains(container)) {
      ro.disconnect();
      renderer.dispose();
      pmrem.dispose();
    }
  });
}

/**
 * buildPlaceholderBottle — lathe-shaped shot bottle approximation.
 * Swap for GLTFLoader('volta-bottle.glb') when the real model arrives.
 */
function buildPlaceholderBottle(glassMat, liquidMat, corkMat, labelColor) {
  const group = new THREE.Group();

  // Lathe profile points (x = radius, y = height) — approximates a shot bottle
  // Height runs from y = -1 (bottom) to y = 1 (shoulder), then neck 1..1.15, then cap 1.15..1.25
  const profile = [];
  profile.push(new THREE.Vector2(0.0, -0.98));
  profile.push(new THREE.Vector2(0.42, -0.98));
  profile.push(new THREE.Vector2(0.44, -0.85));
  profile.push(new THREE.Vector2(0.44,  0.55));
  profile.push(new THREE.Vector2(0.42,  0.7));
  profile.push(new THREE.Vector2(0.32,  0.82));
  profile.push(new THREE.Vector2(0.20,  0.95));
  profile.push(new THREE.Vector2(0.18,  1.05));
  profile.push(new THREE.Vector2(0.18,  1.10));

  const bottleGeo = new THREE.LatheGeometry(profile, 64);
  bottleGeo.computeVertexNormals();
  const bottle = new THREE.Mesh(bottleGeo, glassMat);
  bottle.castShadow = true;
  group.add(bottle);

  // Liquid inside — same profile scaled down slightly and capped lower
  const liquidProfile = [
    new THREE.Vector2(0.0, -0.96),
    new THREE.Vector2(0.40, -0.96),
    new THREE.Vector2(0.42, -0.85),
    new THREE.Vector2(0.42, 0.30),
    new THREE.Vector2(0.0, 0.30),
  ];
  const liquidGeo = new THREE.LatheGeometry(liquidProfile, 48);
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  group.add(liquid);

  // Cork / cap on top
  const capGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.18, 32);
  const cap = new THREE.Mesh(capGeo, corkMat);
  cap.position.y = 1.18;
  cap.castShadow = true;
  group.add(cap);

  // Label — slightly curved plane wrapped around the main cylinder section
  const labelGeo = new THREE.CylinderGeometry(0.445, 0.445, 0.65, 48, 1, true, -Math.PI / 2.5, Math.PI / 1.3);
  const labelMat = new THREE.MeshStandardMaterial({
    color: labelColor,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
    emissive: labelColor,
    emissiveIntensity: 0.08,
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = -0.1;
  group.add(label);

  return group;
}

// ── Boot ────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero3D);
} else {
  initHero3D();
}
document.addEventListener('shopify:section:load', initHero3D);
