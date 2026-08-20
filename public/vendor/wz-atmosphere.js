/*
 * Air atmosphere — a focused, lifecycle-aware implementation of the supplied
 * WZRD sky shader. It deliberately owns one WebGL canvas only; the landing's
 * CSS remains the visual fallback when WebGL is unavailable. The canvas is
 * transparent so its cloud veil can reveal the canonical opening artwork.
 */
(() => {
  "use strict";

  if (customElements.get("wz-sky")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  const SKY_FRAGMENT = `
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform float uProgress;uniform float uRays;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}

float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}

float fbm(vec2 p){float s=0.0;float a=0.56;mat2 r=mat2(0.8,-0.6,0.6,0.8);
for(int i=0;i<5;i++){s+=a*noise(p);p=r*p*2.03+9.7;a*=0.52;}return s;}

float rayStrength(vec2 src,vec2 dir,vec2 coord,float seedA,float seedB,float speed){
vec2 toC=coord-src;float d=length(toC);vec2 dn=toC/max(d,1e-4);
float cosA=dot(dn,dir);
float distorted=cosA+0.04*sin(uTime*1.4+d*3.0);
float spread=pow(max(distorted,0.0),2.4);
float lenFall=clamp((1.7-d)/1.7,0.0,1.0);
float base=clamp((0.45+0.15*sin(distorted*seedA+uTime*speed))+(0.3+0.2*cos(-distorted*seedB+uTime*speed)),0.0,1.0);
return base*lenFall*spread;}

void main(){
vec2 uv=gl_FragCoord.xy/uRes;
float j=clamp(uProgress,0.0,1.0);
vec2 drift=vec2(-j*0.46-uTime*0.006,j*0.11+uTime*0.0018);

float horizon=smoothstep(0.02,0.96,uv.y);
vec3 sky=mix(vec3(0.72,0.86,0.95),vec3(0.26,0.61,0.86),horizon);

float fA=fbm(uv*vec2(2.1,3.2)+drift);
float fB=fbm(uv*vec2(4.8,2.3)-drift*0.65);
float cloud=smoothstep(0.42,0.78,fA*0.72+fB*0.38+uv.y*0.12);
float mist=smoothstep(0.18,0.92,fbm(uv*vec2(1.15,2.1)+drift*0.4));

vec3 cloudColor=mix(vec3(0.64,0.80,0.93),vec3(0.99,0.995,1.0),smoothstep(0.38,1.0,fB+uv.y*0.24));
sky=mix(sky,cloudColor,cloud*0.92);
sky+=mist*0.055*vec3(0.75,0.89,1.0);

vec2 sunP=vec2(0.18,0.84);
float sun=smoothstep(0.28,0.0,distance(uv,sunP));
sky+=sun*vec3(0.46,0.58,0.68)*(1.0-j*0.36);

vec2 asp=vec2(uRes.x/uRes.y,1.0);
vec2 rc=uv*asp;vec2 rs=sunP*asp;
vec2 rdir=normalize(vec2(0.42,-1.0));
float r1=rayStrength(rs,rdir,rc,36.2214,21.11349,1.1);
float r2=rayStrength(rs,rdir,rc,22.3991,18.0234,0.8);
float rays=(r1*0.5+r2*0.4)*uRays;
sky+=rays*vec3(0.96,0.99,1.0)*(0.62+0.38*cloud);

sky+=(hash(gl_FragCoord.xy+uTime)*2.0-1.0)*0.004;
sky*=0.96+0.04*smoothstep(0.0,0.45,uv.y);
float clear=smoothstep(0.0,1.0,j);
float cloudMass=clamp(0.38+cloud*0.70+mist*0.18,0.0,1.0);
// Start as a complete cloud cover, then let the procedural cloud structure
// dissolve away rather than fading an opaque sky rectangle over the poster.
float veil=mix(0.98,cloudMass*0.84,clear)*(1.0-clear);
float rayVeil=rays*0.34*(1.0-clear);
float alpha=clamp(max(veil,rayVeil),0.0,1.0);
gl_FragColor=vec4(sky*alpha,alpha);}`;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error || "Unable to compile shader");
    }
    return shader;
  }

  function makeProgram(gl) {
    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, SKY_FRAGMENT);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(error || "Unable to link shader program");
    }
    return program;
  }

  class WzSky extends HTMLElement {
    static get observedAttributes() {
      return ["mode", "rays", "time"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const styles = document.createElement("style");
      styles.textContent = ":host{position:absolute;inset:0;display:block;overflow:hidden;pointer-events:none}canvas{position:absolute;inset:0;display:block;width:100%;height:100%;background:transparent}";
      this.shadowRoot.appendChild(styles);
      this.canvas = document.createElement("canvas");
      this.shadowRoot.appendChild(this.canvas);

      this.dprCap = 1.25;
      this.frameInterval = 1000 / 30;
      this.progressValue = 0;
      this.clockValue = 12.5;
      this.frame = 0;
      this.visible = false;
      this.contextLost = false;
      this.dead = false;
      this.releaseTimer = 0;
      this.width = 1;
      this.height = 1;
      this.skyStatus = "idle";
      this.releasingContext = false;
    }

    get progress() {
      return this.progressValue;
    }

    set progress(value) {
      this.progressValue = Math.max(0, Math.min(1, Number(value) || 0));
      if (!this.frame) this.draw(this.clock);
    }

    get mode() {
      const mode = this.getAttribute("mode");
      return mode === "off" ? "off" : mode === "calm" ? "calm" : "full";
    }

    get rays() {
      const value = Number.parseFloat(this.getAttribute("rays") || "0.9");
      return Number.isFinite(value) ? Math.min(2, Math.max(0, value)) : 0.9;
    }

    get hasExternalClock() {
      return this.hasAttribute("time");
    }

    get time() {
      if (!this.hasExternalClock) return this.clockValue;
      const value = Number.parseFloat(this.getAttribute("time") || "0");
      return Number.isFinite(value) ? value : 0;
    }

    connectedCallback() {
      if (this.connected) return;
      this.upgradeProperty("progress");
      this.connected = true;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this);
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          this.visible = entries.some((entry) => entry.isIntersecting);
          if (this.visible && !reducedMotion.matches) {
            window.clearTimeout(this.releaseTimer);
            this.ensureContext();
          } else {
            this.scheduleRelease();
          }
          this.sync();
        },
        { rootMargin: "140px" },
      );
      this.intersectionObserver.observe(this);
      this.onVisibilityChange = () => this.sync();
      this.onMotionChange = () => {
        if (reducedMotion.matches) this.latchFallback("reduced-motion");
        this.sync();
      };
      document.addEventListener("visibilitychange", this.onVisibilityChange);
      reducedMotion.addEventListener("change", this.onMotionChange);
      this.resize();
      if (reducedMotion.matches) this.latchFallback("reduced-motion");
      else this.ensureContext();
      this.sync();
    }

    disconnectedCallback() {
      this.connected = false;
      this.stop();
      window.clearTimeout(this.releaseTimer);
      this.resizeObserver?.disconnect();
      this.intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
      reducedMotion.removeEventListener("change", this.onMotionChange);
    }

    attributeChangedCallback() {
      if (!this.connected) return;
      if (this.mode === "off") this.stop();
      else this.ensureContext();
      this.sync();
      this.draw(this.time);
    }

    // Property assignments made before a custom element upgrades become own
    // properties. Replaying the value through the prototype setter prevents a
    // pre-hydration scroll update from permanently shadowing `progress`.
    upgradeProperty(name) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) return;
      const value = this[name];
      delete this[name];
      this[name] = value;
    }

    get shouldRun() {
      return Boolean(
        this.gl &&
          this.visible &&
          !document.hidden &&
          !reducedMotion.matches &&
          !this.hasExternalClock &&
          this.mode !== "off" &&
          !this.dead,
      );
    }

    rebuildCanvas() {
      const nextCanvas = document.createElement("canvas");
      this.canvas.replaceWith(nextCanvas);
      this.canvas = nextCanvas;
      this.gl = null;
      this.program = null;
      this.uniforms = null;
      this.contextLost = false;
    }

    announceStatus(status, reason) {
      if (this.skyStatus === status && !reason) return;
      this.skyStatus = status;
      this.dispatchEvent(new CustomEvent("wz-sky-status", {
        bubbles: true,
        detail: { status, reason: reason || null },
      }));
    }

    latchFallback(reason) {
      if (this.dead && this.skyStatus === "fallback") return;
      this.dead = true;
      this.stop();
      this.canvas.style.display = "none";
      this.announceStatus("fallback", reason);
    }

    ensureContext() {
      if (this.dead || this.mode === "off" || (this.gl && !this.contextLost)) return;
      if (this.contextLost) this.rebuildCanvas();
      const gl = this.canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      }) || this.canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
      });
      if (!gl) {
        this.latchFallback("webgl-unavailable");
        return;
      }

      try {
        this.gl = gl;
        gl.clearColor(0, 0, 0, 0);
        this.program = makeProgram(gl);
        gl.useProgram(this.program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(this.program, "p");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        this.uniforms = {
          resolution: gl.getUniformLocation(this.program, "uRes"),
          time: gl.getUniformLocation(this.program, "uTime"),
          progress: gl.getUniformLocation(this.program, "uProgress"),
          rays: gl.getUniformLocation(this.program, "uRays"),
        };
        this.canvas.addEventListener("webglcontextlost", (event) => {
          this.stop();
          this.contextLost = true;
          this.gl = null;
          this.program = null;
          this.uniforms = null;
          if (this.releasingContext) {
            this.releasingContext = false;
            this.announceStatus("released", "offscreen-release");
            return;
          }
          this.latchFallback(event.statusMessage || "context-lost");
        }, { once: true });
        this.resize();
        this.announceStatus("ready");
      } catch (error) {
        this.latchFallback(error instanceof Error ? error.message.slice(0, 120) : "shader-init-failed");
      }
    }

    resize() {
      const rect = this.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
      this.width = Math.max(1, Math.round(rect.width * dpr));
      this.height = Math.max(1, Math.round(rect.height * dpr));
      if (this.canvas.width !== this.width) this.canvas.width = this.width;
      if (this.canvas.height !== this.height) this.canvas.height = this.height;
      if (this.gl) this.gl.viewport(0, 0, this.width, this.height);
      this.draw(this.time);
    }

    draw(time) {
      if (!this.gl || !this.program || !this.uniforms || this.mode === "off") return;
      const gl = this.gl;
      gl.useProgram(this.program);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(this.uniforms.resolution, this.width, this.height);
      gl.uniform1f(this.uniforms.time, time);
      gl.uniform1f(this.uniforms.progress, this.progressValue);
      gl.uniform1f(this.uniforms.rays, this.rays);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    start() {
      if (this.frame) return;
      this.lastFrame = performance.now();
      const animate = (timestamp) => {
        if (!this.shouldRun) {
          this.frame = 0;
          return;
        }
        const elapsed = timestamp - this.lastFrame;
        if (elapsed < this.frameInterval) {
          this.frame = requestAnimationFrame(animate);
          return;
        }
        const delta = Math.min(50, elapsed);
        this.lastFrame = timestamp;
        this.clockValue += (delta / 1000) * (this.mode === "calm" ? 0.32 : 1);
        this.draw(this.clockValue);
        this.frame = requestAnimationFrame(animate);
      };
      this.frame = requestAnimationFrame(animate);
    }

    stop() {
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = 0;
    }

    sync() {
      const visible = this.mode !== "off" && !this.dead;
      this.canvas.style.display = visible ? "block" : "none";
      if (this.shouldRun) this.start();
      else {
        this.stop();
        this.draw(this.time);
      }
    }

    scheduleRelease() {
      window.clearTimeout(this.releaseTimer);
      if (!this.gl) return;
      this.releaseTimer = window.setTimeout(() => {
        if (this.visible || !this.gl) return;
        const extension = this.gl.getExtension("WEBGL_lose_context");
        if (extension) {
          this.releasingContext = true;
          extension.loseContext();
        }
      }, 5000);
    }
  }

  customElements.define("wz-sky", WzSky);
})();
