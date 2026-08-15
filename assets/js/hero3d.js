/**
 * hero3d.js — the signature element.
 *
 * A flat-shaded emerald icosahedron with a thick black edge wireframe drawn
 * over it, sitting on a hard-offset black silhouette of itself: real depth
 * wearing flat clothes.
 *
 * Everything here is an enhancement. The stage already contains a static
 * inline SVG of the same shape; this module only hides it once a live scene
 * is genuinely drawing. No WebGL, no CDN, no JavaScript — the SVG stands.
 */

const STAGE_ID = 'hero-stage';
const CANVAS_CLASS = 'hero-canvas';

/* Matches the 48rem breakpoint in pages.css (768px). */
const MOBILE_QUERY = '(max-width: 47.99rem)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

const MAX_PIXEL_RATIO = 2;
const MOBILE_PIXEL_SCALE = 0.5;

const CAMERA_FOV = 38;
const CAMERA_DISTANCE = 3.5;
const MESH_RADIUS = 1;
const ICOSAHEDRON_DETAIL = 0;

/* Radians per second. Slow enough to read as considered, not as a spinner. */
const SPIN_X = 0.07;
const SPIN_Y = 0.16;

const PARALLAX_MAX = 0.18;   // radians of tilt at the edge of the viewport
const PARALLAX_EASE = 0.06;  // per-frame lerp toward the pointer target
const MAX_FRAME_SECONDS = 0.1;

/* Mirrors --offset (14px). */
const SHADOW_OFFSET_PX = 14;

/* Edge weight is a fraction of the stage rather than a fixed pixel count:
   LineMaterial measures linewidth in screen pixels, so a constant would sit
   right on a 512px desktop object and swamp a 280px phone one. */
const EDGE_WIDTH_RATIO = 0.024;
const EDGE_WIDTH_MIN = 5;
const EDGE_WIDTH_MAX = 12;

/* Lit from paper above and emerald below, so even the facets turned away
   from the key light stay recognisably emerald instead of going to mud. */
const LIGHT_INTENSITY = 1.6;
const HEMI_INTENSITY = 1.7;
const LIGHT_POSITION = [2.5, 3, 4];

const IDLE_TIMEOUT_MS = 2000;
const IDLE_FALLBACK_MS = 600;

const mediaMobile = window.matchMedia(MOBILE_QUERY);
const mediaReduced = window.matchMedia(REDUCED_QUERY);
const mediaFinePointer = window.matchMedia(FINE_POINTER_QUERY);

/** Reads a design token so no colour is ever written twice. */
function token(element, name) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

function hasWebGL() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (probe.getContext('webgl2') || probe.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Thick lines need three add-on modules. If they fail to load we still get a
 * wireframe, just a hairline one — worth having, not worth blocking on.
 */
async function loadThickLines() {
  const [segments, geometry, material] = await Promise.all([
    import('three/addons/lines/LineSegments2.js'),
    import('three/addons/lines/LineSegmentsGeometry.js'),
    import('three/addons/lines/LineMaterial.js'),
  ]);
  return {
    LineSegments2: segments.LineSegments2,
    LineSegmentsGeometry: geometry.LineSegmentsGeometry,
    LineMaterial: material.LineMaterial,
  };
}

/**
 * three.js is ~670KB minified. It is an enhancement over a static SVG that
 * is already on screen, so it waits for the main thread to go quiet rather
 * than competing with first paint.
 */
function whenIdle() {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(resolve, { timeout: IDLE_TIMEOUT_MS });
    } else {
      setTimeout(resolve, IDLE_FALLBACK_MS);
    }
  });
}

