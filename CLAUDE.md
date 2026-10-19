# Projektnotizen

Isometrisches Achterbahn-Puzzle für den Browser. Quellen in `hb4/`, gebaut zu einer einzigen `index.html`. Spielbeschreibung: README.md.

## Regeln
- Deutsch, kurz. Erst Vorschlag, gebaut wird nach ausdrücklicher Freigabe. Keine ungefragten „X oder Y?“-Rückfragen. Annahmen als offen kennzeichnen.
- Nach jeder Änderung: bauen, testen, dann melden – mit Ergebnis und Testliste (5 Punkte).
- Keine Namen, Marken, Figuren oder Grafiken fremder Spiele, Parks oder Firmen in Code, Texten, Doku oder Commits. Grafik und Ton nur per Code, keine externen Dateien, keine Tracker; Spielstand nur in localStorage.
- Im Spiel „Level“, nicht „Rätsel“; keine Wörter mit „Jagd“. Englische Begriffe (Splash, Booster) sind in Ordnung.

## Befehle
- `npm install` (einmalig), bauen: `cd hb4 && python3 build.py` → `../index.html` (wird committet, GitHub Pages).
- Tests in `hb4/`: `phystest.js` (ohne Browser), `test3.js` (alle Level), `test2.js` (Menü, Zufall), `stalltest.js`, `teiletest.js` (vorher `python3 build.py teile`), `tipptest.js`, `rundetest.js`, `reaktiontest.js`, `kreuztest.js`, `abzeichentest.js`, `randtest.js`, `soundtest.js`, `musiktest.js`. Bildbögen: `figurtest.js`, `loopsicht.js`, `corksheet.js`. Ausgabe in `hb4/out/`.
- Level neu erzeugen: `node phase2.js k3-2`, danach `node addsols.js`.

## Aufbau
- `logic.js`: Teile (`KINDS`, `ORDER`), Physik (`D`, `FRIC`, `effect`), Löser, Tipp, Bewertung (`judge`, Flaggen), Kreuzung (`crossOK`, nur bei `level.cross`).
- `render.js`: Gelände, Strecke, Looping (Tiefe `LK`), Korkenzieher (`CK`, `drawCorkSeg`), Wagen (`CAR`, `rider`), Gäste (`guest`), Sprechblasen (`RSYM`).
- `template.html`: Oberfläche, Texte (`INFO`, `KURZ`), Icons (`pieceIcon`), Abzeichen (`BADGES`), Weiterfahrt (`lap`), Safe-Area (`#sa`).
- `sound.js` (WebAudio), `genb.js` (Zufallslevel), `levels24.json`, `pool.json` (Rückfall, alte Teile), `station_*.json` (fertige Stationsgrafik).

## Festgelegt
- Physik: Lifthill-Gipfel Schwung 1,0; Looping braucht 2,6, Korkenzieher 2,0; ohne Schwung rollt der Zug zurück.
- Looping: Tropfenform, seitlicher Versatz 0,35. Korkenzieher: Heartline Roll über zwei Felder.
- Stationen je Landschaft: Wiese B1, Winter A2, Wüste D1, Küste C1.
- Icons: breites Band ohne Querstriche, Pfeile für Anstieg/Abfahrt, Looping als Seitenansicht, Korkenzieher als Drehung um Mittelrohr. Schwellen auf der Strecke im Park bleiben.
- Wagen cremeweiß (nicht Streckenfarbe). Ergebnisfenster mittig. Köpfe folgen der Fahr-/Laufrichtung (`head`, face f/b/l/r): Schlange von hinten, Fahrgäste je nach Richtung.
- Texte: ganze Sätze, kein Slogan im Menü, „generiert“ statt „erzeugt“.
- Kreuzungen erst mit eigenen neuen Leveln freischalten (`cross:true`).
- Steuerung bleibt bis zu einem möglichen Handheld-Port unverändert.

## Offen
- iPhone: zusätzlicher Abstand oben (24 px bei Notch) auf echtem Gerät prüfen.
- Ideen: Level mit Kreuzung, Steilabfahrt, Tunnel, Level des Tages.
- Senioren-Gruppe ist mit den aktuellen Teilen nicht lösbar.
- `pool.json` hat keinen Generator mehr.

## Veröffentlichen
`index.html` über GitHub Pages oder als Inhalt des claude.ai-Artifacts (nur in claude.ai möglich).
