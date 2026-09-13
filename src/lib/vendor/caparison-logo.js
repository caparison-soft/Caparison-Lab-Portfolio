/**
 * Caparison Soft — 3D glass logo
 * Framework-free ES module. Works in any bundler or straight from a CDN.
 *
 *   import { mountCaparisonLogo } from './caparison-logo.js';
 *   const logo = mountCaparisonLogo(document.querySelector('#logo-canvas'), {
 *     src: '/caparison_logo.glb'
 *   });
 *   // later: logo.dispose();
 *
 * Requires three >= 0.167 (for `dispersion`):  npm i three
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DEFAULTS = {
  src: '/caparison_logo.glb',
  transparent: true,      // transparent canvas, so the page background shows through
  autoRotate: true,
  rotateSpeed: 0.0042,
  drag: true,             // drag to spin
  pointerParallax: true,  // logo leans toward the cursor
  scrollTilt: true,
  fit: 1.75,              // how much of the frame the logo fills
  offset: [0, 0],         // shift the logo in world units [x, y]; 0,0 = centred
  depthScale: 1,          // <1 flattens the mesh along its depth so it reads thinner side-on
  swing: null,            // radians: oscillate ±swing around Y instead of a full spin
  backdrop: null,         // what should be visible THROUGH the glass — see below
  exposure: 1.15,
  maxPixelRatio: 2,
  glass: {},              // any MeshPhysicalMaterial override
  darkCore: null          // colour of an opaque copy inside the glass, e.g. '#171B06'. Gives the
                          // transmission something dark to refract on a light page. null = off.
};

/** Studio softbox strips — same light rig as the Blender render.
 *  Mostly black with two bright bands: that is what makes the white
 *  streaks and the deep darks inside the glass. */
function studioStripEnv() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 1024, 512);
  const g = ctx.createLinearGradient(0, 512, 0, 0);
  [
    [0.00, '#000000'], [0.17, '#000000'], [0.225, '#ffffff'], [0.28, '#000000'],
    [0.45, '#000000'], [0.505, '#ffffff'], [0.56, '#000000'],
    [0.74, '#000000'], [0.79, '#b4b4b4'], [0.845, '#000000'], [1.00, '#000000']
  ].forEach(([p, col]) => g.addColorStop(p, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Anything that must show THROUGH the glass has to be rendered by three.js.
 * A DOM element sitting behind the canvas is NOT refracted — the transmission
 * shader only samples what three.js itself drew. So pass it here and it is
 * painted onto a plane behind the logo:
 *
 *   backdrop: {
 *     color: '#F1F1EF',                  // flat ground
 *     image: '/hero-bg.jpg',             // or an image (covers the plane)
 *     draw: (ctx, w, h) => { ... }       // or paint it yourself (text, gradient)
 *   }
 *
 * Whatever you put here should replace the DOM version behind the canvas,
 * otherwise the viewer sees it twice.
 */
function makeBackdrop(THREE, spec, onReady) {
  const c = document.createElement('canvas');
  // size: [w, h] lets the texture match the canvas aspect so painted text is not stretched.
  c.width = (spec.size && spec.size[0]) || 2048; c.height = (spec.size && spec.size[1]) || 1024;
  const ctx = c.getContext('2d');
  const paint = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = spec.color || '#F1F1EF';
    ctx.fillRect(0, 0, c.width, c.height);
    if (spec.draw) spec.draw(ctx, c.width, c.height);
  };
  paint();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.userData.repaint = () => { paint(); tex.needsUpdate = true; };

  if (spec.image) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const r = Math.max(c.width / img.width, c.height / img.height);
      const w = img.width * r, h = img.height * r;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      if (spec.draw) spec.draw(ctx, c.width, c.height);
      tex.needsUpdate = true;
      onReady && onReady();
    };
    img.src = spec.image;
  }
  return tex;
}

