(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-preview-transition";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var activeOverlay = null;
  var activeFrame = 0;
  var arrivalDispatched = false;

  function writeState(theme) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: theme, at: Date.now() }));
    } catch (error) {
      /* The semantic anchor remains the navigation fallback. */
    }
  }

  function readState() {
    try {
      var value = sessionStorage.getItem(STORAGE_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function validState(theme) {
    var state = readState();
    return Boolean(state && state.theme === theme && Date.now() - state.at < 15000);
  }

  function clearState() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* No transition state is available. */
    }
  }

  function removeOverlay() {
    window.cancelAnimationFrame(activeFrame);
    if (activeOverlay && activeOverlay.parentNode) activeOverlay.parentNode.removeChild(activeOverlay);
    activeOverlay = null;
    document.body.classList.remove("is-transitioning");
  }

  function createOverlay(theme) {
    removeOverlay();
    var overlay = document.createElement("div");
    overlay.className = "route-transition is-visible";
    overlay.dataset.theme = theme;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = [
      "<canvas class=\"transition-canvas\"></canvas>",
      "<div class=\"transition-impact\"></div>",
      "<div class=\"transition-curtain\"></div>",
      "<div class=\"transition-label\"><b>",
      theme === "thor" ? "THE STORM ANSWERS" : "IMPACT REGISTERED",
      "</b><span>",
      theme === "thor" ? "Opening Storm Forge" : "Opening Impact Archive",
      "</span></div>"
    ].join("");
    document.body.appendChild(overlay);
    document.body.classList.add("is-transitioning");
    activeOverlay = overlay;
    return overlay;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function easeOut(value) {
    var t = clamp01(value);
    return 1 - Math.pow(1 - t, 4);
  }

  function easeIn(value) {
    var t = clamp01(value);
    return t * t * t;
  }

  function screenToWorld(x, y, camera, width, height) {
    var halfHeight = camera.top;
    var halfWidth = camera.right;
    return new THREE.Vector3(
      (x / width * 2 - 1) * halfWidth,
      (1 - y / height * 2) * halfHeight,
      0
    );
  }

  function makeJaggedLine(start, end, seed, color, widthScale) {
    var points = [];
    var segments = 28;
    for (var index = 0; index <= segments; index += 1) {
      var progress = index / segments;
      var point = start.clone().lerp(end, progress);
      var envelope = Math.sin(progress * Math.PI);
      var wobble = Math.sin((index + seed) * 12.9898) * 43758.5453;
      wobble -= Math.floor(wobble);
      point.x += (wobble - 0.5) * widthScale * envelope;
      point.z += Math.sin(index * 2.7 + seed) * 0.08;
      points.push(point);
    }
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0 }));
  }

  function addEdges(mesh, group, color) {
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.84 })
    );
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    edges.scale.copy(mesh.scale);
    group.add(edges);
    return edges;
  }

  function buildHammer(material, edgeColor) {
    var group = new THREE.Group();
    var head = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, 0.9), material);
    group.add(head);
    addEdges(head, group, edgeColor);
    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 3.1, 12), material);
    handle.position.y = 2;
    group.add(handle);
    var pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.35, 12), material);
    pommel.position.y = 3.68;
    group.add(pommel);
    group.rotation.z = -0.34;
    return group;
  }

  function buildFist(material) {
    var group = new THREE.Group();
    var palm = new THREE.Mesh(new THREE.SphereGeometry(1.2, 18, 14), material);
    palm.scale.set(1.45, 0.82, 0.92);
    group.add(palm);
    for (var index = 0; index < 4; index += 1) {
      var knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.54, 14, 10), material);
      knuckle.scale.set(0.82, 1.2, 0.88);
      knuckle.position.set(-1.02 + index * 0.67, 0.7 + Math.sin(index) * 0.06, 0.22);
      group.add(knuckle);
    }
    var thumb = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10), material);
    thumb.scale.set(1.02, 0.64, 0.78);
    thumb.position.set(-1.18, -0.18, 0.32);
    thumb.rotation.z = 0.62;
    group.add(thumb);
    group.rotation.set(-0.18, -0.28, -0.08);
    return group;
  }

  function playWebGLTransition(overlay, theme, origin, onComplete) {
    if (!window.THREE) return false;
    var canvas = overlay.querySelector(".transition-canvas");
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      return false;
    }

    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / Math.max(1, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 60);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);
    var hit = screenToWorld(origin.x, origin.y, camera, width, height);
    scene.add(new THREE.AmbientLight(0xfbfaf5, 1.15));
    var light = new THREE.DirectionalLight(theme === "thor" ? 0x6ed9ff : 0x9bc53d, 1.9);
    light.position.set(-2, 6, 8);
    scene.add(light);

    var ink = theme === "thor" ? 0x17234c : 0x2f204b;
    var accent = theme === "thor" ? 0x6ed9ff : 0x9bc53d;
    var cover = theme === "thor" ? 0x17234c : 0x21192f;
    var objectMaterial = new THREE.MeshStandardMaterial({
      color: theme === "thor" ? 0x38435a : 0x4e622f,
      roughness: theme === "thor" ? 0.45 : 0.86,
      metalness: theme === "thor" ? 0.75 : 0.02
    });
    var striker = theme === "thor" ? buildHammer(objectMaterial, 0xffc400) : buildFist(objectMaterial);
    striker.scale.setScalar(theme === "thor" ? 0.72 : 0.9);
    striker.position.set(hit.x, 6.4, 1.2);
    scene.add(striker);

    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(theme === "thor" ? 0.78 : 1.18, 0.06, 7, 48),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0 })
    );
    ring.position.set(hit.x, hit.y, 0.35);
    scene.add(ring);

    var bolts = [];
    if (theme === "thor") {
      var boltStarts = [
        new THREE.Vector3(hit.x - 2.8, 5.3, 0.2),
        new THREE.Vector3(hit.x + 0.4, 5.3, 0.25),
        new THREE.Vector3(hit.x + 3.2, 5.3, 0.15)
      ];
      boltStarts.forEach(function (start, index) {
        var outer = makeJaggedLine(start, new THREE.Vector3(hit.x, hit.y, 0.1), 20 + index * 17, ink, 0.72);
        var inner = makeJaggedLine(start, new THREE.Vector3(hit.x, hit.y, 0.12), 20 + index * 17, accent, 0.54);
        scene.add(outer, inner);
        bolts.push(outer, inner);
      });
    }

    var fragments = [];
    var fragmentMaterial = new THREE.MeshStandardMaterial({ color: theme === "thor" ? 0x26314c : 0x343039, roughness: 0.8, metalness: theme === "thor" ? 0.4 : 0.04 });
    for (var fragmentIndex = 0; fragmentIndex < 26; fragmentIndex += 1) {
      var angle = fragmentIndex / 26 * Math.PI * 2 + (fragmentIndex % 3) * 0.19;
      var fragment = new THREE.Mesh(
        new THREE.BoxGeometry(0.2 + (fragmentIndex % 4) * 0.08, 0.12 + (fragmentIndex % 3) * 0.1, 0.12 + (fragmentIndex % 5) * 0.05),
        fragmentMaterial
      );
      fragment.position.set(hit.x, hit.y, 0.2);
      fragment.userData.direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0.3 + (fragmentIndex % 4) * 0.15);
      fragment.userData.distance = 1.3 + (fragmentIndex % 7) * 0.38;
      scene.add(fragment);
      fragments.push(fragment);
    }

    var plates = [];
    var columns = 6;
    var rows = 4;
    var cellWidth = camera.right * 2 / columns;
    var cellHeight = camera.top * 2 / rows;
    var plateMaterial = new THREE.MeshBasicMaterial({ color: cover });
    for (var plateIndex = 0; plateIndex < columns * rows; plateIndex += 1) {
      var column = plateIndex % columns;
      var row = Math.floor(plateIndex / columns);
      var plate = new THREE.Mesh(new THREE.BoxGeometry(cellWidth * 1.035, cellHeight * 1.04, 0.16), plateMaterial);
      plate.userData.target = new THREE.Vector3(
        camera.left + cellWidth * (column + 0.5),
        camera.top - cellHeight * (row + 0.5),
        2.8
      );
      plate.userData.start = new THREE.Vector3(
        hit.x + (column - 2.5) * (theme === "thor" ? 0.28 : 0.55),
        hit.y + (row - 1.5) * (theme === "thor" ? 0.18 : -0.36),
        0.2
      );
      plate.position.copy(plate.userData.start);
      plate.scale.setScalar(0.001);
      plate.rotation.z = (column - 2.5) * (theme === "thor" ? 0.04 : 0.09);
      scene.add(plate);
      plates.push(plate);
    }

    var startTime = performance.now();
    var duration = theme === "thor" ? 1180 : 1120;
    var impactElement = overlay.querySelector(".transition-impact");
    var label = overlay.querySelector(".transition-label");
    var curtain = overlay.querySelector(".transition-curtain");
    label.classList.add("is-ready");

    function render(now) {
      var progress = clamp01((now - startTime) / duration);
      var strikeProgress = easeIn(progress / 0.34);
      striker.position.y = 6.4 + (hit.y - 6.4) * strikeProgress;
      striker.rotation.z += theme === "thor" ? 0.016 : 0.006;

      var impact = clamp01((progress - 0.27) / 0.18);
      ring.material.opacity = Math.sin(impact * Math.PI) * 0.95;
      ring.scale.setScalar(0.2 + easeOut(impact) * (theme === "thor" ? 4.8 : 6.5));
      bolts.forEach(function (bolt, index) {
        bolt.material.opacity = Math.sin(impact * Math.PI) * (index % 2 ? 1 : 0.72);
      });
      fragments.forEach(function (fragment, index) {
        var fragmentProgress = easeOut(clamp01((progress - 0.28 - index % 5 * 0.006) / 0.34));
        fragment.position.copy(new THREE.Vector3(hit.x, hit.y, 0.2)).add(
          fragment.userData.direction.clone().multiplyScalar(fragment.userData.distance * fragmentProgress)
        );
        fragment.rotation.x = fragmentProgress * (index % 4 + 1) * 0.7;
        fragment.rotation.y = fragmentProgress * (index % 5 + 1) * 0.55;
      });

      var coverProgress = clamp01((progress - 0.48) / 0.43);
      plates.forEach(function (plate, index) {
        var delay = theme === "thor" ? (index % columns) * 0.035 : ((index * 7) % 11) * 0.025;
        var local = easeOut(clamp01((coverProgress - delay) / Math.max(0.01, 1 - delay)));
        plate.position.lerpVectors(plate.userData.start, plate.userData.target, local);
        plate.scale.setScalar(Math.max(0.001, local));
        plate.rotation.z *= 1 - local;
      });

      if (theme === "hulk" && impact > 0 && impact < 0.8) {
        camera.position.x = (Math.sin(now * 0.11) * 0.09) * (1 - impact);
        camera.position.y = (Math.cos(now * 0.13) * 0.075) * (1 - impact);
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      impactElement.style.opacity = String(Math.sin(impact * Math.PI));
      curtain.style.opacity = String(clamp01((progress - 0.84) / 0.16));
      renderer.render(scene, camera);
      if (progress < 1) activeFrame = window.requestAnimationFrame(render);
      else onComplete();
    }

    activeFrame = window.requestAnimationFrame(render);
    return true;
  }

  function leave(link, theme) {
    if (document.body.classList.contains("is-transitioning")) return;
    var rect = link.getBoundingClientRect();
    var origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    var destination = link.href;
    writeState(theme);

    if (reduceMotion.matches) {
      var reducedOverlay = createOverlay(theme);
      reducedOverlay.classList.add("is-reduced");
      window.setTimeout(function () { window.location.assign(destination); }, 180);
      return;
    }

    var overlay = createOverlay(theme);
    link.animate(
      theme === "thor"
        ? [
            { transform: "translate(0,0) rotate(0)" },
            { transform: "translate(0,4px) rotate(-1deg)", offset: 0.42 },
            { transform: "translate(0,-3px) rotate(.5deg)" }
          ]
        : [
            { transform: "translate(0,0) scale(1,1)" },
            { transform: "translate(1px,7px) scale(1.04,.66) skewX(-4deg)", offset: 0.5 },
            { transform: "translate(-2px,3px) scale(.94,.78) skewX(2deg)" }
          ],
      { duration: 430, fill: "forwards", easing: "cubic-bezier(.16,1,.3,1)" }
    );

    var played = playWebGLTransition(overlay, theme, origin, function () {
      window.location.assign(destination);
    });
    if (!played) {
      overlay.classList.add("is-css-fallback");
      window.setTimeout(function () { window.location.assign(destination); }, 720);
    }
  }

  function dispatchArrival() {
    if (arrivalDispatched) return;
    var theme = document.body.dataset.theme;
    if (!theme || !validState(theme)) return;
    arrivalDispatched = true;
    document.body.classList.add("route-arrival-pending");
    window.requestAnimationFrame(function () {
      window.dispatchEvent(new CustomEvent("portfolio:arrived", { detail: { theme: theme } }));
    });
  }

  function consumeArrival(theme) {
    if (theme && !validState(theme)) return false;
    clearState();
    document.body.classList.remove("route-arrival-pending");
    return true;
  }

  function bind(link, theme) {
    if (!link) return;
    link.dataset.transitionTheme = theme;
    link.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      leave(link, link.dataset.transitionTheme || theme);
    });
  }

  window.PortfolioTransition = {
    bind: bind,
    arriveIfNeeded: dispatchArrival,
    hasArrival: validState,
    consumeArrival: consumeArrival,
    clear: removeOverlay
  };

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    clearState();
    removeOverlay();
    document.querySelectorAll("[data-transition-theme]").forEach(function (link) {
      link.getAnimations().forEach(function (animation) { animation.cancel(); });
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dispatchArrival, { once: true });
  } else {
    dispatchArrival();
  }
}());
