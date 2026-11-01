/**
 * Harshil Kaneria — 3D scenes (three.js)
 *
 * 1. Hero robot: a ceramic-and-glass robot built from primitives. It tracks the
 *    cursor, blinks, and waves when clicked, then opens the AI twin.
 * 2. Principles cube: 27 cubes scattered as noise that assemble into one
 *    structure as you scroll, the way an eval loop turns noise into a system.
 *
 * Talks to main.js through window events: hk:scene-ready, hk:robot-hover,
 * hk:robot-click, hk:theme, hk:intro-done.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 4);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const EYE = new THREE.Color('#7df3ff');
const LAVENDER = new THREE.Color('#c4b5fd');

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.setClearColor(0x000000, 0);
  return r;
}

function makeEnv(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return tex;
}

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function accentColor() { return new THREE.Color(cssVar('--accent') || '#a78bfa'); }

// Run a render loop only while `el` is on screen and the tab is visible
function visibleLoop(el, frame, margin = '0px') {
  let running = false, onScreen = false, last = 0;
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    frame(dt, now / 1000);
    requestAnimationFrame(loop);
  };
  const sync = () => {
    const should = onScreen && !document.hidden && !reduceMotion;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    else if (!should) running = false;
  };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { rootMargin: margin }).observe(el);
  document.addEventListener('visibilitychange', sync);
}

//--------------------------------------------------------------
// 1. Hero robot
//--------------------------------------------------------------
function createRobot() {
  const stage = document.getElementById('robot-stage');
  const canvas = document.getElementById('robot-canvas');
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  scene.environmentIntensity = 0.9;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const lookAt = new THREE.Vector3(0, -0.7, 0);

  const M = {
    shell: new THREE.MeshPhysicalMaterial({ color: 0xf2f2f5, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 }),
    visor: new THREE.MeshPhysicalMaterial({ color: 0x050507, roughness: 0.05, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.02 }),
    joint: new THREE.MeshStandardMaterial({ color: 0x23232a, roughness: 0.3, metalness: 0.9 }),
    eye: new THREE.MeshBasicMaterial({ color: EYE }),
    accent: new THREE.MeshBasicMaterial({ color: accentColor() }),
    halo: new THREE.MeshBasicMaterial({ color: accentColor(), transparent: true, opacity: 0.5 })
  };
  const glowTex = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  const glow = (color, opacity, sx, sy) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.set(sx, sy, 1);
    return s;
  };

  const robot = new THREE.Group();
  const body = new THREE.Group();
  robot.add(body);
  scene.add(robot);

  // Torso + chest panel with a 3×3 LED matrix
  const torso = new THREE.Mesh(new RoundedBoxGeometry(2.1, 1.7, 1.4, 6, 0.55), M.shell);
  torso.position.y = -1.75;
  body.add(torso);
  const chestY = -1.72;
  const chest = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.58, 0.12, 4, 0.06), M.visor);
  chest.position.set(0, chestY, 0.69);
  body.add(chest);
  const leds = [];
  const ledGeo = new THREE.SphereGeometry(0.045, 16, 16);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.MeshBasicMaterial({ color: EYE.clone() });
    const led = new THREE.Mesh(ledGeo, m);
    led.position.set(-0.2 + (i % 3) * 0.2, chestY + 0.14 - Math.floor(i / 3) * 0.14, 0.76);
    led.userData.on = Math.random() > 0.4;
    body.add(led);
    leds.push(led);
  }

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.5, 40), M.joint);
  neck.position.y = -0.78;
  body.add(neck);

  // Head
  const head = new THREE.Group();
  head.position.y = -0.65;
  body.add(head);
  const skull = new THREE.Mesh(new RoundedBoxGeometry(2.0, 1.5, 1.6, 8, 0.5), M.shell);
  skull.position.y = 0.85;
  head.add(skull);
  const visor = new THREE.Mesh(new RoundedBoxGeometry(1.64, 0.96, 0.3, 6, 0.14), M.visor);
  visor.position.set(0, 0.86, 0.7);
  head.add(visor);

  const eyes = [-1, 1].map((side) => {
    const eye = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.16, 6, 18), M.eye);
    eye.rotation.z = Math.PI / 2;
    eye.scale.z = 0.45;
    eye.position.set(side * 0.34, 0.9, 0.84);
    eye.userData.base = eye.position.clone();
    const g = glow(EYE, 0.75, 0.95, 0.62);
    g.position.set(side * 0.34, 0.9, 0.9);
    g.userData.base = g.position.clone();
    head.add(eye, g);
    return { eye, g };
  });

  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 48), M.joint);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(side * 1.02, 0.85, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 12, 48), M.accent);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 1.13, 0.85, 0);
    head.add(ear, ring);
  });

  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12), M.joint);
  stalk.position.y = 1.82;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), M.accent);
  tip.position.y = 2.08;
  const tipGlow = glow(accentColor(), 0.6, 0.8, 0.8);
  tipGlow.position.y = 2.08;
  head.add(stalk, tip, tipGlow);

  // Arms hang from shoulder pivots so they can wave
  const arms = [-1, 1].map((side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 1.28, -1.22, 0);
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 32), M.joint);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.78, 8, 24), M.shell);
    arm.position.y = -0.64;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 32), M.joint);
    hand.position.y = -1.32;
    sh.add(joint, arm, hand);
    sh.rotation.z = side * 0.1;
    body.add(sh);
    return { sh, side };
  });

  // Orbiting halo with little "tokens" riding it
  const halo = new THREE.Group();
  halo.rotation.x = Math.PI / 2 - 0.32;
  halo.position.y = -1.0;
  halo.add(new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.008, 8, 240), M.halo));
  const tokenGeo = new RoundedBoxGeometry(0.12, 0.12, 0.12, 2, 0.03);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + Math.random() * 0.2;
    const tk = new THREE.Mesh(tokenGeo, i % 3 === 0 ? M.accent : M.shell);
    tk.position.set(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0);
    tk.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    tk.scale.setScalar(0.7 + Math.random() * 0.6);
    halo.add(tk);
  }
  body.add(halo);

  // Ground: a soft glow pool in dark mode, a contact shadow in light mode
  const floorGlow = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 48),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'), color: accentColor(), transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  const floorShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 48),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.45)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false })
  );
  [floorGlow, floorShadow].forEach((f) => { f.rotation.x = -Math.PI / 2; f.position.y = -3.05; robot.add(f); });

  // Lights
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3.5, 5, 6);
  const rim = new THREE.DirectionalLight(accentColor(), 3.2);
  rim.position.set(-5, 3, -4);
  const rim2 = new THREE.DirectionalLight(EYE, 1.6);
  rim2.position.set(5, -1, -3);
  scene.add(key, rim, rim2);

  function applyTheme() {
    const a = accentColor();
    const dark = isDark();
    M.accent.color.copy(a);
    M.halo.color.copy(a);
    M.halo.opacity = dark ? 0.5 : 0.65;
    tipGlow.material.color.copy(a);
    floorGlow.material.color.copy(a);
    rim.color.copy(a);
    M.shell.color.set(dark ? 0xf2f2f5 : 0xfbfbfc);
    floorGlow.visible = dark;
    floorShadow.visible = !dark;
    scene.environmentIntensity = dark ? 0.9 : 1.1;
  }
  applyTheme();

  // Sizing: keep the whole robot + halo in frame at any aspect ratio
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max((2.45 * 1.12) / tan, (2.75 * 1.08) / (tan * camera.aspect));
    camera.position.set(0, lookAt.y + 0.5, dist);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
    if (reduceMotion) renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  // Pointer → gaze; raycast → hover/click
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  const ndc = new THREE.Vector2(9, 9);
  const ray = new THREE.Raycaster();
  let hover = false, needsRay = false, lastX = -1, lastY = -1;
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), -1, 1);
    pointer.ty = clamp((e.clientY - (r.top + r.height * 0.4)) / (window.innerHeight * 0.5), -1, 1);
    pointer.active = e.pointerType === 'mouse';
    lastX = e.clientX; lastY = e.clientY;
    needsRay = true;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    const r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) setHover(false);
    else needsRay = true;
  }, { passive: true });

  // Recompute from the last pointer position so scrolling can't leave a stale hit
  function hitTest(x = lastX, y = lastY) {
    const r = canvas.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(body, true).length > 0;
  }
  function setHover(v) {
    if (v === hover) return;
    hover = v;
    canvas.style.cursor = v ? 'pointer' : '';
    window.dispatchEvent(new CustomEvent('hk:robot-hover', { detail: v }));
  }
  canvas.addEventListener('pointerleave', () => setHover(false));

  let waveT = -1, happyT = -1;
  // Listen on the window so hero text overlapping the canvas can't swallow the click
  window.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input, textarea, label, [role="button"], dialog')) return;
    if (!hitTest(e.clientX, e.clientY)) return;
    waveT = 0;
    happyT = 0;
    window.dispatchEvent(new Event('hk:robot-click'));
  });

  // Intro: the robot rises into frame once the loader lifts
  let introT = reduceMotion ? 1 : -1;
  const startIntro = () => { if (introT < 0) introT = 0; };
  if (window.__hkIntroDone) startIntro();
  else window.addEventListener('hk:intro-done', startIntro, { once: true });

  let t = 0, nextBlink = 2.2, blinkT = -1, ledClock = 0;
  const gaze = { x: 0, y: 0 };

  function frame(dt) {
    t += dt;

    if (needsRay) { needsRay = false; setHover(hitTest()); }

    // Gaze: follow the cursor, or idle-look around on touch devices
    const gx = pointer.active ? pointer.tx : Math.sin(t * 0.5) * 0.35;
    const gy = pointer.active ? pointer.ty : Math.sin(t * 0.33) * 0.15;
    gaze.x = damp(gaze.x, gx, 4, dt);
    gaze.y = damp(gaze.y, gy, 4, dt);

    head.rotation.y = gaze.x * 0.6;
    head.rotation.x = gaze.y * 0.3;
    body.rotation.y = gaze.x * 0.22;
    body.position.y = Math.sin(t * 1.2) * 0.07;

    // Intro rise + scroll parallax
    if (introT >= 0 && introT < 1) introT = Math.min(1, introT + dt / 1.6);
    const ie = easeOut(Math.max(0, introT));
    const hp = clamp(window.scrollY / window.innerHeight, 0, 1);
    robot.position.y = (1 - ie) * -2.2 + hp * 1.4;
    robot.rotation.y = (1 - ie) * -0.7 + hp * 0.9;
    robot.scale.setScalar(0.86 + ie * 0.14);

    // Blink
    if (t > nextBlink && blinkT < 0) blinkT = 0;
    let lid = 1;
    if (blinkT >= 0) {
      blinkT += dt / 0.16;
      lid = 1 - Math.sin(Math.min(1, blinkT) * Math.PI) * 0.9;
      if (blinkT >= 1) { blinkT = -1; nextBlink = t + 2.4 + Math.random() * 3; }
    }
    // Happy squint after a click
    let happy = 0;
    if (happyT >= 0) { happyT += dt; happy = smooth(0, 0.2, happyT) * (1 - smooth(1.8, 2.4, happyT)); if (happyT > 2.4) happyT = -1; }
    eyes.forEach(({ eye, g }) => {
      eye.scale.x = lid * (1 - happy * 0.5);
      eye.position.x = eye.userData.base.x + gaze.x * 0.05;
      eye.position.y = eye.userData.base.y - gaze.y * 0.04 + happy * 0.03;
      g.position.x = g.userData.base.x + gaze.x * 0.05;
      g.material.opacity = 0.7 + happy * 0.3;
    });

    // Wave
    arms.forEach(({ sh, side }) => {
      let rz = side * 0.1 + Math.sin(t * 1.2 + side) * 0.03;
      if (side === 1 && waveT >= 0) {
        waveT += dt;
        const up = smooth(0, 0.35, waveT) * (1 - smooth(1.9, 2.4, waveT));
        rz += up * (2.45 + Math.sin(waveT * 13) * 0.3);
        head.rotation.z = up * 0.1;
        if (waveT > 2.4) { waveT = -1; head.rotation.z = 0; }
      }
      sh.rotation.z = rz;
    });

    halo.rotation.z += dt * 0.22;
    tipGlow.material.opacity = 0.45 + Math.sin(t * 3) * 0.25 + happy * 0.3;
    floorGlow.material.opacity = 0.26 + Math.sin(t * 1.2) * 0.04;
    floorShadow.scale.setScalar(1 - Math.sin(t * 1.2) * 0.04);

    ledClock += dt;
    if (ledClock > 0.12) {
      ledClock = 0;
      leds.forEach((l) => { if (Math.random() < 0.25) l.userData.on = !l.userData.on; l.material.color.copy(EYE).multiplyScalar(l.userData.on ? 1 : 0.18); });
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('hk:theme', () => { applyTheme(); if (reduceMotion) renderer.render(scene, camera); });

  if (reduceMotion) {
    introT = 1;
    frame(0.016);
  } else {
    visibleLoop(stage, frame);
  }
  frame(0.016);
  stage.classList.add('is-ready');
}

//--------------------------------------------------------------
// 2. Principles cube
//--------------------------------------------------------------
function createCube() {
  const section = document.getElementById('principles');
  const canvas = document.getElementById('cube-canvas');
  const pin = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const group = new THREE.Group();
  scene.add(group);

  const M = {
    dark: new THREE.MeshPhysicalMaterial({ color: 0x1b1b21, metalness: 0.85, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
    light: new THREE.MeshPhysicalMaterial({ color: 0xf6f6f8, metalness: 0, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1 }),
    accent: new THREE.MeshPhysicalMaterial({ color: accentColor(), emissive: accentColor(), emissiveIntensity: 0.5, metalness: 0.1, roughness: 0.25, clearcoat: 1 }),
    cyan: new THREE.MeshPhysicalMaterial({ color: LAVENDER, emissive: LAVENDER, emissiveIntensity: 0.3, metalness: 0.1, roughness: 0.25, clearcoat: 1 })
  };
  const accentIdx = new Set([1, 9, 15, 25, 21]);
  const cyanIdx = new Set([5, 19]);

  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const geo = new RoundedBoxGeometry(0.9, 0.9, 0.9, 4, 0.1);
  const IDENTITY = new THREE.Quaternion();
  const cubes = [];
  let idx = 0;
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const kind = accentIdx.has(idx) ? 'accent' : cyanIdx.has(idx) ? 'cyan' : 'base';
    const mesh = new THREE.Mesh(geo, kind === 'base' ? M.dark : M[kind]);
    const tgt = new THREE.Vector3(x, y, z);
    const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const scatter = tgt.clone().add(dir.multiplyScalar(3.5 + rnd() * 4.5));
    const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28));
    cubes.push({ mesh, kind, tgt, scatter, q0, delay: rnd() * 0.45, phase: rnd() * 6.28 });
    group.add(mesh);
    idx++;
  }

  const core = new THREE.PointLight(accentColor(), 0, 6, 2);
  group.add(core);
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(4, 6, 6);
  const rim = new THREE.DirectionalLight(accentColor(), 3);
  rim.position.set(-6, 2, -5);
  const fill = new THREE.DirectionalLight(LAVENDER, 1.2);
  fill.position.set(6, -3, 2);
  scene.add(key, rim, fill);

  function applyTheme() {
    const a = accentColor();
    M.accent.color.copy(a);
    M.accent.emissive.copy(a);
    core.color.copy(a);
    rim.color.copy(a);
    const base = isDark() ? M.dark : M.light;
    cubes.forEach((c) => { if (c.kind === 'base') c.mesh.material = base; });
  }
  applyTheme();

  let layout = { x: 0, y: 0, s: 1 };
  function resize() {
    const w = pin.clientWidth, h = pin.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, 0, 14);
    camera.updateProjectionMatrix();
    const vh = 2 * 14 * Math.tan(THREE.MathUtils.degToRad(15));
    const vw = vh * camera.aspect;
    layout = camera.aspect > 1.1 ? { x: vw * 0.2, y: 0, s: 1 } : camera.aspect > 0.75 ? { x: 0, y: vh * 0.02, s: 0.72 } : { x: 0, y: -vh * 0.01, s: 0.58 };
    render(currentP(), performance.now() / 1000);
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function currentP() {
    if (reduceMotion) return 1;
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 1;
  }

  let shown = 0;
  function render(p, t, dt = 0.016) {
    // fade the canvas in as the section arrives
    const r = section.getBoundingClientRect();
    shown = damp(shown, r.top < window.innerHeight * 0.6 ? 1 : 0, 3, dt);
    canvas.style.opacity = reduceMotion ? 1 : shown.toFixed(3);

    const a = clamp(p / 0.82, 0, 1);
    cubes.forEach((c) => {
      const e = easeInOut(clamp((a - c.delay) / 0.55, 0, 1));
      c.mesh.position.lerpVectors(c.scatter, c.tgt, e);
      c.mesh.position.y += (1 - e) * Math.sin(t * 0.8 + c.phase) * 0.18;
      c.mesh.quaternion.slerpQuaternions(c.q0, IDENTITY, e);
    });
    pointer.x = damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    group.position.set(layout.x, layout.y, 0);
    group.scale.setScalar(layout.s * (1 + (a >= 1 ? Math.sin(t * 2) * 0.008 : 0)));
    group.rotation.y = -0.7 + p * Math.PI * 1.15 + pointer.x * 0.25 + (reduceMotion ? 0 : t * 0.04);
    group.rotation.x = 0.5 - p * 0.18 + pointer.y * 0.15;
    core.intensity = Math.pow(a, 3) * 8;
    renderer.render(scene, camera);
  }

  new ResizeObserver(resize).observe(pin);
  window.addEventListener('hk:theme', () => { applyTheme(); render(currentP(), performance.now() / 1000); });
  resize();
  if (reduceMotion) render(1, 0);
  else visibleLoop(pin, (dt, t) => render(currentP(), t, dt), '200px 0px');
}

//--------------------------------------------------------------
// Boot
//--------------------------------------------------------------
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (webglAvailable()) {
  try { createRobot(); } catch (e) { console.warn('Robot scene failed:', e); }
  // Build the cube only when its section is about to scroll in
  const section = document.getElementById('principles');
  if (section) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      try { createCube(); } catch (err) { console.warn('Cube scene failed:', err); }
    }, { rootMargin: '100% 0px' });
    io.observe(section);
  }
}
window.dispatchEvent(new Event('hk:scene-ready'));