export async function initHero3D() {
  const stage = document.getElementById(STAGE_ID);
  if (!stage || !hasWebGL()) return;

  await whenIdle();
  const THREE = await import('three');

  const inkColor = new THREE.Color(token(stage, '--ink'));
  const paperColor = new THREE.Color(token(stage, '--paper'));
  const emeraldColor = new THREE.Color(token(stage, '--emerald'));

  const canvas = document.createElement('canvas');
  canvas.className = CANVAS_CLASS;
  canvas.setAttribute('aria-hidden', 'true');
  stage.append(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    /* Antialias is a desktop-only luxury; on mobile the halved pixel ratio
       is already doing the work and the fill-rate cost is real. */
    antialias: !mediaMobile.matches,
    powerPreference: 'low-power',
  });
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_DISTANCE;

  const geometry = new THREE.IcosahedronGeometry(MESH_RADIUS, ICOSAHEDRON_DETAIL);

  const solid = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: emeraldColor,
      flatShading: true,
      roughness: 0.8,
      metalness: 0,
    })
  );

  /* The hard drop shadow is the same solid, painted flat black and pushed
     down-right in screen space. Depth-testing is off and it renders first,
     so the emerald body always covers it where the two overlap — exactly how
     the CSS offset behaves on every other block on the page. */
  const silhouette = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: inkColor,
      depthTest: false,
      depthWrite: false,
    })
  );
  silhouette.renderOrder = -1;

  const solidGroup = new THREE.Group().add(solid);
  const shadowGroup = new THREE.Group().add(silhouette);

  /* Edges. LineSegments2 gives a real pixel width; plain LineSegments is
     locked to one hairline pixel by every WebGL implementation. */
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  let edges;
  let edgeMaterial = null;

  try {
    const { LineSegments2, LineSegmentsGeometry, LineMaterial } = await loadThickLines();
    edgeMaterial = new LineMaterial({
      color: inkColor,
      linewidth: EDGE_WIDTH_MAX,
      worldUnits: false,
      dashed: false,
    });
    edges = new LineSegments2(
      new LineSegmentsGeometry().fromEdgesGeometry(edgeGeometry),
      edgeMaterial
    );
  } catch (error) {
    console.warn('[hero3d] thick-line add-ons unavailable, using hairline edges.', error);
    edges = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: inkColor })
    );
  }
  edges.renderOrder = 1;
  solidGroup.add(edges);

  scene.add(shadowGroup, solidGroup);

  /* Lighting drawn from the palette: paper above, emerald below. */
  scene.add(new THREE.HemisphereLight(paperColor, emeraldColor, HEMI_INTENSITY));
  const key = new THREE.DirectionalLight(paperColor, LIGHT_INTENSITY);
  key.position.set(...LIGHT_POSITION);
  scene.add(key);

  // ---- sizing -----------------------------------------------------------

  function currentPixelRatio() {
    const base = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    return mediaMobile.matches ? Math.max(1, base * MOBILE_PIXEL_SCALE) : base;
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;

    renderer.setPixelRatio(currentPixelRatio());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (edgeMaterial) {
      edgeMaterial.resolution.set(width, height);
      edgeMaterial.linewidth = Math.min(
        EDGE_WIDTH_MAX,
        Math.max(EDGE_WIDTH_MIN, width * EDGE_WIDTH_RATIO)
      );
    }

    /* Convert the 14px CSS offset into world units at the object's depth so
       the shadow keeps the same visual distance at every screen size. */
    const visibleHeight = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_DISTANCE;
    const worldPerPixel = visibleHeight / height;
    shadowGroup.position.set(
      SHADOW_OFFSET_PX * worldPerPixel,
      -SHADOW_OFFSET_PX * worldPerPixel,
      0
    );
  }

  // ---- motion -----------------------------------------------------------

  let spinX = 0.35;
  let spinY = 0.6;
  let tiltTargetX = 0;
  let tiltTargetY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let rafId = null;
  let lastFrame = 0;
  let onScreen = true;

  function applyRotation() {
    const x = spinX + tiltX;
    const y = spinY + tiltY;
    solidGroup.rotation.set(x, y, 0);
    shadowGroup.rotation.set(x, y, 0);
  }

  function draw() {
    applyRotation();
    renderer.render(scene, camera);
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const delta = Math.min((now - lastFrame) / 1000, MAX_FRAME_SECONDS);
    lastFrame = now;

    spinX += SPIN_X * delta;
    spinY += SPIN_Y * delta;
    tiltX += (tiltTargetX - tiltX) * PARALLAX_EASE;
    tiltY += (tiltTargetY - tiltY) * PARALLAX_EASE;

    draw();
  }

  function shouldAnimate() {
    return onScreen && !document.hidden && !mediaReduced.matches;
  }

  function start() {
    if (rafId !== null || !shouldAnimate()) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function sync() {
    if (shouldAnimate()) start();
    else stop();
  }

  // ---- parallax ---------------------------------------------------------

  function parallaxEnabled() {
    return mediaFinePointer.matches && !mediaMobile.matches && !mediaReduced.matches;
  }

  function onPointerMove(event) {
    if (!parallaxEnabled()) return;
    const nx = (event.clientX / window.innerWidth) * 2 - 1;
    const ny = (event.clientY / window.innerHeight) * 2 - 1;
    tiltTargetY = nx * PARALLAX_MAX;
    tiltTargetX = ny * PARALLAX_MAX;
  }

  function resetParallax() {
    tiltTargetX = 0;
    tiltTargetY = 0;
    tiltX = 0;
    tiltY = 0;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // ---- lifecycle --------------------------------------------------------

  new ResizeObserver(() => {
    resize();
    if (!shouldAnimate()) draw();
  }).observe(stage);

  new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    sync();
  }).observe(stage);

  document.addEventListener('visibilitychange', sync);

  /* A requestAnimationFrame loop cannot be stopped by a CSS media query, so
     reduced motion gets its own listener here — and it responds to the OS
     toggle mid-session, not only at load. */
  mediaReduced.addEventListener('change', () => {
    resetParallax();
    sync();
    if (mediaReduced.matches) draw();
  });

  mediaMobile.addEventListener('change', () => {
    resize();
    if (!parallaxEnabled()) resetParallax();
    if (!shouldAnimate()) draw();
  });

  resize();
  draw();
  stage.setAttribute('data-3d', 'on');
  sync();
}
