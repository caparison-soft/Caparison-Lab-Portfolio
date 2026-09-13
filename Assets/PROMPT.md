# Prompt for the website project

Copy everything below the line into the other project's Claude, and attach
`caparison-logo-3d.zip` (or unzip it into the repo first).

---

I'm attaching `caparison-logo-3d.zip` — a 3D glass version of our Caparison
Soft logo, built in Blender and exported for the web. I want it placed in the
site. Read the README inside the zip first; it has the full spec. Summary:

**What's in it**
- `caparison_logo.glb` — the mesh, 948 KB, 26,246 triangles, one draw call, no
  textures. Already oriented to face the camera (+Z).
- `react/CaparisonLogo.jsx` — React Three Fiber component.
- `vanilla/caparison-logo.js` — framework-free ES module, same behaviour.
- `caparison_logo_crystal_transparent.png` — 2000×2000 transparent still, to
  use as the fallback and the first paint.
- `caparison_logo_crystal.png` — the same shot on off-white, for OG images and
  anywhere a static hero is better than WebGL.

**What to do**
1. Put `caparison_logo.glb` in the public/static folder so it resolves at
   `/caparison_logo.glb`.
2. Drop the component into the codebase — use whichever of the two files
   matches our stack, and delete the other.
3. Install `three@^0.169` (plus `@react-three/fiber` and `@react-three/drei` if
   we're on React). The version matters: `MeshPhysicalMaterial.dispersion` —
   which is what makes the rainbow edges — only exists in three r167 and up. On
   older versions the field is silently ignored and the logo renders as plain
   glass, no error.
4. Place it where we've agreed in the layout. The canvas fills its parent, so
   **the parent must have an explicit height** — this is the single most common
   way this breaks.

**Do not change the material or the environment map without telling me.** The
look is a matched pair: the black-with-two-bright-strips environment built on a
canvas inside the component, plus `dispersion: 5`. Flatten that environment to
an even grey and the rainbow disappears. It is tuned to match our Cycles render.

**The one real gotcha — seeing page content through the glass**

The canvas is transparent, so everything *around* the logo shows through
normally. But anything *behind* the logo is NOT refracted: `transmission`
samples only what three.js itself rendered, and our DOM is invisible to the
shader. Put a headline behind the canvas and the glass will show the
environment map, not the headline.

If we want page content to bend through the glass, it has to live inside the 3D
scene. Both files take a `backdrop` option for exactly this:

```js
backdrop: {
  color: '#F1F1EF',
  image: '/hero-bg.jpg',              // optional
  draw: (ctx, w, h) => { /* paint text, gradients, anything */ }
}
```

It's painted onto a plane sized to fill the frame, so it reads as the section
background and the glass refracts it properly. If you move something in there,
hide the DOM copy or the viewer sees it twice.

Rule: static hero content → move it into `backdrop`. Live, scrolling or
interactive content → leave it in the DOM and place it *beside* the logo rather
than behind it. Don't reach for html2canvas or any other DOM-to-texture capture;
it's slow and breaks on fonts, video and cross-origin images.

**Performance**
- Transmission costs a second render pass per frame. On low-end mobile, either
  fall back to the chrome variant (`transmission: 0, metalness: 1,
  roughness: 0.05`) or to the transparent PNG.
- Pixel ratio is already capped at 2, and the animation loop pauses off-screen.
- Auto-rotate is off when the OS asks for reduced motion; pointer response
  still works. Keep that.
- Render the PNG first and swap in the canvas once the GLB resolves, so there's
  no layout shift and no empty box if WebGL fails.

**Before you start**, tell me which section you're putting it in, what height
you're giving the parent, and whether anything needs to show through the glass —
if so, what, so we can decide between `backdrop` and placing it beside the logo.
