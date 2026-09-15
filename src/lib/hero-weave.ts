/**
 * The hero weave: a WebGL2 fragment shader drawing a field of threads,
 * domain-warped by fbm noise, drifting with time and scroll, with a gaussian
 * well under the pointer that pulls the threads in and lifts their light,
 * and one lime thread riding through. Our own GLSL, written for this site.
 *
 * One instance per page: the ground canvas owns the clock; the glass scene
 * draws the same canvas into its backdrop so the threads refract seamlessly.
 */

const VERT = `#version 300 es
in vec2 a;
out vec2 vUv;
void main() { vUv = a * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform float uTime, uAspect, uScroll, uIntensity, uPointerAmt, uThreads;
uniform vec2 uPointer;
uniform vec4 uBone, uLime;
uniform float uLift;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) { v += amp * vnoise(p); p *= 2.03; amp *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime * 0.055 + uScroll * 1.4;

  // Two-stage domain warp: the second field is warped by the first.
  float w1 = fbm(p * 1.55 + vec2(t, t * 0.55));
  float w2 = fbm(p * 2.60 + vec2(w1 * 0.7 - t * 0.75, t * 0.35));
  vec2 q = p + vec2(w1, w2) * 0.15;

  // The pointer: a gaussian well that pulls the warp in and lifts the light.
  vec2 toP = q - uPointer;
  float r2 = dot(toP, toP);
  float well = exp(-r2 * 11.0) * uPointerAmt;
  q -= toP * well * 0.55;

  // Threads: a triangular wave across the warped y, sharp core and soft body.
  float band = q.y * uThreads + w2 * 0.85;
  float edge = abs(fract(band) - 0.5) * 2.0;
  float lit = 1.0 - edge;
  float core = pow(lit, 30.0);
  float glow = pow(lit, 4.0);
  float idx = floor(band);
  float bright = 0.30 + 0.70 * hash21(vec2(idx, 7.0));
  float fieldA = (core * 0.95 + glow * 0.10) * bright * (1.0 + well * 2.2);

  // The lime thread: a slow path across the width, lying in the weave.
  float ride = 0.10 * sin(uv.x * 3.1 + 0.6) + 0.06 * sin(uv.x * 7.3 - 1.2) + w1 * 0.035 + 0.012 * sin(t * 0.9 + p.x * 1.4);
  float off = q.y - ride;
  float tCore = exp(-off * off * 34000.0);
  float tGlow = exp(-off * off * 1400.0);
  float threadA = tCore * 0.95 + tGlow * 0.09;

  // The room: vignette, a soft ceiling under the bar, a soft floor.
  float vig = smoothstep(1.25, 0.30, length(p * vec2(0.80, 1.30)));
  float floorFade = smoothstep(1.02, 0.62, uv.y);
  float ceilFade = smoothstep(0.0, 0.08, uv.y);
  float mask = vig * floorFade * ceilFade * uIntensity;

  float fa = clamp(fieldA, 0.0, 1.0) * uBone.w;
  float ta = clamp(threadA, 0.0, 1.0) * uLime.w;
  vec4 acc = vec4(uBone.rgb * fa, fa) + vec4(uLime.rgb * ta, ta);
  // A flat matte lift over the whole ground, unmasked, so the ink reads as charcoal.
  o = acc * mask + vec4(uBone.rgb * uLift, uLift); // premultiplied
}`;

export type Weave = {
  canvas: HTMLCanvasElement;
  resize(): void;
  /** Render one frame. time in seconds; pointer in CSS px relative to the canvas or null. */
  render(time: number, pointer: { x: number; y: number } | null, scroll: number, intensity: number): void;
  dispose(): void;
};

let shared: Weave | null = null;
export function getSharedWeave(): Weave | null { return shared; }

export function createWeave(canvas: HTMLCanvasElement, opts: { threads?: number; maxDpr?: number; lift?: number } = {}): Weave | null {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const U = { time: u("uTime"), aspect: u("uAspect"), scroll: u("uScroll"), intensity: u("uIntensity"), pAmt: u("uPointerAmt"), threads: u("uThreads"), pointer: u("uPointer"), bone: u("uBone"), lime: u("uLime"), lift: u("uLift") };
  gl.uniform1f(U.lift, opts.lift ?? 0.05);
  gl.uniform1f(U.threads, opts.threads ?? 40);
  // Brand tokens: bone and lime, with a per-colour weight.
  gl.uniform4f(U.bone, 0xec / 255, 0xee / 255, 0xe8 / 255, 0.38);
  gl.uniform4f(U.lime, 0xd6 / 255, 0xf6 / 255, 0x31 / 255, 0.8);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr ?? 2);
  let w = 1, h = 1;
  const ease = { x: 0, y: 0, amt: 0 };

  const weave: Weave = {
    canvas,
    resize() {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(U.aspect, w / h);
    },
    render(time, pointer, scroll, intensity) {
      if (pointer) {
        ease.x += (((pointer.x / w) - 0.5) * (w / h) - ease.x) * 0.1;
        ease.y += (((pointer.y / h) - 0.5) - ease.y) * 0.1;
        ease.amt += (1 - ease.amt) * 0.08;
      } else {
        ease.amt += (0 - ease.amt) * 0.05;
      }
      gl.uniform1f(U.time, time);
      gl.uniform1f(U.scroll, scroll);
      gl.uniform1f(U.intensity, intensity);
      gl.uniform2f(U.pointer, ease.x, ease.y);
      gl.uniform1f(U.pAmt, ease.amt);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      if (shared === weave) shared = null;
      // Release the context only once the canvas has left the document. React's
      // development double-mount disposes and re-creates on the same canvas, and
      // a context lost here would come back lost (blank hero in dev only).
      if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
  shared = weave;
  return weave;
}
