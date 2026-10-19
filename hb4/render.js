(function (root) {
  'use strict';
  const TW = 64, TH = 32, ZH = 16, DV = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const R = {
    sky: ['#5BA4E6', '#6FB5EE', '#8CC6F4', '#A9D6F8', '#C8E6FB', '#E4F3FD'],
    grass: ['#2C6B1E', '#3B8528', '#4C9C32', '#5FB23E', '#7BC853', '#9BDC6E'],
    sand: ['#B88A4A', '#CFA05A', '#E0B66F', '#EDCB8A', '#F5DDA6'],
    snow: ['#9DB4CF', '#BFD2E6', '#DCE8F3', '#F0F6FB', '#FFFFFF'],
    stone: ['#3C3F48', '#5A5F6B', '#7C8290', '#A0A6B2', '#C4C9D2', '#E3E6EB'],
    wood: ['#3E2616', '#5C3A20', '#7E5230', '#A06B3D', '#C08A55'],
    red: ['#5A0E0E', '#8E1B16', '#C22A22', '#E04A3C', '#F27A66'],
    blue: ['#0F2A5E', '#1B4A9A', '#2F6FD6', '#5B95EA', '#93BDF5'],
    green: ['#0F4A2A', '#1B7440', '#2E9E5B', '#5CC283', '#96DDAE'],
    orange: ['#7A3A08', '#B5560F', '#E07A1F', '#F5A04A', '#FFC585'],
    yellow: ['#8A6A00', '#C99A1E', '#F2C12E', '#FFD84F', '#FFEC9A'],
    pine: ['#10331F', '#1A4D2E', '#256B3C', '#378A4D'],
    water: ['#1F5FA8', '#2F7BC8', '#4A97DD', '#7DBBEE', '#B5DBF7'],
    skin: ['#C98E64', '#E0AA80', '#F0C49A', '#FADBB8'],
    pink: ['#C25A78', '#FF8FA3', '#FFC1CF'], purple: ['#5B3392', '#8B5CC4', '#B58CF0'], cyan: ['#2F8FB5', '#4CC3F0', '#9BE0FA'], lime: ['#6E9A20', '#9BCB3C', '#C5E67A'],
    base: ['#0B0F18', '#1B2030', '#FFFFFF', '#2B2B2B']
  };
  R.cgrass = ['#4D5F23', '#6B7C2C', '#8A9A36', '#A9B94B', '#C6D06A', '#DDE48C'];
  const R0 = { grass: R.grass };
  const PAL = [].concat(...Object.values(R));
  const PRGB = PAL.map(h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; });
  let LUT = null;
  function lut() {
    if (LUT) return LUT; LUT = new Uint8Array(32768);
    for (let k = 0; k < 32768; k++) {
      const r = ((k >> 10) & 31) * 8 + 4, g = ((k >> 5) & 31) * 8 + 4, b = (k & 31) * 8 + 4; let best = 0, bd = 1e9;
      for (let p = 0; p < PRGB.length; p++) { const c = PRGB[p], d = (r - c[0]) * (r - c[0]) * .9 + (g - c[1]) * (g - c[1]) * 1.4 + (b - c[2]) * (b - c[2]) * .7; if (d < bd) { bd = d; best = p; } }
      LUT[k] = best;
    } return LUT;
  }
  function quantize(ctx, w, h, x0, y0) {
    x0 = x0 || 0; y0 = y0 || 0;
    const T = lut(), im = ctx.getImageData(x0, y0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) { d[i + 3] = 0; continue; } const p = PRGB[T[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]]; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255; }
    ctx.putImageData(im, x0, y0);
  }
  function layout(N, ZMAX) { const gw = N * TW + 48, gh = N * TH + ZMAX * ZH + 96; return { N, ZMAX, gw, gh, W: gw, H: gh, OX: N * TW / 2 + 24, OY: ZMAX * ZH + 60 }; }
  const proj = L => (x, y, z) => [Math.round(L.OX + (x - y) * TW / 2), Math.round(L.OY + (x + y) * TH / 2 - z * ZH)];
  function hsh(a, b, c) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  const MK = (w, h) => (root.HBR_MK || ((ww, hh) => { const e = document.createElement('canvas'); e.width = ww; e.height = hh; return e; }))(w, h);

  // ---------- Grundformen ----------
  function pl(c, x0, y0, x1, y1, col, th) {
    c.fillStyle = col; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); th = th || 1;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, shallow = dx >= -dy; let err = dx + dy, g = 0;
    for (;;) { if (shallow) c.fillRect(x0, y0, 1, th); else c.fillRect(x0, y0, th, 1); if ((x0 === x1 && y0 === y1) || g++ > 600) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  }
  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const disc = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  const poly = (c, pts, fill, stroke) => { c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); } };
  function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (f >= 1) { r += (255 - r) * (f - 1); g += (255 - g) * (f - 1); b += (255 - b) * (f - 1); } else { r *= f; g *= f; b *= f; } return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')'; }
  function box(c, P, x0, y0, z0, dx, dy, dz, col, out) {
    const f = (pts, cc) => poly(c, pts, cc, out);
    f([P(x0, y0 + dy, z0 + dz), P(x0 + dx, y0 + dy, z0 + dz), P(x0 + dx, y0 + dy, z0), P(x0, y0 + dy, z0)], shade(col, .86));
    f([P(x0 + dx, y0, z0 + dz), P(x0 + dx, y0 + dy, z0 + dz), P(x0 + dx, y0 + dy, z0), P(x0 + dx, y0, z0)], shade(col, .64));
    f([P(x0, y0, z0 + dz), P(x0 + dx, y0, z0 + dz), P(x0 + dx, y0 + dy, z0 + dz), P(x0, y0 + dy, z0 + dz)], shade(col, 1.14));
  }
  function obox(c, P, cx, cy, cz, f, lf, lr, lu, col, out, op) {
    const hl = Math.hypot(f[0], f[1]); let r = hl > 1e-3 ? [-f[1] / hl, f[0] / hl, 0] : [1, 0, 0]; if (op) r = op.r;
    const fl = Math.hypot(f[0], f[1], f[2]); const F = [f[0] / fl, f[1] / fl, f[2] / fl];
    const U = op ? [-op.up[0], -op.up[1], -op.up[2]] : [r[1] * F[2] - r[2] * F[1], r[2] * F[0] - r[0] * F[2], r[0] * F[1] - r[1] * F[0]];
    const pt = (a, b, d) => P(cx + F[0] * a * lf + r[0] * b * lr + U[0] * d * lu, cy + F[1] * a * lf + r[1] * b * lr + U[1] * d * lu, cz + F[2] * a * lf + r[2] * b * lr + U[2] * d * lu);
    const faces = [[[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]], [[1, 0, 0], [[1, -1, 1], [1, 1, 1], [1, 1, -1], [1, -1, -1]]], [[-1, 0, 0], [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]]], [[0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]], [[0, -1, 0], [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1]]]];
    const V = [1, 1, 1.2];
    faces.forEach(fc => { const n = fc[0]; const nw = [F[0] * n[0] + r[0] * n[1] + U[0] * n[2], F[1] * n[0] + r[1] * n[1] + U[1] * n[2], F[2] * n[0] + r[2] * n[1] + U[2] * n[2]]; if (nw[0] * V[0] + nw[1] * V[1] + nw[2] * V[2] <= 0) return; const lam = Math.max(0, -.45 * nw[0] + .55 * nw[1] + .75 * nw[2]); poly(c, fc[1].map(q => pt(q[0], q[1], q[2])), shade(col, .62 + .55 * lam), out); });
  }
  function dither(c, pts, col) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    c.save(); c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.clip(); c.fillStyle = col;
    for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0) + (y & 1); x <= x1; x += 2) c.fillRect(x, y, 1, 1);
    c.restore();
  }

  // ---------- Strecke ----------
  // Korkenzieher-Form: lat = seitlicher Radius, up = Höhe der Drehung, hill = zusätzlicher Bogen nach oben,
  // spine = Mittelrohr, shade = Schienen-Unterseite dunkel, sup = Stützen nur am aufrechten Teil
  // r = Abstand Schiene–Drehachse in Kacheln (klein = Heartline Roll, groß = Korkenzieher), hill = Bogen nach oben (Ebenen);
  // Höhe zählt in Ebenen, 1 Kachel = CKZ Ebenen, damit die Bahn ein echter Kreis um die Achse ist
  // LK: Blicktiefe je Höhe im Looping (Kamera von schräg oben: höher = näher)
  let LK = 1;
  const CKZ = 2, CK = { r: .2, hill: 0, ease: 'glatt', spine: true, shade: true, sup: true }; // H1 Heartline Roll (Jan, 2026-10-13)
  function setCK(o) { Object.assign(CK, o); }
  const LDEL = .35, LDR = 1.0, smt = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const LOOP = (function () {
    const N = 72, A = .35, g = [], w = []; let tot = 0;
    for (let k = 0; k < 1200; k++) { const sg = (k + .5) / 1200, v = A + (1 - A) * (1 - Math.cos(2 * Math.PI * sg)) / 2; g.push(v); tot += v; }
    let phi = 0, x = 0, z = 0; const raw = [[0, 0, 0]], at = [0];
    for (let k = 0; k < 1200; k++) { const dp = g[k] / tot * 2 * Math.PI, pm = phi + dp / 2; x += Math.cos(pm) / 1200; z += Math.sin(pm) / 1200; phi += dp; raw.push([x, z, phi]); }
    const xt = raw[1200][0]; let zm = 0; raw.forEach(r => { zm = Math.max(zm, r[1]); });
    const ZS = 2.4 / (zm / xt), out = [];
    for (let k = 0; k <= N; k++) { const r = raw[Math.round(k / N * 1200)]; out.push([r[0] / xt, r[1] / xt * ZS, r[2], r[1] / zm]); }
    return out;
  })();
  function pieceSamples(p) {
    const c = [p.i + .5, p.j + .5], di = DV[p.din], dof = DV[p.dout], E = [c[0] - di[0] * .5, c[1] - di[1] * .5], out = [];
    if (p.din !== p.dout) {
      const C0 = [E[0] + dof[0] * .5, E[1] + dof[1] * .5], a0 = Math.atan2(-dof[1], -dof[0]), a1 = Math.atan2(di[1], di[0]);
      let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      for (let k = 0; k <= 14; k++) { const a = a0 + d * k / 14; out.push([C0[0] + Math.cos(a) * .5, C0[1] + Math.sin(a) * .5, p.z0 + (p.z1 - p.z0) * k / 14]); }
    } else {
      const n = p.type === 'L' ? 72 : p.type === 'C' ? 24 : 10, perp = [-di[1], di[0]];
      // Korkenzieher über zwei Felder: Drehung um die Längsachse (rot 0..2π), Mitte kreist mit Radius CKR um die Achse
      if (p.type === 'C') { for (let k = 0; k <= n; k++) { const t = ((p.half || 0) + k / n) / 2, e = CK.ease === 'alt' ? t - Math.sin(2 * Math.PI * t) / (2 * Math.PI) : t * t * t * (t * (6 * t - 15) + 10), th = 2 * Math.PI * e, lat = CK.r * Math.sin(th), up = CKZ * CK.r * (1 - Math.cos(th)) + CK.hill * Math.sin(Math.PI * t); out.push([E[0] + di[0] * k / n + perp[0] * lat, E[1] + di[1] * k / n + perp[1] * lat, p.z0 + up, th, perp]); } return out; }
      for (let k = 0; k <= n; k++) {
        if (p.type === 'L') { const Lq = LOOP[k]; const lt = LDEL * smt(k / n); out.push([E[0] + di[0] * Lq[0] + di[1] * lt, E[1] + di[1] * Lq[0] + di[0] * lt, p.z0 + Lq[1], Lq[2], Lq[3], k / n]); continue; }
        const t = k / n; let along = t, up = 0, lat = 0;
        if (p.type === 'L') { const th = 2 * Math.PI * t; along = (th + 2.6 * Math.sin(th)) / (2 * Math.PI); up = 1.0 * (1 - Math.cos(th)); lat = .6 * Math.sin(th) * (1 - Math.cos(th)) / 2; }
        out.push([E[0] + di[0] * along + perp[0] * lat, E[1] + di[1] * along + perp[1] * lat, p.z0 + (p.z1 - p.z0) * t + up]);
      }
    }
    return out;
  }
  function buildPath(run, ride) {
    const S = [], nT = run.track.length;
    const addPiece = (p, pi, skipFirst, brk) => { const sm = pieceSamples(p); sm.forEach((q, k) => { if (k === 0 && skipFirst) return; const e = { x: q[0], y: q[1], z: q[2], pi, ty: p.type }; if (p.type === 'L') { e.phi = q[3]; e.lh = q[4]; e.ls = q[5]; e.ev = DV[p.din]; } if (p.type === 'C') { e.rot = q[3]; e.cp = q[4]; } if (k === 0 && brk) e.brk = true; S.push(e); }); };
    run.track.forEach((p, pi) => addPiece(p, pi, pi > 0, false));
    const stationMid = Math.floor(pieceSamples(run.track[0]).length / 2);
    (run.ret || []).forEach((p, k) => {
      let skip = true, brk = false;
      if (k === 0) { const sm = pieceSamples(p), l = S[S.length - 1]; const d = Math.hypot(sm[0][0] - l.x, sm[0][1] - l.y) + Math.abs(sm[0][2] - l.z); skip = d < .05; brk = !skip && !ride; }
      addPiece(p, nT + k, skip, brk);
    });
    if (ride) { const sm = pieceSamples(run.track[0]); for (let k = 1; k <= stationMid; k++) S.push({ x: sm[k][0], y: sm[k][1], z: sm[k][2], pi: 0, ty: 'S' }); }
    {
      const ox = S.map(e => e.x), oy = S.map(e => e.y); let res = null, acc = 0;
      for (let k = 0; k < S.length; k++) {
        const e = S[k];
        if (e.brk) res = null; else if (k > 0) acc += Math.hypot(ox[k] - ox[k - 1], oy[k] - oy[k - 1]);
        let dxk = 0, dyk = 0;
        if (res) { const f = 1 - smt(acc / LDR); dxk = res[0] * f; dyk = res[1] * f; e.x += dxk; e.y += dyk; if (acc >= LDR) res = null; }
        const nx = S[k + 1];
        if (e.ty === 'L' && e.ev && (!nx || nx.ty !== 'L' || nx.pi !== e.pi)) { res = [e.ev[1] * LDEL + dxk, e.ev[0] * LDEL + dyk]; acc = 0; }
      }
    }
    const D = [0]; for (let k = 1; k < S.length; k++) { const a = S[k - 1], b = S[k]; D.push(D[k - 1] + (b.brk ? 0 : Math.hypot(b.x - a.x, b.y - a.y, .6 * (b.z - a.z)))); }
    const loopish = e => e.ty === 'L' || e.ty === 'C', Rr = .62, z0 = S.map(e => e.z);
    for (let k = 0; k < S.length; k++) {
      if (loopish(S[k])) continue; let sw = 0, sz = 0;
      for (let j = k; j >= 0; j--) { const d = D[k] - D[j]; if (d > Rr) break; if (loopish(S[j])) break; const w = 1 - d / Rr; sw += w; sz += w * z0[j]; if (S[j].brk) break; }
      for (let j = k + 1; j < S.length; j++) { if (S[j].brk) break; const d = D[j] - D[k]; if (d > Rr) break; if (loopish(S[j])) break; const w = 1 - d / Rr; sw += w; sz += w * z0[j]; }
      S[k].z = sz / sw;
    }
    for (let k = 1; k < S.length; k++) { const a = S[k - 1], b = S[k]; D[k] = D[k - 1] + (b.brk ? 0 : Math.hypot(b.x - a.x, b.y - a.y, .6 * (b.z - a.z))); }
    let nextSup = .25; for (let k = 0; k < S.length; k++) if (D[k] >= nextSup) { S[k].sup = true; nextSup = D[k] + .5; }
    return { S, D, startS: D[stationMid], endS: D[S.length - 1] };
  }
  function posAt(path, s) {
    const { S, D } = path, last = S.length - 1; let lo = 0, f = 0;
    if (s <= 0) { lo = 0; } else if (s >= D[last]) { lo = last - 1; f = 1; } else { let hi = last; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (D[m] <= s) lo = m; else hi = m; } f = (s - D[lo]) / ((D[lo + 1] - D[lo]) || 1); }
    const a = S[lo], b = S[lo + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f, pi: a.pi, ty: a.ty, k: lo, phi: a.phi === undefined ? undefined : a.phi + (b.phi - a.phi) * f, lh: a.lh === undefined ? undefined : a.lh + (b.lh - a.lh) * f, rot: a.rot === undefined ? undefined : a.rot + ((b.rot === undefined ? a.rot : b.rot) - a.rot) * f, cp: a.cp, ev: a.ev, dx: b.x - a.x, dy: b.y - a.y, dz: b.z - a.z };
  }

  function makeDecor(seed, N, theme, reserved) {
    const rngf = root.HB.mulberry32(root.HB.hash('d' + seed)), out = {};
    const kinds = { meadow: ['oak', 'oak', 'pine', 'bush', 'bush', 'flower', 'bench', 'lamp', 'birch', 'bin'], desert: ['cactus', 'cactus', 'rock', 'rock', 'dry', 'palm', 'dune'], winter: ['spine', 'spine', 'spine', 'mound', 'mound', 'snowman', 'lamp', 'rock'] }[theme];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if (reserved.has(i + ',' + j)) continue; if (rngf() < .34) out[i + ',' + j] = kinds[Math.floor(rngf() * kinds.length)]; }
    return out;
  }

  // ---------- Hintergrund ----------
  function makeBgArea(w, h, hz, theme) {
    const cv = MK(w, h), c = cv.getContext('2d');
    const skies = { meadow: [R.sky[0], R.sky[1], R.sky[2], R.sky[3], R.sky[4]], desert: ['#E7A55B', '#F2BB72', '#F7CF8E', '#FBE0AB', '#FDEEC9'], winter: ['#7F9FC4', '#9DB6D3', '#BCCEE2', '#D6E2EE', '#EAF1F8'] }[theme];
    const bandH = hz / skies.length;
    skies.forEach((col, k) => { rect(c, 0, Math.floor(k * bandH), w, Math.ceil(bandH) + 1, col); if (k) { const by = Math.round(k * bandH); for (let y = by - 3; y < by + 3; y++) for (let x = (y & 1); x < w; x += 2) rect(c, x, y, 1, 1, skies[k - 1]); } });
    rect(c, 0, Math.round(hz), w, h - Math.round(hz), skies[skies.length - 1]);
    const hill = (base, amp, f, ph, col, col2) => { for (let x = 0; x < w; x++) { const y = Math.round(base - amp * (.5 + .5 * Math.sin(x * f + ph)) - amp * .35 * Math.sin(x * f * 2.3 + ph * 2)); rect(c, x, y, 1, h - y, col); rect(c, x, y, 1, 1, col2); } };
    if (theme === 'meadow') { hill(hz + 24, 40, .014, 1, R.sky[2], R.sky[3]); hill(hz + 40, 30, .019, 3, R.pine[2], R.pine[3]); hill(hz + 58, 20, .026, 5, R.grass[1], R.grass[2]); hill(hz + 100, 12, .04, 2, R.grass[2], R.grass[3]); }
    else if (theme === 'desert') { hill(hz + 24, 44, .013, 2, '#D9955A', '#E8AC6E'); hill(hz + 42, 30, .019, 4, R.sand[1], R.sand[2]); hill(hz + 60, 18, .03, 1, R.sand[2], R.sand[3]); hill(hz + 100, 12, .04, 2, R.sand[3], R.sand[4]); }
    else { hill(hz + 22, 48, .013, 1, R.snow[1], R.snow[2]); hill(hz + 40, 32, .019, 3, R.pine[1], R.pine[2]); hill(hz + 58, 20, .027, 5, R.snow[2], R.snow[3]); hill(hz + 100, 12, .04, 2, R.snow[3], R.snow[4]); }
    disc(c, w * .82, Math.max(34, hz * .24), 15, theme === 'winter' ? '#F4F0E0' : '#FFE9A0'); disc(c, w * .82, Math.max(34, hz * .24), 11, theme === 'winter' ? '#FFFFFF' : '#FFF5CC');
    quantize(c, w, h);
    return cv;
  }
  function cloud(c, x, y, snow) {
    [[8, 6, 44, 9], [3, 11, 58, 9], [14, 1, 24, 9], [30, 4, 26, 8]].forEach(r => rect(c, x + r[0], y + r[1], r[2], r[3], R.sky[5]));
    rect(c, x + 12, y + 5, 20, 3, '#FFFFFF'); rect(c, x + 34, y + 7, 12, 2, '#FFFFFF'); rect(c, x + 5, y + 17, 52, 3, snow ? R.snow[1] : R.sky[4]);
  }

  // ---------- Boden ----------
  function makeGround(L, theme, seed, reserved, pond, pathTiles) {
    const cv = MK(L.W, L.H), c = cv.getContext('2d'); const P = proj(L), N = L.N;
    const ramp = theme === 'meadow' ? R.grass : theme === 'desert' ? R.sand : R.snow;
    const cA = theme === 'meadow' ? [R.grass[2], R.grass[3]] : theme === 'desert' ? [R.sand[2], R.sand[3]] : [R.snow[3], R.snow[2]];
    const edgeL = theme === 'meadow' ? R.wood[3] : theme === 'desert' ? '#C98A4B' : R.stone[3], edgeR = theme === 'meadow' ? R.wood[1] : theme === 'desert' ? '#9C6A38' : R.stone[1];
    poly(c, [P(0, N, 0), P(N, N, 0), P(N, 0, 0), P(N, 0, -1.9), P(N / 2 + 1, N / 2 + 1, -3.4), P(0, N, -1.9)], edgeR);
    const isP = (i, j) => (pathTiles || []).some(q => q[0] === i && q[1] === j), isW = (i, j) => (pond || []).some(q => q[0] === i && q[1] === j);
    for (let s = 0; s <= 2 * N - 2; s++) for (let i = 0; i < N; i++) {
      const j = s - i; if (j < 0 || j >= N) continue; const a = P(i, j, 0), top = [P(i, j, 0), P(i + 1, j, 0), P(i + 1, j + 1, 0), P(i, j + 1, 0)];
      if (isW(i, j)) {
        poly(c, top, (i + j) % 2 ? R.water[2] : R.water[1]);
        for (let k = 0; k < 7; k++) { const rx = hsh(i, j, k + 3) * .8 + .1, ry = hsh(i, j, k + 33) * .8 + .1; const p = P(i + rx, j + ry, 0); rect(c, p[0] - 2, p[1], 5, 1, R.water[3]); }
        for (let k = 0; k < 2; k++) { const p = P(i + .25 + hsh(i, j, k + 90) * .5, j + .25 + hsh(i, j, k + 91) * .5, 0); disc(c, p[0], p[1], 3, R.green[1]); rect(c, p[0] - 1, p[1] - 1, 3, 1, R.green[3]); rect(c, p[0] + 1, p[1] - 2, 2, 1, R.pink[1]); }
      } else if (isP(i, j)) {
        poly(c, top, (i + j) % 2 ? R.stone[4] : R.stone[3]);
        for (let k = 1; k < 4; k++) { const q0 = P(i + k * .25, j, 0), q1 = P(i + k * .25, j + 1, 0), r0 = P(i, j + k * .25, 0), r1 = P(i + 1, j + k * .25, 0); pl(c, q0[0], q0[1], q1[0], q1[1], R.stone[2], 1); pl(c, r0[0], r0[1], r1[0], r1[1], R.stone[2], 1); }
        for (let k = 0; k < 8; k++) { const p = P(i + hsh(i, j, k + 50), j + hsh(i, j, k + 60), 0); rect(c, p[0], p[1], 2, 1, hsh(i, j, k + 70) > .5 ? R.stone[5] : R.stone[3]); }
      } else {
        poly(c, top, (i + j) % 2 ? cA[0] : cA[1]);
        for (let k = 0; k < 16; k++) { const rx = hsh(i, j, k), ry = hsh(i, j, k + 17); const px = a[0] + Math.round((rx - ry) * TW / 2), py = a[1] + Math.round((rx + ry) * TH / 2); const lt = hsh(i, j, k + 40); rect(c, px, py, 1, 1, lt > .66 ? ramp[ramp.length - 2] : lt > .33 ? ramp[1] : ramp[ramp.length - 1]);
          if (theme === 'meadow' && k < 5 && hsh(i, j, k + 7) > .45) { rect(c, px, py - 1, 1, 2, R.grass[1]); rect(c, px + 1, py - 2, 1, 2, R.grass[1]); rect(c, px - 1, py - 2, 1, 2, R.grass[4]); } }
      }
      if (i === N - 1) { poly(c, [P(i + 1, j, 0), P(i + 1, j + 1, 0), P(i + 1, j + 1, -1.9), P(i + 1, j, -1.9)], edgeR); for (let z = 1; z < 4; z++) { const e0 = P(i + 1, j, -z * .5), e1 = P(i + 1, j + 1, -z * .5); pl(c, e0[0], e0[1], e1[0], e1[1], theme === 'meadow' ? R.wood[0] : R.stone[1], 1); } for (let k = 0; k < 4; k++) { const p = P(i + 1, j + hsh(i, j, k + 200), -hsh(i, j, k + 210) * 1.6); rect(c, p[0], p[1], 2, 1, R.wood[2]); } }
      if (j === N - 1) { poly(c, [P(i, j + 1, 0), P(i + 1, j + 1, 0), P(i + 1, j + 1, -1.9), P(i, j + 1, -1.9)], edgeL); for (let z = 1; z < 4; z++) { const e0 = P(i, j + 1, -z * .5), e1 = P(i + 1, j + 1, -z * .5); pl(c, e0[0], e0[1], e1[0], e1[1], theme === 'meadow' ? R.wood[2] : R.stone[2], 1); } for (let k = 0; k < 4; k++) { const p = P(i + hsh(i, j, k + 220), j + 1, -hsh(i, j, k + 230) * 1.6); rect(c, p[0], p[1], 2, 1, R.wood[4]); } }
    }
    (pond || []).forEach(q => { const i = q[0], j = q[1], has = (a, b) => isW(a, b);
      const edge = (x0, y0, x1, y1) => { const p0 = P(x0, y0, 0), p1 = P(x1, y1, 0); pl(c, p0[0], p0[1], p1[0], p1[1], R.stone[4], 1); pl(c, p0[0], p0[1] + 1, p1[0], p1[1] + 1, R.stone[1], 2); };
      if (!has(i, j - 1)) edge(i, j, i + 1, j); if (!has(i + 1, j)) edge(i + 1, j, i + 1, j + 1); if (!has(i, j + 1)) edge(i, j + 1, i + 1, j + 1); if (!has(i - 1, j)) edge(i, j, i, j + 1); });
    const fence = (x0, y0, x1, y1) => { const n = 12; for (let k = 0; k <= n; k++) { const t = k / n, p0 = P(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0), p1 = P(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, .5); pl(c, p0[0], p0[1], p1[0], p1[1], R.wood[3], 2); rect(c, p1[0] - 1, p1[1] - 1, 4, 1, R.wood[4]); }
      [.16, .34].forEach(h => { const q0 = P(x0, y0, h), q1 = P(x1, y1, h); pl(c, q0[0], q0[1], q1[0], q1[1], R.wood[2], 2); pl(c, q0[0], q0[1] - 1, q1[0], q1[1] - 1, R.wood[4], 1); }); };
    fence(N - .06, 0.1, N - .06, N - .1); fence(0.1, N - .06, N - .1, N - .06);
    quantize(c, L.W, L.H);
    return cv;
  }

  // ---------- Dekor ----------
  function drawDecor(c, P, i, j, kind, t) {
    const p = P(i + .5, j + .5, 0), x = p[0], y = p[1];
    const sh = w => { c.fillStyle = 'rgba(20,50,20,.24)'; c.beginPath(); c.ellipse(x + 4, y + 1, w, w * .42, 0, 0, 7); c.fill(); };
    const blobs = (arr, ox, oy) => arr.forEach(b => disc(c, x + ox + b[0], y + oy + b[1], b[2], b[3]));
    if (kind === 'oak') {
      sh(17); rect(c, x - 3, y - 15, 6, 15, R.wood[1]); rect(c, x - 1, y - 15, 2, 15, R.wood[2]); rect(c, x - 5, y - 2, 4, 2, R.wood[1]); rect(c, x + 2, y - 2, 4, 2, R.wood[1]);
      blobs([[0, -26, 14, R.grass[0]], [-9, -20, 10, R.grass[0]], [9, -20, 10, R.grass[0]], [0, -30, 11, R.grass[0]], [0, -27, 12, R.grass[1]], [-8, -21, 8, R.grass[1]], [8, -21, 8, R.grass[1]], [0, -31, 9, R.grass[1]], [-5, -31, 5, R.grass[3]], [4, -26, 4, R.grass[3]], [-9, -22, 3, R.grass[3]], [-6, -35, 2, R.grass[4]]], 0, 0);
      for (let k = 0; k < 14; k++) rect(c, x - 14 + Math.floor(hsh(i, j, k) * 28), y - 40 + Math.floor(hsh(i, j, k + 9) * 22), 2, 1, k % 2 ? R.grass[0] : R.grass[4]);
    } else if (kind === 'birch') {
      sh(11); rect(c, x - 2, y - 20, 4, 20, '#E8E8E0'); rect(c, x, y - 20, 2, 20, '#C4C9D2'); [-14, -9, -5, -17].forEach(m => rect(c, x - 2, y + m, 3, 1, R.base[3]));
      blobs([[0, -27, 9, R.grass[2]], [-5, -22, 6, R.grass[2]], [5, -22, 6, R.grass[2]], [0, -31, 6, R.grass[2]], [-3, -30, 4, R.grass[4]], [3, -25, 3, R.grass[4]]], 0, 0);
    } else if (kind === 'pine') {
      sh(13); rect(c, x - 2, y - 9, 5, 9, R.wood[1]);
      [[-12, 11, R.pine[0]], [-21, 9, R.pine[1]], [-30, 7, R.pine[2]], [-38, 5, R.pine[2]]].forEach((tt, k) => { poly(c, [[x, y + tt[0] - 12], [x + tt[1] + 2, y + tt[0] + 6], [x - tt[1] - 1, y + tt[0] + 6]], tt[2]); pl(c, x - tt[1] + 2 + k, y + tt[0] + 4, x + tt[1] - 2 - k, y + tt[0] + 4, R.pine[0], 1); rect(c, x - 2 - k, y + tt[0] - 3 + k, 2, 4, R.pine[3]); });
    } else if (kind === 'spine') {
      sh(13); rect(c, x - 2, y - 9, 5, 9, R.wood[1]);
      [[-11, 12, R.pine[1]], [-21, 10, R.pine[2]], [-30, 7, R.pine[2]]].forEach(tt => { poly(c, [[x, y + tt[0] - 12], [x + tt[1] + 2, y + tt[0] + 6], [x - tt[1] - 1, y + tt[0] + 6]], tt[2]); rect(c, x - tt[1] + 3, y + tt[0] + 2, tt[1] * 2 - 4, 4, R.snow[4]); rect(c, x - 2, y + tt[0] - 10, 5, 5, R.snow[4]); rect(c, x - 5, y + tt[0] - 1, 4, 3, R.snow[3]); });
    } else if (kind === 'bush') {
      sh(12); blobs([[-5, -6, 6, R.grass[0]], [5, -6, 6, R.grass[0]], [0, -9, 6, R.grass[0]], [-5, -7, 5, R.grass[2]], [5, -7, 5, R.grass[2]], [0, -10, 5, R.grass[3]], [-3, -11, 2, R.grass[4]]], 0, 0);
      [[-7, -8], [4, -7], [0, -12], [8, -9], [-2, -5]].forEach(f => { rect(c, x + f[0], y + f[1], 2, 2, R.red[3]); rect(c, x + f[0], y + f[1], 1, 1, R.red[4]); });
    } else if (kind === 'flower') {
      [[R.red[3], -10, -3], [R.yellow[3], 0, -6], ['#FFFFFF', 9, -2], [R.purple[2], -4, 2], [R.pink[1], 6, 3], [R.cyan[1], -12, 4], [R.orange[3], 12, 3], [R.red[3], 2, 5]].forEach(f => { rect(c, x + f[1], y + f[2] - 1, 1, 4, R.grass[1]); rect(c, x + f[1] - 2, y + f[2] - 3, 5, 3, f[0]); rect(c, x + f[1], y + f[2] - 3, 1, 1, R.yellow[4]); rect(c, x + f[1] - 1, y + f[2] - 4, 3, 1, f[0]); });
    } else if (kind === 'bench') {
      sh(11); rect(c, x - 8, y - 7, 16, 3, R.wood[3]); rect(c, x - 8, y - 11, 16, 3, R.wood[2]); rect(c, x - 8, y - 14, 16, 2, R.wood[3]); rect(c, x - 8, y - 4, 2, 5, R.stone[1]); rect(c, x + 6, y - 4, 2, 5, R.stone[1]); rect(c, x - 8, y - 14, 16, 1, R.wood[4]); rect(c, x - 8, y - 7, 16, 1, R.wood[4]);
    } else if (kind === 'lamp') {
      sh(6); rect(c, x - 1, y - 28, 3, 28, R.stone[1]); rect(c, x, y - 28, 1, 28, R.stone[3]); rect(c, x - 4, y - 33, 9, 6, R.yellow[3]); rect(c, x - 4, y - 34, 9, 1, R.stone[0]); rect(c, x - 3, y - 32, 7, 3, R.yellow[4]); rect(c, x - 5, y - 36, 11, 2, R.stone[0]); rect(c, x - 3, y - 2, 7, 2, R.stone[1]);
    } else if (kind === 'bin') {
      sh(6); rect(c, x - 4, y - 11, 9, 11, R.green[1]); rect(c, x - 4, y - 11, 3, 11, R.green[2]); rect(c, x - 5, y - 13, 11, 2, R.green[0]); rect(c, x - 2, y - 7, 5, 1, R.base[3]);
    } else if (kind === 'cactus') {
      sh(8); rect(c, x - 3, y - 21, 6, 21, R.green[1]); rect(c, x - 1, y - 21, 2, 21, R.green[3]); rect(c, x - 10, y - 15, 7, 3, R.green[1]); rect(c, x - 10, y - 22, 3, 8, R.green[1]); rect(c, x + 3, y - 12, 7, 3, R.green[1]); rect(c, x + 7, y - 19, 3, 8, R.green[1]); rect(c, x - 2, y - 22, 4, 2, R.pink[1]); for (let k = 0; k < 6; k++) rect(c, x - 3 + (k % 2) * 5, y - 18 + k * 3, 1, 1, R.green[4]);
    } else if (kind === 'rock') {
      sh(12); poly(c, [[x - 11, y], [x - 8, y - 9], [x, y - 12], [x + 9, y - 8], [x + 12, y]], R.stone[2]); poly(c, [[x - 8, y - 9], [x, y - 12], [x + 2, y - 5], [x - 9, y - 2]], R.stone[4]); rect(c, x + 3, y - 6, 8, 5, R.stone[1]); rect(c, x - 5, y - 9, 4, 1, R.stone[5]);
    } else if (kind === 'dry') {
      sh(7); [[-5, -8], [0, -12], [5, -6], [-2, -4], [3, -10]].forEach(b => pl(c, x, y, x + b[0], y + b[1], R.wood[3], 1));
    } else if (kind === 'palm') {
      sh(10); c.strokeStyle = R.wood[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 15, x + 2, y - 26); c.stroke(); c.lineWidth = 1;
      [[-13, -4], [13, -4], [-9, 5], [9, 5], [0, -9], [-5, 0], [6, 1]].forEach(f => { c.strokeStyle = R.green[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 2, y - 26); c.quadraticCurveTo(x + 2 + f[0] / 2, y - 32 + f[1] / 2, x + 2 + f[0], y - 24 + f[1]); c.stroke(); }); c.lineWidth = 1; rect(c, x + 1, y - 26, 3, 3, R.wood[1]);
    } else if (kind === 'dune') {
      c.fillStyle = R.sand[1]; c.beginPath(); c.ellipse(x, y - 1, 16, 6, 0, 3.14, 0); c.fill(); c.fillStyle = R.sand[3]; c.beginPath(); c.ellipse(x - 3, y - 3, 11, 4, 0, 3.14, 0); c.fill();
    } else if (kind === 'mound') {
      c.fillStyle = R.snow[1]; c.beginPath(); c.ellipse(x, y - 1, 15, 7, 0, 3.14, 0); c.fill(); c.fillStyle = R.snow[4]; c.beginPath(); c.ellipse(x - 3, y - 3, 10, 4, 0, 3.14, 0); c.fill();
    } else if (kind === 'snowman') {
      sh(9); disc(c, x, y - 6, 8, R.snow[3]); disc(c, x, y - 17, 6, R.snow[4]); disc(c, x, y - 25, 5, '#FFFFFF'); rect(c, x - 2, y - 27, 1, 1, R.base[0]); rect(c, x + 2, y - 27, 1, 1, R.base[0]); rect(c, x, y - 24, 5, 1, R.orange[2]); rect(c, x - 5, y - 31, 10, 2, R.base[1]); rect(c, x - 3, y - 36, 6, 5, R.base[1]); rect(c, x - 12, y - 19, 6, 1, R.wood[2]); rect(c, x + 6, y - 19, 6, 1, R.wood[2]); rect(c, x - 1, y - 14, 2, 2, R.base[0]); rect(c, x - 1, y - 9, 2, 2, R.base[0]);
    }
  }

  // ---------- Bauten ----------
  function drawHouse(c, P, hi, hj, col) {
    const x0 = hi, y0 = hj;
    box(c, P, x0 + .08, y0 + .1, 0, .84, .8, .8, '#E9D8B0', R.stone[0]);
    poly(c, [P(x0 + .2, y0 + .9, 0), P(x0 + .42, y0 + .9, 0), P(x0 + .42, y0 + .9, .46), P(x0 + .2, y0 + .9, .46)], R.wood[1], R.wood[0]);
    poly(c, [P(x0 + .54, y0 + .9, .24), P(x0 + .8, y0 + .9, .24), P(x0 + .8, y0 + .9, .56), P(x0 + .54, y0 + .9, .56)], R.sky[1], R.stone[1]);
    const w1 = P(x0 + .67, y0 + .9, .24), w2 = P(x0 + .67, y0 + .9, .56); pl(c, w1[0], w1[1], w2[0], w2[1], R.stone[1], 1);
    poly(c, [P(x0 + .92, y0 + .26, .24), P(x0 + .92, y0 + .62, .24), P(x0 + .92, y0 + .62, .56), P(x0 + .92, y0 + .26, .56)], R.sky[1], R.stone[1]);
    const A = P(x0, y0, .8), B = P(x0 + 1, y0, .8), Cc = P(x0 + 1, y0 + 1, .8), Dd = P(x0, y0 + 1, .8), r1 = P(x0, y0 + .5, 1.3), r2 = P(x0 + 1, y0 + .5, 1.3);
    poly(c, [Dd, Cc, r2, r1], col[2], R.red[0]); poly(c, [B, Cc, r2], col[1], R.red[0]); poly(c, [A, B, r2, r1], col[3], R.red[0]);
    for (let k = 1; k < 4; k++) { const a = P(x0, y0 + 1 - k * .125, .8 + k * .125), b = P(x0 + 1, y0 + 1 - k * .125, .8 + k * .125); pl(c, a[0], a[1], b[0], b[1], col[1], 1); }
    const ch = P(x0 + .78, y0 + .3, 1.1); rect(c, ch[0] - 2, ch[1] - 10, 6, 11, R.stone[1]); rect(c, ch[0] - 2, ch[1] - 11, 6, 2, R.stone[3]); rect(c, ch[0] - 1, ch[1] - 10, 2, 10, R.stone[2]);
    const sg = P(x0 + .5, y0 + .96, 1.02); rect(c, sg[0] - 12, sg[1] - 4, 24, 8, R.yellow[3]); rect(c, sg[0] - 12, sg[1] - 4, 24, 1, R.yellow[4]); rect(c, sg[0] - 12, sg[1] + 3, 24, 1, R.yellow[0]); for (let k = 0; k < 4; k++) rect(c, sg[0] - 9 + k * 5, sg[1] - 1, 3, 2, col[1]);
  }
  function drawPlatform(c, P, ox, sy) {
    box(c, P, ox, sy - .03, 0, 1, .24, .14, R.stone[4], R.stone[1]); box(c, P, ox, sy + .79, 0, 1, .24, .14, R.stone[4], R.stone[1]);
    const a = P(ox, sy + .21, .14), b = P(ox + 1, sy + .21, .14), d = P(ox, sy + .79, .14), e = P(ox + 1, sy + .79, .14); pl(c, a[0], a[1], b[0], b[1], R.yellow[3], 1); pl(c, d[0], d[1], e[0], e[1], R.yellow[3], 1);
  }
  function drawCanopy(c, P, ox, sy, col) {
    [[ox + .1, sy + .02], [ox + .9, sy + .02], [ox + .1, sy + .96], [ox + .9, sy + .96]].forEach(q => { const a = P(q[0], q[1], .12), b = P(q[0], q[1], 1.0); pl(c, a[0], a[1], b[0], b[1], R.stone[4], 2); pl(c, a[0] + 2, a[1], b[0] + 2, b[1], R.stone[2], 1); });
    const A = P(ox - .06, sy - .12, 1.0), B = P(ox + 1.06, sy - .12, 1.0), Cc = P(ox + 1.06, sy + 1.12, 1.0), D = P(ox - .06, sy + 1.12, 1.0);
    poly(c, [A, B, Cc, D], col[2], R.red[0]);
    for (let k = 0; k < 6; k++) { const p0 = P(ox + .1 + k * .16, sy - .12, 1.0), p1 = P(ox + .1 + k * .16, sy + 1.12, 1.0); pl(c, p0[0], p0[1], p1[0], p1[1], '#FFFFFF', 2); }
    const e0 = P(ox - .06, sy + 1.12, 1.0), e1 = P(ox + 1.06, sy + 1.12, 1.0); pl(c, e0[0], e0[1] + 1, e1[0], e1[1] + 1, col[0], 3); pl(c, e0[0], e0[1] + 4, e1[0], e1[1] + 4, R.base[3], 1);
  }
  function drawGate(c, P, gi, gj, col) {
    const a0 = P(gi + .5, gj + .08, 0), a1 = P(gi + .5, gj + .08, 1.25), b0 = P(gi + .5, gj + .92, 0), b1 = P(gi + .5, gj + .92, 1.25);
    [[a0, a1], [b0, b1]].forEach(s => { pl(c, s[0][0], s[0][1], s[1][0], s[1][1], R.wood[3], 4); pl(c, s[0][0] - 1, s[0][1], s[1][0] - 1, s[1][1], R.wood[4], 1); rect(c, s[1][0] - 3, s[1][1] - 2, 8, 3, R.wood[1]); });
    poly(c, [[a1[0] - 4, a1[1] - 10], [b1[0] + 4, b1[1] - 10], [b1[0] + 4, b1[1] + 5], [a1[0] - 4, a1[1] + 5]], col[2], R.red[0]);
    const m = P(gi + .5, gj + .5, 1.25); rect(c, m[0] - 14, m[1] - 5, 28, 6, R.yellow[3]); for (let k = 0; k < 6; k++) rect(c, m[0] - 11 + k * 4, m[1] - 3, 2, 2, col[1]);
    const rail = yy => { [.18, .34].forEach(h => { const r0 = P(gi - 1, gj + yy, h), r1 = P(gi + .5, gj + yy, h); pl(c, r0[0], r0[1], r1[0], r1[1], R.stone[3], 1); }); for (let k = 0; k <= 3; k++) { const pp = P(gi - 1 + k * .5, gj + yy, 0), pq = P(gi - 1 + k * .5, gj + yy, .36); pl(c, pp[0], pp[1], pq[0], pq[1], R.stone[2], 2); } };
    rail(.1); rail(.9);
  }
  // Lamellen auf einem geraden Feld in Fahrtrichtung (Bremse gelb/schwarz, Booster orange/blau)
  // Korkenzieher-Abschnitt in echtem 3D: zwei Schienen und Mittelrohr drehen um die Fahrtachse (Seitenvektor cp, Winkel rot),
  // Verstrebungen Schiene–Rohr; gezeichnet von hinten nach vorn (Tiefe x+y+0,41·z), Schienen-Unterseite dunkel, wenn kopfüber
  function drawCorkSeg(c, P, a, b, tc, k) {
    const g = .115, hs = .12, fr = q => { const cs = Math.cos(q.rot), sn = Math.sin(q.rot), s = a.cp; return { rail: sg => [q.x + s[0] * g * sg * cs, q.y + s[1] * g * sg * cs, q.z + CKZ * g * sg * sn], sp: [q.x + s[0] * sn * hs, q.y + s[1] * sn * hs, q.z - CKZ * cs * hs], cs }; };
    const fa = fr(a), fb = fr(b.rot === undefined ? Object.assign({}, b, { rot: a.rot }) : b), dep = (p, q) => (p[0] + p[1] + q[0] + q[1]) / 2 + .41 * (p[2] + q[2]) / 2;
    const els = [{ d: dep(fa.sp, fb.sp), f: () => { const s0 = P(...fa.sp), s1 = P(...fb.sp); pl(c, s0[0], s0[1] + 1, s1[0], s1[1] + 1, R.stone[0], 3); pl(c, s0[0], s0[1], s1[0], s1[1], R.stone[2], 2); pl(c, s0[0], s0[1] - 1, s1[0], s1[1] - 1, R.stone[3], 1);
      if (k % 2 === 0) [-1, 1].forEach(sg => { const r = P(...fa.rail(sg)); pl(c, s0[0], s0[1], r[0], r[1], R.stone[1], 1); }); } }];
    [-1, 1].forEach(sg => { const r0 = fa.rail(sg), r1 = fb.rail(sg); els.push({ d: dep(r0, r1), f: () => { const p0 = P(...r0), p1 = P(...r1), rc = CK.shade && fa.cs < 0 ? [tc[0], tc[0], tc[1], tc[1], tc[2]] : tc;
      pl(c, p0[0], p0[1] + 2, p1[0], p1[1] + 2, rc[0], 1); pl(c, p0[0], p0[1] + 1, p1[0], p1[1] + 1, rc[1], 1); pl(c, p0[0], p0[1], p1[0], p1[1], rc[2], 1); pl(c, p0[0], p0[1] - 1, p1[0], p1[1] - 1, rc[3], 1); } }); });
    els.sort((x, y) => x.d - y.d).forEach(e => e.f());
  }
  function drawFins(c, P, p, cols) {
    const d = DV[p.din], z = p.z0 + .1;
    for (let k = 0; k < 5; k++) { const a = .14 + k * .18; if (d[0]) box(c, P, p.i + (d[0] > 0 ? a : 1 - a - .08), p.j + .4, z, .08, .2, .09, cols[k % 2], null); else box(c, P, p.i + .4, p.j + (d[1] > 0 ? a : 1 - a - .08), z, .2, .08, .09, cols[k % 2], null); }
  }
  function drawBrake(c, P, bi, bj) {
    for (let k = 0; k < 5; k++) { const x = bi + .14 + k * .18; box(c, P, x, bj + .3, .06, .08, .4, .1, k % 2 ? R.base[3] : R.yellow[3], null); }
  }
  // Ziel-Tor statt Fahne: zwei Pfosten quer zur Fahrtrichtung, schwarz-weiß kariertes Band darüber; Lampen grün, wenn der Kreis geschlossen ist
  function drawGoal(c, P, ti, tj, dir, part, on, t) {
    const d = DV[dir], s = [-d[1], d[0]], cx = ti + .5, cy = tj + .5, w = .44, h = 1.25, end = sg => [cx + s[0] * w * sg, cy + s[1] * w * sg];
    const back = (s[0] + s[1]) > 0 ? -1 : 1; // Pfosten mit kleinerem x+y steht hinten
    const post = sg => { const e = end(sg), a = P(e[0], e[1], 0), b = P(e[0], e[1], h); rect(c, a[0] - 2, a[1] - 1, 5, 2, R.stone[1]); pl(c, a[0], a[1], b[0], b[1], R.stone[1], 3); pl(c, a[0] - 1, a[1], b[0] - 1, b[1], R.stone[4], 1); const l = P(e[0], e[1], h + .12); disc(c, l[0], l[1], 2, on && Math.sin(t * 6) > -.3 ? R.green[3] : R.yellow[3]); };
    if (part === 0) { post(back); return; }
    post(-back); const n = 8;
    for (let k = 0; k < n; k++) for (let r = 0; r < 2; r++) { const f0 = k / n, f1 = (k + 1) / n, e0 = [cx + s[0] * w * (2 * f0 - 1), cy + s[1] * w * (2 * f0 - 1)], e1 = [cx + s[0] * w * (2 * f1 - 1), cy + s[1] * w * (2 * f1 - 1)], z0 = h - .1 - r * .14, z1 = z0 - .14;
      poly(c, [P(e0[0], e0[1], z0), P(e1[0], e1[1], z0), P(e1[0], e1[1], z1), P(e0[0], e0[1], z1)], (k + r) % 2 ? '#FFFFFF' : R.base[1]); }
    const a = P(end(-1)[0], end(-1)[1], h - .1), b = P(end(1)[0], end(1)[1], h - .1); pl(c, a[0], a[1] - 1, b[0], b[1] - 1, R.stone[1], 1);
  }
  function drawFlag(c, P, ti, tj, on, t) {
    const a = P(ti + .5, tj + .5, 0), b = P(ti + .5, tj + .5, 1.4); pl(c, a[0], a[1], b[0], b[1], R.stone[4], 2); rect(c, b[0] - 1, b[1] - 1, 4, 3, R.yellow[3]);
    const w = Math.round(Math.sin(t * 6) * 1.5); poly(c, [[b[0] + 2, b[1] - 1], [b[0] + 16, b[1] + 3 + w], [b[0] + 2, b[1] + 8]], on ? '#5CC283' : R.yellow[3], R.base[1]);
  }
  // Pflicht-Flagge: Mast an der hinteren Kachelecke, rot-weißer Wimpel; grün, sobald die Strecke darüber führt
  function drawPflag(c, P, i, j, on, t) {
    const g = P(i + .5, j + .5, 0); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4; rect(c, g[0] + Math.round(Math.cos(a) * 12) - 1, g[1] + Math.round(Math.sin(a) * 6) - 1, 3, 2, on ? R.green[3] : R.red[3]); }
    const a = P(i + .2, j + .2, 0), b = P(i + .2, j + .2, 1.6); rect(c, a[0] - 2, a[1] - 1, 5, 2, R.stone[1]); pl(c, a[0], a[1], b[0], b[1], R.stone[1], 2); pl(c, a[0], a[1], b[0], b[1], R.stone[4], 1); disc(c, b[0] + 1, b[1] - 1, 2, R.yellow[3]);
    const w = Math.round(Math.sin(t * 5 + i + j) * 1.5), c1 = on ? R.green[2] : R.red[2], c2 = on ? R.green[4] : '#FFFFFF';
    for (let k = 0; k < 4; k++) { const x0 = b[0] + 2 + k * 4, h = 10 - k * 2, y0 = b[1] + 1 + Math.round(w * k / 3) + k; rect(c, x0, y0, 4, h, k % 2 ? c2 : c1); }
    rect(c, b[0] + 2, b[1] + 1, 16, 1, on ? R.green[1] : R.red[1]);
  }
  // Gast als kleine Pixelfigur (Fußpunkt x,y): Haare, Gesicht mit Augen, Hemd mit Schatten, Arme mit Händen, Hose, Schuhe.
  // step: Gehphase 0/1 (Beine und Arme schwingen), up: Arme hoch, kid: kleiner, mit Luftballon, v: Variante (Hose, Mütze)
  const PANTS = ['#3A4A78', '#5A4632', '#2E2E3A', '#6B6F7A'];
  function guest(c, x, y, col, hair, step, up, kid, v) {
    v = v || 0; const k = kid ? 0 : 1, hy = y - 12 - k * 2, ty = y - 8 - k, legH = 3 + k, dk = shade(col, .7), pc = PANTS[v % PANTS.length];
    // Beine und Schuhe
    rect(c, x - 2, y - legH, 2, legH - (step ? 1 : 0), pc); rect(c, x, y - legH, 2, legH - (step ? 0 : 1), shade(pc, .8));
    rect(c, x - 2, y - 1 - (step ? 1 : 0), 2, 1, R.base[0]); rect(c, x, y - 1 - (step ? 0 : 1), 2, 1, R.base[0]);
    // Rumpf mit Schatten rechts und Gürtellinie
    rect(c, x - 2, ty, 4, 4 + k, col); rect(c, x + 1, ty, 1, 4 + k, dk); rect(c, x - 2, ty + 3 + k, 4, 1, shade(col, .55));
    // Arme mit Händen
    if (up) { rect(c, x - 3, ty - 4, 1, 5, col); rect(c, x + 2, ty - 4, 1, 5, dk); rect(c, x - 3, ty - 5, 1, 1, R.skin[2]); rect(c, x + 2, ty - 5, 1, 1, R.skin[2]); }
    else { const a = step ? 1 : 0; rect(c, x - 3, ty + 1 - a, 1, 3, col); rect(c, x + 2, ty + a, 1, 3, dk); rect(c, x - 3, ty + 4 - a, 1, 1, R.skin[2]); rect(c, x + 2, ty + 3 + a, 1, 1, R.skin[1]); }
    // Kopf: Gesicht, Schatten, Augen, Haare oder Mütze
    rect(c, x - 2, hy, 4, 4, R.skin[2]); rect(c, x + 1, hy + 1, 1, 3, R.skin[1]); rect(c, x - 2, hy + 3, 4, 1, R.skin[1]);
    rect(c, x - 1, hy + 1, 1, 1, R.base[0]); rect(c, x + 1, hy + 1, 1, 1, R.base[0]);
    if (v % 3 === 1 && !kid) { rect(c, x - 2, hy - 2, 4, 2, R.red[2]); rect(c, x - 3, hy, 3, 1, R.red[1]); }
    else { rect(c, x - 2, hy - 1, 4, 2, hair); rect(c, x + 1, hy, 1, 2, hair); rect(c, x - 2, hy - 1, 2, 1, shade(hair, 1.25)); }
    if (kid) { rect(c, x + 4, hy - 7, 3, 4, R.red[3]); rect(c, x + 4, hy - 7, 1, 1, '#FFFFFF'); rect(c, x + 5, hy - 3, 1, 4, '#FFFFFF'); rect(c, x + 3, hy + 1, 2, 1, '#FFFFFF'); }
  }
  // Symbole 7×7 als Zeilen; Zeichen: r rot, y gelb, p rosa, g grün, b blau, k dunkel
  const RSYM = {
    wow: ['..r....', '..r....', '..r....', '..r....', '..r....', '.......', '..r....'],
    wow2: ['.r..r..', '.r..r..', '.r..r..', '.r..r..', '.r..r..', '.......', '.r..r..'],
    herz: ['.......', '.pp.pp.', 'ppppppp', 'ppppppp', '.ppppp.', '..ppp..', '...p...'],
    uebel: ['.ggggg.', 'g.....g', 'g.ggg.g', 'g.g.g.g', 'g.g...g', 'g.gggg.', '.......'],
    nass: ['.b...b.', '.b...b.', 'bbb.bbb', 'bbb.bbb', '.b.....', '...b...', '..bbb..'],
    puh: ['.......', '.......', '.......', '.......', '.......', '.......', 'k.k.k..'],
    lach: ['.......', '.k...k.', '.......', 'k.....k', '.k...k.', '..kkk..', '.......']
  };
  function reactBubble(c, x, y, sym) {
    const rows = RSYM[sym]; if (!rows) return; const col = { r: R.red[2], y: R.yellow[2], p: R.red[3], g: R.lime[0], b: R.water[2], k: R.base[0] };
    rect(c, x - 1, y - 1, 13, 12, R.base[0]); rect(c, x, y, 11, 10, '#FFFFFF'); rect(c, x + 2, y + 10, 3, 1, '#FFFFFF'); rect(c, x + 1, y + 10, 1, 2, R.base[0]); rect(c, x + 2, y + 11, 1, 2, R.base[0]); rect(c, x + 3, y + 11, 2, 1, R.base[0]);
    rows.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] !== '.') rect(c, x + 2 + i, y + 1 + j, 1, 1, col[r[i]]); });
  }
  // Wagen in eigener Farbe (nicht Streckenfarbe): cremeweiß, vorderer Wagen mit Schnauze und Scheinwerfer
  const CAR = ['#E9E3D3', '#C9C1AE', '#F2C12E', '#6B6457'];
  // Fahrgast im Wagen (Kopfmitte hx,hy): Shirt mit Schatten, Gesicht mit Augen und Schatten, Haare mit Glanz oder Mütze, Arme hoch mit Händen
  function rider(c, hx, hy, gc, hair, up, cap) {
    rect(c, hx - 2, hy + 2, 4, 3, gc); rect(c, hx + 1, hy + 2, 1, 3, shade(gc, .7));
    rect(c, hx - 2, hy - 2, 4, 4, R.skin[2]); rect(c, hx + 1, hy - 1, 1, 3, R.skin[1]); rect(c, hx - 1, hy, 1, 1, R.base[0]); rect(c, hx + 1, hy, 1, 1, R.base[0]);
    if (cap) { rect(c, hx - 2, hy - 3, 4, 2, R.red[2]); rect(c, hx - 3, hy - 2, 2, 1, R.red[1]); }
    else { rect(c, hx - 2, hy - 3, 4, 2, hair); rect(c, hx + 1, hy - 1, 1, 1, hair); rect(c, hx - 2, hy - 3, 1, 1, shade(hair, 1.3)); }
    if (up) { rect(c, hx - 4, hy - 1, 1, 3, gc); rect(c, hx + 3, hy - 1, 1, 3, shade(gc, .7)); rect(c, hx - 4, hy - 4, 1, 3, R.skin[2]); rect(c, hx + 3, hy - 4, 1, 3, R.skin[1]); }
  }
  const GCOL = [R.pink[1], R.cyan[1], R.yellow[3], R.lime[1], R.purple[2], R.orange[3], R.red[3]];
  const HAIR = [R.wood[1], R.base[1], R.yellow[1], R.wood[3], R.stone[4]];

  // ---------- Statische Schichten (einmal pro Streckenaenderung) ----------
  function staticItems(L, S) {
    const P = proj(L), run = S.run, tc = R[S.trackCol || 'red'], st = run.track[0], sx = st.i, sy = st.j, theme = S.theme, items = [];
    const Sm = S.path.S, occ = new Set(run.track.concat(run.ret).map(p => p.i + ',' + p.j));
    const sc = theme === 'meadow' ? R.grass[0] : theme === 'desert' ? R.sand[0] : R.snow[0];
    items.push({ d: -1, f: c => { for (let k = 0; k < Sm.length - 1; k++) { if (Sm[k + 1].brk) continue; const p = P(Sm[k].x + .08, Sm[k].y + .08, 0), q = P(Sm[k + 1].x + .08, Sm[k + 1].y + .08, 0); pl(c, p[0], p[1], q[0], q[1], sc, 3); } } });
    for (const key in S.decor) { if (occ.has(key)) continue; const [i, j] = key.split(',').map(Number), kind = S.decor[key]; items.push({ d: i + j + 1, f: c => drawDecor(c, P, i, j, kind, 0) }); }
    if (S.station) {
      const an = P(sx - 1, sy - 1, 0), SP = S.station, sp = (c, k) => { const q = SP[k]; c.drawImage(q.cv, an[0] + q.ox, an[1] + q.oy); };
      items.push({ d: sx + 1 + sy - 1 + 1.3, f: c => sp(c, 'house') });
      items.push({ d: sx + sy + .5 + .05, f: c => sp(c, 'plat') });
      items.push({ d: sx + sy + .5 + 1.35, f: c => sp(c, 'canopy') });
      if (S.gate) items.push({ d: S.gate[0] + S.gate[1] + .55 + .6, f: c => sp(c, 'gate') });
    } else {
    items.push({ d: sx + sy - 1 + 1.3, f: c => drawHouse(c, P, sx, sy - 1, tc) });
    items.push({ d: sx + sy + .5 + .05, f: c => drawPlatform(c, P, sx, sy) });
    items.push({ d: sx + sy + .5 + 1.35, f: c => drawCanopy(c, P, sx, sy, tc) });
    if (S.gate) items.push({ d: S.gate[0] + S.gate[1] + .55 + .6, f: c => drawGate(c, P, S.gate[0], S.gate[1], tc) });
    }
    items.push({ d: run.exit.i + run.exit.j + .55, f: c => drawBrake(c, P, run.exit.i, run.exit.j) });
    run.track.forEach(p => { if (p.type === 'H' || p.type === 'V') items.push({ d: p.i + p.j + 1.06 + p.z0 * .012, f: c => drawFins(c, P, p, p.type === 'H' ? [R.yellow[3], R.base[3]] : [R.orange[3], R.cyan[1]]) }); });
    // Kreuzungsfelder: die obere Strecke bekommt dort keine Stützen (sie stünden sonst auf der unteren)
    const pcs = run.track.concat(run.ret), lowZ = {}; pcs.forEach(p => { const q = p.i + ',' + p.j; lowZ[q] = q in lowZ ? Math.min(lowZ[q], p.z0) : p.z0; });
    const cnt = {}; pcs.forEach(p => { const q = p.i + ',' + p.j; cnt[q] = (cnt[q] || 0) + 1; });
    const overX = pi => { const p = pcs[pi]; if (!p) return false; const q = p.i + ',' + p.j; return cnt[q] > 1 && p.z0 > lowZ[q]; };
    let pn = [0, 1];
    for (let k = 0; k < Sm.length - 1; k++) {
      const a = Sm[k], b = Sm[k + 1]; if (b.brk) continue;
      let dx = b.x - a.x, dy = b.y - a.y; const l = Math.hypot(dx, dy); if (l > 1e-4) { dx /= l; dy /= l; pn = [-dy, dx]; } let nx = pn[0], ny = pn[1]; if (a.ty === 'L' && a.ev) { nx = -a.ev[1]; ny = a.ev[0]; }
      items.push({ d: (a.x + a.y + b.x + b.y) / 2 + (a.z + b.z) * .012 + (a.ty === 'L' && pcs[a.pi] ? LK * ((a.z + b.z) / 2 - pcs[a.pi].z0) : 0), f: c => {
        if (a.sup && a.z > .25 && !overX(a.pi) && a.ty !== 'S' && a.ty !== 'L' && !(CK.sup && a.ty === 'C' && Math.cos(a.rot || 0) < .9)) {
          const top = a.z - .05;
          [[-1, R.stone[2]], [1, R.stone[4]]].forEach(cc => { const g0 = P(a.x + nx * .12 * cc[0], a.y + ny * .12 * cc[0], 0), g1 = P(a.x + nx * .12 * cc[0], a.y + ny * .12 * cc[0], top); pl(c, g0[0], g0[1], g1[0], g1[1], cc[1], 2); });
          for (let z = 0; z < top - .2; z += .75) { const zt = Math.min(top, z + .75), q0 = P(a.x - nx * .12, a.y - ny * .12, z), q1 = P(a.x + nx * .12, a.y + ny * .12, zt), q2 = P(a.x + nx * .12, a.y + ny * .12, z), q3 = P(a.x - nx * .12, a.y - ny * .12, zt); pl(c, q0[0], q0[1], q1[0], q1[1], R.stone[3], 1); pl(c, q2[0], q2[1], q3[0], q3[1], R.stone[3], 1); const m0 = P(a.x - nx * .12, a.y - ny * .12, zt), m1 = P(a.x + nx * .12, a.y + ny * .12, zt); pl(c, m0[0], m0[1], m1[0], m1[1], R.stone[1], 1); }
          const f0 = P(a.x, a.y, 0); rect(c, f0[0] - 5, f0[1] - 1, 11, 3, R.stone[1]); rect(c, f0[0] - 5, f0[1] - 1, 11, 1, R.stone[4]); rect(c, f0[0] - 4, f0[1], 1, 1, R.base[3]); rect(c, f0[0] + 4, f0[1], 1, 1, R.base[3]);
        }
        if (a.ty === 'C' && a.rot !== undefined && (CK.spine || CK.shade)) { drawCorkSeg(c, P, a, b, tc, k); return; }
        const p0 = P(a.x, a.y, a.z), p1 = P(b.x, b.y, b.z);
        // Kreuzung: obere Strecke als Brücke mit Kastenträger
        if (overX(a.pi)) { const g0 = P(a.x, a.y, a.z - .1), g1 = P(b.x, b.y, b.z - .1); pl(c, g0[0], g0[1] + 6, g1[0], g1[1] + 6, R.base[0], 4); pl(c, g0[0], g0[1] + 4, g1[0], g1[1] + 4, R.stone[1], 4); pl(c, g0[0], g0[1] + 3, g1[0], g1[1] + 3, R.yellow[2], 2); }
        if (CK.spine && a.ty === 'C' && a.rot !== undefined) { const nz = (r, cp) => [-cp[0] * Math.sin(r) * .13, -cp[1] * Math.sin(r) * .13, Math.cos(r) * .26], na = nz(a.rot, a.cp), nb = nz(b.rot === undefined ? a.rot : b.rot, a.cp), s0 = P(a.x - na[0], a.y - na[1], a.z - na[2]), s1 = P(b.x - nb[0], b.y - nb[1], b.z - nb[2]); pl(c, s0[0], s0[1] + 1, s1[0], s1[1] + 1, R.stone[0], 4); pl(c, s0[0], s0[1], s1[0], s1[1], R.stone[2], 2); }
        pl(c, p0[0], p0[1] + 3, p1[0], p1[1] + 3, R.stone[0], 2); pl(c, p0[0], p0[1] + 2, p1[0], p1[1] + 2, R.stone[1], 1);
        const ca = a.rot === undefined ? 1 : Math.cos(a.rot), sa = a.rot === undefined ? 0 : Math.sin(a.rot), cb = b.rot === undefined ? ca : Math.cos(b.rot), sb = b.rot === undefined ? sa : Math.sin(b.rot);
        if (k % 2 === 0) { const t0 = P(a.x - nx * .19 * ca, a.y - ny * .19 * ca, a.z - .38 * sa), t1 = P(a.x + nx * .19 * ca, a.y + ny * .19 * ca, a.z + .38 * sa); pl(c, t0[0], t0[1] + 2, t1[0], t1[1] + 2, R.stone[1], 1); pl(c, t0[0], t0[1] + 1, t1[0], t1[1] + 1, R.stone[3], 1); }
        [-1, 1].forEach(sg => { const r0 = P(a.x + nx * .115 * sg * ca, a.y + ny * .115 * sg * ca, a.z + .23 * sg * sa), r1 = P(b.x + nx * .115 * sg * cb, b.y + ny * .115 * sg * cb, b.z + .23 * sg * sb); const rc = CK.shade && a.ty === 'C' && ca < 0 ? [tc[0], tc[0], tc[1], tc[1], tc[2]] : tc; pl(c, r0[0], r0[1] + 2, r1[0], r1[1] + 2, rc[0], 1); pl(c, r0[0], r0[1] + 1, r1[0], r1[1] + 1, rc[1], 1); pl(c, r0[0], r0[1], r1[0], r1[1], rc[2], 1); pl(c, r0[0], r0[1] - 1, r1[0], r1[1] - 1, rc[3], 1); pl(c, r0[0], r0[1] - 2, r1[0], r1[1] - 2, rc[4], 1); });
      } });
    }
    return items;
  }
  function makeStatic(L, S) {
    const items = staticItems(L, S).sort((a, b) => a.d - b.d), groups = {};
    items.forEach(it => { const k = Math.max(0, Math.floor((it.d + 1) * 2)); (groups[k] = groups[k] || []).push(it); });
    const slabs = [];
    Object.keys(groups).map(Number).sort((a, b) => a - b).forEach(k => {
      const cv = MK(L.W, L.H), c = cv.getContext('2d'); c.imageSmoothingEnabled = false; groups[k].forEach(it => it.f(c)); quantize(c, L.W, L.H);
      const im = c.getImageData(0, 0, L.W, L.H).data; let x0 = L.W, y0 = L.H, x1 = -1, y1 = -1;
      for (let y = 0; y < L.H; y++) { const row = y * L.W * 4; for (let x = 0; x < L.W; x++) if (im[row + x * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; } }
      if (x1 < 0) return; const w = x1 - x0 + 1, h = y1 - y0 + 1, cv2 = MK(w, h); cv2.getContext('2d').drawImage(cv, x0, y0, w, h, 0, 0, w, h);
      slabs.push({ k, d0: k / 2 - 1, cv: cv2, x: x0, y: y0 });
    });
    return { slabs };
  }

  // ---------- Bildzeichnung (nur Bewegtes) ----------
  function draw(c, L, S) {
    const P = proj(L), run = S.run, t = S.t, theme = S.theme, tc = R[S.trackCol || 'red'], st = run.track[0], sx = st.i, sy = st.j, dyn = [], boxes = [];
    c.imageSmoothingEnabled = false; c.lineCap = 'butt'; c.lineJoin = 'miter';
    c.clearRect(0, 0, L.W, L.H); c.drawImage(S.ground, 0, 0);
    if (S.target) { const bp = P(S.target.i + .5, S.target.j + .5, 1.0), gd = run.exit.dir; dyn.push({ d: S.target.i + S.target.j + .55, f: c2 => drawGoal(c2, P, S.target.i, S.target.j, gd, 0, S.ready, t) }); dyn.push({ d: S.target.i + S.target.j + 1.45, f: c2 => drawGoal(c2, P, S.target.i, S.target.j, gd, 1, S.ready, t) }); boxes.push([bp[0] - 30, bp[1] - 44, 70, 90]); }
    (S.flags || []).forEach(f => { const on = run.track.some(p => p.i === f[0] && p.j === f[1]); dyn.push({ d: f[0] + f[1] + .45, f: c2 => drawPflag(c2, P, f[0], f[1], on, t) }); });
    (S.pond || []).forEach(q => { const p = P(q[0] + .5, q[1] + .5, 0), ph = Math.floor(t * 2.5 + q[0] * 2 + q[1]) % 4; dyn.push({ d: q[0] + q[1] + .3, f: c2 => { rect(c2, p[0] - 9 + ph * 4, p[1] - 3 + (ph & 1), 3, 1, '#FFFFFF'); rect(c2, p[0] + 6 - ph * 3, p[1] + 1, 3, 1, R.water[4]); } }); });
    if ((S.pond || []).length) { const q = S.pond[Math.floor(S.pond.length / 2)], dx = Math.sin(t * .5) * .3, dy = Math.cos(t * .4) * .2, p = P(q[0] + .5 + dx, q[1] + .5 + dy, 0), right = Math.cos(t * .5) > 0; dyn.push({ d: q[0] + q[1] + 1 + dx + dy, f: c2 => { rect(c2, p[0] - 3, p[1] - 3, 7, 4, '#FFFFFF'); rect(c2, p[0] + (right ? 3 : -5), p[1] - 5, 3, 3, '#FFFFFF'); rect(c2, p[0] + (right ? 5 : -7), p[1] - 4, 2, 1, R.orange[3]); rect(c2, p[0] + (right ? 4 : -4), p[1] - 5, 1, 1, R.base[0]); rect(c2, p[0] - 4, p[1] + 1, 9, 1, R.water[3]); } }); }
    const qy = sy + 1.5;
    // Gäste bleiben auf dem gepflasterten Stationsplatz (Felder sx..sx+1, Zeile sy+1): Schlange vom Eingangstor zum Bahnsteig, Zuschauer am Rand
    for (let g = 0; g < 5; g++) { const ph = (t * .08 + g / 5) % 1, xx = (sx + 1.92) - ph * .95, yy = qy + (g % 2 ? .14 : -.14) - Math.max(0, (sx + 1.35 - xx)) * 1.1, kid = g % 3 === 0; dyn.push({ d: xx + yy + .3, f: c2 => { const p = P(xx, Math.max(yy, sy + 1.08), 0); guest(c2, p[0], p[1], GCOL[g % GCOL.length], HAIR[g % HAIR.length], Math.floor(t * 4 + g) & 1, false, kid, g); } }); }
    [[sx + .25, sy + 1.82, 0], [sx + .7, sy + 1.88, 1], [sx + 1.55, sy + 1.86, 2]].forEach((q, g) => { dyn.push({ d: q[0] + q[1] + .2, f: c2 => { const p = P(q[0], q[1], 0); guest(c2, p[0], p[1], GCOL[(g + 3) % GCOL.length], HAIR[(g + 1) % HAIR.length], 0, S.cars && Math.sin(t * 6 + g) > 0, g === 1, g + 5); } }); });
    const Sm = S.path.S;
    for (let k = 0; k < Sm.length - 1; k++) { const a = Sm[k]; if (a.ty !== 'T' || Sm[k + 1].brk) continue; const on = (Math.floor(t * 9) + k) % 2, cp = P(a.x, a.y, a.z); dyn.push({ d: a.x + a.y + a.z * .012 + .02, f: c2 => { rect(c2, cp[0], cp[1] - 1, 2, 3, on ? R.yellow[3] : R.base[3]); rect(c2, cp[0] + 3, cp[1] - 1, 2, 3, on ? R.base[3] : R.yellow[3]); } }); }
    if (S.cars) S.cars.forEach((cs, ci) => {
      const q = posAt(S.ridePath, cs), cz = q.z + .08, cp = P(q.x, q.y, q.z); boxes.push([cp[0] - 40, cp[1] - 50, 80, 90]);
      if (q.ty === 'W') dyn.push({ d: q.x + q.y + .9, f: c2 => { for (let k = 0; k < 14; k++) { const a = hsh(k, ci, Math.floor(t * 12)) * 6.28, r = 6 + hsh(k, ci + 7, Math.floor(t * 12)) * 12; rect(c2, cp[0] + Math.cos(a) * r, cp[1] - 4 - Math.abs(Math.sin(a)) * r * .9, 2, 2, k % 3 ? '#FFFFFF' : R.water[3]); } } });
      // im Looping nach Blicktiefe (x+y+LK·Höhe im Looping) sortiert, damit vordere Schienen den Wagen auf der Rückseite verdecken
      const lz0 = q.ty === 'L' && run.track[q.pi] ? run.track[q.pi].z0 : null;
      dyn.push({ d: lz0 !== null ? q.x + q.y + q.z * .012 * 2 + LK * (q.z - lz0) + .06 : q.x + q.y + .5 + q.z * .02, f: c2 => {
        if ((q.ty === 'L' && q.phi !== undefined) || (q.ty === 'C' && q.rot !== undefined)) {
          let N, rv; if (q.ty === 'L') { const ev = q.ev, sn = Math.sin(q.phi), cs = Math.cos(q.phi); N = [-ev[0] * sn, -ev[1] * sn, cs]; rv = [-ev[1], ev[0], 0]; } else { const sn = Math.sin(q.rot), cs = Math.cos(q.rot), cp = q.cp; N = [-cp[0] * sn, -cp[1] * sn, cs]; rv = [cp[0] * cs, cp[1] * cs, sn]; }
          const F = [q.dx, q.dy, q.dz], op = { up: N, r: rv };
          const at = (h, sd) => [q.x + N[0] * h + rv[0] * (sd || 0), q.y + N[1] * h + rv[1] * (sd || 0), q.z + N[2] * h + rv[2] * (sd || 0)];
          const b0 = at(.14); obox(c2, P, b0[0], b0[1], b0[2], F, .17, .12, .07, CAR[0], CAR[3], op);
          const b1 = at(.21); obox(c2, P, b1[0], b1[1], b1[2], F, .1, .115, .018, R.base[1], null, op);
          [-1, 1].forEach((s2, k) => { const gc = S.cols[(ci * 2 + k) % S.cols.length], bp = P(...at(.27, .055 * s2)), hp = P(...at(.34, .055 * s2)), ha = P(...at(.38, .055 * s2)), tp = P(...at(.55, .055 * s2 * 1.6));
            rect(c2, bp[0] - 2, bp[1] - 1, 4, 3, gc); rect(c2, hp[0] - 2, hp[1] - 2, 4, 4, R.skin[2]); rect(c2, ha[0] - 2, ha[1] - 1, 4, 2, HAIR[(ci + k) % HAIR.length]); pl(c2, hp[0], hp[1], tp[0], tp[1], R.skin[2], 1); });
          return;
        }
        const dn = q.dz < -.02, loop = q.ty === 'L', hl = Math.hypot(q.dx, q.dy) || 1, rr = [-q.dy / hl, q.dx / hl];
        const fx = q.dx / hl, fy = q.dy / hl;
        // Räder (dunkel, unter dem Wagenkasten)
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(w => { const p = P(q.x + fx * .12 * w[0] + rr[0] * .11 * w[1], q.y + fy * .12 * w[0] + rr[1] * .11 * w[1], cz - .01); rect(c2, p[0] - 1, p[1] - 1, 2, 2, R.base[0]); });
        obox(c2, P, q.x, q.y, cz + .06, [q.dx, q.dy, q.dz], .17, .12, .08, CAR[0], CAR[3]);
        obox(c2, P, q.x - q.dx / hl * .02, q.y - q.dy / hl * .02, cz + .15, [q.dx, q.dy, q.dz], .09, .08, .018, R.base[1], null);
        if (ci === 0) { obox(c2, P, q.x + fx * .22, q.y + fy * .22, cz + .03, [q.dx, q.dy, q.dz], .06, .08, .04, CAR[1], CAR[3]); const hlp = P(q.x + fx * .29, q.y + fy * .29, cz + .05); rect(c2, hlp[0] - 1, hlp[1] - 1, 2, 2, CAR[2]); }
        [-1, 1].forEach((s, k) => { const h = P(q.x + rr[0] * .055 * s, q.y + rr[1] * .055 * s, cz + .34); rider(c2, h[0], h[1], S.cols[(ci * 2 + k) % S.cols.length], HAIR[(ci + k) % HAIR.length], dn || loop, (ci * 2 + k) % 3 === 1); });
        // gelber Haltebügel vor den Fahrgästen
        const b0 = P(q.x + fx * .09 + rr[0] * .1, q.y + fy * .09 + rr[1] * .1, cz + .24), b1 = P(q.x + fx * .09 - rr[0] * .1, q.y + fy * .09 - rr[1] * .1, cz + .24); pl(c2, b0[0], b0[1], b1[0], b1[1], CAR[2], 1);
      } });
    });
    dyn.sort((a, b) => a.d - b.d); let di = 0;
    S.static.slabs.forEach(sl => { while (di < dyn.length && dyn[di].d < sl.d0) { dyn[di].f(c); di++; } c.drawImage(sl.cv, sl.x, sl.y); });
    while (di < dyn.length) { dyn[di].f(c); di++; }
    // Gäste-Reaktion: Sprechblase mit Pixel-Symbol über einem Wagen (S.react = {sym, ci} aus der Oberfläche)
    if (S.cars && S.react && S.react.sym) { const cs = S.cars[S.react.ci % S.cars.length], q = posAt(S.ridePath, cs), p = P(q.x, q.y, q.z), bob = Math.round(Math.sin(t * 8)); reactBubble(c, p[0] + 6, p[1] - 30 + bob, S.react.sym); boxes.push([p[0] - 10, p[1] - 44, 34, 30]); }
    if (theme === 'winter') for (let k = 0; k < 60; k++) { const px = (hsh(k, 3, 9) * L.W + t * (7 + (k % 5))) % L.W, py = (hsh(k, 5, 7) * L.H + t * (16 + (k % 7) * 2)) % L.H; rect(c, px, py, 2, 2, '#FFFFFF'); }
    if (S.ghost) {
      const gh = S.ghost, z = (gh.z0 + gh.z1) / 2, i = gh.i, j = gh.j, ok = gh.valid;
      const tiles = gh.i2 !== undefined ? [[i, j, 0], [gh.i2, gh.j2, 1]] : [[i, j]];
      tiles.forEach(tl => dither(c, [P(tl[0] + .06, tl[1] + .06, z), P(tl[0] + .94, tl[1] + .06, z), P(tl[0] + .94, tl[1] + .94, z), P(tl[0] + .06, tl[1] + .94, z)], ok ? (gh.stall ? '#FF9A3C' : '#FFE27A') : '#E25046'));
      const sm = [].concat(...tiles.map(tl => pieceSamples({ i: tl[0], j: tl[1], din: gh.din, dout: gh.dout, z0: gh.z0, z1: gh.z1, type: gh.type, half: tl[2] }))), col = ok ? '#FFFFFF' : '#FFD2CE';
      for (let k = 0; k < sm.length - 1; k++) { const p = P(sm[k][0], sm[k][1], sm[k][2] + .05), q = P(sm[k + 1][0], sm[k + 1][1], sm[k + 1][2] + .05); pl(c, p[0], p[1], q[0], q[1], col, 3); }
      const gc = P(i + .5, j + .5, 0), gt = P(i + .5, j + .5, z); for (let y = gt[1]; y < gc[1]; y += 3) rect(c, gc[0], y, 1, 1, '#FFFFFF');
      const m = P(i + .5, j + .5, z);
      if (!ok) { pl(c, m[0] - 6, m[1] - 6, m[0] + 6, m[1] + 6, '#FFFFFF', 3); pl(c, m[0] + 6, m[1] - 6, m[0] - 6, m[1] + 6, '#FFFFFF', 3); }
      else { const ei = gh.i2 !== undefined ? gh.i2 : i, ej = gh.i2 !== undefined ? gh.j2 : j, e = P(ei + .5 + DV[gh.dout][0] * .3, ej + .5 + DV[gh.dout][1] * .3, gh.z1 + .05); rect(c, e[0] - 2, e[1] - 2, 5, 5, '#FFFFFF'); }
      boxes.push([m[0] - 50, m[1] - 40, 100, 90]);
    }
    if (S.target && S.pulse && Math.sin(t * 7) > 0) { const e = S.target, pts = [P(e.i + .04, e.j + .04, 0), P(e.i + .96, e.j + .04, 0), P(e.i + .96, e.j + .96, 0), P(e.i + .04, e.j + .96, 0)]; for (let k = 0; k < 4; k++) { const p = pts[k], q = pts[(k + 1) % 4]; pl(c, p[0], p[1], q[0], q[1], '#FFFFFF', 2); } }
    boxes.forEach(b => { const x0 = Math.max(0, Math.round(b[0])), y0 = Math.max(0, Math.round(b[1])), x1 = Math.min(L.W, Math.round(b[0] + b[2])), y1 = Math.min(L.H, Math.round(b[1] + b[3])); if (x1 > x0 && y1 > y0) quantize(c, x1 - x0, y1 - y0, x0, y0); });
  }
  function tileCenter(L, i, j, z) { return proj(L)(i + .5, j + .5, z || 0); }

  function loadStation(json) { return Promise.all(Object.keys(json).map(k => new Promise(res => { const im = new Image(); im.onload = () => { const cv = MK(im.width, im.height); cv.getContext('2d').drawImage(im, 0, 0); json[k].cv = cv; res(); }; im.onerror = res; im.src = json[k].src; }))).then(() => json); }
  function setPalette(name) { R.grass = name === 'coast' ? R.cgrass : R0.grass; }
  const api = { setLK: v => { LK = v; }, setCK, setPalette, loadStation, layout, draw, makeStatic, quantize, makeBgArea, cloud, makeGround, makeDecor, buildPath, posAt, tileCenter, proj, GCOL, R, TW, TH, ZH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HBR = api;
})(typeof window !== 'undefined' ? window : globalThis);
