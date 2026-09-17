"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import styles from "./LandingCloudShader.module.css";

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.55;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p = mat2(0.80, -0.60, 0.60, 0.80) * p * 2.02;
    amplitude *= 0.48;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
  uv.y = 1.0 - uv.y;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 cloudUv = vec2((uv.x - 0.5) * aspect, uv.y);
  float drift = u_time * 0.018;
  float broad = fbm(cloudUv * vec2(2.1, 3.2) + vec2(drift, 2.3));
  float detail = fbm(cloudUv * vec2(4.4, 6.0) - vec2(drift * 0.6, 1.1));
  float horizon = smoothstep(0.72, 0.16, uv.y);
  float cloud = smoothstep(0.43, 0.72, broad * 0.76 + detail * 0.34 + horizon * 0.46);
  cloud *= smoothstep(0.98, 0.18, uv.y);
  vec3 shadow = vec3(0.56, 0.70, 0.81);
  vec3 pearl = vec3(0.98, 0.995, 1.0);
  vec3 color = mix(shadow, pearl, smoothstep(0.38, 0.88, broad + detail * 0.18));
  float edge = smoothstep(0.1, 0.86, cloud) * (0.34 + broad * 0.52);
  outColor = vec4(color, edge * 0.58);
}
`;

function makeShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LandingCloudShader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forcedColors = window.matchMedia("(forced-colors: active)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced || forcedColors || connection?.saveData) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vertex = makeShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = makeShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    gl.useProgram(program);

    let frame = 0;
    let running = true;
    let visible = true;
    let lastPaint = 0;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const frameInterval = mobile ? 1000 / 24 : 1000 / 30;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const renderScale = mobile ? 0.52 : 0.68;
      const width = Math.max(1, Math.round(rect.width * renderScale));
      const height = Math.max(1, Math.round(rect.height * renderScale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = (now: number) => {
      if (!running) return;
      if (visible && !document.hidden && now - lastPaint >= frameInterval) {
        lastPaint = now;
        resize();
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform1f(time, now / 1000);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        canvas.dataset.ready = "true";
      }
      frame = window.requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" });
    observer.observe(root);
    frame = window.requestAnimationFrame(render);
    return () => {
      running = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <Image className={styles.fallback} src="/images/landing-clouds-v2.webp" alt="" fill priority sizes="100vw" />
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className={styles.veil} />
    </div>
  );
}
