(() => {
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!window.gsap || !window.ScrollTrigger) { window.finishPortfolioIntro?.(); return; }
gsap.registerPlugin(ScrollTrigger);

function initScene() {
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xFBFAF5, 26, 60);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
camera.position.set(-2, 3.5, 14);

const INK = 0x15151C;
const RED = 0xE0202F;

function windowTexture(w, h) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#EFEBDE';
  x.fillRect(0, 0, 64, 128);
  x.fillStyle = 'rgba(21,21,28,.8)';
  for (let r = 8; r < 124; r += 14) {
    for (let col = 8; col < 60; col += 14) {
      if (Math.random() < 0.72) {
        x.fillRect(col, r, 7, 8);
      } else {
        x.fillStyle = 'rgba(255,196,0,.9)';
        x.fillRect(col, r, 7, 8);
        x.fillStyle = 'rgba(21,21,28,.8)';
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.repeat.set(Math.max(1, Math.round(w / 1.4)), Math.max(1, Math.round(h / 2.4)));
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

const city = new THREE.Group();
const buildingDefs = [
  [-13, 3, 7, -6], [-9.5, 2.6, 10, -5], [-6, 3.4, 14, -4.5], [-2.4, 2.4, 8, -6.5],
  [0.8, 3, 11, -5.5], [4.4, 2.8, 9, -6], [8.2, 3.6, 12.5, -2.6], [12.6, 3, 8, -6.2], [16.2, 3.4, 10.5, -5.4],
  [-17, 3, 9, -7], [19.8, 2.8, 7.5, -7]
];
const HERO_BIDX = 6;
const HERO_BH = 12.5;
let heroBuilding = null;

buildingDefs.forEach((d, i) => {
  const [bx, bw, bh, bz] = d;
  const g = new THREE.BoxGeometry(bw, bh, bw);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: windowTexture(bw, bh) }));
  m.position.set(bx, bh / 2 - 4.5, bz);
  city.add(m);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(g),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.9 })
  );
  edges.position.copy(m.position);
  city.add(edges);

  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(bw + 0.3, 0.22, bw + 0.3),
    new THREE.MeshBasicMaterial({ color: INK })
  );
  ledge.position.set(bx, bh - 4.5 + 0.11, bz);
  city.add(ledge);

  if (i === HERO_BIDX) {
    heroBuilding = m;
  }
});
scene.add(city);

const farRow = new THREE.Group();
for (let i = 0; i < 16; i++) {
  const w = 2 + Math.random() * 2.5;
  const h = 4 + Math.random() * 8;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: 0xD9D4C4, transparent: true, opacity: 0.55 })
  );
  m.position.set(-22 + i * 3, h / 2 - 4.5, -16);
  farRow.add(m);
}
scene.add(farRow);

const clouds = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const cg = new THREE.Group();
  for (let b = 0; b < 4; b++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 + Math.random() * 0.5, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    );
    s.position.set(b * 0.9 - 1.3, Math.random() * 0.3, 0);
    cg.add(s);

    const o = new THREE.LineSegments(
      new THREE.EdgesGeometry(s.geometry),
      new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.12 })
    );
    o.position.copy(s.position);
    cg.add(o);
  }
  cg.position.set(-14 + i * 9, 6.5 + Math.random() * 3, -10 - Math.random() * 4);
  cg.userData = { sp: 0.08 + Math.random() * 0.12 };
  clouds.add(cg);
}
scene.add(clouds);

