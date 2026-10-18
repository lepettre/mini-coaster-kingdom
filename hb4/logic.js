(function (root) {
  'use strict';
  const DV = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const GROUPS = {
    kids: { id: 'kids', name: 'Kinder', t: [10, 24], n: 6, col: '#FF8FA3' },
    fam: { id: 'fam', name: 'Familien', t: [18, 34], n: 10, col: '#FFC93C' },
    teens: { id: 'teens', name: 'Teenager', t: [30, 99], n: 18, col: '#4CC3F0' },
    seniors: { id: 'seniors', name: 'Senioren', t: [6, 16], n: 3, col: '#9BCB3C' },
    fans: { id: 'fans', name: 'Thrill-Fans', t: [40, 99], n: 26, col: '#B58CF0' }
  };
  const KINDS = {
    G: { name: 'Gerade', type: 'G', a: 1, u: 0, tempo: 0 },
    L: { name: 'Links', type: 'K', turn: -1, a: 2, u: 2, tempo: 0 },
    R: { name: 'Rechts', type: 'K', turn: 1, a: 2, u: 2, tempo: 0 },
    A: { name: 'Anstieg', type: 'A', a: 0, u: 0, tempo: -1 },
    B: { name: 'Abfahrt', type: 'B', a: 3, u: 1, tempo: 1 },
    P: { name: 'Looping', type: 'L', a: 4, u: 3, tempo: 0 },
    C: { name: 'Korkenzieher', type: 'C', a: 3, u: 3, tempo: 0, len: 2 },
    H: { name: 'Bremse', type: 'H', a: 0, u: 0, tempo: -1 },
    V: { name: 'Booster', type: 'V', a: 2, u: 1, tempo: 1 },
    W: { name: 'Splash', type: 'W', a: 2, u: 0, tempo: -1 }
  };
  const ORDER = ['G', 'L', 'R', 'A', 'B', 'P', 'H', 'V', 'W', 'C'];
  const FRIC = { G: .07, K: .09, A: .07, B: .07, L: .45, C: .4, H: .07, V: .07, W: 1.2 };
  // corkK: Mindestschwung Korkenzieher; brakeMax: Bremse senkt Schwung höchstens darauf; boost: Booster gibt Schwung dazu (bis kMax)
  const D = { n: 8, lift: 3, zmax: 4, k0: 1.0, sr: 3, loopK: 2.6, corkK: 2.0, brakeMax: 1.2, boost: 1.5, kMax: 4 };

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function newRun(level) {
    const n = level.n || D.n, lift = D.lift, st = level.station;
    const track = [{ i: st[0], j: st[1], z0: 0, z1: 0, din: 0, dout: 0, type: 'S' }];
    for (let s = 1; s <= lift; s++) track.push({ i: st[0] + s, j: st[1], z0: s - 1, z1: s, din: 0, dout: 0, type: 'T' });
    const ret = level.ret.map(r => ({ i: r[0], j: r[1], z0: 0, z1: 0, din: r[2], dout: r[3], type: r[2] === r[3] ? 'G' : 'K', ret: true }));
    const blocked = level.blocked.map(b => ({ i: b[0], j: b[1] })).concat(level.deco.map(b => ({ i: b[0], j: b[1] })), ret.map(r => ({ i: r.i, j: r.j })));
    return { level, n, lift, zmax: D.zmax, groups: level.groups.map(id => GROUPS[id]), inv: Object.assign({}, level.inv), blocked, ret, exit: { i: ret[0].i, j: ret[0].j, dir: ret[0].din }, track, hist: [], pond: new Set(level.blocked.map(b => b[0] + ',' + b[1])), flags: (level.flags || []).map(f => ({ i: f[0], j: f[1] })),
      head: { i: st[0] + lift, j: st[1], z: lift, dir: 0, k: D.k0, turn: 0, last: null }, placed: 0, thrill: 0, nausea: 0, stall: null };
  }
  // Splash (W) darf auf Teichfelder, alles andere nicht
  function occupied(run, i, j, water) { return run.track.some(p => p.i === i && p.j === j) || run.blocked.some(p => p.i === i && p.j === j && !(water && run.pond && run.pond.has(i + ',' + j))); }

  // Kreuzung: eine flache Gerade darf rechtwinklig über oder unter genau eine andere flache Gerade, mit mindestens 2 Ebenen Abstand
  function crossOK(run, K, h, i, j, dir) {
    if (K.type !== 'G') return false;
    const here = run.track.filter(p => p.i === i && p.j === j).concat(run.ret.filter(p => p.i === i && p.j === j));
    if (here.length !== 1) return false; const o = here[0];
    if (o.type !== 'G' || o.z0 !== o.z1 || o.din % 2 === dir % 2 || Math.abs(o.z0 - h.z) < 2) return false;
    const isRet = run.ret.some(p => p.i === i && p.j === j);
    return !run.blocked.some(b => b.i === i && b.j === j) || isRet && run.blocked.filter(b => b.i === i && b.j === j).length === 1;
  }
  function ghost(run, kind) {
    const K = KINDS[kind], h = run.head, n = run.n;
    const i = h.i + DV[h.dir][0], j = h.j + DV[h.dir][1];
    const dout = K.type === 'K' ? (h.dir + (K.turn > 0 ? 1 : 3)) % 4 : h.dir;
    const z1 = K.type === 'A' ? h.z + 1 : K.type === 'B' ? h.z - 1 : h.z;
    const g = { kind, i, j, din: h.dir, dout, z0: h.z, z1, type: K.type, turn: K.turn || 0, valid: true, reason: '' };
    const kExit = K.type === 'H' ? Math.min(h.k - FRIC.H, D.brakeMax) : K.type === 'V' ? Math.min(D.kMax, h.k + D.boost) - FRIC.V : h.k - (z1 - h.z) - FRIC[K.type];
    const len = K.len || 1, i2 = i + DV[h.dir][0] * (len - 1), j2 = j + DV[h.dir][1] * (len - 1), out = (a, b) => a < 0 || b < 0 || a >= n || b >= n;
    if (len > 1) { g.i2 = i2; g.j2 = j2; }
    if (run.stall) { g.valid = false; g.reason = 'Zug steht schon'; }
    else if ((run.inv[kind] || 0) <= 0) { g.valid = false; g.reason = 'Keine mehr'; }
    else if (out(i, j) || out(i2, j2)) { g.valid = false; g.reason = 'Rand des Parks'; }
    else if ((occupied(run, i, j, K.type === 'W') && !(g.cross = crossOK(run, K, h, i, j, h.dir))) || (len > 1 && occupied(run, i2, j2))) { g.valid = false; g.reason = 'Feld belegt'; }
    else if (K.type === 'W' && !run.pond.has(i + ',' + j)) { g.valid = false; g.reason = 'Nur auf einem Teichfeld'; }
    else if (K.type === 'W' && h.z !== 0) { g.valid = false; g.reason = 'Nur am Boden'; }
    else if (z1 < 0) { g.valid = false; g.reason = 'Schon am Boden'; }
    else if (z1 > run.zmax) { g.valid = false; g.reason = 'Zu hoch'; }
    else if (K.type === 'L' && h.k < D.loopK) { g.stall = true; g.stallF = .35; g.reason = 'Zu wenig Schwung'; }
    else if (K.type === 'C' && h.k < D.corkK) { g.stall = true; g.stallF = .3; g.reason = 'Zu wenig Schwung'; }
    else if (kExit < 0.2) { const loss = h.k - kExit; g.stall = true; g.stallF = Math.min(.9, Math.max(.1, (h.k - .2) / (loss || 1))); g.reason = 'Zu wenig Schwung'; }
    g.kExit = kExit; return g;
  }
  function effect(run, g) {
    const h = run.head, kAvg = (h.k + g.kExit) / 2, v = Math.sqrt(Math.max(kAvg, 0.1)); let t = 0, n = 0;
    switch (g.type) {
      case 'G': t = 0.9 * v; break;
      case 'K': t = 1.5 * v; n = 1.1 * v; if (h.turn && h.turn === g.turn) { t += .5 * v; n += .9 * v; } break;
      case 'A': t = .3; break;
      case 'B': t = 1 + 1.8 * v; n = .4 * v; break;
      case 'L': t = 5 + 2 * v; n = 3 + .8 * v; break;
      case 'C': t = 4 + 1.2 * v; n = 3.5 + .6 * v; break;
      case 'H': t = .2; break;
      case 'V': t = 1 + .8 * v; n = .3 * v; break;
      case 'W': t = 2 + .5 * v; break;
    }
    if (h.last && h.last !== g.type) t += .4;
    if (g.cross) t += .6; // knapp über/unter der eigenen Strecke
    return { t, n, v, k: g.kExit };
  }
  function place(run, g) {
    const e = effect(run, g);
    const two = g.i2 !== undefined, kOut = Math.max(g.kExit, .05);
    run.hist.push({ head: Object.assign({}, run.head), thrill: run.thrill, nausea: run.nausea, kind: g.kind, cnt: two ? 2 : 1 });
    run.inv[g.kind]--; run.thrill += e.t; run.nausea += e.n;
    if (two) { // Zweifeld-Teil: zwei Einträge (half 0/1), Wirkung zählt einmal
      const km = (run.head.k + kOut) / 2;
      run.track.push({ i: g.i, j: g.j, z0: g.z0, z1: g.z0, din: g.din, dout: g.din, type: g.type, half: 0, v: e.v, t: e.t, n: e.n, kIn: run.head.k, kOut: km });
      run.track.push({ i: g.i2, j: g.j2, z0: g.z0, z1: g.z1, din: g.din, dout: g.dout, type: g.type, half: 1, v: e.v, t: 0, n: 0, kIn: km, kOut });
    } else run.track.push({ i: g.i, j: g.j, z0: g.z0, z1: g.z1, din: g.din, dout: g.dout, type: g.type, v: e.v, t: e.t, n: e.n, kIn: run.head.k, kOut , cross: !!g.cross });
    if (g.stall) run.stall = { idx: run.track.length - (two ? 2 : 1), f: g.stallF, kind: g.kind };
    run.head = { i: two ? g.i2 : g.i, j: two ? g.j2 : g.j, z: g.z1, dir: g.dout, k: kOut, turn: g.type === 'K' ? g.turn : 0, last: g.type }; run.placed++;
  }
  function undo(run) {
    const h = run.hist.pop(); if (!h) return false;
    for (let c = h.cnt || 1; c > 0; c--) run.track.pop(); if (run.stall && run.stall.idx >= run.track.length) run.stall = null; run.head = h.head; run.thrill = h.thrill; run.nausea = h.nausea; run.inv[h.kind]++; run.placed--; return true;
  }
  function ready(run) { const h = run.head; return h.i + DV[h.dir][0] === run.exit.i && h.j + DV[h.dir][1] === run.exit.j && h.dir === run.exit.dir && h.z === 0; }
  // Pflicht-Flaggen: jede Flaggen-Kachel muss von der gebauten Strecke befahren werden
  function flagsHit(run) { return (run.flags || []).filter(f => run.track.some(p => p.i === f.i && p.j === f.j)).length; }
  function judge(run) {
    const T = run.thrill, Nn = run.nausea;
    const res = run.groups.map(gr => {
      const lo = gr.t[0], hi = gr.t[1]; let why = '';
      if (T < lo) why = 'Zu wenig Aufregung'; else if (T > hi) why = 'Zu viel Aufregung';
      if (Nn > gr.n) why = 'Zu viel Übelkeit';
      const mid = T >= lo + (hi - lo) * .2 && T <= hi - (hi - lo) * .2 && Nn <= gr.n * .7 && why === '';
      return { id: gr.id, name: gr.name, col: gr.col, ok: why === '', mid: gr.t[1] >= 99 ? (why === '' && T >= lo * 1.1 && Nn <= gr.n * .7) : mid, why };
    });
    const fl = (run.flags || []).length, fh = flagsHit(run);
    return { res, ready: ready(run), success: ready(run) && res.every(r => r.ok) && !run.stall && fh === fl, centered: res.every(r => r.mid), flags: { n: fl, hit: fh } };
  }
  function stars(run, par) { const j = judge(run); if (!j.success) return 0; let s = 1; if (j.centered) s = 2; if (j.centered && run.placed <= par) s = 3; return s; }
  function clone(r) { return Object.assign({}, r, { track: r.track.slice(), head: Object.assign({}, r.head), inv: Object.assign({}, r.inv), hist: r.hist.slice() }); }

  function solve(level, cap, budget) {
    const root0 = newRun(level), seen = new Set(); let nodes = 0, sols = [];
    const key = r => r.head.i + ',' + r.head.j + ',' + r.head.z + ',' + r.head.dir + '|' + Object.keys(r.inv).map(k => r.inv[k]).join('') + '|' + r.thrill.toFixed(1) + '|' + r.nausea.toFixed(1) + '|' + r.track.map(p => p.i * 10 + p.j).sort().join(',');
    (function go(r) {
      if (sols.length >= cap || nodes > budget) return; nodes++;
      const k = key(r); if (seen.has(k)) return; seen.add(k);
      if (ready(r)) { const j = judge(r); if (j.success) sols.push({ placed: r.placed, centered: j.centered, seq: r.hist.map(h => h.kind).join('') + '' }); return; }
      for (const kind of ORDER) { if (!(r.inv[kind] > 0)) continue; const g = ghost(r, kind); if (!g.valid || g.stall) continue; const c = clone(r); place(c, g); go(c); }
    })(root0);
    return { sols, nodes };
  }

  // ---- Tipp: Suche ab beliebigem Spielstand ----
  const ZB = (function () { const r = mulberry32(12345), a = []; for (let i = 0; i < 100; i++) a.push(Math.floor(r() * 4294967296) >>> 0); return a; })();
  function stateKey(r) { let h = 0; for (let i = 0; i < r.track.length; i++) { const p = r.track[i]; h ^= ZB[p.i * 10 + p.j]; } const v = r.inv; return r.head.i + ',' + r.head.j + ',' + r.head.z + ',' + r.head.dir + ',' + v.G + v.L + v.R + v.A + v.B + v.P + v.C + v.H + v.V + v.W + ',' + r.thrill.toFixed(1) + ',' + r.nausea.toFixed(1) + ',' + h; }
  function solveFrom(run, budget, cap) {
    cap = cap || 3; const base = run.hist.length, seen = new Set(); let nodes = 0; const sols = [];
    (function go(r) {
      if (sols.length >= cap || nodes > budget) return; nodes++;
      const k = stateKey(r); if (seen.has(k)) return; seen.add(k);
      if (ready(r)) { const j = judge(r); if (j.success) sols.push({ placed: r.placed, centered: j.centered, seq: r.hist.slice(base).map(h => h.kind) }); return; }
      for (const kind of ORDER) { if (!(r.inv[kind] > 0)) continue; const g = ghost(r, kind); if (!g.valid || g.stall) continue; const c = clone(r); place(c, g); go(c); }
    })(clone(run));
    sols.sort((a, b) => (b.centered - a.centered) || (a.placed - b.placed));
    return { found: sols.length > 0, seq: sols.length ? sols[0].seq : null, nodes, out: sols.length === 0 && nodes > budget };
  }
  // Tipp: nächste Teile oder Sackgasse (back = so viele Teile zurück, danach geht es wieder)
  function hint(run, budget) {
    if (run.stall) { const c = clone(run); let b = 0; while (c.hist.length && c.stall) { undo(c); b++; } const r = hint(c, budget); return r.found ? { found: false, dead: true, back: b + r.back } : r; }
    const r = solveFrom(run, budget); if (r.found || r.out) return { found: r.found, out: r.out, seq: r.seq, back: 0 };
    const c = clone(run); let b = 0;
    while (c.hist.length && b < 14) { undo(c); b++; const q = solveFrom(c, Math.min(budget, 20000)); if (q.found) return { found: false, dead: true, back: b }; if (q.out) return { found: false, dead: true, back: -1 }; }
    return { found: false, dead: true, back: -1 };
  }
  const api = { flagsHit, solveFrom, hint, clone, DV, GROUPS, KINDS, ORDER, D, mulberry32, hash, newRun, ghost, effect, place, undo, ready, judge, stars, solve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HB = api;
})(typeof window !== 'undefined' ? window : globalThis);
