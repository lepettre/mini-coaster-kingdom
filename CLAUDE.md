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
Quellstand = veröffentlichte Version (Tipp-Knopf, `window.__hb`-Testhook, Hinweistext-Fix enthalten). `python3 build.py` erzeugt byte-identisch die veröffentlichte Datei (geprüft am 2026-10-12).

## Befehle
- Einmalig: `npm install`
- Bauen: `cd hb4 && python3 build.py` → `hb4/dist/haengebahn.html`
- Tests (nach dem Bauen, in `hb4/`): `node test3.js` (6 Level per Tipp-Taps durchspielen), `node stalltest.js` (Looping ohne Schwung). Beide laufen. Screenshots landen in `hb4/out/`.
- Nach JEDER Änderung: bauen, dann Tests, dann erst melden.

## Bekannte Lücken
- `hb5/parts.js` fehlt (wird von `hb5/stations.js` gebraucht). Sprites daher nicht neu erzeugbar; fertige `hb4/station_*.json` genügen zum Bauen. Stationen ändern = JSON direkt bearbeiten oder parts.js neu schreiben.
- `levels.json` fehlt; nur `test1.js` und `gen3.js` (alt) brauchen sie.
- `test1.js`, `test2.js`, `themes.js`, `loopsheet.js`, `loopfour.js` nach der Pfad-Umstellung nicht neu geprüft.
- `hb4/icon-512.png` gibt es nicht mehr; `build.py` bettet nur das 180er-Icon ein (wie in der veröffentlichten Version).

## Geplant, noch NICHT gebaut (nur auf Auftrag)
Varianz-Paket: bisher nutzen alle 24 Level denselben Grundriss, Pflicht-Flaggen fehlen. Level 1-1 bis 1-3 bleiben unverändert, Level ab 1-4 würden fest in `levels24.json` stehen. Gewünschter Weg: fester Baukasten statt teurem Zufallswalk (Hindernis-Schablonen L, Zeile, Zickzack, Doppelteich; feste Flaggenplätze je Grundriss; Strecke bestehender Level als bekannte Lösung wiederverwenden; ein einziger Solver-Lauf prüft die Lösungszahl). Nur für neue Grundrisse P3 (lange Rückstrecke) und P4 (9×9) ein Walk mit kleinem Budget. Zufallsmodus (`genb.js`, `pool.json`) bleibt unverändert.
Vor der vollen Umsetzung zuerst 2–3 Testvarianten zur Durchsicht: (1) P3 mit L-Hindernis, (2) P4 9×9 mit einer Flagge, (3) bisheriger Grundriss mit zwei Flaggen und Doppelteich; jeweils Solver-Lösbarkeitsprüfung und Textansicht des Bretts.
Nur besprochen, nicht beschlossen: Kreuzungen, Korkenzieher C (in `logic.js` unter KINDS definiert, aber nicht in ORDER und nicht im Generator), Steilabfahrt, Turbo-Lift, Tunnel. Vorgeschlagene Reihenfolge: 9×9 → Korkenzieher → Kreuzungen.
Weitere offene Punkte: Tagesrätsel; vollständiger Durchspieltest aller 24 Level (bisher 6); Senioren als Gäste sind mit festem Aufbau nicht lösbar.

## Veröffentlichen
Die Datei `hb4/dist/haengebahn.html` ersetzt den Inhalt des claude.ai-Artifacts (https://claude.ai/artifact/LT6HNUnGZuxQj8vzQJo9Ts); das geht nur in claude.ai, nicht aus Claude Code. Alternative: GitHub Pages.

## Looping-Entscheidungen (nicht rückgängig machen)
Tropfenform, seitlicher Versatz 0,35, Folgeteil führt Spur zurück, Physik: Looping braucht Schwung 2,6; ohne Schwung rollt der Zug zurück, Fehlermeldung, Strecke weg. Stilwahl je Landschaft: Wiese Chalet (B1), Winter Märchenburg (A2), Wüste Westernstadt (D1), Küste Villa (C1). Icon C (Abendburg, Looping ohne Wagen, durchgehende Strecke).
