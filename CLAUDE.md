# Mini Coaster Kingdom (früher „Hängebahn")

Isometrisches Freizeitpark-Puzzle: Strecke aus Bauteilen legen, Gäste fahren lassen. 24 feste Level in 4 Kapiteln plus Zufallsmodus. Wird aus `hb4/` zu EINER HTML-Datei gebaut. Besitzer: Jan. Details: README.md.

## Arbeitsregeln (immer einhalten)
- Deutsch, kurz.
- Erst Vorschlag zeigen, nach ausdrücklichem Auftrag bauen. Auf Fragen wie „wie lässt sich das verbessern?" nur Vorschläge machen, nichts umbauen.
- Keine ungefragten Rückfragen der Art „X oder Y?".
- Nichts erfinden; Annahmen als offene Frage kennzeichnen.
- Token sparen; Fehler per Testskript finden, nicht per Screenshot-Orgie.
- Nach jeder Phase: Ergebnis plus Testliste (5 Punkte).
- Rechtlich sauber: keine Namen, Marken, Figuren oder Grafiken fremder Spiele, Parks oder Firmen in Code, Spieltexten, Doku oder Commit-Nachrichten. Alle Grafiken werden selbst per Code erzeugt. Keine Tracker, keine externen Dateien; der Spielstand bleibt im Browser (localStorage). Hinweise dazu: Menü-Fußzeile und Abschnitt „Rechtliches“ in README.md.

## Stand
Seit 2026-10-12 weicht der Quellstand von der veröffentlichten Version ab (neue Physik, rote Oberfläche, Pflicht-Flaggen in der Logik). Die veröffentlichte Fassung entspricht Commit 217c641.
- **Physik:** Zug am Lifthill-Gipfel langsam (`D.k0` 1,0 statt 1,7). Er kommt nie über die Lifthill-Höhe; ein Anstieg geht nur mit Schwung aus einer Abfahrt und bremst. Folge: Level 1-2 hat ein Teichfeld weniger, 3-6 Par 15, 12 Pool-Rätsel ersetzt. Fahrtanimation: Tempo folgt dem Schwung stufenlos.
- **Oberfläche:** dunkles, mattes Rot (`C` in `ui.js`); Text auf Fenstern hell (`C.txt`), `C.ink` nur für Rahmen und Text auf Gelb.
- **Neue Teile (gebaut 2026-10-12):** Bremse `H` (Schwung höchstens 1,2), Booster `V` (+1,5, max. 4), Splash `W` (nur auf Teichfeld am Boden, −1,2), Korkenzieher `C` über zwei Felder (braucht 2,0, kostet 0,4; zwei Track-Einträge `half` 0/1, Wirkung zählt einmal). Werte in `D`/`FRIC`/`effect` in `logic.js`. Baufenster zeigt nur Teile aus `level.inv` (max. 8, ab 7 vier Spalten). Seit Varianz Phase 2 in festen Leveln.
- **Korkenzieher-Form (Jan, 2026-10-13): H1 Heartline Roll.** `CK` in `render.js` (r 0,2, ohne Hügel, Mittelrohr, dunkle Unterseite kopfüber, Stützen nur aufrecht); eigener 3D-Zeichner `drawCorkSeg`. Entwürfe vergleichen: `node corksheet.js`.
- **Ziel-Tor** statt gelber Ziel-Fahne (kariertes Band über dem letzten Feld, Lampen grün bei geschlossenem Kreis), damit keine Verwechslung mit Pflicht-Flaggen.
- **Erklärungen:** Fenster „Neu in diesem Level“ beim ersten Auftreten von Looping, Bremse, Booster, Splash, Korkenzieher, Pflicht-Flagge (`saved.seen`); Hilfe mit Ziel-Tor/Flaggen und Knopf „Alle Teile“ (Übersicht). Texte in `INFO`/`KURZ` (`template.html`).
- **Spielstand-Version 2:** Sterne wurden einmalig zurückgesetzt (`saved.v`).
- **Besucher** bleiben auf dem gepflasterten Stationsplatz (Schlange Tor→Bahnsteig, Zuschauer am Rand).
- **Zufallsmodus** (`genb.js`) nutzt alle Teile, Grundrisse und Flaggen aus freigespielten Leveln (`randOpts`); Splash nur selten; Fallback weiter `pool.json`. Messen: `node zufalltest.js 24`.
- **Ton (2026-10-13):** `hb4/sound.js`, komplett per WebAudio erzeugt (keine Aufnahmen/Dateien): eigener Walzer (Bauen/Menü) und Galopp (Fahrt) als Drehorgel, Geräusche (Bauen, Zurück, Lifthill-Kette, Splash, Hängenbleiben, Jubel/Fanfare, Misserfolg), synthetische Stimmen (Schreien, Juchzen, Lachen über Vokal-Formanten). Ton-Knopf oben (aus beim ersten Start, `saved.snd`). Prüfen + Hörprobe: `node soundtest.js` → `out/hoerprobe.wav`. Gemeinfreie Melodien (z. B. „Über den Wellen“) nur mit Notenvorlage ergänzen, nicht aus dem Gedächtnis.
- **Pflicht-Flaggen:** Level-Feld `flags:[[i,j],…]`; `judge` verlangt jede Flagge (`flagsHit`), Render zeigt rot-weißen Wimpel (grün, wenn befahren), Statuszeile zählt mit.
- **Varianz Phase 2 (2026-10-12):** Level 1-4 bis 4-6 neu aus `phase2.js` (Plan-Tabelle `PLAN` je Level: Grundriss P1–P4, Gruppe, Pflicht-Teile, Hindernis, Flaggen, Länge). Kapitel 1 ohne Flaggen, Kap. 2: 1 Flagge + Bremse/Booster, Kap. 3: 2 Flaggen + Korkenzieher, Kap. 4: 2–3 Flaggen + Splash. Die Par-Lösung nutzt immer die neuen Teile des Levels. Überlappung der Musterlösungen 0,46 → 0,26, keine doppelten mehr. Ein Level neu erzeugen: `node phase2.js k3-2`, danach immer `node addsols.js`. Regeln: Par-Lösung nutzt die neuen Teile, mindestens 4 Drei-Sterne-Lösungen, keine Teilefolge doppelt. 3-1 (jetzt 22 Drei-Sterne-Lösungen) und 3-6 (5, Grundriss P1) am 2026-10-18 neu, weil zu eng.
- **Weiterfahrt nach Erfolg (2026-10-18):** Zug dreht nach erfolgreicher Fahrt im Hintergrund weiter Runden (`lap`), Ergebnisfenster dann unten über dem Baufenster; jeder Knopf beendet das. Test: `node rundetest.js`.
- **Gäste-Reaktionen (2026-10-18):** Sprechblase über einem Wagen je Teil (`reactNow` in `template.html`, Symbole `RSYM`/`reactBubble` in `render.js`): Staunen (Abfahrt mit Schwung, Booster, Looping/Korkenzieher doppelt), Lachen danach, nass (Splash), Durchatmen (Bremse), übel (Kurve bei > 70 % Übelkeitslimit), Herz in der Runde nach Erfolg. Test: `node reaktiontest.js`.
- **Figuren (2026-10-18):** `guest()` in `render.js` feiner: Augen, Haar mit Glanz, Hemd mit Schatten und Gürtel, schwingende Arme mit Händen, Hose (`PANTS`), Schuhe, manche mit Mütze (Variante `v`). Großaufnahme: `node figurtest.js` → `out/figuren.png`.
- **Tipp-Knopf:** nutzt zuerst die gespeicherten Drei-Sterne-Lösungen `sols` je Level (bis 30, aus `addsols.js`; Zufallsrätsel speichern ihre selbst): passt die bisherige Strecke, kommt das nächste Teil sofort. Sonst Suche mit Budget 400 000 (vorher 50 000, reichte für 6 Level nicht).