const hero = new THREE.Group();
const inkMat = new THREE.MeshBasicMaterial({ color: INK });
function part(geom, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(geom, inkMat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.scale.set(sx, sy, sz);
  hero.add(m);
  return m;
}

part(new THREE.SphereGeometry(0.34, 14, 14), 0.12, 1.62, 0, 0, 0, 0, 1, 0.92, 1);
part(new THREE.CylinderGeometry(0.26, 0.34, 0.95, 10), -0.08, 0.95, 0, 0, 0, 0.5);
part(new THREE.CylinderGeometry(0.11, 0.13, 0.85, 8), -0.42, 0.42, 0.16, 0, 0, 1.25);
part(new THREE.CylinderGeometry(0.09, 0.11, 0.8, 8), -0.95, 0.18, 0.16, 0, 0, -0.9);
part(new THREE.CylinderGeometry(0.11, 0.13, 0.8, 8), -0.1, 0.36, -0.18, 0, 0, 0.35);
part(new THREE.CylinderGeometry(0.09, 0.11, 0.75, 8), 0.12, 0, -0.18, 0, 0, -0.15);
part(new THREE.BoxGeometry(0.34, 0.12, 0.16), 0.16, -0.36, -0.18);
part(new THREE.BoxGeometry(0.34, 0.12, 0.16), -1.2, -0.1, 0.16);
part(new THREE.CylinderGeometry(0.09, 0.1, 0.8, 8), 0.58, 1.45, 0.05, 0, 0, -1.35);
part(new THREE.SphereGeometry(0.12, 10, 10), 0.98, 1.62, 0.05);
part(new THREE.CylinderGeometry(0.08, 0.09, 0.6, 8), -0.28, 1.15, -0.22, 0, 0, 0.9);
part(new THREE.SphereGeometry(0.1, 10, 10), -0.52, 0.88, -0.22);
hero.scale.setScalar(2.2);

const perch = new THREE.Vector3(
  heroBuilding.position.x - 0.4,
  heroBuilding.position.y + (HERO_BH / 2) + 0.25,
  heroBuilding.position.z + 1.2
);
hero.position.copy(perch);
const HERO_BASE_ROT = 2.75;
hero.rotation.y = HERO_BASE_ROT;
scene.add(hero);

const handLocal = new THREE.Vector3(0.98, 1.62, 0.05);
function handWorld() {
  return hero.localToWorld(handLocal.clone());
}

const moon = new THREE.Group();
const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(4.6, 48), new THREE.MeshBasicMaterial({ color: 0xFFE9A8 }));
const moonRing = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.78, 48), new THREE.MeshBasicMaterial({ color: INK }));
const moonRing2 = new THREE.Mesh(new THREE.RingGeometry(5.1, 5.16, 48), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.35 }));
moon.add(moonDisc, moonRing, moonRing2);

for (let i = 0; i < 7; i++) {
  const cr = new THREE.Mesh(
    new THREE.CircleGeometry(0.22 + Math.random() * 0.4, 20),
    new THREE.MeshBasicMaterial({ color: 0xF3D67C })
  );
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 3.4;
  cr.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.01);
  moon.add(cr);
}
moon.position.set(perch.x + 0.6, perch.y + 2.6, perch.z - 6.5);
scene.add(moon);

const WEB_SEGS = 900;
const RADIAL = 6;
function buildWebCurve() {
  const h = handWorld();
  const pts = [
    h,
    h.clone().add(new THREE.Vector3(-3.2, 2.6, 1.2)),
    new THREE.Vector3(3.5, 8, -1),
    new THREE.Vector3(-1, 5, 2.5),
    new THREE.Vector3(-6, 9, -2),
    new THREE.Vector3(-11, 5.5, 3),
    new THREE.Vector3(-16, 10, -3),
    new THREE.Vector3(-21, 6.5, 2),
    new THREE.Vector3(-27, 10.5, -4),
    new THREE.Vector3(-33, 7.5, 1)
  ];
  return new THREE.CatmullRomCurve3(pts);
}

let webCurve = buildWebCurve();
const webGeo = new THREE.TubeGeometry(webCurve, WEB_SEGS, 0.045, RADIAL, false);
const web = new THREE.Mesh(webGeo, new THREE.MeshBasicMaterial({ color: INK }));
web.geometry.setDrawRange(0, 0);
scene.add(web);

