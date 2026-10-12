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
    C: { name: 'Korkenzieher', type: 'C', a: 3, u: 3, tempo: 0 }
  };
  const ORDER = ['G', 'L', 'R', 'A', 'B', 'P'];
  const FRIC = { G: .07, K: .09, A: .07, B: .07, L: .45, C: .25 };
  const D = { n: 8, lift: 3, zmax: 4, k0: 1.0, sr: 3, loopK: 2.6 };

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function newRun(level) {
    const n = level.n || D.n, lift = D.lift, st = level.station;
    const track = [{ i: st[0], j: st[1], z0: 0, z1: 0, din: 0, dout: 0, type: 'S' }];
    for (let s = 1; s <= lift; s++) track.push({ i: st[0] + s, j: st[1], z0: s - 1, z1: s, din: 0, dout: 0, type: 'T' });
    const ret = level.ret.map(r => ({ i: r[0], j: r[1], z0: 0, z1: 0, din: r[2], dout: r[3], type: r[2] === r[3] ? 'G' : 'K', ret: true }));
    const blocked = level.blocked.map(b => ({ i: b[0], j: b[1] })).concat(level.deco.map(b => ({ i: b[0], j: b[1] })), ret.map(r => ({ i: r.i, j: r.j })));
    return { level, n, lift, zmax: D.zmax, groups: level.groups.map(id => GROUPS[id]), inv: Object.assign({}, level.inv), blocked, ret, exit: { i: ret[0].i, j: ret[0].j, dir: ret[0].din }, track, hist: [],
      head: { i: st[0] + lift, j: st[1], z: lift, dir: 0, k: D.k0, turn: 0, last: null }, placed: 0, thrill: 0, nausea: 0, stall: null };
  }
  function occupied(run, i, j) { return run.track.some(p => p.i === i && p.j === j) || run.blocked.some(p => p.i === i && p.j === j); }

  function ghost(run, kind) {
    const K = KINDS[kind], h = run.head, n = run.n;
    const i = h.i + DV[h.dir][0], j = h.j + DV[h.dir][1];
    const dout = K.type === 'K' ? (h.dir + (K.turn > 0 ? 1 : 3)) % 4 : h.dir;
    const z1 = K.type === 'A' ? h.z + 1 : K.type === 'B' ? h.z - 1 : h.z;
    const g = { kind, i, j, din: h.dir, dout, z0: h.z, z1, type: K.type, turn: K.turn || 0, valid: true, reason: '' };
    const kExit = h.k - (z1 - h.z) - FRIC[K.type];
    if (run.stall) { g.valid = false; g.reason = 'Zug bleibt schon hängen'; }
    else if ((run.inv[kind] || 0) <= 0) { g.valid = false; g.reason = 'Keine mehr'; }
    else if (i < 0 || j < 0 || i >= n || j >= n) { g.valid = false; g.reason = 'Parkrand'; }
    else if (occupied(run, i, j)) { g.valid = false; g.reason = 'Belegt'; }
    else if (z1 < 0) { g.valid = false; g.reason = 'Schon am Boden'; }
    else if (z1 > run.zmax) { g.valid = false; g.reason = 'Zu hoch'; }
    else if (K.type === 'L' && h.k < D.loopK) { g.stall = true; g.stallF = .35; g.reason = 'Zu langsam - Zug bleibt hängen'; }
    else if (kExit < 0.2) { const loss = h.k - kExit; g.stall = true; g.stallF = Math.min(.9, Math.max(.1, (h.k - .2) / (loss || 1))); g.reason = 'Kein Schwung - Zug bleibt hängen'; }
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
      case 'C': t = 3 + v; n = 3.2 + .6 * v; break;
    }
    if (h.last && h.last !== g.type) t += .4;
    return { t, n, v, k: g.kExit };
  }
  function place(run, g) {
    const e = effect(run, g);
    run.hist.push({ head: Object.assign({}, run.head), thrill: run.thrill, nausea: run.nausea, kind: g.kind });
    run.inv[g.kind]--; run.thrill += e.t; run.nausea += e.n;
    run.track.push({ i: g.i, j: g.j, z0: g.z0, z1: g.z1, din: g.din, dout: g.dout, type: g.type, v: e.v, t: e.t, n: e.n, kIn: run.head.k, kOut: Math.max(g.kExit, .05) });
    if (g.stall) run.stall = { idx: run.track.length - 1, f: g.stallF, kind: g.kind };
    run.head = { i: g.i, j: g.j, z: g.z1, dir: g.dout, k: Math.max(g.kExit, .05), turn: g.type === 'K' ? g.turn : 0, last: g.type }; run.placed++;
  }
  function undo(run) {
    const h = run.hist.pop(); if (!h) return false;
    run.track.pop(); if (run.stall && run.stall.idx >= run.track.length) run.stall = null; run.head = h.head; run.thrill = h.thrill; run.nausea = h.nausea; run.inv[h.kind]++; run.placed--; return true;
  }
  function ready(run) { const h = run.head; return h.i + DV[h.dir][0] === run.exit.i && h.j + DV[h.dir][1] === run.exit.j && h.dir === run.exit.dir && h.z === 0; }
  function judge(run) {
    const T = run.thrill, Nn = run.nausea;
    const res = run.groups.map(gr => {
      const lo = gr.t[0], hi = gr.t[1]; let why = '';
      if (T < lo) why = 'Zu wenig Aufregung'; else if (T > hi) why = 'Zu viel Aufregung';
      if (Nn > gr.n) why = why ? why + ', zu viel Übelkeit' : 'Zu viel Übelkeit';
      const mid = T >= lo + (hi - lo) * .2 && T <= hi - (hi - lo) * .2 && Nn <= gr.n * .7 && why === '';
      return { id: gr.id, name: gr.name, col: gr.col, ok: why === '', mid: gr.t[1] >= 99 ? (why === '' && T >= lo * 1.1 && Nn <= gr.n * .7) : mid, why };
    });
    return { res, ready: ready(run), success: ready(run) && res.every(r => r.ok) && !run.stall, centered: res.every(r => r.mid) };
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
  function stateKey(r) { let h = 0; for (let i = 0; i < r.track.length; i++) { const p = r.track[i]; h ^= ZB[p.i * 10 + p.j]; } const v = r.inv; return r.head.i + ',' + r.head.j + ',' + r.head.z + ',' + r.head.dir + ',' + v.G + v.L + v.R + v.A + v.B + v.P + v.C + ',' + r.thrill.toFixed(1) + ',' + r.nausea.toFixed(1) + ',' + h; }
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
  const api = { solveFrom, hint, clone, DV, GROUPS, KINDS, ORDER, D, mulberry32, hash, newRun, ghost, effect, place, undo, ready, judge, stars, solve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HB = api;
})(typeof window !== 'undefined' ? window : globalThis);
