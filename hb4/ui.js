(function (root) {
  'use strict';
  const U = 2; // 1 UI-Pixel = 2 Bildschirmpunkte
  const C = { ink: '#141B2A', face: '#B3C0D3', hi: '#F2F6FB', lo: '#4B5B74', title: '#2E4FA8', title2: '#213C86', inset: '#8A9BB6', btn: '#C9D3E2', btnP: '#9FB0C8', yel: '#F2C12E', red: '#C22A22', grn: '#3B8528', org: '#E07A1F', dis: '#7C8DA8', white: '#FFFFFF' };

  // ---- 5x7 Pixelschrift: [y0, Zeilen] ----
  const F = {};
  const def = (ch, y0, rows) => { F[ch] = { y0, rows: rows.split('/') }; };
  'A:.###./#...#/#...#/#####/#...#/#...#/#...#;B:####./#...#/#...#/####./#...#/#...#/####.;C:.###./#...#/#..../#..../#..../#...#/.###.;D:####./#...#/#...#/#...#/#...#/#...#/####.;E:#####/#..../#..../####./#..../#..../#####;F:#####/#..../#..../####./#..../#..../#....;G:.###./#...#/#..../#.###/#...#/#...#/.####;H:#...#/#...#/#...#/#####/#...#/#...#/#...#;I:.###./..#../..#../..#../..#../..#../.###.;J:..###/...#./...#./...#./...#./#..#./.##..;K:#...#/#..#./#.#../##.../#.#../#..#./#...#;L:#..../#..../#..../#..../#..../#..../#####;M:#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#;N:#...#/##..#/#.#.#/#..##/#...#/#...#/#...#;O:.###./#...#/#...#/#...#/#...#/#...#/.###.;P:####./#...#/#...#/####./#..../#..../#....;Q:.###./#...#/#...#/#...#/#.#.#/#..#./.##.#;R:####./#...#/#...#/####./#.#../#..#./#...#;S:.####/#..../#..../.###./....#/....#/####.;T:#####/..#../..#../..#../..#../..#../..#..;U:#...#/#...#/#...#/#...#/#...#/#...#/.###.;V:#...#/#...#/#...#/#...#/#...#/.#.#./..#..;W:#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#;X:#...#/#...#/.#.#./..#../.#.#./#...#/#...#;Y:#...#/#...#/.#.#./..#../..#../..#../..#..;Z:#####/....#/...#./..#../.#.../#..../#####'.split(';').forEach(s => def(s[0], 1, s.slice(2)));
  '0:.###./#...#/#..##/#.#.#/##..#/#...#/.###.;1:..#../.##../..#../..#../..#../..#../.###.;2:.###./#...#/....#/...#./..#../.#.../#####;3:####./....#/....#/.###./....#/....#/####.;4:...#./..##./.#.#./#..#./#####/...#./...#.;5:#####/#..../####./....#/....#/#...#/.###.;6:.###./#..../#..../####./#...#/#...#/.###.;7:#####/....#/...#./..#../.#.../.#.../.#...;8:.###./#...#/#...#/.###./#...#/#...#/.###.;9:.###./#...#/#...#/.####/....#/....#/.###.'.split(';').forEach(s => def(s[0], 1, s.slice(2)));
  'a:.###./....#/.####/#...#/.####;c:.###./#...#/#..../#...#/.###.;e:.###./#...#/#####/#..../.###.;m:##.#./#.#.#/#.#.#/#.#.#/#...#;n:####./#...#/#...#/#...#/#...#;o:.###./#...#/#...#/#...#/.###.;r:#.##./##..#/#..../#..../#....;s:.####/#..../.###./....#/####.;u:#...#/#...#/#...#/#..##/.##.#;v:#...#/#...#/#...#/.#.#./..#..;w:#...#/#...#/#.#.#/#.#.#/.#.#.;x:#...#/.#.#./..#../.#.#./#...#;z:#####/...#./..#../.#.../#####'.split(';').forEach(s => def(s[0], 3, s.slice(2)));
  'b:#..../#..../####./#...#/#...#/#...#/####.;d:....#/....#/.####/#...#/#...#/#...#/.####;f:..##./.#..#/.#.../###../.#.../.#.../.#...;h:#..../#..../#.##./##..#/#...#/#...#/#...#;k:#..../#..../#..#./#.#../##.../#.#../#..#.;l:.##../..#../..#../..#../..#../..#../.###.;t:.#.../.#.../####./.#.../.#.../.#..#/..##.;i:..#../...../.##../..#../..#../..#../.###.;j:...#./...../..##./...#./...#./#..#./.##..'.split(';').forEach(s => def(s[0], 1, s.slice(2)));
  'g:.####/#...#/#...#/#...#/.####/....#/.###.;p:####./#...#/#...#/#...#/####./#..../#....;q:.####/#...#/#...#/#...#/.####/....#/....#;y:#...#/#...#/#...#/.####/....#/#...#/.###.'.split(';').forEach(s => def(s[0], 3, s.slice(2)));
  def('.', 7, '..#..'); def(',', 7, '..#../.#...'); def(':', 3, '..#../...../...../..#..'); def('!', 1, '..#../..#../..#../..#../..#../...../..#..'); def('?', 1, '.###./#...#/....#/...#./..#../...../..#..');
  def('-', 4, '.###.'); def('+', 3, '..#../..#../#####/..#../..#..'); def('/', 1, '....#/....#/...#./..#../.#.../#..../#....'); def('%', 1, '##..#/##..#/...#./..#../.#.../#..##/#..##');
  def('(', 1, '...#./..#../.#.../.#.../.#.../..#../...#.'); def(')', 1, '.#.../..#../...#./...#./...#./..#../.#...'); def("'", 1, '..#../..#../.#...'); def('=', 3, '...../#####/...../#####'); def('*', 2, '.#.#./..#../#####/..#../.#.#.'); def('x', 3, '#...#/.#.#./..#../.#.#./#...#');
  def('↑', 1, '..#../.###./#.#.#/..#../..#../..#../..#..');
  const um = (ch, base, top) => { const b = F[base]; F[ch] = { y0: top, rows: ['.#.#.'].concat(Array(b.y0 - top - 1).fill('.....'), b.rows) }; };
  um('ä', 'a', 1); um('ö', 'o', 1); um('ü', 'u', 1); um('Ä', 'A', 0); um('Ö', 'O', 0); um('Ü', 'U', 0);
  F['ß'] = { y0: 1, rows: '.##../#..#./#.##./#..##/#...#/#...#/#.##.'.split('/') };
  F[' '] = { y0: 0, rows: [], adv: 4 };

  const tcache = {};
  function textCanvas(str, col, outline) {
    const key = str + '|' + col + '|' + (outline || ''); if (tcache[key]) return tcache[key];
    let w = 0; for (const ch of str) w += (F[ch] && F[ch].adv) || 6; const pad = outline ? 1 : 0;
    const cv = document.createElement('canvas'); cv.width = (w + pad * 2) * U; cv.height = (11 + pad * 2) * U; const g = cv.getContext('2d');
    const paint = (dx, dy, color) => { g.fillStyle = color; let x = pad + dx; for (const ch of str) { const gl = F[ch]; if (!gl) { x += 6; continue; } gl.rows.forEach((r, ry) => { for (let rx = 0; rx < r.length; rx++) if (r[rx] === '#') g.fillRect((x + rx) * U, (pad + dy + gl.y0 + ry) * U, U, U); }); x += gl.adv || 6; } };
    if (outline) [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(o => paint(o[0], o[1], outline));
    paint(0, 0, col); return tcache[key] = cv;
  }
  function textW(str) { let w = 0; for (const ch of str) w += (F[ch] && F[ch].adv) || 6; return w - 1; }

  function make(ctx) {
    const hits = []; let pressed = null;
    const fr = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x * U, y * U, w * U, h * U); };
    const px = (x, y, col) => fr(x, y, 1, 1, col);
    const line = (x0, y0, x1, y1, col) => { let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy, g = 0; for (;;) { px(x0, y0, col); if ((x0 === x1 && y0 === y1) || g++ > 300) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
    const text = (x, y, str, col, outline) => { const t = textCanvas(str, col || C.ink, outline); ctx.drawImage(t, (x - (outline ? 1 : 0)) * U, (y - (outline ? 1 : 0)) * U); };
    const bevel = (x, y, w, h, face, hi, lo) => { fr(x, y, w, h, C.ink); fr(x + 1, y + 1, w - 2, h - 2, face); fr(x + 1, y + 1, w - 2, 1, hi); fr(x + 1, y + 1, 1, h - 2, hi); fr(x + 1, y + h - 2, w - 2, 1, lo); fr(x + w - 2, y + 1, 1, h - 2, lo); };
    const win = (x, y, w, h, title) => { bevel(x, y, w, h, C.face, C.hi, C.lo); if (title) { fr(x + 2, y + 2, w - 4, 10, C.title); for (let i = 0; i < w - 4; i += 2) px(x + 2 + i, y + 11, C.title2), px(x + 3 + i, y + 10, C.title2); text(x + 4, y + 3, title, C.white); } };
    const inset = (x, y, w, h, col) => bevel(x, y, w, h, col || C.inset, C.lo, C.hi);
    function btn(id, x, y, w, h, o) {
      o = o || {}; const down = pressed === id && !o.disabled, sel = o.sel;
      bevel(x, y, w, h, down || sel ? C.btnP : C.btn, down || sel ? C.lo : C.hi, down || sel ? C.hi : C.lo);
      if (sel) { fr(x + 2, y + 2, w - 4, 1, C.yel); fr(x + 2, y + h - 3, w - 4, 1, C.yel); fr(x + 2, y + 2, 1, h - 4, C.yel); fr(x + w - 3, y + 2, 1, h - 4, C.yel); }
      if (o.draw) o.draw(x + (down ? 1 : 0), y + (down ? 1 : 0), w, h, !!o.disabled);
      if (o.disabled && o.dim) for (let yy = y + 1; yy < y + h - 1; yy++) for (let xx = x + 1 + (yy & 1); xx < x + w - 1; xx += 2) px(xx, yy, C.btn);
      if (!o.disabled && o.fn) hits.push({ id, x, y, w, h, fn: o.fn });
    }
    function begin() { hits.length = 0; }
    function press(ux, uy) { for (let i = hits.length - 1; i >= 0; i--) { const h = hits[i]; if (ux >= h.x && ux < h.x + h.w && uy >= h.y && uy < h.y + h.h) { pressed = h.id; return h; } } pressed = null; return null; }
    function release(ux, uy) { const id = pressed; pressed = null; if (!id) return; for (let i = hits.length - 1; i >= 0; i--) { const h = hits[i]; if (h.id === id && ux >= h.x && ux < h.x + h.w && uy >= h.y && uy < h.y + h.h) { h.fn(); return; } } }
    return { fr, px, line, text, bevel, win, inset, btn, begin, press, release, U, C, textW, hits };
  }
  const api = { make, textW, U, C };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HBUI = api;
})(typeof window !== 'undefined' ? window : globalThis);
