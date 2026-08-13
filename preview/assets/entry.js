(function () {
  "use strict";

  var body = document.body;
  var choices = Array.from(document.querySelectorAll("[data-theme-choice]"));
  var launch = document.getElementById("projectsLaunch");
  var launchMode = document.getElementById("launchMode");
  var canvas = document.getElementById("entryWorld");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointer = { x: 0, y: 0 };
  var targetBlend = 0;
  var themeBlend = 0;
  var frame = 0;
  var running = false;

  function selectTheme(theme) {
    body.dataset.previewTheme = theme;
    targetBlend = theme === "hulk" ? 1 : 0;
    choices.forEach(function (choice) {
      var selected = choice.dataset.themeChoice === theme;
      choice.classList.toggle("is-active", selected);
      choice.setAttribute("aria-pressed", String(selected));
    });
    launch.href = theme + ".html";
    launch.dataset.transitionTheme = theme;
    launchMode.textContent = theme === "thor"
      ? "Storm Forge selected · lightning strikes here, then continues inside the archive."
      : "Impact Archive selected · the button buckles, then the faultline carries the impact inside.";
  }

  choices.forEach(function (choice) {
    choice.addEventListener("click", function () {
      selectTheme(choice.dataset.themeChoice);
    });
  });

  if (window.PortfolioTransition) {
    window.PortfolioTransition.bind(launch, "thor");
  }

  if (!canvas || !window.THREE) {
    body.classList.add("entry-webgl-fallback");
    return;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (error) {
    body.classList.add("entry-webgl-fallback");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xfbfaf5, 20, 54);
  var camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
  camera.position.set(1.5, 2.8, 15.5);

  scene.add(new THREE.HemisphereLight(0xfbfaf5, 0x15151c, 1.15));
  var keyLight = new THREE.DirectionalLight(0xffe8a0, 1.15);
  keyLight.position.set(4, 10, 8);
  scene.add(keyLight);

  var common = new THREE.Group();
  var thorWorld = new THREE.Group();
  var hulkWorld = new THREE.Group();
  var thorMaterials = [];
  var hulkMaterials = [];
  scene.add(common, thorWorld, hulkWorld);

  function seeded(index) {
    var value = Math.sin(index * 812.871 + 47.13) * 43758.5453;
    return value - Math.floor(value);
  }

  function remember(material, collection) {
    material.transparent = true;
    material.userData.baseOpacity = material.opacity == null ? 1 : material.opacity;
    collection.push(material);
    return material;
  }

  function addEdges(mesh, group, color, opacity, collection) {
    var material = remember(new THREE.LineBasicMaterial({ color: color, opacity: opacity }), collection);
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), material);
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    edges.scale.copy(mesh.scale);
    group.add(edges);
  }

  function windowTexture(seed) {
    var textureCanvas = document.createElement("canvas");
    textureCanvas.width = 64;
    textureCanvas.height = 128;
    var context = textureCanvas.getContext("2d");
    context.fillStyle = "#eee9dd";
    context.fillRect(0, 0, 64, 128);
    for (var row = 7; row < 124; row += 14) {
      for (var col = 7; col < 60; col += 14) {
        context.fillStyle = seeded(seed + row * 3 + col) > 0.72 ? "#ffc400" : "#17171e";
        context.fillRect(col, row, 7, 8);
      }
    }
    var texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  for (var buildingIndex = 0; buildingIndex < 14; buildingIndex += 1) {
    var buildingWidth = 1.5 + seeded(buildingIndex) * 1.65;
    var buildingHeight = 4.5 + seeded(buildingIndex + 20) * 8.5;
    var buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth);
    var building = new THREE.Mesh(buildingGeometry, new THREE.MeshBasicMaterial({ map: windowTexture(buildingIndex) }));
    building.position.set(-18 + buildingIndex * 2.8, buildingHeight / 2 - 6.8, -7 - seeded(buildingIndex + 50) * 5);
    common.add(building);
    var outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(buildingGeometry),
      new THREE.LineBasicMaterial({ color: 0x15151c, transparent: true, opacity: 0.72 })
    );
    outline.position.copy(building.position);
    common.add(outline);
  }

  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(38, 1.1, 13),
    new THREE.MeshBasicMaterial({ color: 0x15151c })
  );
  roof.position.set(0, -5.9, -4);
  common.add(roof);

  function buildClouds(group, collection, color) {
    for (var cloudIndex = 0; cloudIndex < 4; cloudIndex += 1) {
      var cloud = new THREE.Group();
      for (var bulb = 0; bulb < 5; bulb += 1) {
        var cloudMaterial = remember(new THREE.MeshBasicMaterial({ color: color, opacity: 0.74 }), collection);
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7 + seeded(cloudIndex * 8 + bulb) * 0.55, 10, 8), cloudMaterial);
        sphere.position.set(bulb * 0.82 - 1.65, seeded(cloudIndex * 11 + bulb) * 0.4, 0);
        cloud.add(sphere);
      }
      cloud.position.set(-11 + cloudIndex * 6.8, 6.4 + seeded(cloudIndex + 90) * 2.3, -10 - cloudIndex);
      cloud.userData.speed = 0.08 + seeded(cloudIndex + 111) * 0.08;
      group.add(cloud);
    }
  }

  buildClouds(thorWorld, thorMaterials, 0xe8f5ff);

  var stormDiscMaterial = remember(new THREE.MeshBasicMaterial({ color: 0x2342d6, opacity: 0.92 }), thorMaterials);
  var stormDisc = new THREE.Mesh(new THREE.CircleGeometry(6.2, 56), stormDiscMaterial);
  stormDisc.position.set(7.8, 3.1, -11.5);
  thorWorld.add(stormDisc);
  var stormRing = new THREE.Mesh(
    new THREE.RingGeometry(6.25, 6.48, 56),
    remember(new THREE.MeshBasicMaterial({ color: 0x15151c, opacity: 0.88 }), thorMaterials)
  );
  stormRing.position.copy(stormDisc.position);
  thorWorld.add(stormRing);

  var forge = new THREE.Group();
  var platformMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x17234c, roughness: 0.72, metalness: 0.35 }), thorMaterials);
  var platform = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.15, 0.8, 32), platformMaterial);
  platform.position.y = -0.45;
  forge.add(platform);
  addEdges(platform, forge, 0x6ed9ff, 0.8, thorMaterials);
  var ringMaterial = remember(new THREE.MeshBasicMaterial({ color: 0xffc400, opacity: 0.92 }), thorMaterials);
  for (var ringIndex = 0; ringIndex < 3; ringIndex += 1) {
    var runeRing = new THREE.Mesh(new THREE.TorusGeometry(2.15 + ringIndex * 0.48, 0.035, 6, 48), ringMaterial);
    runeRing.rotation.x = Math.PI / 2;
    runeRing.position.y = 0.02 + ringIndex * 0.03;
    forge.add(runeRing);
  }
  var hammer = new THREE.Group();
  var hammerMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x273248, roughness: 0.42, metalness: 0.78 }), thorMaterials);
  var hammerHead = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.22, 1.18), hammerMaterial);
  hammer.add(hammerHead);
  addEdges(hammerHead, hammer, 0xffc400, 0.68, thorMaterials);
  var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.5, 12), hammerMaterial);
  handle.position.y = 2.15;
  hammer.add(handle);
  hammer.rotation.z = -0.42;
  hammer.position.set(0.2, 1.25, 0.2);
  forge.add(hammer);
  forge.position.set(7.6, -2.7, -1.2);
  forge.rotation.y = -0.25;
  thorWorld.add(forge);

  function makeLightning(group, collection, start, end, seed) {
    var points = [];
    var segments = 22;
    for (var index = 0; index <= segments; index += 1) {
      var progress = index / segments;
      var point = start.clone().lerp(end, progress);
      var envelope = Math.sin(progress * Math.PI);
      point.x += (seeded(seed + index) - 0.5) * 0.75 * envelope;
      point.z += (seeded(seed + index + 80) - 0.5) * 0.45 * envelope;
      points.push(point);
    }
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var outer = new THREE.Line(geometry, remember(new THREE.LineBasicMaterial({ color: 0x17234c, opacity: 0.96 }), collection));
    var inner = new THREE.Line(geometry.clone(), remember(new THREE.LineBasicMaterial({ color: 0x6ed9ff, opacity: 0.96 }), collection));
    inner.scale.setScalar(0.997);
    group.add(outer, inner);
    return [outer, inner];
  }

  var entryBolts = [];
  entryBolts.push(makeLightning(thorWorld, thorMaterials, new THREE.Vector3(7.3, 10, -1), new THREE.Vector3(7.7, -0.65, -1), 30));
  entryBolts.push(makeLightning(thorWorld, thorMaterials, new THREE.Vector3(11.8, 8.5, -3), new THREE.Vector3(8.3, -0.4, -1), 90));

  var bruiseDisc = new THREE.Mesh(
    new THREE.CircleGeometry(6.6, 56),
    remember(new THREE.MeshBasicMaterial({ color: 0x2f204b, opacity: 0.9 }), hulkMaterials)
  );
  bruiseDisc.position.set(7.8, 3.1, -11.4);
  hulkWorld.add(bruiseDisc);

  var faultCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(10.5, 9.5, -4),
    new THREE.Vector3(8.1, 5.2, -1),
    new THREE.Vector3(10.2, 2.1, -0.8),
    new THREE.Vector3(7.3, -0.4, -0.2),
    new THREE.Vector3(9.4, -5.6, -1)
  ]);
  var faultOuter = new THREE.Mesh(
    new THREE.TubeGeometry(faultCurve, 180, 0.13, 5, false),
    remember(new THREE.MeshBasicMaterial({ color: 0x2f204b, opacity: 0.95 }), hulkMaterials)
  );
  var faultInner = new THREE.Mesh(
    new THREE.TubeGeometry(faultCurve, 180, 0.055, 5, false),
    remember(new THREE.MeshBasicMaterial({ color: 0x9bc53d, opacity: 0.96 }), hulkMaterials)
  );
  hulkWorld.add(faultOuter, faultInner);

  var slabMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x34333a, roughness: 0.92, metalness: 0.05 }), hulkMaterials);
  for (var slabIndex = 0; slabIndex < 15; slabIndex += 1) {
    var slab = new THREE.Mesh(
      new THREE.BoxGeometry(1.3 + seeded(slabIndex) * 2.2, 0.55 + seeded(slabIndex + 20) * 1.15, 1.5 + seeded(slabIndex + 40) * 2.2),
      slabMaterial
    );
    var slabAngle = slabIndex / 15 * Math.PI * 2;
    var slabRadius = 2.8 + seeded(slabIndex + 60) * 3.6;
    slab.position.set(8.4 + Math.cos(slabAngle) * slabRadius, -1.5 + seeded(slabIndex + 70) * 4.5, -1 + Math.sin(slabAngle) * 2.3);
    slab.rotation.set(seeded(slabIndex + 90) * 0.7, slabAngle, seeded(slabIndex + 100) * 0.7);
    slab.userData.baseY = slab.position.y;
    hulkWorld.add(slab);
    addEdges(slab, hulkWorld, 0x15151c, 0.9, hulkMaterials);
  }

  var fist = new THREE.Group();
  var fistMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x445826, roughness: 0.86, metalness: 0.03 }), hulkMaterials);
  var palm = new THREE.Mesh(new THREE.SphereGeometry(1.3, 18, 14), fistMaterial);
  palm.scale.set(1.45, 0.82, 1.05);
  fist.add(palm);
  for (var fingerIndex = 0; fingerIndex < 4; fingerIndex += 1) {
    var knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 10), fistMaterial);
    knuckle.scale.set(0.85, 1.25, 0.9);
    knuckle.position.set(-1.05 + fingerIndex * 0.68, 0.72 + Math.sin(fingerIndex) * 0.08, 0.25);
    fist.add(knuckle);
  }
  var thumb = new THREE.Mesh(new THREE.SphereGeometry(0.66, 14, 10), fistMaterial);
  thumb.scale.set(1.05, 0.68, 0.82);
  thumb.position.set(-1.22, -0.2, 0.38);
  thumb.rotation.z = 0.65;
  fist.add(thumb);
  fist.position.set(7.6, 0.6, -0.25);
  fist.rotation.set(-0.22, -0.36, -0.12);
  fist.scale.setScalar(1.45);
  hulkWorld.add(fist);

  function setOpacity(materials, opacity) {
    materials.forEach(function (material) {
      material.opacity = material.userData.baseOpacity * Math.max(0, Math.min(1, opacity));
      material.depthWrite = opacity > 0.45;
    });
  }

  function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    if (reduced) render(0);
  }

  function render(time) {
    themeBlend += (targetBlend - themeBlend) * (reduced ? 1 : 0.085);
    setOpacity(thorMaterials, 1 - themeBlend);
    setOpacity(hulkMaterials, themeBlend);
    thorWorld.visible = themeBlend < 0.998;
    hulkWorld.visible = themeBlend > 0.002;
    thorWorld.position.x = -themeBlend * 2.5;
    hulkWorld.position.x = (1 - themeBlend) * 2.5;

    var seconds = (time || 0) * 0.001;
    forge.rotation.y = -0.25 + Math.sin(seconds * 0.5) * 0.035;
    hammer.rotation.z = -0.42 + Math.sin(seconds * 0.8) * 0.025;
    entryBolts.forEach(function (pair, boltIndex) {
      var pulse = 0.58 + Math.sin(seconds * (7 + boltIndex) + boltIndex) * 0.35;
      pair[0].material.opacity = pulse * (1 - themeBlend);
      pair[1].material.opacity = Math.min(1, pulse + 0.28) * (1 - themeBlend);
    });
    fist.position.y = 0.6 + Math.sin(seconds * 0.75) * 0.045;
    faultInner.material.opacity = (0.68 + Math.sin(seconds * 3.2) * 0.23) * themeBlend;

    thorWorld.children.forEach(function (child) {
      if (child.userData && child.userData.speed) {
        child.position.x += child.userData.speed * 0.012;
        if (child.position.x > 15) child.position.x = -15;
      }
    });

    camera.position.x += ((1.5 + pointer.x * 1.15) - camera.position.x) * 0.05;
    camera.position.y += ((2.8 - pointer.y * 0.72) - camera.position.y) * 0.05;
    camera.lookAt(new THREE.Vector3(1.7 + pointer.x * 0.28, 0.45 - pointer.y * 0.18, -1));
    renderer.render(scene, camera);
  }

  function tick(time) {
    if (!running) return;
    render(time);
    frame = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running || document.hidden) return;
    running = true;
    frame = window.requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (event) {
    pointer.x = event.clientX / Math.max(1, window.innerWidth) - 0.5;
    pointer.y = event.clientY / Math.max(1, window.innerHeight) - 0.5;
  }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!reduced) start();
  });
  window.addEventListener("pagehide", stop, { once: true });

  resize();
  if (reduced) render(0);
  else start();
}());
