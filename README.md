# Mini Coaster Kingdom

Isometrisches Pixel-Art-Freizeitpark-Puzzle, iPhone-Hochformat, 24 Level in 4 Kapiteln plus Zufallsmodus. Das Ergebnis ist eine einzelne HTML-Datei.

## Ordner
| Pfad | Inhalt |
|---|---|
| `hb4/logic.js` | Regeln, Teile (inkl. Bremse, Booster, Splash, Korkenzieher), Physik (Looping braucht Schwung 2,6), Löser `solve`, Tipp-Löser `solveFrom`/`hint`, Hängenbleiben |
| `hb4/render.js` | Zeichnen, Looping, Wagen, Paletten |
| `hb4/ui.js`, `hb4/template.html` | Oberfläche, Menü, Level, Tipp-Knopf, Zufall; `template.html` ist das HTML-Gerüst mit Platzhaltern |
| `hb4/genb.js` | Zufallsgenerator im Browser |
| `hb4/gen2/3/4/5.js`, `layouts.js` | Erzeugen von Leveln und Vorrat (Node, einmalig) |
| `hb4/levels24.json`, `pool.json`, `level1.json` | Leveldaten, 54 Zufalls-Rückfallpuzzles |
| `hb4/station_*.json` | fertige Sprites der 4 Landschaften |
| `hb4/build.py` | setzt alles zu `index.html` zusammen |
| `hb4/test*.js`, `stalltest.js`, `phystest.js` | Tests (Browser per Puppeteer; `phystest.js` reines Node) |
| `hb4/teiletest.js`, `teile_test.json` | Testlevel und Browser-Test der neuen Teile (`python3 build.py teile`) |
| `hb4/varianz.js`, `varianz_test.json`, `vtest.js` | Varianz-Testvarianten, Vorschau mit `python3 build.py varianz` |
| `hb5/` | Sprite-Generatoren (unvollständig, siehe CLAUDE.md) |
| `icons/` | Icon-Skript und Original-PNG |

## Bauen und testen
```
npm install
cd hb4
python3 build.py        # erzeugt ../index.html (156 KB)
node phystest.js        # Physik + Lösbarkeit aller Level/Pool-Rätsel (ohne Browser)
node test3.js           # alle 24 Level im Browser durchspielen
node stalltest.js       # Looping ohne Schwung
```
Zum Ansehen `index.html` im Browser öffnen.

## Wie das Bauen funktioniert
`build.py` ersetzt in `template.html` die Platzhalter `/*LOGIC*/`, `/*GENB*/`, `/*RENDER*/`, `/*UI*/`, `/*LEVELS*/`, `/*POOL*/`, `/*STATIONS*/` und `<!--ICON-->` durch die Dateiinhalte. Spiel-Code gehört deshalb in `logic.js`, `render.js` oder `ui.js`, nicht in die fertige HTML. Eigener Code des Gerüsts (Schleife, Tipp-Knopf, Eingabe) steht am Ende von `template.html`.

## Testhook
Im Spiel gibt es `window.__hb` (Zustand, Tap-Flächen per ID, Level wählen). Die Browser-Tests tippen damit echte Knöpfe, ohne auf interne Variablen zuzugreifen.

## Rechtliches
- **Eigenständiges, nicht kommerzielles Hobbyprojekt.** Es steht in keiner Verbindung zu Herstellern, Verlagen oder Rechteinhabern anderer Spiele oder zu Freizeitparks. Genannte Namen von Fahrgeschäftstypen (Looping, Lifthill usw.) sind Gattungsbegriffe.
- **Eigene Inhalte.** Code, Pixelgrafiken, Icon und Leveldaten sind für dieses Projekt erstellt; Grafiken entstehen per Programmcode. Es werden keine fremden Bilder, Schriften, Klänge oder Bibliotheken ausgeliefert. Die Node-Pakete in `package.json` dienen nur zum Testen und sind nicht Teil des Spiels.
- **Musik und Geräusche** werden im Spiel per Programmcode erzeugt (eigene Kompositionen, synthetische Stimmen); es sind keine Aufnahmen oder Klangdateien enthalten.
- **Datenschutz.** Das Spiel lädt nichts nach, setzt keine Cookies, nutzt keine Analyse- oder Werbedienste und sendet keine Daten. Spielstand und Einstellungen liegen nur im Browser des Geräts (localStorage) und lassen sich über die Browser-Einstellungen löschen. Beim Hosten (z. B. GitHub Pages) verarbeitet der Hoster technisch nötige Zugriffsdaten wie IP-Adressen nach seinen eigenen Datenschutzbestimmungen.
- **Nutzungsrechte.** © 2026 Jan. Alle Rechte vorbehalten, solange keine Lizenzdatei etwas anderes erlaubt.
