(function () {
  "use strict";

  var WEB_SEGMENTS = 900;
  var RADIAL_SEGMENTS = 6;
  var canvas = document.getElementById("hulkWorld");
  var progressFill = document.getElementById("loadProgress");
  var loadValue = document.getElementById("loadValue");
  var loadZone = document.getElementById("loadZone");
  var loader = document.getElementById("sceneLoader");
  var loaderStatus = document.getElementById("sceneLoaderStatus");
  var loaderMeter = document.getElementById("sceneLoaderMeter");
  var sceneStatus = document.getElementById("sceneStatus");
  var records = Array.prototype.slice.call(document.querySelectorAll(".case-record"));
  var projectAnchors = Array.prototype.slice.call(document.querySelectorAll("[data-project-anchor]"));
  var evidencePanel = document.getElementById("evidencePanel");
  var evidenceLabel = document.getElementById("evidenceLabel");
  var evidenceTitle = document.getElementById("evidenceTitle");
  var evidenceSummary = document.getElementById("evidenceSummary");
  var evidenceTags = document.getElementById("evidenceTags");
  var evidenceVisualLabel = document.getElementById("evidenceVisualLabel");
  var evidenceMetric = document.getElementById("evidenceMetric");
  var activeCount = document.getElementById("activeCount");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var incomingTransition = Boolean(
    window.PortfolioTransition &&
    typeof window.PortfolioTransition.hasArrival === "function" &&
    window.PortfolioTransition.hasArrival("hulk")
  );

  var renderer = null;
  var scene = null;
  var camera = null;
  var faultCurve = null;
  var faultOuter = null;
  var faultInner = null;
  var faultTip = null;
  var faultTipRing = null;
  var fist = null;
  var debris = [];
  var checkpoints = [];
  var frameId = 0;
  var lastTime = performance.now();
  var sceneReady = false;
  var introStarted = false;
  var currentProject = -1;
  var checkpointProgress = [.12, .3, .49, .68, .87];
  var scrollTarget = 0;
  var scrollProgress = 0;
  var introCharge = 0;
  var shakeStrength = 0;
  var hidden = document.hidden;
  var pointer = { x: 0, y: 0 };
  var lookCurrent = null;

  document.body.classList.add("scene-booting");

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function seeded(index) {
    var value = Math.sin(index * 9187.41 + 31.77) * 43758.5453;
    return value - Math.floor(value);
  }

  function damping(rate, delta) {
    return 1 - Math.exp(-rate * delta);
  }

  function createConcreteTexture() {
    var size = 64;
    var data = new Uint8Array(size * size * 3);
    for (var index = 0; index < size * size; index += 1) {
      var grain = Math.floor(seeded(index + 90) * 31) - 19;
      var seam = index % size === Math.floor(seeded(Math.floor(index / size) + 700) * size) ? -34 : 0;
      data[index * 3] = clamp(217 + grain + seam, 0, 255);
      data[index * 3 + 1] = clamp(211 + grain + seam, 0, 255);
      data[index * 3 + 2] = clamp(196 + grain + seam, 0, 255);
    }
    var texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  function outlinedMesh(geometry, material, edgeColor) {
    var group = new THREE.Group();
    var mesh = new THREE.Mesh(geometry, material);
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 18),
      new THREE.LineBasicMaterial({ color: edgeColor || 0x15151c, transparent: true, opacity: .72 })
    );
    group.add(mesh, edges);
    return group;
  }

  function createContainmentWorld(concreteMaterial, darkConcreteMaterial, inkMaterial, bruiseMaterial) {
    var world = new THREE.Group();
    var level;
    var segment;

    for (level = 0; level < 12; level += 1) {
      var levelY = .4 - level * 2.95;
      var radius = 4.7 + level * .17;
      for (segment = 0; segment < 9; segment += 1) {
        var angle = segment / 9 * Math.PI * 2 + level * .13;
        var width = 2.65 + seeded(level * 20 + segment) * 1.45;
        var depth = 2.15 + seeded(level * 20 + segment + 5) * 1.2;
        var geometry = new THREE.BoxGeometry(width, .58 + seeded(segment + level) * .28, depth);
        var material = (level + segment) % 5 === 0 ? darkConcreteMaterial : concreteMaterial;
        var slab = outlinedMesh(geometry, material);
        slab.position.set(Math.cos(angle) * radius, levelY, Math.sin(angle) * radius - 4.5);
        slab.rotation.y = -angle + seeded(segment + level * 5) * .12;
        slab.rotation.z = (seeded(level * 40 + segment) - .5) * .1;
        world.add(slab);
      }
    }

    var towerDefinitions = [
      [-9.2, -12.5, -7.5, 2.8, 29, 3.5],
      [9.5, -11, -8.5, 3.4, 32, 4],
      [-12.5, -15, -12, 3.8, 20, 3.2],
      [12.8, -17, -13, 4.1, 23, 3.4],
      [-5.4, -23, -13.8, 3.2, 18, 3]
    ];
    towerDefinitions.forEach(function (definition, index) {
      var tower = outlinedMesh(
        new THREE.BoxGeometry(definition[3], definition[4], definition[5]),
        index % 2 ? darkConcreteMaterial : concreteMaterial
      );
      tower.position.set(definition[0], definition[1], definition[2]);
      tower.rotation.z = (index % 2 ? 1 : -1) * .035;
      world.add(tower);
    });

    var braceMaterial = new THREE.MeshBasicMaterial({ color: 0x15151c });
    for (level = 0; level < 8; level += 1) {
      var brace = new THREE.Mesh(new THREE.BoxGeometry(18, .16, .2), braceMaterial);
      brace.position.set(0, -2.1 - level * 4.1, -12.5);
      brace.rotation.z = level % 2 ? .08 : -.08;
      world.add(brace);
    }

    for (segment = 0; segment < 15; segment += 1) {
      var face = outlinedMesh(
        new THREE.BoxGeometry(2.2 + seeded(segment + 910) * 2.6, .55, 2 + seeded(segment + 970) * 2),
        segment % 4 === 0 ? bruiseMaterial : concreteMaterial
      );
      var faceAngle = segment / 15 * Math.PI * 2;
      face.position.set(4.2 + Math.cos(faceAngle) * (2.3 + seeded(segment) * 2.1), -.4 + (seeded(segment + 20) - .5) * 1.1, -3.8 + Math.sin(faceAngle) * (2.1 + seeded(segment + 42) * 1.7));
      face.rotation.set((seeded(segment + 60) - .5) * .22, -faceAngle, (seeded(segment + 90) - .5) * .2);
      world.add(face);
    }

    scene.add(world);
  }

  function createImpactMass(inkMaterial, bruiseMaterial) {
    fist = new THREE.Group();
    var forearm = outlinedMesh(new THREE.CylinderGeometry(2.05, 2.55, 8.8, 10), inkMaterial, 0x2f204b);
    forearm.position.set(.35, 7.2, -.2);
    forearm.rotation.z = -.08;
    fist.add(forearm);

    var palm = outlinedMesh(new THREE.SphereGeometry(2.58, 20, 14), inkMaterial, 0x2f204b);
    palm.position.set(0, 2.4, 0);
    palm.scale.set(1.02, .84, .76);
    palm.rotation.z = -.08;
    fist.add(palm);

    for (var finger = 0; finger < 4; finger += 1) {
      var knuckle = outlinedMesh(new THREE.SphereGeometry(.94, 16, 12), inkMaterial, 0x2f204b);
      knuckle.position.set(-1.87 + finger * 1.24, -.35 + Math.abs(1.5 - finger) * .12, .18);
      knuckle.scale.set(.7, 1.16, 1.48);
      knuckle.rotation.z = (finger - 1.5) * -.025;
      fist.add(knuckle);
    }

    var thumb = outlinedMesh(new THREE.SphereGeometry(1.08, 16, 12), inkMaterial, 0x2f204b);
    thumb.position.set(-2.42, 1.1, 1.18);
    thumb.scale.set(.78, 1.48, 1.08);
    thumb.rotation.set(.08, 0, -.55);
    fist.add(thumb);

    var pressureBand = outlinedMesh(new THREE.CylinderGeometry(2.13, 2.28, .62, 10), bruiseMaterial, 0x15151c);
    pressureBand.position.set(.34, 5.05, -.18);
    pressureBand.rotation.z = -.08;
    fist.add(pressureBand);

    fist.position.set(4.15, 7.4, -1.85);
    fist.rotation.set(.04, -.13, -.02);
    fist.userData.restY = 0;
    scene.add(fist);
  }

  function createDebris(concreteMaterial, inkMaterial) {
    var debrisGroup = new THREE.Group();
    for (var index = 0; index < 62; index += 1) {
      var size = .1 + seeded(index + 1200) * .48;
      var geometry = index % 3 === 0
        ? new THREE.TetrahedronGeometry(size, 0)
        : new THREE.BoxGeometry(size * 1.6, size, size * .75);
      var fragment = new THREE.Mesh(geometry, index % 5 === 0 ? inkMaterial : concreteMaterial);
      var angle = seeded(index + 1300) * Math.PI * 2;
      var radius = 2.1 + seeded(index + 1400) * 8.5;
      fragment.position.set(4.2 + Math.cos(angle) * radius, .3 - seeded(index + 1500) * 25, -3.9 + Math.sin(angle) * radius * .58);
      fragment.rotation.set(seeded(index) * Math.PI, seeded(index + 10) * Math.PI, seeded(index + 20) * Math.PI);
      fragment.userData = {
        baseX: fragment.position.x,
        baseY: fragment.position.y,
        baseZ: fragment.position.z,
        phase: seeded(index + 1600) * Math.PI * 2,
        drift: .2 + seeded(index + 1700) * .55
      };
      debris.push(fragment);
      debrisGroup.add(fragment);
    }
    scene.add(debrisGroup);
  }

  function createFaultline() {
    var points = [
      new THREE.Vector3(4.2, .2, -3.4),
      new THREE.Vector3(2.8, -2.8, -2.1),
      new THREE.Vector3(4.6, -5.8, -4.7),
      new THREE.Vector3(.7, -9.1, -1.7),
      new THREE.Vector3(-4.7, -12.5, -4.5),
      new THREE.Vector3(-.8, -16.1, -2),
      new THREE.Vector3(5.2, -19.4, -5),
      new THREE.Vector3(1.4, -23.1, -1.8),
      new THREE.Vector3(-5.1, -27, -4.4),
      new THREE.Vector3(-.4, -31.5, -2.7)
    ];
    faultCurve = new THREE.CatmullRomCurve3(points, false, "catmullrom", .34);
    var outerGeometry = new THREE.TubeGeometry(faultCurve, WEB_SEGMENTS, .13, RADIAL_SEGMENTS, false);
    var innerGeometry = new THREE.TubeGeometry(faultCurve, WEB_SEGMENTS, .042, RADIAL_SEGMENTS, false);
    faultOuter = new THREE.Mesh(outerGeometry, new THREE.MeshBasicMaterial({ color: 0x2f204b }));
    faultInner = new THREE.Mesh(innerGeometry, new THREE.MeshBasicMaterial({ color: 0x9bc53d }));
    faultOuter.geometry.setDrawRange(0, 0);
    faultInner.geometry.setDrawRange(0, 0);
    scene.add(faultOuter, faultInner);

    faultTip = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 10), new THREE.MeshBasicMaterial({ color: 0x9bc53d }));
    faultTipRing = new THREE.Mesh(new THREE.TorusGeometry(.38, .035, 6, 22), new THREE.MeshBasicMaterial({ color: 0x15151c }));
    scene.add(faultTip, faultTipRing);

    for (var index = 0; index < 5; index += 1) {
      var group = new THREE.Group();
      var outer = new THREE.Mesh(new THREE.TorusGeometry(.58, .055, 6, 28), new THREE.MeshBasicMaterial({ color: 0x2f204b }));
      var inner = new THREE.Mesh(new THREE.TorusGeometry(.34, .03, 6, 22), new THREE.MeshBasicMaterial({ color: index === 0 ? 0xffc400 : 0x9bc53d }));
      group.add(outer, inner);
      group.scale.setScalar(0);
      group.userData.scale = 0;
      scene.add(group);
      checkpoints.push(group);
    }
    updateCheckpointPositions();
  }

  function updateCheckpointPositions() {
    if (!faultCurve) return;
    checkpoints.forEach(function (checkpoint, index) {
      checkpoint.position.copy(faultCurve.getPointAt(clamp(checkpointProgress[index], .001, .999)));
    });
  }

  function initializeScene() {
    if (!canvas || !window.THREE) return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      return false;
    }
    renderer.setClearColor(0xfbfaf5, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xfbfaf5, 25, 68);
    camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, .1, 180);
    camera.position.set(-1.8, 4.1, 17.2);
    lookCurrent = new THREE.Vector3(3.3, 1.2, -1.2);

    scene.add(new THREE.HemisphereLight(0xfbfaf5, 0x2f204b, 1.35));
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(-6, 14, 10);
    scene.add(keyLight);
    var gammaLight = new THREE.PointLight(0x9bc53d, .65, 24);
    gammaLight.position.set(4.2, .4, -1.5);
    scene.add(gammaLight);

    var concreteTexture = createConcreteTexture();
    var concreteMaterial = new THREE.MeshLambertMaterial({ color: 0xded8c8, map: concreteTexture });
    var darkConcreteMaterial = new THREE.MeshLambertMaterial({ color: 0xaaa394, map: concreteTexture });
    var inkMaterial = new THREE.MeshLambertMaterial({ color: 0x5f922d });
    var bruiseMaterial = new THREE.MeshLambertMaterial({ color: 0x2f204b });

    createContainmentWorld(concreteMaterial, darkConcreteMaterial, inkMaterial, bruiseMaterial);
    createImpactMass(inkMaterial, bruiseMaterial);
    createDebris(concreteMaterial, inkMaterial);
    createFaultline();
    sceneReady = true;
    return true;
  }

  function documentProgress() {
    var root = document.documentElement;
    return clamp(root.scrollTop / Math.max(1, root.scrollHeight - root.clientHeight), 0, 1);
  }

  function calculateProjectAnchors() {
    var root = document.documentElement;
    var range = Math.max(1, root.scrollHeight - window.innerHeight);
    checkpointProgress = records.map(function (record) {
      var top = record.getBoundingClientRect().top + window.scrollY;
      return clamp((top + record.offsetHeight * .5 - window.innerHeight * .5) / range, .04, .96);
    });
    updateCheckpointPositions();
  }

  function nearestProject() {
    if (!records.length) return 0;
    var viewportCenter = window.innerHeight * .5;
    var bestIndex = 0;
    var bestDistance = Infinity;
    records.forEach(function (record, index) {
      var bounds = record.getBoundingClientRect();
      var distance = Math.abs(bounds.top + bounds.height * .5 - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function recordData(record) {
    var heading = record.querySelector("h3");
    var paragraphs = record.querySelectorAll(".case-record__copy > p");
    var tags = Array.prototype.slice.call(record.querySelectorAll(".case-record__copy li")).map(function (item) { return item.textContent; });
    return {
      label: paragraphs[0] ? paragraphs[0].textContent : "Project case",
      title: heading ? heading.textContent : "Project",
      summary: paragraphs[1] ? paragraphs[1].textContent : "",
      tags: tags
    };
  }

  function setActiveProject(index, animate) {
    var safeIndex = clamp(index, 0, Math.max(0, records.length - 1));
    if (safeIndex === currentProject) return;
    currentProject = safeIndex;
    records.forEach(function (record, recordIndex) {
      record.classList.toggle("is-active", recordIndex === safeIndex);
    });
    projectAnchors.forEach(function (anchor, anchorIndex) {
      var active = anchorIndex === safeIndex;
      anchor.classList.toggle("is-active", active);
      if (active) anchor.setAttribute("aria-current", "step");
      else anchor.removeAttribute("aria-current");
    });

    var data = recordData(records[safeIndex]);
    if (evidencePanel) evidencePanel.dataset.case = String(safeIndex);
    if (evidenceLabel) evidenceLabel.textContent = data.label;
    if (evidenceTitle) evidenceTitle.textContent = data.title;
    if (evidenceSummary) evidenceSummary.textContent = data.summary;
    if (evidenceVisualLabel) evidenceVisualLabel.textContent = data.title.toUpperCase() + " / PREVIEW PLACEHOLDER";
    if (evidenceMetric) evidenceMetric.textContent = safeIndex === 0 ? "742" : String(safeIndex + 1).padStart(2, "0");
    if (activeCount) activeCount.textContent = String(safeIndex + 1).padStart(2, "0") + " of 05";
    if (evidenceTags) {
      evidenceTags.textContent = "";
      data.tags.forEach(function (tag) {
        var item = document.createElement("li");
        item.textContent = tag;
        evidenceTags.appendChild(item);
      });
    }

    if (animate && window.gsap && evidencePanel && !reduceMotion.matches) {
      window.gsap.fromTo(evidencePanel, { y: 14, scaleY: .986 }, { y: 0, scaleY: 1, duration: .55, ease: "back.out(1.18)", clearProps: "transform" });
    }
  }

  function updateScrollState(progress) {
    scrollTarget = typeof progress === "number" ? progress : documentProgress();
    if (progressFill) progressFill.style.transform = "scaleX(" + scrollTarget.toFixed(4) + ")";
    if (loadValue) loadValue.textContent = String(Math.round(scrollTarget * 100)).padStart(3, "0") + "%";
    var active = nearestProject();
    setActiveProject(active, true);
    if (loadZone) {
      if (scrollTarget < checkpointProgress[0] * .55) loadZone.textContent = "SURFACE / ENTRY";
      else if (scrollTarget > .985) loadZone.textContent = "FOUNDATION / COMPLETE";
      else loadZone.textContent = "CASE " + String(active + 1).padStart(2, "0") + " / UNDER LOAD";
    }
  }

  function initializeScrollTriggers() {
    if (!window.gsap || !window.ScrollTrigger) {
      window.addEventListener("scroll", function () { updateScrollState(); }, { passive: true });
      return;
    }
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "max",
      onUpdate: function (self) { updateScrollState(self.progress); },
      onRefresh: function () {
        calculateProjectAnchors();
        updateScrollState(documentProgress());
      }
    });
    records.forEach(function (record, index) {
      window.ScrollTrigger.create({
        trigger: record,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: function () { setActiveProject(index, true); },
        onEnterBack: function () { setActiveProject(index, true); }
      });
    });
  }

  function updateWorld(delta, elapsed) {
    if (!sceneReady) return;
    var alpha = damping(5.25, delta);
    scrollProgress += (scrollTarget - scrollProgress) * alpha;
    var faultProgress = reduceMotion.matches ? 1 : clamp(Math.max(introCharge, .07 + scrollProgress * .93), 0, 1);
    var segmentsOn = Math.floor(faultProgress * WEB_SEGMENTS);
    var drawCount = Math.max(0, segmentsOn * RADIAL_SEGMENTS * 6);
    faultOuter.geometry.setDrawRange(0, drawCount);
    faultInner.geometry.setDrawRange(0, drawCount);

    var tipProgress = clamp(faultProgress, .001, .999);
    var tipPoint = faultCurve.getPointAt(tipProgress);
    faultTip.position.copy(tipPoint);
    faultTip.scale.setScalar(1 + Math.sin(elapsed * 8) * .08);
    faultTipRing.position.copy(tipPoint);
    faultTipRing.rotation.set(elapsed * .5, elapsed * .8, elapsed * 1.4);

    checkpoints.forEach(function (checkpoint, index) {
      var targetScale = faultProgress >= checkpointProgress[index] ? 1 : 0;
      checkpoint.userData.scale += (targetScale - checkpoint.userData.scale) * damping(targetScale ? 9 : 12, delta);
      checkpoint.scale.setScalar(checkpoint.userData.scale);
      checkpoint.lookAt(camera.position);
    });

    var desiredCamera = new THREE.Vector3(
      THREE.MathUtils.lerp(-1.8, tipPoint.x * .28, scrollProgress) + pointer.x * .55,
      THREE.MathUtils.lerp(4.1, tipPoint.y + 4.8, scrollProgress) - pointer.y * .4,
      THREE.MathUtils.lerp(17.2, 15.6, scrollProgress)
    );
    var cameraAlpha = damping(3.5, delta);
    camera.position.lerp(desiredCamera, cameraAlpha);
    var desiredLook = new THREE.Vector3().lerpVectors(new THREE.Vector3(3.3, 1.1, -1.2), tipPoint, clamp(scrollProgress * 1.1, 0, 1));
    lookCurrent.lerp(desiredLook, damping(4.1, delta));

    var shake = shakeStrength * (Math.sin(elapsed * 71) + Math.sin(elapsed * 113) * .55);
    camera.position.x += shake * .13;
    camera.position.y += shake * .08;
    camera.lookAt(lookCurrent);

    debris.forEach(function (fragment) {
      var data = fragment.userData;
      fragment.position.x = data.baseX + Math.sin(elapsed * .33 + data.phase) * .06 + scrollProgress * data.drift * .24;
      fragment.position.y = data.baseY + Math.cos(elapsed * .27 + data.phase) * .07 + scrollProgress * data.drift * .75;
      fragment.position.z = data.baseZ + Math.sin(elapsed * .21 + data.phase) * .05;
      fragment.rotation.x += delta * .06 * data.drift;
      fragment.rotation.z += delta * .045 * data.drift;
    });
  }

  function renderFrame(now) {
    frameId = 0;
    if (hidden || !sceneReady) return;
    var delta = Math.min(.05, Math.max(.001, (now - lastTime) / 1000));
    lastTime = now;
    updateWorld(delta, now / 1000);
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(renderFrame);
  }

  function startRenderLoop() {
    if (!sceneReady) return;
    if (reduceMotion.matches) {
      scrollProgress = scrollTarget;
      updateWorld(1 / 60, performance.now() / 1000);
      renderer.render(scene, camera);
      return;
    }
    if (!frameId && !hidden) {
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    }
  }

  function finishIntro() {
    document.body.classList.remove("scene-booting");
    document.body.classList.add("scene-ready");
    if (sceneStatus) sceneStatus.textContent = "Impact Archive ready.";
    if (loader) loader.style.display = "none";
    if (
      incomingTransition &&
      window.PortfolioTransition &&
      typeof window.PortfolioTransition.consumeArrival === "function"
    ) {
      window.PortfolioTransition.consumeArrival("hulk");
      incomingTransition = false;
    }
  }

  function runIntro(fullImpact) {
    if (introStarted) return;
    introStarted = true;
    if (loaderStatus) loaderStatus.textContent = fullImpact ? "ARCHIVE SURFACE BREACHED" : "CALIBRATING CONTAINMENT SHAFT";
    if (reduceMotion.matches) {
      introCharge = 1;
      if (fist) fist.position.y = fist.userData.restY;
      finishIntro();
      startRenderLoop();
      return;
    }

    startRenderLoop();
    if (!window.gsap || !sceneReady || !fist) {
      introCharge = .12;
      if (fist) fist.position.y = fist.userData.restY;
      if (loaderMeter) loaderMeter.style.transform = "scaleX(1)";
      window.setTimeout(finishIntro, fullImpact ? 760 : 420);
      return;
    }

    var impactState = { charge: 0, shake: 0 };
    var timeline = window.gsap.timeline({ onComplete: finishIntro });
    timeline
      .to(loaderMeter, { scaleX: .55, duration: fullImpact ? .42 : .22, ease: "power2.out" }, 0)
      .to(fist.position, { y: fist.userData.restY, duration: fullImpact ? .52 : .3, ease: "power4.in" }, fullImpact ? .08 : 0)
      .to(impactState, {
        charge: .14,
        shake: 1,
        duration: .16,
        ease: "power4.out",
        onUpdate: function () {
          introCharge = impactState.charge;
          shakeStrength = impactState.shake;
        }
      }, fullImpact ? .52 : .3)
      .to(loaderMeter, { scaleX: 1, duration: .32, ease: "power3.out" }, fullImpact ? .54 : .31)
      .to(impactState, {
        shake: 0,
        duration: fullImpact ? .58 : .34,
        ease: "power3.out",
        onUpdate: function () { shakeStrength = impactState.shake; }
      }, fullImpact ? .68 : .39)
      .to(loader, { opacity: 0, duration: .34, ease: "power2.out" }, fullImpact ? 1.02 : .62);
  }

  function handleResize() {
    if (renderer && camera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    calculateProjectAnchors();
    updateScrollState(documentProgress());
    if (reduceMotion.matches && sceneReady) {
      updateWorld(1 / 60, performance.now() / 1000);
      renderer.render(scene, camera);
    }
  }

  function handleVisibility() {
    hidden = document.hidden;
    if (hidden && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (!hidden) startRenderLoop();
  }

  function handleMotionPreference() {
    if (reduceMotion.matches && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    startRenderLoop();
  }

  function revealAfterFailure() {
    window.setTimeout(function () {
      introCharge = .1;
      finishIntro();
    }, incomingTransition ? 780 : 260);
  }

  try {
    sceneReady = initializeScene();
    initializeScrollTriggers();
    calculateProjectAnchors();
    updateScrollState(documentProgress());

    window.addEventListener("pointermove", function (event) {
      pointer.x = event.clientX / window.innerWidth - .5;
      pointer.y = event.clientY / window.innerHeight - .5;
    }, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", handleResize, { once: true });
    document.addEventListener("visibilitychange", handleVisibility);
    if (typeof reduceMotion.addEventListener === "function") reduceMotion.addEventListener("change", handleMotionPreference);
    else if (typeof reduceMotion.addListener === "function") reduceMotion.addListener(handleMotionPreference);

    if (!sceneReady) {
      revealAfterFailure();
    } else if (incomingTransition) {
      window.addEventListener("portfolio:arrived", function () { runIntro(true); }, { once: true });
      window.setTimeout(function () { runIntro(true); }, 1500);
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { runIntro(false); }, { once: true });
    } else {
      runIntro(false);
    }
  } catch (error) {
    revealAfterFailure();
  }
}());