const web2 = new THREE.Mesh(
  new THREE.TubeGeometry(webCurve, WEB_SEGS, 0.016, RADIAL, false),
  new THREE.MeshBasicMaterial({ color: RED })
);
web2.position.y = 0.09;
web2.geometry.setDrawRange(0, 0);
scene.add(web2);

const tip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshBasicMaterial({ color: RED }));
const tipRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.02, 6, 24),
  new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.7 })
);
scene.add(tip, tipRing);

const checkpoints = [];
[0.22, 0.45, 0.68, 0.9].forEach((at) => {
  const grp = new THREE.Group();
  const SP = 10;
  for (let s = 0; s < SP; s++) {
    const a = s / SP * Math.PI * 2;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0)
    ]);
    grp.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.8 })));
  }
  for (let r = 0.25; r <= 0.85; r += 0.2) {
    const ringPts = [];
    for (let s = 0; s <= SP; s++) {
      const a = s / SP * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    grp.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.6 })
    ));
  }
  const p = webCurve.getPointAt(at);
  grp.position.copy(p);
  grp.scale.setScalar(0);
  grp.userData = { at, shown: false };
  scene.add(grp);
  checkpoints.push(grp);
});

let webProgress = 0;
let webTarget = 0;
function setHud(p) {
  document.getElementById('hudWeb').textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
}

addEventListener('scroll', () => {
  const h = document.documentElement;
  const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  webTarget = p;
  document.getElementById('progFill').style.width = p * 100 + '%';
  document.getElementById('hudScroll').textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
}, { passive: true });

const footer = document.querySelector('footer');
const bottomHud = document.querySelector('.hud-br');
if (footer && bottomHud) {
  const footerObserver = new IntersectionObserver(([entry]) => {
    bottomHud.classList.toggle('is-hidden', entry.isIntersecting);
  }, { threshold: 0 });
  footerObserver.observe(footer);
}

const camBase = { x: 0, y: 5, z: 14 };
const mouse = { x: 0, y: 0 };
addEventListener('pointermove', (e) => {
  mouse.x = e.clientX / innerWidth - 0.5;
  mouse.y = e.clientY / innerHeight - 0.5;
});

const shots = [];
const WORDS = ['THWACK!', 'BAM!', 'ZAP!', 'GOTCHA!', 'SNAP!'];

function comicBurst(x, y) {
  const el = document.createElement('div');
  el.className = 'burst';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const col = Math.random() < 0.5 ? '#E0202F' : '#2342D6';
  el.innerHTML = `<svg viewBox="0 0 100 100"><polygon points="50,2 58,30 88,12 70,38 98,46 70,56 86,84 56,68 50,98 42,68 14,86 30,56 2,48 30,40 12,12 42,30" fill="${col}" stroke="#15151C" stroke-width="3"/></svg><b>${word}</b>`;
  document.body.appendChild(el);
  gsap.fromTo(el, { scale: 0, rotate: -20 }, { scale: 1, rotate: 6, duration: 0.35, ease: 'back.out(3)' });
  gsap.to(el, { scale: 0, opacity: 0, duration: 0.3, delay: 0.55, ease: 'back.in(2)', onComplete: () => el.remove() });
}

