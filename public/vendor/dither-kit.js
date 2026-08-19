/* dither-kit — composable ordered-dither primitives for the Air design system.
   Ports the dither-kit API surface (from / direction / variant / bloom) to plain
   custom elements: no Tailwind, no bundler, no deps. One Bayer 8x8 engine feeds
   every element so washes, charts, avatars and display glyphs share a texture.

   <dk-gradient from="blue" direction="up" fade pixel="3" bloom="low">
   <dk-chart type="bar|area" values="4,3,6,78,9" variant="gradient|dotted|hatched|solid">
   <dk-avatar name="air" hue="0">
   <dk-glyph text="01" weight="700">
   <dk-video src="clip.mp4" contrast="1.2" fps="24">                            */
(() => {
  if (window.__ditherKit) return;
  window.__ditherKit = true;

  const BAYER = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ].map(v => (v + 0.5) / 64);
  const bayer = (x, y) => BAYER[((y & 7) << 3) + (x & 7)];

  /* Host box comes from a stylesheet, NOT from imperative element.style: these
     elements are mounted by React, which re-applies the authored style object on
     every re-render and silently wipes anything set imperatively. A wiped
     position:relative leaves the absolutely-positioned canvas resolving against
     a distant ancestor (and no ResizeObserver fires, because the host's own size
     never changed) — so the canvas balloons over the layout. A stylesheet rule
     is immune to that, and an instance-level inline position:absolute still wins
     over it, which is what the full-bleed washes rely on. */
  const sheet = document.createElement('style');
  sheet.textContent = 'dk-gradient,dk-chart,dk-avatar,dk-glyph,dk-video,dk-orb,dk-dust,dk-clouds,dk-bubble{display:block;position:relative;overflow:hidden;line-height:0}';
  (document.head || document.documentElement).appendChild(sheet);

  const RAMPS = {
    blue: ['#050810', '#0a2a58', '#0a84ff', '#8cc8ff', '#e8f4ff'],
    night: ['#05070a', '#061426', '#0b2748', '#164070', '#2f6fb8'],
    /* monotonically darkening — for dissolving one surface into the next */
    dissolve: ['#061426', '#050d1a', '#05070a', '#05070a', '#05070a'],
    cyan: ['#04080e', '#0c3a46', '#2fa3b8', '#6dc8d7', '#e4f8fc'],
    ink: ['#04060a', '#151a21', '#3f464f', '#9aa1a9', '#f1ebdd'],
    bone: ['#05070a', '#2a2620', '#6c6353', '#c5ba9e', '#f6f2e7'],
  };

  const hexRGB = h => {
    let s = String(h || '').replace('#', '').trim();
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16);
    return isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [140, 200, 255];
  };

  const rotateHue = (rgb, deg) => {
    if (!deg) return rgb;
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    h = (h + deg / 360) % 1;
    if (s === 0) return [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const hue = t => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
  };

  /* shared texture masks — same vocabulary across charts, washes and buttons */
  const TEXTURE = {
    dotted: (x, y) => (x & 1) === 0 && (y & 1) === 0,
    hatched: (x, y) => ((x + y) % 4) < 2,
    grid: (x, y) => (x % 3) !== 0 && (y % 3) !== 0,
  };
  const maskFor = v => TEXTURE[v] || null;

  const hash = (x, y) => {
    let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };

  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), e = hash(xi + 1, yi + 1);
    const ab = a + (b - a) * u, ce = c + (e - c) * u;
    return ab + (ce - ab) * v;
  };

  const fbm = (x, y, oct) => {
    let s = 0, amp = 0.5, fr = 1;
    for (let i = 0; i < oct; i++) { s += amp * vnoise(x * fr, y * fr); fr *= 2.03; amp *= 0.5; }
    return s;
  };

  class DKBase extends HTMLElement {
    connectedCallback() {
      if (!this._built) {
        this._built = true;
        this._glow = document.createElement('div');
        this._glow.setAttribute('aria-hidden', 'true');
        Object.assign(this._glow.style, { position: 'absolute', inset: '-14%', pointerEvents: 'none', opacity: '0' });
        this._cv = document.createElement('canvas');
        Object.assign(this._cv.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' });
        this.appendChild(this._glow);
        this.appendChild(this._cv);
        if (window.ResizeObserver) {
          this._ro = new ResizeObserver(() => this._schedule());
          this._ro.observe(this);
        }
      }
      this._schedule();
    }

    disconnectedCallback() { if (this._ro) this._ro.disconnect(); if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; }
    attributeChangedCallback() { if (this._built) this._schedule(); }

    _schedule() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => { this._raf = 0; try { this._render(); } catch (e) {} });
    }

    num(n, d) { const v = parseFloat(this.getAttribute(n)); return isFinite(v) ? v : d; }
    str(n, d) { const v = this.getAttribute(n); return (v === null || v === '') ? d : v; }

    _ramp() {
      const name = this.str('from', this.str('color', 'blue'));
      let stops = (RAMPS[name] || RAMPS.blue).map(hexRGB);
      const hue = this.num('hue', 0);
      if (hue) stops = stops.map(c => rotateHue(c, hue));
      if (this.hasAttribute('reverse')) stops = stops.slice().reverse();
      const fade = this.hasAttribute('fade');
      const n = stops.length - 1;
      return stops.map((c, i) => [c[0], c[1], c[2], fade ? Math.min(255, Math.round(255 * (i / n) * 1.7)) : 255]);
    }

    _grid() {
      const r = this.getBoundingClientRect();
      const cell = Math.max(1, this.num('pixel', 3));
      return { cell, w: Math.max(1, Math.round(r.width / cell)), h: Math.max(1, Math.round(r.height / cell)) };
    }

    _bloom() {
      const lvl = this.str('bloom', 'off');
      const a = lvl === 'aura' ? 0.42 : lvl === 'high' ? 0.26 : lvl === 'low' ? 0.14 : 0;
      if (!a) { this._glow.style.opacity = '0'; return; }
      const c = this.str('glow', '#8cc8ff');
      this._glow.style.background = 'radial-gradient(ellipse at 50% 58%, ' + c + ' 0%, transparent 66%)';
      this._glow.style.filter = 'blur(' + (lvl === 'aura' ? 40 : lvl === 'high' ? 26 : 16) + 'px)';
      this._glow.style.opacity = String(a);
    }

    /* value in 0..1 per cell, optional binary mask; returns the 2d context */
    _paint(w, h, valueAt, mask) {
      const ctx = this._cv.getContext('2d');
      if (!ctx) return null;
      this._cv.width = w;
      this._cv.height = h;
      const ramp = this._ramp();
      const top = ramp.length - 1;
      const smooth = this.hasAttribute('smooth');
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (mask && !mask(x, y)) { d[i + 3] = 0; continue; }
          let v = valueAt(x, y);
          v = v > 1 ? 1 : (v > 0 ? v : 0);
          const s = v * top, lo = Math.floor(s);
          if (smooth) {
            /* continuous ramp — for elements that must NOT carry the dither
               texture (anything living inside the phone mock) */
            const a = Math.min(top, Math.max(0, lo)), b = Math.min(top, a + 1), f = s - a;
            const c0 = ramp[a], c1 = ramp[b];
            d[i] = c0[0] + (c1[0] - c0[0]) * f;
            d[i + 1] = c0[1] + (c1[1] - c0[1]) * f;
            d[i + 2] = c0[2] + (c1[2] - c0[2]) * f;
            d[i + 3] = c0[3] + (c1[3] - c0[3]) * f;
            continue;
          }
          const idx = Math.min(top, lo + ((s - lo) > bayer(x, y) ? 1 : 0));
          const c = ramp[idx];
          d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = c[3];
        }
      }
      ctx.putImageData(img, 0, 0);
      this._bloom();
      return ctx;
    }
  }

  /* ---------- dithered background wash ---------- */
  class DKGradient extends DKBase {
    static get observedAttributes() { return ['from', 'color', 'direction', 'pixel', 'bloom', 'gamma', 'fade', 'reverse', 'hue', 'glow', 'variant']; }
    _render() {
      const g = this._grid();
      const dir = this.str('direction', 'up');
      const gamma = this.num('gamma', 1);
      const mx = g.w - 1 || 1, my = g.h - 1 || 1;
      this._paint(g.w, g.h, (x, y) => {
        const nx = x / mx, ny = y / my;
        let v;
        if (dir === 'down') v = 1 - ny;
        else if (dir === 'left') v = nx;
        else if (dir === 'right') v = 1 - nx;
        else if (dir === 'radial') v = 1 - Math.min(1, Math.hypot(nx - 0.5, ny - 0.5) * 2);
        else v = ny;
        return gamma === 1 ? v : Math.pow(v, gamma);
      }, maskFor(this.str('variant', 'gradient')));
    }
  }

  /* ---------- dithered bar / area chart ---------- */
  class DKChart extends DKBase {
    static get observedAttributes() { return ['values', 'type', 'variant', 'from', 'color', 'pixel', 'bloom', 'gap', 'edge', 'hue', 'max']; }
    _render() {
      const g = this._grid();
      const vals = String(this.getAttribute('values') || '').split(',').map(parseFloat).filter(v => isFinite(v));
      if (!vals.length) return;
      const n = vals.length;
      const max = this.num('max', 0) || Math.max.apply(null, vals) || 1;
      const norm = i => Math.max(0.02, vals[i] / max);
      const type = this.str('type', 'bar');
      const variant = this.str('variant', 'gradient');
      const colW = g.w / n;
      const gap = Math.max(0, this.num('gap', 1));
      const floor = g.h - 1;
      const colOf = x => Math.min(n - 1, Math.floor(x / colW));
      const topAt = x => {
        if (type === 'area') {
          const t = (x / (g.w - 1 || 1)) * (n - 1);
          const i0 = Math.floor(t), i1 = Math.min(n - 1, i0 + 1);
          const hv = norm(i0) + (norm(i1) - norm(i0)) * (t - i0);
          return Math.round((1 - hv) * (floor - 1));
        }
        return Math.round((1 - norm(colOf(x))) * (floor - 1));
      };
      const inShape = (x, y) => {
        if (type !== 'area') {
          const local = x - colOf(x) * colW;
          if (local < gap / 2 || local > colW - gap / 2) return false;
        }
        return y >= topAt(x) && y < floor;
      };
      const tex = maskFor(variant);
      const texture = (x, y) => !tex || tex(x, y);
      const ctx = this._paint(
        g.w, g.h,
        (x, y) => variant === 'solid' ? 0.92 : 0.22 + 0.78 * (1 - y / (floor || 1)),
        (x, y) => inShape(x, y) && texture(x, y)
      );
      if (!ctx) return;
      ctx.fillStyle = this.str('edge', '#8cc8ff');
      for (let x = 0; x < g.w; x++) {
        const t = topAt(x);
        if (type !== 'area') {
          const local = x - colOf(x) * colW;
          if (local < gap / 2 || local > colW - gap / 2) continue;
        }
        if (t < floor) ctx.fillRect(x, t, 1, 1);
      }
      ctx.fillStyle = 'rgba(140,200,255,0.34)';
      ctx.fillRect(0, floor, g.w, 1);
    }
  }

  /* ---------- generative mirrored pixel avatar ---------- */
  class DKAvatar extends DKBase {
    static get observedAttributes() { return ['name', 'hue', 'from', 'color', 'bloom', 'cells']; }
    _render() {
      const name = this.str('name', 'air');
      let h = 2166136261;
      for (let i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
      const rnd = k => { let v = Math.imul(h ^ Math.imul(k + 1, 2654435761), 2246822519); v ^= v >>> 13; return ((v >>> 0) % 1000) / 1000; };
      const cells = Math.max(3, Math.round(this.num('cells', 5)));
      const half = Math.ceil(cells / 2);
      const sub = 3;
      const w = cells * sub, hh = cells * sub;
      const on = [];
      for (let cy = 0; cy < cells; cy++) {
        for (let cx = 0; cx < half; cx++) on[cy * half + cx] = rnd(cy * half + cx) > 0.44;
      }
      const at = (cx, cy) => on[cy * half + (cx < half ? cx : cells - 1 - cx)];
      this._paint(w, hh, (x, y) => 0.32 + 0.68 * (1 - y / (hh - 1)), (x, y) => at(Math.floor(x / sub), Math.floor(y / sub)));
    }
  }

  /* ---------- dithered display glyph ---------- */
  class DKGlyph extends DKBase {
    static get observedAttributes() { return ['text', 'pixel', 'from', 'color', 'bloom', 'weight', 'hue', 'gamma']; }
    connectedCallback() {
      super.connectedCallback();
      if (!this._fontHooked && document.fonts && document.fonts.ready) {
        this._fontHooked = true;
        document.fonts.ready.then(() => this._schedule());
      }
    }
    _render() {
      const g = this._grid();
      const text = this.str('text', '01');
      const off = document.createElement('canvas');
      off.width = g.w; off.height = g.h;
      const c = off.getContext('2d');
      if (!c) return;
      const weight = this.str('weight', '700');
      const font = px => weight + ' ' + px + 'px "Azeret Mono", ui-monospace, monospace';
      let size = g.h;
      c.font = font(size);
      const wide = c.measureText(text).width;
      if (wide > g.w && wide > 0) { size = Math.max(4, Math.floor(size * (g.w / wide))); c.font = font(size); }
      const m = c.measureText(text);
      const asc = m.actualBoundingBoxAscent || size * 0.72;
      const desc = m.actualBoundingBoxDescent || 0;
      c.textAlign = 'left';
      c.textBaseline = 'alphabetic';
      c.fillStyle = '#fff';
      c.fillText(text, 0, Math.round((g.h + (asc - desc)) / 2));
      const data = c.getImageData(0, 0, g.w, g.h).data;
      const gamma = this.num('gamma', 1);
      this._paint(
        g.w, g.h,
        (x, y) => { const v = 0.26 + 0.74 * (1 - y / (g.h - 1 || 1)); return gamma === 1 ? v : Math.pow(v, gamma); },
        (x, y) => data[(y * g.w + x) * 4 + 3] > 90
      );
    }
  }

  /* ---------- live dithered video ---------- */
  class DKVideo extends DKBase {
    static get observedAttributes() { return ['src', 'pixel', 'from', 'color', 'bloom', 'fps', 'paused', 'contrast', 'lift', 'hue']; }
    connectedCallback() {
      super.connectedCallback();
      if (!this._vid) {
        const v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.style.display = 'none';
        v.src = this.str('src', '');
        v.addEventListener('loadeddata', () => this._schedule());
        this._vid = v;
        this.appendChild(v);
      }
      this._kick();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._loopRaf) cancelAnimationFrame(this._loopRaf);
      this._loopRaf = 0;
      if (this._vid) this._vid.pause();
    }
    _kick() {
      const paused = this.getAttribute('paused') === '1';
      if (!this._vid) return;
      if (paused) {
        this._vid.pause();
        if (this._loopRaf) { cancelAnimationFrame(this._loopRaf); this._loopRaf = 0; }
        this._schedule();
        return;
      }
      const p = this._vid.play();
      if (p && p.catch) p.catch(() => {});
      if (!this._loopRaf) this._tick();
    }
    attributeChangedCallback(name) {
      if (!this._built) return;
      if (name === 'src' && this._vid) this._vid.src = this.str('src', '');
      if (name === 'paused') this._kick();
      this._schedule();
    }
    _tick() {
      const step = () => {
        this._loopRaf = requestAnimationFrame(step);
        const fps = Math.max(4, this.num('fps', 24));
        const now = performance.now();
        if (this._last && now - this._last < 1000 / fps) return;
        this._last = now;
        this._render();
      };
      this._loopRaf = requestAnimationFrame(step);
    }
    _render() {
      const g = this._grid();
      const v = this._vid;
      if (!v || v.readyState < 2 || !v.videoWidth) {
        this._paint(g.w, g.h, (x, y) => 0.18 + 0.3 * (1 - y / (g.h - 1 || 1)), null);
        return;
      }
      if (!this._scratch) this._scratch = document.createElement('canvas');
      const s = this._scratch;
      s.width = g.w; s.height = g.h;
      const sc = s.getContext('2d', { willReadFrequently: true });
      if (!sc) return;
      const vr = v.videoWidth / v.videoHeight, hr = g.w / g.h;
      let sw, sh, sx, sy;
      if (vr > hr) { sh = v.videoHeight; sw = sh * hr; sx = (v.videoWidth - sw) / 2; sy = 0; }
      else { sw = v.videoWidth; sh = sw / hr; sx = 0; sy = (v.videoHeight - sh) / 2; }
      sc.drawImage(v, sx, sy, sw, sh, 0, 0, g.w, g.h);
      const d = sc.getImageData(0, 0, g.w, g.h).data;
      /* auto-levels on a 32-bin histogram (2% / 98% cuts, so a stray black or
         white pixel cannot compress the frame into the middle of the ramp),
         smoothed between frames so the dither does not crawl */
      const n = g.w * g.h;
      if (!this._lum || this._lum.length !== n) this._lum = new Float32Array(n);
      const lum = this._lum;
      const hist = new Int32Array(32);
      for (let p = 0, i = 0; p < n; p++, i += 4) {
        const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        lum[p] = l;
        hist[(l * 31) | 0]++;
      }
      const cut = n * 0.02;
      let acc = 0, loB = 0, hiB = 31;
      for (let i = 0; i < 32; i++) { acc += hist[i]; if (acc > cut) { loB = i; break; } }
      acc = 0;
      for (let i = 31; i >= 0; i--) { acc += hist[i]; if (acc > cut) { hiB = i; break; } }
      let lo = loB / 31, hi = (hiB + 1) / 31;
      if (hi - lo < 0.12) hi = lo + 0.12;
      this._lo = this._lo === undefined ? lo : this._lo + (lo - this._lo) * 0.2;
      this._hi = this._hi === undefined ? hi : this._hi + (hi - this._hi) * 0.2;
      const span = Math.max(0.05, this._hi - this._lo);
      const contrast = this.num('contrast', 1.15);
      const lift = this.num('lift', 0);
      this._paint(g.w, g.h, (x, y) => {
        const l = (lum[y * g.w + x] - this._lo) / span;
        return (l - 0.5) * contrast + 0.5 + lift;
      }, null);
    }
  }

  /* ---------- thinking orb (state machine, in the kit's own material) ----------
     Ports the thinking-orbs idea (state="listening" | "solving" | "done") onto
     the Bayer engine. Add `smooth` where the dither must not appear. */
  class DKOrb extends DKBase {
    static get observedAttributes() { return ['state', 'from', 'color', 'pixel', 'bloom', 'hue', 'speed', 'smooth', 'glow']; }
    connectedCallback() {
      super.connectedCallback();
      this._t0 = performance.now();
      this._spin();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._orbRaf) cancelAnimationFrame(this._orbRaf);
      this._orbRaf = 0;
    }
    _spin() {
      if (this._orbRaf) return;
      const step = () => {
        this._orbRaf = requestAnimationFrame(step);
        const now = performance.now();
        if (this._prev && now - this._prev < 1000 / 30) return;
        this._prev = now;
        try { this._render(); } catch (e) {}
      };
      this._orbRaf = requestAnimationFrame(step);
    }
    _render() {
      const g = this._grid();
      const t = ((performance.now() - (this._t0 || 0)) / 1000) * this.num('speed', 1);
      const state = this.str('state', 'listening');
      const cx = (g.w - 1) / 2, cy = (g.h - 1) / 2;
      const R = Math.max(1, Math.min(cx, cy));
      this._paint(g.w, g.h, (x, y) => {
        const dx = (x - cx) / R, dy = (y - cy) / R;
        const r = Math.hypot(dx, dy);
        if (r > 1) return 0;
        const z = Math.sqrt(Math.max(0, 1 - r * r));
        let v = 0.22 + 0.78 * Math.max(0, -dx * 0.45 - dy * 0.55 + z * 0.68);
        if (state === 'listening') {
          v += 0.26 * Math.sin(r * 6.5 - t * 2.1) * (1 - r * 0.55);
        } else if (state === 'solving') {
          const a = Math.atan2(dy, dx);
          v += 0.32 * Math.sin(a * 3 + t * 5.2 - r * 4.5) * (0.35 + 0.65 * r);
          v += 0.16 * Math.sin(r * 12 - t * 7.5);
        } else if (state === 'done') {
          v += 0.08 * Math.sin(t * 0.9);
        }
        return v * (1 - 0.55 * Math.pow(r, 7));
      }, (x, y) => {
        const dx = (x - cx) / R, dy = (y - cy) / R;
        return dx * dx + dy * dy <= 1;
      });
    }
  }

  /* ---------- particle reveal ----------
     A veil of drifting grains over live DOM. The pointer clears it, so the
     content underneath resolves crisply instead of being re-rendered. */
  class DKDust extends DKBase {
    static get observedAttributes() { return ['from', 'color', 'pixel', 'radius', 'softness', 'density', 'drift', 'grain', 'fade', 'bloom']; }
    connectedCallback() {
      super.connectedCallback();
      this._t0 = performance.now();
      this._px = -1e5; this._py = -1e5;
      this._tx = -1e5; this._ty = -1e5;
      this._on = 0; this._onTarget = 0;
      const host = this.parentElement;
      this._host = host;
      this._fine = window.matchMedia('(hover: hover) and (pointer: fine)');
      this._move = e => {
        const r = this.getBoundingClientRect();
        this._tx = e.clientX - r.left;
        this._ty = e.clientY - r.top;
        if (this._onTarget === 0) { this._px = this._tx; this._py = this._ty; }
        this._onTarget = 1;
      };
      this._leave = () => { this._onTarget = 0; };
      if (host && this._fine.matches) {
        host.addEventListener('pointermove', this._move, { passive: true });
        host.addEventListener('pointerleave', this._leave, { passive: true });
      }
      this._drift();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._dustRaf) cancelAnimationFrame(this._dustRaf);
      this._dustRaf = 0;
      if (this._host) {
        this._host.removeEventListener('pointermove', this._move);
        this._host.removeEventListener('pointerleave', this._leave);
      }
    }
    _drift() {
      if (this._dustRaf) return;
      const step = () => {
        this._dustRaf = requestAnimationFrame(step);
        const now = performance.now();
        if (this._prev && now - this._prev < 1000 / 24) return;
        this._prev = now;
        this._px += (this._tx - this._px) * 0.18;
        this._py += (this._ty - this._py) * 0.18;
        this._on += (this._onTarget - this._on) * 0.12;
        try { this._render(); } catch (e) {}
      };
      this._dustRaf = requestAnimationFrame(step);
    }
    _render() {
      const g = this._grid();
      const cell = g.cell;
      const t = (performance.now() - (this._t0 || 0)) / 1000;
      const drift = this.num('drift', 1);
      const dens = Math.min(1, Math.max(0, this.num('density', 0.5)));
      /* `grain`, not `fade`: DKBase._ramp() already claims `fade` as a boolean
         flag that alpha-grades the ramp, so reusing it here would fire two
         unrelated behaviours off one attribute. */
      const grain = Math.min(1, Math.max(0, this.num('grain', 0.7)));
      const radius = Math.max(1, this.num('radius', 240)) / cell;
      const soft = Math.min(1, Math.max(0.02, this.num('softness', 0.75)));
      const inner = radius * (1 - soft);
      const px = this._px / cell, py = this._py / cell;
      const on = this._on;
      const frame = Math.floor(t * (1 + drift * 5));
      this._paint(g.w, g.h, (x, y) => {
        const wob = 0.5 + 0.5 * Math.sin((x * 0.09 + y * 0.07) + t * drift * 0.8);
        return 0.3 + 0.7 * wob * grain;
      }, (x, y) => {
        const d = Math.hypot(x - px, y - py);
        const e = on * (1 - Math.min(1, Math.max(0, (d - inner) / Math.max(1e-3, radius - inner))));
        const revealed = 1 - e;
        /* dissolve the cloud into its own edges, or the box reads as a rectangle
           of grain rather than an aura */
        const fx = Math.min(1, Math.min(x, g.w - 1 - x) / Math.max(1, g.w * 0.24));
        const fy = Math.min(1, Math.min(y, g.h - 1 - y) / Math.max(1, g.h * 0.24));
        const t0 = Math.min(fx, fy);
        const feather = t0 * t0 * (3 - 2 * t0);
        return hash(x + frame * 7, y - frame * 3) < dens * feather * revealed * revealed;
      });
    }
  }

  /* ---------- drifting cloud field ----------
     A full-section atmosphere rather than a box of noise: FBM coverage on a
     coarse grid, dithered through the same ramp, with a decaying wind buffer so
     the cursor parts the clouds along its path. */
  class DKClouds extends DKBase {
    static get observedAttributes() { return ['from', 'color', 'pixel', 'scale', 'speed', 'cover', 'density', 'wind', 'wind-radius', 'bloom', 'paused', 'fade', 'glow']; }
    connectedCallback() {
      super.connectedCallback();
      this._ct = Math.random() * 40;
      this._cpx = -1e5; this._cpy = -1e5;
      this._vis = true;
      const host = this.parentElement;
      this._chost = host;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
      this._cmv = e => { const r = this.getBoundingClientRect(); this._cpx = e.clientX - r.left; this._cpy = e.clientY - r.top; };
      this._clv = () => { this._cpx = -1e5; this._cpy = -1e5; };
      if (host && fine.matches) {
        host.addEventListener('pointermove', this._cmv, { passive: true });
        host.addEventListener('pointerleave', this._clv, { passive: true });
      }
      if (window.IntersectionObserver) {
        this._cio = new IntersectionObserver(es => { this._vis = es[es.length - 1].isIntersecting; });
        this._cio.observe(this);
      }
      this._blow();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._cRaf) cancelAnimationFrame(this._cRaf);
      this._cRaf = 0;
      if (this._cio) this._cio.disconnect();
      if (this._chost) {
        this._chost.removeEventListener('pointermove', this._cmv);
        this._chost.removeEventListener('pointerleave', this._clv);
      }
    }
    _blow() {
      if (this._cRaf) return;
      const step = () => {
        this._cRaf = requestAnimationFrame(step);
        const now = performance.now();
        if (this._cLast && now - this._cLast < 1000 / 20) return;
        const dt = this._cLast ? Math.min(0.12, (now - this._cLast) / 1000) : 0.05;
        this._cLast = now;
        if (!this._vis) return;
        const frozen = this.getAttribute('paused') === '1';
        if (!frozen) this._ct += dt * this.num('speed', 0.6) * 0.06;
        try { this._render(dt, frozen); } catch (e) {}
      };
      this._cRaf = requestAnimationFrame(step);
    }
    _render(dt, frozen) {
      const r = this.getBoundingClientRect();
      const want = Math.max(2, this.num('pixel', 6));
      /* keep the field under a fixed cell budget so a full-bleed hero costs the
         same as a small panel */
      let cell = want;
      const budget = 26000;
      if ((r.width / cell) * (r.height / cell) > budget) {
        cell = Math.sqrt((r.width * r.height) / budget);
      }
      const w = Math.max(1, Math.round(r.width / cell));
      const h = Math.max(1, Math.round(r.height / cell));
      if (!this._wind || this._wind.length !== w * h) { this._wind = new Float32Array(w * h); this._ww = w; }
      const wind = this._wind;
      const decay = Math.pow(0.5, dt / 0.8);
      const wr = Math.max(1, this.num('wind-radius', 320)) / cell;
      const px = this._cpx / cell, py = this._cpy / cell;
      const live = !frozen && this._cpx > -1e4;
      for (let i = 0; i < wind.length; i++) wind[i] *= decay;
      if (live) {
        const x0 = Math.max(0, Math.floor(px - wr)), x1 = Math.min(w - 1, Math.ceil(px + wr));
        const y0 = Math.max(0, Math.floor(py - wr)), y1 = Math.min(h - 1, Math.ceil(py + wr));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const d2 = ((x - px) * (x - px) + (y - py) * (y - py)) / (wr * wr);
          const s = Math.exp(-d2 * 3) * 0.5;
          const i = y * w + x;
          wind[i] = Math.min(1, wind[i] + s);
        }
      }
      const scale = Math.max(0.05, this.num('scale', 1.1));
      const cover = this.num('cover', 0.12);
      const dens = this.num('density', 2.4);
      const windAmt = Math.min(1, Math.max(0, this.num('wind', 0.7)));
      const t = this._ct;
      const asp = r.width / Math.max(1, r.height);
      this._paint(w, h, (x, y) => {
        const nx = (x / w) * asp * scale, ny = (y / h) * scale;
        const q = fbm(nx * 1.6 + t * 0.35, ny * 1.6 - t * 0.12, 4);
        const f = fbm(nx * 3.1 - q + t * 0.2, ny * 3.1 + q, 3);
        let cov = cover + dens * (q * 0.9 + f * 0.55 - 0.52);
        cov -= wind[y * w + x] * windAmt;
        return cov;
      }, null);
    }
  }

  /* ---------- droplet that rides the cursor ----------
     The Bubble idea rendered in this page's material: a metaball trail resolved
     through the Bayer ramp, repainted only inside its own bounding box. */
  class DKBubble extends DKBase {
    static get observedAttributes() { return ['from', 'color', 'pixel', 'size', 'trail', 'bloom', 'fade', 'glow']; }
    connectedCallback() {
      super.connectedCallback();
      this._tx = -1e5; this._ty = -1e5;
      this._hx = -1e5; this._hy = -1e5;
      this._pts = []; this._on = 0; this._onT = 0; this._dirty = null;
      const host = this.parentElement;
      this._bhost = host;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
      this._bmv = e => {
        const r = this.getBoundingClientRect();
        this._tx = e.clientX - r.left; this._ty = e.clientY - r.top;
        if (this._onT === 0) { this._hx = this._tx; this._hy = this._ty; this._pts = []; }
        this._onT = 1;
      };
      this._blv = () => { this._onT = 0; };
      if (host && fine.matches) {
        host.addEventListener('pointermove', this._bmv, { passive: true });
        host.addEventListener('pointerleave', this._blv, { passive: true });
      }
      this._float();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._bRaf) cancelAnimationFrame(this._bRaf);
      this._bRaf = 0;
      if (this._bhost) {
        this._bhost.removeEventListener('pointermove', this._bmv);
        this._bhost.removeEventListener('pointerleave', this._blv);
      }
    }
    _float() {
      if (this._bRaf) return;
      const step = () => {
        this._bRaf = requestAnimationFrame(step);
        const now = performance.now();
        if (this._bLast && now - this._bLast < 1000 / 30) return;
        this._bLast = now;
        this._hx += (this._tx - this._hx) * 0.34;
        this._hy += (this._ty - this._hy) * 0.34;
        this._on += (this._onT - this._on) * 0.1;
        if (this._onT === 1 || this._on > 0.02) {
          this._pts.unshift([this._hx, this._hy]);
          const n = Math.max(2, Math.round(this.num('trail', 12)));
          if (this._pts.length > n) this._pts.length = n;
        }
        try { this._render(); } catch (e) {}
      };
      this._bRaf = requestAnimationFrame(step);
    }
    _render() {
      const cell = Math.max(1, this.num('pixel', 3));
      const r = this.getBoundingClientRect();
      const W = Math.max(1, Math.round(r.width / cell));
      const H = Math.max(1, Math.round(r.height / cell));
      const cv = this._cv, ctx = cv.getContext('2d');
      if (!ctx) return;
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; this._dirty = null; }
      if (this._dirty) { ctx.clearRect(this._dirty[0], this._dirty[1], this._dirty[2], this._dirty[3]); this._dirty = null; }
      if (this._on < 0.02 || !this._pts.length) { this._bloom(); return; }
      const R = Math.max(3, this.num('size', 32)) * this._on / cell;
      const pts = this._pts.map(p => [p[0] / cell, p[1] / cell]);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      const pad = R * 1.9 + 3;
      const bx = Math.max(0, Math.floor(x0 - pad)), by = Math.max(0, Math.floor(y0 - pad));
      const bw = Math.min(W - bx, Math.ceil(x1 - x0 + pad * 2));
      const bh = Math.min(H - by, Math.ceil(y1 - y0 + pad * 2));
      if (bw <= 0 || bh <= 0) { this._bloom(); return; }
      const ramp = this._ramp(), top = ramp.length - 1;
      const img = ctx.createImageData(bw, bh), d = img.data;
      const n = pts.length;
      for (let yy = 0; yy < bh; yy++) {
        for (let xx = 0; xx < bw; xx++) {
          const gx = bx + xx, gy = by + yy;
          let f = 0;
          for (let i = 0; i < n; i++) {
            const ri = R * (1 - i / (n * 1.3));
            const dx = gx - pts[i][0], dy = gy - pts[i][1];
            f += (ri * ri) / (dx * dx + dy * dy + 0.75);
          }
          if (f < 1) continue;
          const hgt = Math.min(1, (f - 1) * 0.35);
          const nz = Math.sqrt(hgt);
          const dxl = gx - pts[0][0], dyl = gy - pts[0][1];
          const dl = Math.max(1e-3, Math.hypot(dxl, dyl));
          const lit = Math.max(0, (-dxl / dl) * 0.4 + (-dyl / dl) * 0.5);
          let v = (0.18 + 0.62 * nz + 0.34 * lit * (1 - nz)) * this._on;
          v = v > 1 ? 1 : (v > 0 ? v : 0);
          const s = v * top, lo = Math.floor(s);
          const idx = Math.min(top, lo + ((s - lo) > bayer(gx, gy) ? 1 : 0));
          const c = ramp[idx];
          const o = (yy * bw + xx) * 4;
          d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = c[3];
        }
      }
      ctx.putImageData(img, bx, by);
      this._dirty = [bx, by, bw, bh];
      this._bloom();
    }
  }

  customElements.define('dk-gradient', DKGradient);
  customElements.define('dk-clouds', DKClouds);
  customElements.define('dk-bubble', DKBubble);
  customElements.define('dk-orb', DKOrb);
  customElements.define('dk-dust', DKDust);
  customElements.define('dk-video', DKVideo);
  customElements.define('dk-chart', DKChart);
  customElements.define('dk-avatar', DKAvatar);
  customElements.define('dk-glyph', DKGlyph);
})();