export function mountCaparisonLogo(canvas, userOpts = {}) {
  const opt = { ...DEFAULTS, ...userOpts };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: opt.transparent
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opt.maxPixelRatio));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opt.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 4.1);

  const env = studioStripEnv();
  scene.environment = env;
  if (!opt.transparent) {
    scene.background = env;
    scene.backgroundBlurriness = 1;
    scene.backgroundIntensity = 0.06;
  }

  // Dispersion glass — clear crystal with rainbow edges.
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 1,
    thickness: 0.55,
    ior: 1.52,
    dispersion: 5,                  // the rainbow edges — three r167+
    roughness: 0.015,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 1.3,
    side: THREE.FrontSide,
    ...opt.glass
  });

  let backdrop = null;
  if (opt.backdrop) {
    backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: makeBackdrop(THREE, opt.backdrop), toneMapped: false
      })
    );
    backdrop.position.z = opt.backdrop.z ?? -2;
    scene.add(backdrop);
  }
  function fitBackdrop() {
    if (!backdrop) return;
    const d = camera.position.z - backdrop.position.z;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    backdrop.scale.set(h * camera.aspect, h, 1);
  }

  const group = new THREE.Group();
  group.position.set(opt.offset[0] || 0, opt.offset[1] || 0, 0);
  scene.add(group);

  let disposed = false;
  new GLTFLoader().load(opt.src, (gltf) => {
    if (disposed) return;
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    gltf.scene.traverse(o => { if (o.isMesh) o.material = material; });
    gltf.scene.position.sub(center);
    gltf.scene.scale.setScalar(opt.fit / Math.max(size.x, size.y, size.z));
    if (opt.depthScale !== 1) gltf.scene.scale.z *= opt.depthScale;
    if (opt.darkCore) {
      const core = gltf.scene.clone(true);
      // Lit, not flat: the strip environment shades the core so the body has form.
      const coreMat = new THREE.MeshStandardMaterial({ color: opt.darkCore, metalness: 0.35, roughness: 0.45, envMapIntensity: 0.9 });
      core.traverse(o => { if (o.isMesh) o.material = coreMat; });
      core.scale.multiplyScalar(opt.darkCoreScale ?? 0.92);
      group.add(core);
    }
    group.add(gltf.scene);
    canvas.dispatchEvent(new CustomEvent('logo:ready'));
  });

  /* ---------- interaction ---------- */
  let targetY = 0, targetX = 0, curY = 0, curX = 0, spin = 0, scrollTilt = 0;
  let dragging = false, lastX = 0, lastY = 0;
  let autoRotate = opt.autoRotate && !reduceMotion;

  const pt = e => (e.touches ? e.touches[0] : e);
  const onDown = e => {
    if (!opt.drag) return;
    dragging = true; lastX = pt(e).clientX; lastY = pt(e).clientY;
  };
  const onUp = () => { dragging = false; };
  const onMove = e => {
    const p = pt(e);
    if (dragging) {
      targetY += (p.clientX - lastX) * 0.008;
      targetX = Math.max(-0.9, Math.min(0.9, targetX + (p.clientY - lastY) * 0.006));
      lastX = p.clientX; lastY = p.clientY;
    } else if (opt.pointerParallax) {
      const r = canvas.getBoundingClientRect();
      if (p.clientX < r.left || p.clientX > r.right || p.clientY < r.top || p.clientY > r.bottom) return;
      const nx = (p.clientX - r.left) / r.width - 0.5;
      const ny = (p.clientY - r.top) / r.height - 0.5;
      targetY = targetY * 0.92 + nx * 0.04;
      targetX = targetX * 0.92 + ny * 0.028;
    }
  };
  const onScroll = () => {
    if (!opt.scrollTilt) return;
    const r = canvas.getBoundingClientRect();
    scrollTilt = ((r.top + r.height / 2) / innerHeight - 0.5) * -0.45;
  };

  canvas.addEventListener('pointerdown', onDown);
  addEventListener('pointerup', onUp);
  addEventListener('pointermove', onMove);
  addEventListener('scroll', onScroll, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dpr = renderer.getPixelRatio();
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitBackdrop();
    }
  }

  let raf;
  (function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    resize();
    if (autoRotate) spin += opt.rotateSpeed;
    const spinY = opt.swing ? Math.sin(spin) * opt.swing : spin;
    curY += (targetY + spinY - curY) * 0.07;
    curX += (targetX + scrollTilt - curX) * 0.07;
    group.rotation.set(curX, curY, 0);
    renderer.render(scene, camera);
  })();

  return {
    setAutoRotate(v) { autoRotate = v; },
    /** Re-run the backdrop draw callback (after a resize, for example). */
    repaintBackdrop() { if (backdrop) backdrop.material.map.userData.repaint(); },
    material,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', onScroll);
      material.dispose();
      env.dispose();
      renderer.dispose();
    }
  };
}
