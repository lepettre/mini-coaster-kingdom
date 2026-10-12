# Mini Coaster Kingdom (früher „Hängebahn")

Puzzle im Stil von RollerCoaster Tycoon: Strecke aus Bauteilen legen, Gäste fahren lassen. 24 feste Level in 4 Kapiteln plus Zufallsmodus. Wird aus `hb4/` zu EINER HTML-Datei gebaut. Besitzer: Jan. Details: README.md.

## Arbeitsregeln (immer einhalten)
- Deutsch, kurz.
- Erst Vorschlag zeigen, nach ausdrücklichem Auftrag bauen. Auf Fragen wie „wie lässt sich das verbessern?" nur Vorschläge machen, nichts umbauen.
- Keine ungefragten Rückfragen der Art „X oder Y?".
- Nichts erfinden; Annahmen als offene Frage kennzeichnen.
- Token sparen; Fehler per Testskript finden, nicht per Screenshot-Orgie.
- Nach jeder Phase: Ergebnis plus Testliste (5 Punkte).

## Stand
Seit 2026-10-12 weicht der Quellstand von der veröffentlichten Version ab (neue Physik, rote Oberfläche, Pflicht-Flaggen in der Logik). Die veröffentlichte Fassung entspricht Commit 217c641.
- **Physik:** Zug am Lifthill-Gipfel langsam (`D.k0` 1,0 statt 1,7). Er kommt nie über die Lifthill-Höhe; ein Anstieg geht nur mit Schwung aus einer Abfahrt und bremst. Folge: Level 1-2 hat ein Teichfeld weniger, 3-6 Par 15, 12 Pool-Rätsel ersetzt. Fahrtanimation: Tempo folgt dem Schwung stufenlos.
- **Oberfläche:** dunkles, mattes Rot wie RCT2 (`C` in `ui.js`); Text auf Fenstern hell (`C.txt`), `C.ink` nur für Rahmen und Text auf Gelb.
- **Pflicht-Flaggen:** Level-Feld `flags:[[i,j],…]`; `judge` verlangt jede Flagge (`flagsHit`), Render zeigt rot-weißen Wimpel (grün, wenn befahren), Statuszeile zählt mit. Noch in keinem festen Level genutzt.

## Befehle
- Einmalig: `npm install`
- Bauen: `cd hb4 && python3 build.py` → `hb4/dist/mini-coaster-kingdom.html`
- Tests (nach dem Bauen, in `hb4/`): `node phystest.js` (Physik + Lösbarkeit aller Level und Pool-Rätsel, ohne Browser, ~15 s), `node test3.js` (alle 24 Level im Browser, ~6 min; Teilmenge: `node test3.js 3 8`), `node stalltest.js` (Looping ohne Schwung), `node test2.js` (Menü + Zufallsmodus). Screenshots landen in `hb4/out/`.
- Varianz-Vorschau: `node varianz.js` → `varianz_test.json`; `python3 build.py varianz` → `dist/varianz-vorschau.html`; `node vtest.js` spielt sie durch.
- Nach JEDER Änderung: bauen, dann Tests, dann erst melden.

## Bekannte Lücken
- `hb5/parts.js` fehlt. `hb5/stations.js` ruft daraus 16 Funktionen auf (tower, cone, gableRoof2, dormer, stoneTex …), sie stehen nirgends sonst. Für das Spiel unnötig (fertige `hb4/station_*.json` genügen); nur zum Neuerzeugen der Stationen nötig. Stationen ändern = JSON direkt bearbeiten oder parts.js neu schreiben.
- `levels.json` fehlt; nur `test1.js` und `gen3.js` (alt) brauchen sie.
- `test1.js`, `themes.js`, `loopsheet.js`, `loopfour.js` nach der Pfad-Umstellung nicht neu geprüft (`test2.js` läuft).
- Level k1-4, k2-1, k2-4, k3-4, k4-4 haben identische Lösungsmengen (gleiche Strecke) – Kandidaten fürs Varianz-Paket.
- `hb4/icon-512.png` gibt es nicht mehr; `build.py` bettet nur das 180er-Icon ein (wie in der veröffentlichten Version).

## Geplant, noch NICHT gebaut (nur auf Auftrag)
Varianz-Paket: bisher nutzen alle 24 Level denselben Grundriss, Pflicht-Flaggen fehlen. Level 1-1 bis 1-3 bleiben unverändert, Level ab 1-4 würden fest in `levels24.json` stehen. Gewünschter Weg: fester Baukasten statt teurem Zufallswalk (Hindernis-Schablonen L, Zeile, Zickzack, Doppelteich; feste Flaggenplätze je Grundriss; Strecke bestehender Level als bekannte Lösung wiederverwenden; ein einziger Solver-Lauf prüft die Lösungszahl). Nur für neue Grundrisse P3 (lange Rückstrecke) und P4 (9×9) ein Walk mit kleinem Budget. Zufallsmodus (`genb.js`, `pool.json`) bleibt unverändert.
Phase 1 erledigt (2026-10-12): drei Testvarianten in `varianz_test.json` (V1 P3 + L-Hindernis, V2 P4 9×9 + Flagge + Zickzack, V3 P1 + zwei Flaggen + Doppelteich), alle mit 3 Sternen gespielt, ohne Flagge 0 Sterne. **Wartet auf Jans Freigabe**, erst dann Phase 2 (Level ab 1-4 neu in `levels24.json`).
Nur besprochen, nicht beschlossen: Kreuzungen, Korkenzieher C (in `logic.js` unter KINDS definiert, aber nicht in ORDER und nicht im Generator), Steilabfahrt, Turbo-Lift, Tunnel. Vorgeschlagene Reihenfolge: 9×9 → Korkenzieher → Kreuzungen.
Weitere offene Punkte: Tagesrätsel; Senioren als Gäste sind mit festem Aufbau nicht lösbar.

## Veröffentlichen
Die Datei `hb4/dist/mini-coaster-kingdom.html` ersetzt den Inhalt des claude.ai-Artifacts (https://claude.ai/artifact/LT6HNUnGZuxQj8vzQJo9Ts); das geht nur in claude.ai, nicht aus Claude Code. Alternative: GitHub Pages.

## Looping-Entscheidungen (nicht rückgängig machen)
Tropfenform, seitlicher Versatz 0,35, Folgeteil führt Spur zurück, Physik: Looping braucht Schwung 2,6; ohne Schwung rollt der Zug zurück, Fehlermeldung, Strecke weg. Stilwahl je Landschaft: Wiese Chalet (B1), Winter Märchenburg (A2), Wüste Westernstadt (D1), Küste Villa (C1). Icon C (Abendburg, Looping ohne Wagen, durchgehende Strecke).
