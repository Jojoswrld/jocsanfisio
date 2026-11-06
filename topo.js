// Topographic contour lines drawn from warped FBM noise, one still frame per canvas.
// <canvas class="topo" data-seed="3" data-peak="0.82,0.55" data-peak-height="0.9"> inside a positioned section.
// Colours come from the CSS tokens. Nothing animates; it redraws only when the section changes size.
// Without WebGL the canvas is removed and the section keeps its plain paper.
(() => {
  const canvases = [...document.querySelectorAll("canvas.topo")];
  if (!canvases.length) return;

  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const css = getComputedStyle(document.documentElement);
  function token(name) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css.getPropertyValue(name).trim();
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  }
  const minor = token("--color-topo"), major = token("--color-topo-major");

  const vert = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const frag = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 r; uniform float seed, dpr, peakH; uniform vec2 peak; uniform vec3 cMinor, cMajor;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1.,0.)), u.x), mix(h(i+vec2(0.,1.)), h(i+vec2(1.,1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ v += a*n(p); p = m*p; a *= 0.45; } return v; }
float line(float k, float width){
  float d = abs(fract(k - 0.5) - 0.5) / fwidth(k);
  return 1.0 - clamp(d - width, 0.0, 1.0);
}
void main(){
  vec2 uv = gl_FragCoord.xy / (720.0 * dpr);          // fixed scale: same line density on every screen
  vec2 p = uv * 1.3 + seed * 7.3;
  float e = fbm(p + 0.9 * vec2(fbm(p * 0.7), fbm(p * 0.7 + 4.1)));
  vec2 pk = peak * r / (720.0 * dpr);
  float d = length(uv - pk);
  e += peakH * exp(-d * d * 9.0);                     // the cone of a volcano where data-peak asks for one
  float k = e * 14.0;
  float lMinor = line(k, 0.15 * dpr);
  float lMajor = line(k / 5.0, 0.6 * dpr);           // every fifth line is an index contour, a little heavier
  vec3 col = cMinor; float a = lMinor * 0.9;
  col = mix(col, cMajor, lMajor); a = max(a, lMajor);
  gl_FragColor = vec4(col * a, a);
}`;

  for (const canvas of canvases) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, preserveDrawingBuffer: true });
    if (!gl || !gl.getExtension("OES_standard_derivatives")) { canvas.remove(); continue; }
    const make = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = make(gl.VERTEX_SHADER, vert), fs = make(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) { canvas.remove(); continue; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (k) => gl.getUniformLocation(prog, k);
    const [px, py] = (canvas.dataset.peak || "0,0").split(",").map(Number);
    gl.uniform1f(u("seed"), Number(canvas.dataset.seed || 1));
    gl.uniform2f(u("peak"), px, 1 - py);               // data-peak is measured from the top
    gl.uniform1f(u("peakH"), canvas.dataset.peak ? Number(canvas.dataset.peakHeight || 0.9) : 0);
    gl.uniform3fv(u("cMinor"), minor);
    gl.uniform3fv(u("cMajor"), major);
    gl.clearColor(0, 0, 0, 0);

    const host = canvas.parentElement;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(host.clientWidth * dpr));
      const hgt = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== hgt) { canvas.width = w; canvas.height = hgt; }
      gl.viewport(0, 0, w, hgt);
      gl.uniform2f(u("r"), w, hgt);
      gl.uniform1f(u("dpr"), dpr);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    new ResizeObserver(draw).observe(host);
    draw();
  }
})();