function webSplat(x, y) {
  const el = document.createElement('div');
  el.className = 'websplat';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  let spokes = '';
  let rings = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    spokes += `<line x1="60" y1="60" x2="${60 + Math.cos(a) * 56}" y2="${60 + Math.sin(a) * 56}"/>`;
  }
  for (let r = 14; r <= 52; r += 13) {
    let d = '';
    for (let i = 0; i <= 10; i++) {
      const a = i / 10 * Math.PI * 2;
      d += (i === 0 ? 'M' : 'L') + (60 + Math.cos(a) * r) + ',' + (60 + Math.sin(a) * r);
    }
    rings += `<path d="${d}Z" fill="none"/>`;
  }
  el.innerHTML = `<svg width="120" height="120" viewBox="0 0 120 120" stroke="#15151C" stroke-width="1.6" opacity=".75">${spokes}${rings}</svg>`;
  document.body.appendChild(el);
  gsap.fromTo(el, { scale: 0.2, opacity: 1, rotate: Math.random() * 40 - 20 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  gsap.to(el, { opacity: 0, scale: 1.15, duration: 0.6, delay: 0.5, onComplete: () => el.remove() });
}

const TAP_MOVE_LIMIT = 12;
const TAP_TIME_LIMIT = 650;
let touchPress = null;

function fireWebShot(x, y) {
  if (reduceMotion) return;
  const v = new THREE.Vector3((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1, 0.5).unproject(camera);
  const dir = v.sub(camera.position).normalize();
  const target = camera.position.clone().add(dir.multiplyScalar(13));
  const start = handWorld();
  const mid = start.clone().lerp(target, 0.5).add(new THREE.Vector3(0, 1.2, 0));
  const curve = new THREE.CatmullRomCurve3([start, mid, target]);
  const SEG = 60;
  const g = new THREE.TubeGeometry(curve, SEG, 0.03, 5, false);
  g.setDrawRange(0, 0);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: RED }));
  scene.add(m);
  const shot = { mesh: m, seg: SEG, t: 0 };
  shots.push(shot);
  gsap.fromTo(hero.rotation, { z: 0 }, { z: -0.06, duration: 0.08, yoyo: true, repeat: 1 });
  comicBurst(x, y);
  webSplat(x, y);
}

addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') {
    touchPress = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startedAt: performance.now(),
      moved: false
    };
    return;
  }

  if (e.button === 0) fireWebShot(e.clientX, e.clientY);
});

addEventListener('pointermove', (e) => {
  if (!touchPress || e.pointerId !== touchPress.id) return;
  const dx = e.clientX - touchPress.x;
  const dy = e.clientY - touchPress.y;
  if (Math.hypot(dx, dy) > TAP_MOVE_LIMIT) touchPress.moved = true;
});

addEventListener('pointerup', (e) => {
  if (!touchPress || e.pointerId !== touchPress.id) return;
  const elapsed = performance.now() - touchPress.startedAt;
  const isTap = !touchPress.moved && elapsed < TAP_TIME_LIMIT;
  const x = touchPress.x;
  const y = touchPress.y;
  touchPress = null;
  if (isTap) fireWebShot(x, y);
});

addEventListener('pointercancel', () => {
  touchPress = null;
});