## Befehle
- Einmalig: `npm install`
- Bauen: `cd hb4 && python3 build.py` → `index.html` im Projektordner (wird mit committet, damit GitHub Pages sie ausliefern kann)
- Tests (nach dem Bauen, in `hb4/`): `node phystest.js` (Physik + Lösbarkeit aller Level und Pool-Rätsel, ohne Browser, ~15 s), `node test3.js` (alle 24 Level im Browser, ~6 min; Teilmenge: `node test3.js 3 8`), `node stalltest.js` (Looping ohne Schwung), `node test2.js` (Menü + Zufallsmodus), `node teiletest.js` (neue Teile bauen und befahren; vorher `python3 build.py teile`), `node soundtest.js` (Ton), `node musiktest.js` (nur ein Musikstück gleichzeitig), `node tipptest.js` (jedes Level nur per Tipp lösen, ~10 min), `node rundetest.js` (Weiterfahrt nach Erfolg), `node reaktiontest.js` (Gäste-Reaktionen). Screenshots landen in `hb4/out/`.
- Nach JEDER Änderung: bauen, dann Tests, dann erst melden.

## Bekannte Lücken
- Stationsgrafiken gibt es nur als fertige `hb4/station_*.json`; der alte Generator (`hb5/`, unvollständig) wurde am 2026-10-18 entfernt. Stationen ändern = JSON direkt bearbeiten.
- `pool.json` (Zufall-Rückfall) hat keinen Generator mehr (alte `gen*.js` am 2026-10-18 entfernt).
- Senioren sind nicht lösbar: jede Strecke braucht ≥ 2 Kurven und 3 Abfahrten, das übersteigt ihr Übelkeitslimit (3). Zwei Gruppen gleichzeitig (Kinder+Familien) fand der Generator nicht.
- Booster dürfen den Zug über die Lifthill-Höhe bringen (Energie von außen); `phystest.js` nimmt das aus.
- `hb4/icon-512.png` gibt es nicht mehr; `build.py` bettet nur das 180er-Icon ein (wie in der veröffentlichten Version).

## Geplant, noch NICHT gebaut (nur auf Auftrag)
Varianz-Paket ist umgesetzt. Steuerung bleibt unverändert bis zu einem möglichen Port auf eine Retro-Handheld-Konsole (nur recherchiert, nicht beschlossen).
Nur besprochen, nicht beschlossen: Kreuzungen, Steilabfahrt, Tunnel.
Weitere offene Punkte: Tagesrätsel; Senioren (siehe Bekannte Lücken); `pool.json` (Zufall-Fallback) enthält nur alte Teile.

## Veröffentlichen
Die Datei `index.html` ersetzt den Inhalt des claude.ai-Artifacts (https://claude.ai/artifact/LT6HNUnGZuxQj8vzQJo9Ts); das geht nur in claude.ai, nicht aus Claude Code. Alternative: GitHub Pages.

## Looping-Entscheidungen (nicht rückgängig machen)
Tropfenform, seitlicher Versatz 0,35, Folgeteil führt Spur zurück, Physik: Looping braucht Schwung 2,6; ohne Schwung rollt der Zug zurück, Fehlermeldung, Strecke weg. Stilwahl je Landschaft: Wiese Chalet (B1), Winter Märchenburg (A2), Wüste Westernstadt (D1), Küste Villa (C1). Icon C (Abendburg, Looping ohne Wagen, durchgehende Strecke).
