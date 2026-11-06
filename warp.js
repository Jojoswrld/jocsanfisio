// Domain-warped noise background (fbm warped by fbm, after Inigo Quilez).
// Colours come from the CSS tokens. Pauses off screen, with the pause button,
// and draws one still frame under prefers-reduced-motion. Without WebGL the band stays solid navy.
(() => {
  const canvas = document.querySelector("canvas.warp");
  if (!canvas) return;
  const band = canvas.parentElement;
  const button = band.querySelector(".warp-toggle");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl) { canvas.remove(); button?.remove(); return; }

  // Resolve a CSS colour token (oklch included) to linear-free sRGB 0..1 via a 1x1 canvas.
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const css = getComputedStyle(document.documentElement);
  function token(name) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css.getPropertyValue(name).trim();
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  }

  const vert = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const frag = `
precision mediump float;
uniform vec2 r; uniform float t; uniform vec3 c0, c1, c2, c3;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1.,0.)), u.x), mix(h(i+vec2(0.,1.)), h(i+vec2(1.,1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a*n(p); p = m*p; a *= 0.5; } return v; }
void main(){
  vec2 p = gl_FragCoord.xy / r.y * 1.4;
  vec2 q = vec2(fbm(p + 0.05*t), fbm(p + vec2(5.2, 1.3) - 0.04*t));
  vec2 s = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2) + 0.03*t), fbm(p + 4.0*q + vec2(8.3, 2.8)));
  float f = fbm(p + 4.0*s);
  vec3 col = mix(c0, c1, clamp(f*f*2.2, 0.0, 1.0));
  col = mix(col, c2, clamp(length(q)*0.5, 0.0, 1.0) * 0.32);
  col = mix(col, c3, smoothstep(0.74, 0.95, s.x) * 0.16);
  gl_FragColor = vec4(col, 1.0);
}`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  const vs = shader(gl.VERTEX_SHADER, vert), fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); button?.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (k) => gl.getUniformLocation(prog, k);
  gl.uniform3fv(u("c0"), token("--color-ink"));
  gl.uniform3fv(u("c1"), token("--color-warp-1"));
  gl.uniform3fv(u("c2"), token("--color-warp-2"));
  gl.uniform3fv(u("c3"), token("--color-accent"));
  const uRes = u("r"), uTime = u("t");

  // Render at half resolution: the pattern is soft, and it keeps older phones cool.
  function resize() {
    const w = Math.max(1, Math.round(band.clientWidth / 2));
    const hgt = Math.max(1, Math.round(band.clientHeight / 2));
    if (canvas.width !== w || canvas.height !== hgt) {
      canvas.width = w; canvas.height = hgt;
      gl.viewport(0, 0, w, hgt);
      gl.uniform2f(uRes, w, hgt);
    }
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false, paused = false, raf = 0, clock = 20, last = 0;
  function draw() { resize(); gl.uniform1f(uTime, clock); gl.drawArrays(gl.TRIANGLES, 0, 6); }
  function frame(now) {
    if (last) clock += Math.min(now - last, 100) / 1000;
    last = now;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function update() {
    const run = visible && !paused && !reduce.matches && !document.hidden;
    if (run && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!run) draw();
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }).observe(band);
  document.addEventListener("visibilitychange", update);
  reduce.addEventListener("change", update);
  addEventListener("resize", () => { if (!raf) draw(); });

  if (button) {
    button.hidden = reduce.matches;
    reduce.addEventListener("change", () => { button.hidden = reduce.matches; });
    button.addEventListener("click", () => {
      paused = !paused;
      button.setAttribute("aria-pressed", String(paused));
      button.textContent = paused ? button.dataset.play : button.dataset.pause;
      update();
    });
  }
  draw();
})();
