(function (root) {
  'use strict';
  // Ton komplett per WebAudio erzeugt: keine Aufnahmen, keine Dateien. Melodien sind eigene Kompositionen (Walzer, Galopp),
  // Stimmen (Schreien, Juchzen, Lachen) entstehen aus Sägezahn-Klang durch Vokal-Filter (Formanten).
  // attach(ctx, ziel) erlaubt auch das Rendern in einen OfflineAudioContext (Hörprobe).
  let C = null, OUT = null, MUS = null, BUS = null, SFX = null, NOISE = null, on = false, mode = null, next = 0, step = 0, timer = null, chainT = 0, lastVoice = 0;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // Noten als MIDI-Nummern: [Ton, Dauer in Schlägen]
  const N = { G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, Fs5: 78, G5: 79, A5: 81, B5: 83, C6: 84, D6: 86, E6: 88, G3: 55, D3: 50, C3: 48, F3: 53 };
  const CH = { G: [43, 59, 62, 67], D7: [38, 57, 60, 66], C: [36, 55, 60, 64], G7: [43, 59, 62, 65], F: [41, 57, 60, 65], Cg: [36, 55, 60, 64] };
  const n = (k, b) => [N[k], b];
  // Walzer (3/4) in G: A, A', B, A'
  const WA = [[n('B4', 1), n('D5', 1), n('G5', 1)], [n('B5', 2), n('A5', 1)], [n('A5', 2), n('Fs5', 1)], [n('D5', 3)], [n('C5', 1), n('D5', 1), n('Fs5', 1)], [n('A5', 2), n('G5', 1)], [n('G5', 1), n('Fs5', 1), n('G5', 1)], [n('B4', 3)]];
  const WA2 = [[n('B4', 1), n('D5', 1), n('G5', 1)], [n('B5', 2), n('D6', 1)], [n('E6', 2), n('C6', 1)], [n('G5', 3)], [n('B5', 1), n('A5', 1), n('G5', 1)], [n('A5', 1), n('Fs5', 1), n('D5', 1)], [n('G5', 1), n('D5', 1), n('B4', 1)], [n('G5', 3)]];
  const WB = [[n('E5', 1), n('G5', 1), n('C6', 1)], [n('E6', 2), n('D6', 1)], [n('D6', 1), n('B5', 1), n('G5', 1)], [n('D5', 3)], [n('C6', 1), n('A5', 1), n('Fs5', 1)], [n('D5', 1), n('Fs5', 1), n('A5', 1)], [n('G5', 2), n('Fs5', 1)], [n('G5', 3)]];
  const WAL = { beats: 3, bpm: 156, bars: [].concat(WA, WA2, WB, WA2), chords: ['G', 'G', 'D7', 'D7', 'D7', 'D7', 'G', 'G', 'G', 'G', 'C', 'C', 'G', 'D7', 'G', 'G', 'C', 'C', 'G', 'G', 'D7', 'D7', 'G', 'G', 'G', 'G', 'C', 'C', 'G', 'D7', 'G', 'G'] };
  // Galopp (2/4, Achtel) in C für die Fahrt
  const e = (k) => [N[k], .5];
  const GA = [[e('C5'), e('E5'), e('G5'), e('C6')], [e('B5'), e('G5'), e('D5'), e('F5')], [e('E5'), e('G5'), e('C6'), e('E6')], [e('D6'), e('B5'), e('G5'), e('B5')], [e('C6'), e('G5'), e('E5'), e('G5')], [e('A5'), e('F5'), e('C5'), e('F5')], [e('G5'), e('F5'), e('E5'), e('D5')], [e('C5'), [N.G4, .5], [N.C5, 1]]];
  const GB = [[e('E5'), e('E5'), e('G5'), e('E5')], [e('F5'), e('F5'), e('A5'), e('F5')], [e('G5'), e('A5'), e('B5'), e('C6')], [e('D6'), e('C6'), e('B5'), e('G5')], [e('E5'), e('G5'), e('C6'), e('G5')], [e('F5'), e('A5'), e('D6'), e('A5')], [e('G5'), e('B5'), e('D6'), e('B5')], [[N.C6, 1], [N.C5, 1]]];
  const GAL = { beats: 2, bpm: 132, bars: [].concat(GA, GB), chords: ['C', 'G7', 'C', 'G7', 'C', 'F', 'G7', 'C', 'C', 'F', 'G7', 'G7', 'C', 'F', 'G7', 'C'] };

  function attach(ctx, dest) {
    C = ctx; OUT = C.createGain(); OUT.gain.value = 1; OUT.connect(dest || C.destination);
    MUS = C.createGain(); MUS.gain.value = .22; MUS.connect(OUT); SFX = C.createGain(); SFX.gain.value = .55; SFX.connect(OUT);
    const len = C.sampleRate * 2, b = C.createBuffer(1, len, C.sampleRate), d = b.getChannelData(0); let s = 12345;
    for (let i = 0; i < len; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = s / 0x3fffffff - 1; } NOISE = b;
  }
  function env(g, t, a, d, peak, sus, rel, end) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.linearRampToValueAtTime(peak * sus, t + a + d); g.gain.setValueAtTime(peak * sus, end); g.gain.linearRampToValueAtTime(0, end + rel); }
  // Drehorgel-Ton: Rechteck + leise Oktave darüber, sanftes Vibrato, Tiefpass
  function organ(t, m, dur, vol, dest) {
    const f = mtof(m), g = C.createGain(), lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = .7; g.connect(lp); lp.connect(dest || BUS || MUS);
    const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = 5.5; lg.gain.value = f * .004; lfo.connect(lg);
    // eine Stimme ohne Verstimmung (vorher zwei leicht verstimmte Pfeifen = Schwebung, klang doppelt), Oktave darüber leise für den Orgelglanz
    [['square', f, .55, 0], ['triangle', f * 2, .18, 0]].forEach(o => { const os = C.createOscillator(), og = C.createGain(); os.type = o[0]; os.frequency.value = o[1]; og.gain.value = o[2]; lg.connect(os.frequency); os.connect(og); og.connect(g); os.start(t); os.stop(t + dur + .15); });
    lfo.start(t); lfo.stop(t + dur + .15); env(g, t, .01, .08, vol, .7, .08, t + dur * .92);
  }
  function bass(t, m, dur, vol) { const os = C.createOscillator(), g = C.createGain(); os.type = 'triangle'; os.frequency.value = mtof(m); os.connect(g); g.connect(BUS || MUS); env(g, t, .005, .1, vol, .5, .05, t + dur * .7); os.start(t); os.stop(t + dur + .1); }
  function chordHit(t, notes, dur, vol) { notes.forEach(m => { const os = C.createOscillator(), g = C.createGain(), lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; os.type = 'square'; os.frequency.value = mtof(m); os.connect(g); g.connect(lp); lp.connect(BUS || MUS); env(g, t, .005, .06, vol, .4, .04, t + dur * .5); os.start(t); os.stop(t + dur + .1); }); }
  function drum(t, low) { const s = C.createBufferSource(), g = C.createGain(), f = C.createBiquadFilter(); s.buffer = NOISE; f.type = low ? 'lowpass' : 'highpass'; f.frequency.value = low ? 180 : 5000; s.connect(f); f.connect(g); g.connect(BUS || MUS); env(g, t, .002, .05, low ? .8 : .18, .1, .03, t + .05); s.start(t, Math.random()); s.stop(t + .15); }
  // ein Takt eines Stücks ab Zeit t; Begleitung: Bass auf 1, Akkord auf den übrigen Schlägen (Walzer) bzw. Um-ta (Galopp)
  function bar(song, i, t) {
    const sp = 60 / song.bpm, b = song.bars[i % song.bars.length], ch = CH[song.chords[i % song.chords.length]];
    let x = 0; b.forEach(nt => { organ(t + x * sp, nt[0], nt[1] * sp, .32); x += nt[1]; });
    for (let k = 0; k < song.beats; k++) { const tt = t + k * sp; if (k === 0) { bass(tt, ch[0], sp, .55); drum(tt, true); } else { chordHit(tt, ch.slice(1), sp, .07); drum(tt, false); } if (song.beats === 2) { chordHit(tt + sp / 2, ch.slice(1), sp / 2, .06); } }
    return song.beats * sp;
  }
  function tick() { if (!C || !mode) return; const song = mode === 'ride' ? GAL : WAL; while (next < C.currentTime + .4) { next += bar(song, step++, next); } }
  // Stückwechsel: jedes Stück hat einen eigenen Kanal; der alte wird sofort ausgeblendet, damit bereits geplante Takte
  // nicht in das neue Stück hineinklingen (sonst liefen Walzer und Galopp kurz doppelt)
  function music(m) { if (m === mode) return; mode = m; step = 0; if (!C) return; next = C.currentTime + .15;
    if (BUS) { const old = BUS, t = C.currentTime; old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.linearRampToValueAtTime(0, t + .12); setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 400); }
    BUS = C.createGain(); BUS.gain.value = 1; BUS.connect(MUS); }
  // ---------- Geräusche ----------
  function noiseHit(t, type, f0, f1, dur, vol, q) { const s = C.createBufferSource(), fl = C.createBiquadFilter(), g = C.createGain(); s.buffer = NOISE; fl.type = type; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); s.connect(fl); fl.connect(g); g.connect(SFX); env(g, t, .005, dur * .3, vol, .5, dur * .5, t + dur * .5); s.start(t, Math.random()); s.stop(t + dur + .1); }
  function blip(t, f0, f1, dur, vol, type) { const os = C.createOscillator(), g = C.createGain(); os.type = type || 'square'; os.frequency.setValueAtTime(f0, t); os.frequency.exponentialRampToValueAtTime(f1, t + dur); os.connect(g); g.connect(SFX); env(g, t, .003, dur * .3, vol, .4, dur * .3, t + dur * .6); os.start(t); os.stop(t + dur + .05); }
  // Stimme: Sägezahn mit Tonhöhenverlauf durch Vokal-Formanten (a: 800/1200/2600 Hz, u: 350/800/2300 Hz), dazu etwas Hauch
  const VOW = { a: [800, 1200, 2600], u: [350, 800, 2300], i: [300, 2300, 3000], o: [500, 900, 2500] };
  function voice(t, pts, vow, vol, breath) {
    const os = C.createOscillator(), g = C.createGain(), mix = C.createGain(); os.type = 'sawtooth'; const dur = pts[pts.length - 1][0];
    os.frequency.setValueAtTime(pts[0][1], t); pts.slice(1).forEach(p => os.frequency.linearRampToValueAtTime(p[1], t + p[0]));
    const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = 6 + Math.random() * 2; lg.gain.value = pts[0][1] * .03; lfo.connect(lg); lg.connect(os.frequency); lfo.start(t); lfo.stop(t + dur + .1);
    os.connect(mix); if (breath) { const s = C.createBufferSource(), bg = C.createGain(); s.buffer = NOISE; bg.gain.value = breath; s.connect(bg); bg.connect(mix); s.start(t, Math.random()); s.stop(t + dur + .1); }
    VOW[vow].forEach((f, k) => { const bp = C.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = [6, 8, 10][k]; const fg = C.createGain(); fg.gain.value = [1, .6, .25][k]; mix.connect(bp); bp.connect(fg); fg.connect(g); });
    g.connect(SFX); env(g, t, .04, .1, vol, .85, dur * .25, t + dur * .75); os.start(t); os.stop(t + dur + .1);
  }
  function scream(t, n) { for (let k = 0; k < (n || 3); k++) { const f = 420 + Math.random() * 380, d = 1 + Math.random() * .6, o = Math.random() * .25; voice(t + o, [[0, f * .9], [.15, f * 1.35], [d * .7, f * 1.2], [d, f * .8]], Math.random() < .7 ? 'a' : 'i', .9, .15); } }
  function juchz(t) { const f = 380 + Math.random() * 200; voice(t, [[0, f], [.18, f * 1.1]], 'u', .8, .1); voice(t + .22, [[0, f * 1.2], [.25, f * 1.6], [.6, f * 1.3]], 'u', .9, .1); }
  function laugh(t) { const f = 230 + Math.random() * 140, nn = 4 + Math.floor(Math.random() * 3); for (let k = 0; k < nn; k++) { const tt = t + k * .17; noiseHit(tt, 'bandpass', 1500, 1200, .05, .25, 2); voice(tt + .03, [[0, f * (1.15 - k * .05)], [.1, f * (1.05 - k * .05)]], 'a', .7, .2); } }
  function cheer(t, stars) { for (let k = 0; k < 4 + stars * 2; k++) { const f = 300 + Math.random() * 500; voice(t + Math.random() * .4, [[0, f], [.2, f * 1.3], [.9, f * 1.1]], ['a', 'u', 'o'][k % 3], .45, .2); } for (let k = 0; k < 30; k++) noiseHit(t + Math.random() * 1.6, 'bandpass', 2500, 1800, .03, .25, 1.5); }
  const FX = {
    build: t => { noiseHit(t, 'lowpass', 900, 200, .12, .6); blip(t, 160, 70, .12, .4, 'triangle'); },
    undo: t => blip(t, 500, 180, .12, .25),
    click: t => blip(t, 1200, 900, .04, .15),
    chain: t => { noiseHit(t, 'highpass', 3000, 2500, .025, .35, 2); blip(t, 900, 700, .02, .12, 'square'); },
    splash: t => { noiseHit(t, 'lowpass', 4000, 300, .9, .9); noiseHit(t + .05, 'bandpass', 2500, 900, .6, .5, 1); },
    scream: t => scream(t, 3), juchz: t => juchz(t), laugh: t => laugh(t),
    stall: t => { voice(t, [[0, 300], [.3, 280], [.5, 300], [.9, 200]], 'o', .7, .1); noiseHit(t + .2, 'bandpass', 600, 300, .8, .3, 4); },
    fail: t => { [0, .35, .7].forEach((o, k) => organ(t + o, 64 - k, .3, .3, SFX)); organ(t + 1.05, 61, .9, .3, SFX); },
    win1: t => cheer(t, 1), win2: t => cheer(t, 2), win3: t => { cheer(t, 3); [72, 76, 79, 84].forEach((m, k) => organ(t + k * .12, m, .25, .3, SFX)); }
  };
  function sfx(name, delay) { if (!C || !on || !FX[name]) return; const t = C.currentTime + (delay || 0) + .01; if (/scream|juchz|laugh/.test(name)) { if (C.currentTime - lastVoice < 1.4) return; lastVoice = C.currentTime; } FX[name](t); }
  // Lifthill-Kette: regelmäßiges Klacken, solange chain(true) aufgerufen wird
  function chain(active) { if (!C || !on || !active) return; if (C.currentTime >= chainT) { FX.chain(C.currentTime + .01); chainT = C.currentTime + .14; } }
  function setOn(v) {
    on = !!v; if (on && !C) { const AC = root.AudioContext || root.webkitAudioContext; if (!AC) { on = false; return false; } attach(new AC()); timer = setInterval(tick, 100); const m = mode; mode = null; if (m) music(m); }
    if (C) { if (on) { C.resume && C.resume(); next = C.currentTime + .1; } else C.suspend && C.suspend(); } return on;
  }
  if (root.document) root.document.addEventListener('visibilitychange', () => { if (C && on) { if (root.document.hidden) C.suspend(); else C.resume(); } });
  // Hörprobe: Walzer, Galopp und alle Geräusche in einen OfflineAudioContext rendern
  function demo(ctx) { attach(ctx); on = true; let t = .2; for (let k = 0; k < 8; k++) t += bar(WAL, k, t); for (let k = 0; k < 8; k++) t += bar(GAL, k, t); t += .5;
    ['build', 'undo', 'chain', 'chain', 'chain', 'chain', 'scream', 'juchz', 'laugh', 'splash', 'stall', 'fail', 'win3'].forEach(nm => { FX[nm](t); t += nm === 'chain' ? .14 : nm === 'win3' ? 2.5 : 1.8; }); return t; }
  root.HBS = { setOn, isOn: () => on, music, sfx, chain, demo, attach, stats: () => ({ ctx: C ? C.state : 'none', mode, step }) };
})(typeof window !== 'undefined' ? window : globalThis);