const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  const t = clock.getElapsedTime();

  hero.position.y = perch.y + Math.sin(t * 1.6) * 0.04;
  hero.rotation.y = HERO_BASE_ROT + Math.sin(t * 0.5) * 0.05 + mouse.x * 0.15;

  moon.lookAt(camera.position);
  const mp = 1 + Math.sin(t * 1.2) * 0.015;
  moon.scale.set(mp, mp, mp);

  webProgress += (webTarget - webProgress) * 0.08;
  const segsOn = Math.floor(webProgress * WEB_SEGS);
  web.geometry.setDrawRange(0, Math.max(0, segsOn * RADIAL * 6));
  web2.geometry.setDrawRange(0, Math.max(0, segsOn * RADIAL * 6));
  setHud(webProgress);

  const tp = webCurve.getPointAt(Math.max(0.001, Math.min(0.999, webProgress)));
  tip.position.copy(tp);
  tip.scale.setScalar(1 + Math.sin(t * 8) * 0.18);
  tipRing.position.copy(tp);
  tipRing.rotation.z = t * 3;
  tipRing.rotation.y = t * 2;
  tipRing.scale.setScalar(1 + Math.sin(t * 5) * 0.12);

  web.rotation.z = Math.sin(t * 0.8) * 0.012 + mouse.y * 0.02;
  web2.rotation.z = web.rotation.z;

  checkpoints.forEach((cp) => {
    if (!cp.userData.shown && webProgress > cp.userData.at) {
      cp.userData.shown = true;
      gsap.to(cp.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(2.5)' });
    }
    if (cp.userData.shown && webProgress < cp.userData.at - 0.03) {
      cp.userData.shown = false;
      gsap.to(cp.scale, { x: 0, y: 0, z: 0, duration: 0.3 });
    }
    cp.lookAt(camera.position);
  });

  const followX = THREE.MathUtils.lerp(camBase.x, tp.x * 0.55, webProgress);
  const followY = THREE.MathUtils.lerp(camBase.y, 2.5 + tp.y * 0.35, webProgress);
  const followZ = THREE.MathUtils.lerp(camBase.z, 15.5, webProgress);
  camera.position.x += ((followX + mouse.x * 1.6) - camera.position.x) * 0.05;
  camera.position.y += ((followY - mouse.y * 1.0) - camera.position.y) * 0.05;
  camera.position.z += (followZ - camera.position.z) * 0.05;
  const lookStart = new THREE.Vector3(perch.x - 4.6, perch.y - 2.2, perch.z);
  const look = new THREE.Vector3().lerpVectors(lookStart, tp, Math.min(1, webProgress * 1.25 + 0.05));
  camera.lookAt(look);

  clouds.children.forEach((c) => {
    c.position.x += c.userData.sp * dt;
    if (c.position.x > 22) {
      c.position.x = -22;
    }
  });

  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.t += dt * 3.2;
    const on = Math.min(1, s.t);
    s.mesh.geometry.setDrawRange(0, Math.floor(on * s.seg) * 5 * 6);
    if (s.t > 1.4) {
      s.mesh.material.transparent = true;
      s.mesh.material.opacity = Math.max(0, 1 - (s.t - 1.4) * 2);
      if (s.mesh.material.opacity <= 0) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        shots.splice(i, 1);
      }
    }
  }

  renderer.render(scene, camera);
  if (!reduceMotion) {
    requestAnimationFrame(tick);
  }
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (reduceMotion) renderer.render(scene, camera);
});

const trailC = document.getElementById('webTrail');
const tx = trailC.getContext('2d');
function sizeTrail() {
  trailC.width = innerWidth;
  trailC.height = innerHeight;
}
sizeTrail();
addEventListener('resize', sizeTrail);

const trail = [];
addEventListener('pointermove', (e) => {
  if (reduceMotion || !finePointer) return;
  trail.unshift({ x: e.clientX, y: e.clientY });
  if (trail.length > 26) {
    trail.pop();
  }
});

(function trailLoop() {
  tx.clearRect(0, 0, trailC.width, trailC.height);
  if (trail.length > 2 && !reduceMotion) {
    for (let i = 1; i < trail.length; i++) {
      const f = 1 - i / trail.length;
      tx.strokeStyle = `rgba(224,32,47,${f * 0.5})`;
      tx.lineWidth = f * 3;
      tx.beginPath();
      tx.moveTo(trail[i - 1].x, trail[i - 1].y);
      tx.lineTo(trail[i].x, trail[i].y);
      tx.stroke();
      if (i % 5 === 0) {
        tx.strokeStyle = `rgba(21,21,28,${f * 0.3})`;
        tx.lineWidth = 1;
        const dx = trail[i].x - trail[i - 1].x;
        const dy = trail[i].y - trail[i - 1].y;
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L * 7 * f;
        const ny = dx / L * 7 * f;
        tx.beginPath();
        tx.moveTo(trail[i].x - nx, trail[i].y - ny);
        tx.lineTo(trail[i].x + nx, trail[i].y + ny);
        tx.stroke();
      }
    }
  }
  if (!reduceMotion && finePointer) requestAnimationFrame(trailLoop);
}());


return () => {
  dispatchEvent(new Event('scroll'));
  tick();
  if (!reduceMotion) gsap.from(camera.position, { z: 24, y: 8, duration: 2.6, ease: 'power3.out' });
};
}

let startScene = () => {};
try {
  if (window.THREE) startScene = initScene();
} catch (error) {
  // Project content and pointer interactions do not require WebGL.
  document.getElementById('gl').hidden = true;
  console.warn('Portfolio background unavailable:', error.message);
}
if (!reduceMotion) document.documentElement.classList.add('motion-ready');

