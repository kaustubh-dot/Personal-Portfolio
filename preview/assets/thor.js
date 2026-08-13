(function () {
  "use strict";

  var body = document.body;
  var canvas = document.getElementById("stormWorld");
  var progressFill = document.getElementById("progressFill");
  var chargeValue = document.getElementById("chargeValue");
  var stationValue = document.getElementById("stationValue");
  var loader = document.querySelector(".scene-loader");
  var loaderLabel = document.getElementById("sceneLoaderLabel");
  var loaderFill = document.getElementById("sceneLoaderFill");
  var sceneStatus = document.getElementById("sceneStatus");
  var hudTicks = Array.prototype.slice.call(document.querySelectorAll(".charge-hud__ticks i"));
  var records = Array.prototype.slice.call(document.querySelectorAll("[data-project]"));
  var routeLinks = Array.prototype.slice.call(document.querySelectorAll("[data-route-link]"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var transitionArrival = hasFreshThorTransition();
  var revealSafetyTimer = null;

  body.classList.add("js-ready");

  function hasFreshThorTransition() {
    if (window.PortfolioTransition && typeof window.PortfolioTransition.hasArrival === "function") {
      return window.PortfolioTransition.hasArrival("thor");
    }
    try {
      var raw = window.sessionStorage.getItem("portfolio-preview-transition");
      var state = raw ? JSON.parse(raw) : null;
      return Boolean(state && state.theme === "thor" && Date.now() - state.at < 15000);
    } catch (error) {
      return false;
    }
  }

  function consumeThorTransition() {
    if (!transitionArrival) return;
    if (window.PortfolioTransition && typeof window.PortfolioTransition.consumeArrival === "function") {
      window.PortfolioTransition.consumeArrival("thor");
    }
    transitionArrival = false;
  }

  function revealPage() {
    if (body.classList.contains("scene-ready")) return;
    body.classList.remove("scene-pending");
    body.classList.add("scene-ready");
    if (sceneStatus) sceneStatus.textContent = "Storm Forge archive ready.";
    if (loader) loader.setAttribute("hidden", "");
    if (revealSafetyTimer !== null) {
      window.clearTimeout(revealSafetyTimer);
      revealSafetyTimer = null;
    }
  }

  revealSafetyTimer = window.setTimeout(function () {
    consumeThorTransition();
    revealPage();
  }, 3200);

  if (!canvas || !window.THREE) {
    revealPage();
    return;
  }

  try {
    initStormForge();
  } catch (error) {
    revealPage();
  }

  function initStormForge() {
    var THREE = window.THREE;
    var gsap = window.gsap || null;
    var ScrollTrigger = window.ScrollTrigger || null;
    var WEB_SEGMENTS = 900;
    var WEB_RADIAL = 6;
    var DRAW_MULTIPLIER = WEB_RADIAL * 6;
    var INK = 0x15151c;
    var PAPER = 0xfbfaf5;
    var PAPER_2 = 0xf2efe6;
    var BLUE = 0x2342d6;
    var BLUE_DEEP = 0x16289b;
    var STORM = 0x17234c;
    var YELLOW = 0xffc400;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(49, window.innerWidth / window.innerHeight, .1, 220);
    var clock = new THREE.Clock(false);
    var frameId = null;
    var running = false;
    var scrollTarget = normalizedScroll();
    var scrollProgress = scrollTarget;
    var activeProject = 0;
    var pointer = { x: 0, y: 0 };
    var triggerHandles = [];
    var cloudGroups = [];
    var checkpoints = [];
    var platformFragments = [];
    var worldSeed = 113824;
    var heroCoordination = { compression: 0 };
    var sceneState = {
      introCharge: 0,
      strikeProgress: 0,
      strikeOpacity: 1,
      cameraImpact: 0
    };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(PAPER, 0);
    scene.fog = new THREE.Fog(PAPER, 27, 73);
    camera.position.set(.2, 3.7, 15.8);

    function random() {
      worldSeed = (worldSeed * 1664525 + 1013904223) >>> 0;
      return worldSeed / 4294967296;
    }

    function clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    }

    function normalizedScroll() {
      var root = document.documentElement;
      var range = Math.max(1, root.scrollHeight - root.clientHeight);
      return clamp(root.scrollTop / range, 0, 1);
    }

    function basicMaterial(color, opacity) {
      return new THREE.MeshBasicMaterial({
        color: color,
        transparent: typeof opacity === "number" && opacity < 1,
        opacity: typeof opacity === "number" ? opacity : 1,
        side: THREE.DoubleSide
      });
    }

    function addEdges(mesh, color, opacity) {
      var edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: color || INK, transparent: opacity < 1, opacity: typeof opacity === "number" ? opacity : 1 })
      );
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      edges.scale.copy(mesh.scale);
      mesh.parent.add(edges);
      return edges;
    }

    function makePrintTexture(width, height, accent) {
      var textureCanvas = document.createElement("canvas");
      var size = 192;
      textureCanvas.width = size;
      textureCanvas.height = size;
      var context = textureCanvas.getContext("2d");
      context.fillStyle = "#f2efe6";
      context.fillRect(0, 0, size, size);
      context.fillStyle = "#17234c";
      for (var y = 7; y < size; y += 13) {
        for (var x = 7; x < size; x += 13) {
          var offset = (Math.floor(y / 13) % 2) * 5;
          context.beginPath();
          context.arc(x + offset, y, 2.1, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.fillStyle = accent ? "rgba(255,196,0,.92)" : "rgba(35,66,214,.76)";
      for (var stripe = 12; stripe < size; stripe += 47) {
        context.fillRect(stripe, 0, 6, size);
      }
      var texture = new THREE.CanvasTexture(textureCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(Math.max(1, Math.round(width / 2)), Math.max(1, Math.round(height / 2)));
      texture.magFilter = THREE.NearestFilter;
      return texture;
    }

    var stormDisc = new THREE.Group();
    var disc = new THREE.Mesh(new THREE.CircleGeometry(6.2, 56), basicMaterial(BLUE_DEEP, .9));
    var discRing = new THREE.Mesh(new THREE.RingGeometry(6.2, 6.4, 56), basicMaterial(INK, .9));
    var discEcho = new THREE.Mesh(new THREE.RingGeometry(6.75, 6.82, 56), basicMaterial(YELLOW, .65));
    stormDisc.add(disc, discRing, discEcho);
    stormDisc.position.set(5.8, 4.3, -12.8);
    scene.add(stormDisc);

    for (var craterIndex = 0; craterIndex < 72; craterIndex += 1) {
      var crater = new THREE.Mesh(new THREE.CircleGeometry(.035 + random() * .08, 8), basicMaterial(craterIndex % 8 === 0 ? YELLOW : PAPER, .54));
      var craterAngle = random() * Math.PI * 2;
      var craterDistance = Math.sqrt(random()) * 5.7;
      crater.position.set(Math.cos(craterAngle) * craterDistance, Math.sin(craterAngle) * craterDistance, .02);
      stormDisc.add(crater);
    }

    var skyline = new THREE.Group();
    var skylineDefinitions = [
      [-18, 2.6, 8.5, -8], [-15, 2.1, 12, -7], [-11.8, 3.2, 7.2, -9], [-8, 2.8, 14, -7],
      [-4.3, 2.4, 9.4, -8], [-1, 3.5, 6.8, -9], [2.5, 2.6, 11.8, -7], [6.4, 3.8, 14.5, -8.6],
      [10.8, 2.3, 9.5, -7.8], [14, 3.2, 12.8, -9], [18, 2.8, 8.2, -8]
    ];

    skylineDefinitions.forEach(function (definition, index) {
      var x = definition[0];
      var width = definition[1];
      var height = definition[2];
      var z = definition[3];
      var geometry = new THREE.BoxGeometry(width, height, width * .84);
      var material = new THREE.MeshBasicMaterial({ map: makePrintTexture(width, height, index % 4 === 0) });
      var monolith = new THREE.Mesh(geometry, material);
      monolith.position.set(x, height / 2 - 5.1, z);
      skyline.add(monolith);
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .96 }));
      edges.position.copy(monolith.position);
      skyline.add(edges);
      var crown = new THREE.Mesh(new THREE.BoxGeometry(width + .2, .18, width + .08), basicMaterial(INK));
      crown.position.set(x, height - 5.02, z);
      skyline.add(crown);
      if (index % 3 === 1) {
        var spire = new THREE.Mesh(new THREE.ConeGeometry(.11, 2.1, 5), basicMaterial(INK));
        spire.position.set(x + width * .22, height - 3.9, z);
        skyline.add(spire);
      }
    });
    scene.add(skyline);

    var clouds = new THREE.Group();
    for (var cloudIndex = 0; cloudIndex < 6; cloudIndex += 1) {
      var cloud = new THREE.Group();
      for (var puffIndex = 0; puffIndex < 5; puffIndex += 1) {
        var puff = new THREE.Mesh(
          new THREE.SphereGeometry(.75 + random() * .6, 9, 7),
          basicMaterial(cloudIndex % 2 ? BLUE : STORM, .1 + random() * .08)
        );
        puff.position.set(puffIndex * .92 - 1.8, random() * .36, random() * .24);
        puff.scale.y = .55 + random() * .35;
        cloud.add(puff);
      }
      cloud.position.set(-18 + cloudIndex * 7.5, 6.3 + random() * 3.7, -10.5 - random() * 4.5);
      cloud.userData.speed = .1 + random() * .12;
      clouds.add(cloud);
      cloudGroups.push(cloud);
    }
    scene.add(clouds);

    var forge = new THREE.Group();
    forge.position.set(5.4, -2.4, -2.8);
    scene.add(forge);

    var platformBase = new THREE.Mesh(new THREE.CylinderGeometry(4.35, 4.9, .95, 12), basicMaterial(STORM));
    platformBase.position.y = 0;
    forge.add(platformBase);
    addEdges(platformBase, PAPER, .9);

    var platformTop = new THREE.Mesh(new THREE.CylinderGeometry(3.82, 4.22, .35, 12), basicMaterial(BLUE_DEEP));
    platformTop.position.y = .62;
    forge.add(platformTop);
    addEdges(platformTop, INK, 1);

    var platformRing = new THREE.Mesh(new THREE.TorusGeometry(3.55, .09, 6, 40), basicMaterial(YELLOW));
    platformRing.rotation.x = Math.PI / 2;
    platformRing.position.y = .84;
    forge.add(platformRing);

    for (var slabIndex = 0; slabIndex < 18; slabIndex += 1) {
      var slabAngle = slabIndex / 18 * Math.PI * 2;
      var slabDistance = 2.5 + random() * 2.2;
      var slab = new THREE.Mesh(new THREE.BoxGeometry(1.1 + random() * .8, .25 + random() * .18, 1.2 + random() * .9), basicMaterial(slabIndex % 4 === 0 ? BLUE : STORM));
      slab.position.set(Math.cos(slabAngle) * slabDistance, .8 + random() * .18, Math.sin(slabAngle) * slabDistance);
      slab.rotation.set(random() * .16, -slabAngle + random() * .25, random() * .12);
      slab.userData.baseY = slab.position.y;
      slab.userData.baseRotation = slab.rotation.clone();
      forge.add(slab);
      platformFragments.push(slab);
    }

    var hammer = new THREE.Group();
    hammer.position.set(.1, .86, .05);
    hammer.rotation.z = -.18;
    forge.add(hammer);

    var handle = new THREE.Mesh(new THREE.CylinderGeometry(.24, .31, 5.25, 9), basicMaterial(INK));
    handle.position.y = 2.7;
    hammer.add(handle);

    for (var gripIndex = 0; gripIndex < 7; gripIndex += 1) {
      var grip = new THREE.Mesh(new THREE.TorusGeometry(.31, .055, 5, 9), basicMaterial(gripIndex % 2 ? BLUE : PAPER));
      grip.rotation.x = Math.PI / 2;
      grip.position.y = .65 + gripIndex * .53;
      hammer.add(grip);
    }

    var hammerHead = new THREE.Mesh(new THREE.BoxGeometry(2.85, 1.42, 1.55), basicMaterial(STORM));
    hammerHead.position.y = 5.5;
    hammer.add(hammerHead);
    addEdges(hammerHead, PAPER, 1);

    var headCore = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.66, 1.78), basicMaterial(BLUE_DEEP));
    headCore.position.y = 5.5;
    hammer.add(headCore);
    addEdges(headCore, YELLOW, 1);

    var leftCap = new THREE.Mesh(new THREE.BoxGeometry(.36, 1.15, 1.22), basicMaterial(PAPER_2));
    leftCap.position.set(-1.58, 5.5, 0);
    hammer.add(leftCap);
    addEdges(leftCap, INK, 1);

    var rightCap = leftCap.clone();
    rightCap.position.x = 1.58;
    hammer.add(rightCap);

    var pommel = new THREE.Mesh(new THREE.CylinderGeometry(.38, .48, .48, 8), basicMaterial(BLUE));
    pommel.position.y = .03;
    hammer.add(pommel);

    var hammerBaseY = hammer.position.y;
    var hammerBaseRotation = hammer.rotation.z;

    var impactRing = new THREE.Mesh(new THREE.TorusGeometry(3.1, .11, 6, 46), basicMaterial(YELLOW, 0));
    impactRing.rotation.x = Math.PI / 2;
    impactRing.position.set(.1, .94, .05);
    impactRing.scale.setScalar(.2);
    forge.add(impactRing);

    var conduitPoints = [
      new THREE.Vector3(5.2, 3.95, -2.65),
      new THREE.Vector3(3.8, 6.8, -.4),
      new THREE.Vector3(.7, 4.3, 1.1),
      new THREE.Vector3(-2.4, 7.8, -1.2),
      new THREE.Vector3(-5.8, 4.2, 1.7),
      new THREE.Vector3(-9.3, 7.3, -1.5),
      new THREE.Vector3(-12.8, 3.9, 1.4),
      new THREE.Vector3(-16.5, 7.2, -1.8),
      new THREE.Vector3(-20.2, 4.4, 1.2),
      new THREE.Vector3(-24.8, 7.1, -.8)
    ];
    var conduitCurve = new THREE.CatmullRomCurve3(conduitPoints);
    var conduitOuterGeometry = new THREE.TubeGeometry(conduitCurve, WEB_SEGMENTS, .105, WEB_RADIAL, false);
    var conduitInnerGeometry = new THREE.TubeGeometry(conduitCurve, WEB_SEGMENTS, .042, WEB_RADIAL, false);
    var conduitOuter = new THREE.Mesh(conduitOuterGeometry, basicMaterial(BLUE_DEEP));
    var conduitInner = new THREE.Mesh(conduitInnerGeometry, basicMaterial(YELLOW));
    conduitOuter.geometry.setDrawRange(0, 0);
    conduitInner.geometry.setDrawRange(0, 0);
    conduitInner.position.z = .025;
    scene.add(conduitOuter, conduitInner);

    var conduitTip = new THREE.Group();
    var tipCore = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), basicMaterial(YELLOW));
    var tipRing = new THREE.Mesh(new THREE.TorusGeometry(.37, .045, 6, 22), basicMaterial(BLUE_DEEP));
    conduitTip.add(tipCore, tipRing);
    scene.add(conduitTip);

    var checkpointPositions = [.14, .32, .5, .68, .86];
    checkpointPositions.forEach(function (at, index) {
      var checkpoint = new THREE.Group();
      var nodeDisc = new THREE.Mesh(new THREE.CircleGeometry(.54, 24), basicMaterial(index === 0 ? YELLOW : PAPER));
      var nodeRing = new THREE.Mesh(new THREE.RingGeometry(.55, .72, 24), basicMaterial(INK));
      var nodeEcho = new THREE.Mesh(new THREE.RingGeometry(.83, .9, 24), basicMaterial(BLUE));
      checkpoint.add(nodeDisc, nodeRing, nodeEcho);
      for (var spokeIndex = 0; spokeIndex < 10; spokeIndex += 1) {
        var spokeAngle = spokeIndex / 10 * Math.PI * 2;
        var spokeGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(spokeAngle) * .73, Math.sin(spokeAngle) * .73, 0),
          new THREE.Vector3(Math.cos(spokeAngle) * 1.12, Math.sin(spokeAngle) * 1.12, 0)
        ]);
        checkpoint.add(new THREE.Line(spokeGeometry, new THREE.LineBasicMaterial({ color: index % 2 ? YELLOW : BLUE_DEEP })));
      }
      checkpoint.position.copy(conduitCurve.getPointAt(at));
      checkpoint.scale.setScalar(.001);
      checkpoint.userData = { at: at, shown: false, index: index };
      scene.add(checkpoint);
      checkpoints.push(checkpoint);
    });

    var strikeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(9.4, 15.5, -6),
      new THREE.Vector3(7.5, 11.8, -2.2),
      new THREE.Vector3(8.2, 8.9, -.6),
      new THREE.Vector3(5.2, 3.95, -2.65)
    ]);
    var strikeSegments = 240;
    var strikeGeometry = new THREE.TubeGeometry(strikeCurve, strikeSegments, .13, WEB_RADIAL, false);
    var strikeMaterial = basicMaterial(YELLOW, 1);
    var strikeBolt = new THREE.Mesh(strikeGeometry, strikeMaterial);
    strikeBolt.geometry.setDrawRange(0, 0);
    scene.add(strikeBolt);

    function setActiveProject(index) {
      activeProject = clamp(index, 0, records.length - 1);
      records.forEach(function (record, recordIndex) {
        record.classList.toggle("is-active", recordIndex === activeProject);
      });
      routeLinks.forEach(function (link, linkIndex) {
        var active = linkIndex === activeProject;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
    }

    function nearestProject() {
      var nearestIndex = 0;
      var nearestDistance = Infinity;
      var targetLine = window.innerHeight * .53;
      records.forEach(function (record, index) {
        var rect = record.getBoundingClientRect();
        var distance = Math.abs(rect.top + rect.height * .4 - targetLine);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      return nearestIndex;
    }

    function updateHud() {
      var percentage = Math.round(scrollTarget * 100);
      if (progressFill) progressFill.style.setProperty("--page-progress", String(scrollTarget));
      if (chargeValue) chargeValue.textContent = String(percentage).padStart(3, "0") + "%";
      if (stationValue) stationValue.textContent = percentage < 2 ? "Awaiting node 01" : "Node " + String(activeProject + 1).padStart(2, "0") + " of 05";
      hudTicks.forEach(function (tick, index) {
        tick.classList.toggle("is-charged", percentage >= (index + 1) * 10);
      });
    }

    function updateConduit(time) {
      var effectiveProgress = reduceMotion.matches ? 1 : clamp(sceneState.introCharge + scrollProgress * (1 - sceneState.introCharge), 0, 1);
      var segmentsOn = Math.floor(effectiveProgress * WEB_SEGMENTS);
      var drawCount = Math.max(0, segmentsOn * DRAW_MULTIPLIER);
      conduitOuter.geometry.setDrawRange(0, drawCount);
      conduitInner.geometry.setDrawRange(0, drawCount);

      var tipAt = clamp(effectiveProgress, .001, .999);
      var tipPosition = conduitCurve.getPointAt(tipAt);
      conduitTip.position.copy(tipPosition);
      tipRing.rotation.z = time * 2.2;
      tipRing.rotation.y = time * 1.4;
      var tipPulse = 1 + Math.sin(time * 7) * .12;
      conduitTip.scale.setScalar(tipPulse);

      checkpoints.forEach(function (checkpoint) {
        var shouldShow = effectiveProgress >= checkpoint.userData.at;
        if (shouldShow !== checkpoint.userData.shown) {
          checkpoint.userData.shown = shouldShow;
          if (gsap && !reduceMotion.matches) {
            gsap.to(checkpoint.scale, {
              x: shouldShow ? 1 : .001,
              y: shouldShow ? 1 : .001,
              z: shouldShow ? 1 : .001,
              duration: shouldShow ? .55 : .25,
              ease: shouldShow ? "back.out(2.4)" : "power2.in"
            });
          } else {
            checkpoint.scale.setScalar(shouldShow ? 1 : .001);
          }
        }
        checkpoint.lookAt(camera.position);
      });

      var strikeCount = Math.floor(clamp(sceneState.strikeProgress, 0, 1) * strikeSegments) * DRAW_MULTIPLIER;
      strikeBolt.geometry.setDrawRange(0, strikeCount);
      strikeMaterial.opacity = sceneState.strikeOpacity;
    }

    function updateCamera(time) {
      var effectiveProgress = reduceMotion.matches ? 0 : scrollProgress;
      var tipPosition = conduitCurve.getPointAt(clamp(effectiveProgress, .001, .999));
      var followX = THREE.MathUtils.lerp(.2, tipPosition.x * .54, effectiveProgress);
      var followY = THREE.MathUtils.lerp(3.7, 2.5 + tipPosition.y * .34, effectiveProgress);
      var followZ = THREE.MathUtils.lerp(15.8, 17.3, effectiveProgress);
      var impactShake = sceneState.cameraImpact * Math.sin(time * 49) * .16;
      var desiredX = followX + pointer.x * 1.15 + impactShake;
      var desiredY = followY - pointer.y * .72 + heroCoordination.compression * .35;
      var desiredZ = followZ + Math.abs(impactShake) * .4;
      var smoothing = reduceMotion.matches ? 1 : .055;

      camera.position.x += (desiredX - camera.position.x) * smoothing;
      camera.position.y += (desiredY - camera.position.y) * smoothing;
      camera.position.z += (desiredZ - camera.position.z) * smoothing;

      var lookStart = new THREE.Vector3(2.5, 1.7, -2.8);
      var lookTarget = new THREE.Vector3().lerpVectors(lookStart, tipPosition, Math.min(1, effectiveProgress * 1.2 + .04));
      camera.lookAt(lookTarget);
    }

    function tick() {
      frameId = null;
      if (!running || document.hidden) return;

      var delta = Math.min(clock.getDelta(), .05);
      var elapsed = clock.getElapsedTime();
      scrollProgress += (scrollTarget - scrollProgress) * (reduceMotion.matches ? 1 : .075);

      if (!reduceMotion.matches) {
        cloudGroups.forEach(function (cloud) {
          cloud.position.x += cloud.userData.speed * delta;
          if (cloud.position.x > 23) cloud.position.x = -23;
        });
        stormDisc.rotation.z = Math.sin(elapsed * .18) * .014;
        hammer.rotation.y = Math.sin(elapsed * .42) * .018;
      }

      updateConduit(elapsed);
      updateCamera(elapsed);
      renderer.render(scene, camera);
      scheduleFrame();
    }

    function scheduleFrame() {
      if (!running || document.hidden || frameId !== null) return;
      frameId = window.requestAnimationFrame(tick);
    }

    function startLoop() {
      if (running || document.hidden) return;
      running = true;
      clock.start();
      scheduleFrame();
    }

    function stopLoop() {
      running = false;
      clock.stop();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    }

    function impactForge() {
      sceneState.cameraImpact = 1;
      if (!gsap || reduceMotion.matches) {
        sceneState.cameraImpact = 0;
        return;
      }

      impactRing.material.opacity = 1;
      impactRing.scale.setScalar(.2);
      gsap.to(impactRing.scale, { x: 1.75, y: 1.75, z: 1.75, duration: .62, ease: "power3.out" });
      gsap.to(impactRing.material, { opacity: 0, duration: .58, ease: "power2.out" });
      gsap.to(sceneState, { cameraImpact: 0, duration: .55, ease: "power3.out" });

      platformFragments.forEach(function (fragment, index) {
        var direction = index % 2 ? 1 : -1;
        gsap.timeline()
          .to(fragment.position, { y: fragment.userData.baseY + .22 + (index % 4) * .06, duration: .16, ease: "power3.out" }, 0)
          .to(fragment.rotation, { z: fragment.userData.baseRotation.z + direction * .08, duration: .16 }, 0)
          .to(fragment.position, { y: fragment.userData.baseY, duration: .42, ease: "bounce.out" }, .16)
          .to(fragment.rotation, { z: fragment.userData.baseRotation.z, duration: .42, ease: "power3.out" }, .16);
      });
    }

    function runArrival() {
      if (reduceMotion.matches) {
        sceneState.introCharge = 1;
        sceneState.strikeProgress = 1;
        sceneState.strikeOpacity = 0;
        hammer.position.y = hammerBaseY;
        hammer.rotation.z = hammerBaseRotation;
        consumeThorTransition();
        revealPage();
        return;
      }

      if (!gsap) {
        sceneState.introCharge = .045;
        sceneState.strikeProgress = 1;
        sceneState.strikeOpacity = 0;
        hammer.position.y = hammerBaseY;
        hammer.rotation.z = hammerBaseRotation;
        consumeThorTransition();
        revealPage();
        return;
      }

      var delay = transitionArrival ? .58 : .08;
      var dropDuration = transitionArrival ? .48 : .34;
      var impactAt = delay + dropDuration;
      hammer.position.y = hammerBaseY + (transitionArrival ? 7.2 : 4.5);
      hammer.rotation.z = hammerBaseRotation - .42;
      if (loaderLabel) loaderLabel.textContent = transitionArrival ? "Storm route incoming" : "Opening the forge";

      var timeline = gsap.timeline();
      timeline
        .to(loaderFill, { width: "42%", duration: impactAt, ease: "power1.inOut" }, 0)
        .to(hammer.position, { y: hammerBaseY, duration: dropDuration, ease: "power4.in" }, delay)
        .to(hammer.rotation, { z: hammerBaseRotation, duration: dropDuration, ease: "power3.in" }, delay)
        .to(sceneState, { strikeProgress: 1, duration: dropDuration, ease: "power4.in" }, delay)
        .call(impactForge, null, impactAt)
        .to(sceneState, { introCharge: .045, duration: .46, ease: "power3.out" }, impactAt)
        .to(loaderFill, { width: "100%", duration: .42, ease: "power3.out" }, impactAt)
        .to(sceneState, { strikeOpacity: 0, duration: .5, ease: "power2.out" }, impactAt + .08)
        .call(function () {
          if (loaderLabel) loaderLabel.textContent = "Proof route established";
          consumeThorTransition();
          revealPage();
        }, null, impactAt + .52);
    }

    function bindScroll() {
      if (gsap && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        triggerHandles.push(ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: function (self) {
            scrollTarget = self.progress;
            updateHud();
          }
        }));

        triggerHandles.push(gsap.to(heroCoordination, {
          compression: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".storm-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        }).scrollTrigger);

        gsap.to(".storm-hero__paper", {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: ".storm-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });

        records.forEach(function (record, index) {
          gsap.from(record.querySelectorAll(".project-record__header, .project-record__copy, .evidence, .project-record__footer"), {
            y: 48,
            opacity: 0,
            duration: .95,
            stagger: .09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: record,
              start: "top 77%",
              toggleActions: "play none none reverse"
            }
          });

          triggerHandles.push(ScrollTrigger.create({
            trigger: record,
            start: "top 58%",
            end: "bottom 42%",
            onEnter: function () { setActiveProject(index); updateHud(); },
            onEnterBack: function () { setActiveProject(index); updateHud(); }
          }));
        });
      } else {
        window.addEventListener("scroll", function () {
          scrollTarget = normalizedScroll();
          setActiveProject(nearestProject());
          updateHud();
        }, { passive: true });
      }
    }

    function handlePointer(event) {
      if (reduceMotion.matches) return;
      pointer.x = event.clientX / window.innerWidth - .5;
      pointer.y = event.clientY / window.innerHeight - .5;
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (ScrollTrigger) ScrollTrigger.refresh();
      if (!running && !document.hidden) {
        renderer.render(scene, camera);
      }
    }

    function handleVisibility() {
      if (document.hidden) stopLoop();
      else startLoop();
    }

    function handleMotionChange() {
      scrollTarget = normalizedScroll();
      if (reduceMotion.matches) {
        sceneState.introCharge = 1;
        pointer.x = 0;
        pointer.y = 0;
      } else {
        sceneState.introCharge = Math.min(sceneState.introCharge, .045);
      }
    }

    routeLinks.forEach(function (link, index) {
      link.addEventListener("click", function () {
        setActiveProject(index);
        updateHud();
      });
    });

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    if (typeof reduceMotion.addEventListener === "function") reduceMotion.addEventListener("change", handleMotionChange);
    else if (typeof reduceMotion.addListener === "function") reduceMotion.addListener(handleMotionChange);

    setActiveProject(nearestProject());
    bindScroll();
    updateHud();
    startLoop();
    runArrival();
  }
}());