async function launch() {
  startScene();
  await window.finishPortfolioIntro?.();
  if (reduceMotion) return;
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to('.hero h1 .row > span', { y: 0, rotateX: 0, opacity: 1, duration: 1.25, stagger: .12 }, .12)
    .to('.hero-tag', { opacity: 1, duration: .8 }, .25)
    .to('.hero-sub', { opacity: 1, duration: .8 }, .55)
    .to('.hero-actions', { opacity: 1, duration: .8 }, .7)
    .to('.hero-meta', { opacity: 1, duration: .8 }, .85);
  ScrollTrigger.refresh();
}
const fontReady = document.fonts?.ready || Promise.resolve();
Promise.race([fontReady, new Promise(resolve => setTimeout(resolve, 750))])
  .then(launch);

if (!reduceMotion) {
  const h13d = document.getElementById('h13d');
  document.querySelectorAll('.hero h1 .row').forEach((row, index) => {
    row.style.transform = 'translateZ(' + index * 18 + 'px)';
  });
  if (finePointer) {
    addEventListener('pointermove', (event) => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      gsap.to(h13d, { rotateY: x * 10, rotateX: -y * 7, duration: .8, ease: 'power2.out', transformPerspective: 1100 });
    });
    gsap.to(h13d, { y: -8, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
  gsap.utils.toArray('.reveal').forEach((element) => {
    gsap.to(element, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
  });
  gsap.utils.toArray('.flip3d').forEach((element) => {
    gsap.to(element, { opacity: 1, rotateX: 0, y: 0, duration: 1.3, ease: 'back.out(1.5)', transformPerspective: 900, scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
  });
  const skewSet = gsap.quickSetter('.skew-wrap', 'skewY', 'deg');
  ScrollTrigger.create({
    onUpdate(self) {
      const velocity = Math.max(-4, Math.min(4, self.getVelocity() / -450));
      skewSet(velocity);
      gsap.to('.skew-wrap', { skewY: 0, duration: .7, ease: 'power3.out', overwrite: true });
    }
  });
}

if (finePointer && !reduceMotion) {
  document.body.classList.add('custom-cursor');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const label = document.getElementById('cursorLabel');
  let pointerX = -100, pointerY = -100, ringX = -100, ringY = -100;
  addEventListener('pointermove', (event) => {
    pointerX = event.clientX; pointerY = event.clientY;
    dot.style.transform = 'translate(' + pointerX + 'px,' + pointerY + 'px) translate(-50%,-50%)';
    label.style.left = pointerX + 'px'; label.style.top = pointerY + 'px';
  });
  gsap.ticker.add(() => {
    ringX += (pointerX - ringX) * .18;
    ringY += (pointerY - ringY) * .18;
    ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
  });
  document.querySelectorAll('.hoverable,a,button').forEach((element) => {
    element.addEventListener('pointerenter', () => {
      ring.classList.add('hovering');
      if (element.dataset.label) { label.textContent = element.dataset.label; label.style.opacity = 1; }
    });
    element.addEventListener('pointerleave', () => {
      ring.classList.remove('hovering'); label.style.opacity = 0;
    });
  });
  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .32, y: (event.clientY - rect.top - rect.height / 2) * .32, duration: .4 });
    });
    button.addEventListener('pointerleave', () => gsap.to(button, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
  });
  document.querySelectorAll('.project-image').forEach((image) => {
    image.addEventListener('pointermove', (event) => {
      const rect = image.getBoundingClientRect();
      gsap.to(image, { rotateY: (event.clientX - rect.left - rect.width / 2) / rect.width * 5, rotateX: -(event.clientY - rect.top - rect.height / 2) / rect.height * 5, duration: .5, ease: 'power2.out', transformPerspective: 1400 });
    });
    image.addEventListener('pointerleave', () => gsap.to(image, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
  });
}
})();
