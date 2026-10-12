# Mini Coaster Kingdom

Isometrisches Pixel-Art-Puzzle (Stil RollerCoaster Tycoon), iPhone-Hochformat, 24 Level in 4 Kapiteln plus Zufallsmodus. Das Ergebnis ist eine einzelne HTML-Datei.

## Ordner
| Pfad | Inhalt |
|---|---|
| `hb4/logic.js` | Regeln, Physik (Looping braucht Schwung 2,6), Löser `solve`, Tipp-Löser `solveFrom`/`hint`, Hängenbleiben |
| `hb4/render.js` | Zeichnen, Looping, Wagen, Paletten |
| `hb4/ui.js`, `hb4/template.html` | Oberfläche, Menü, Level, Tipp-Knopf, Zufall; `template.html` ist das HTML-Gerüst mit Platzhaltern |
| `hb4/genb.js` | Zufallsgenerator im Browser |
| `hb4/gen2/3/4/5.js`, `layouts.js` | Erzeugen von Leveln und Vorrat (Node, einmalig) |
| `hb4/levels24.json`, `pool.json`, `level1.json` | Leveldaten, 54 Zufalls-Rückfallpuzzles |
| `hb4/station_*.json` | fertige Sprites der 4 Landschaften |
| `hb4/build.py` | setzt alles zu `hb4/dist/mini-coaster-kingdom.html` zusammen |
| `hb4/test*.js`, `stalltest.js` | Browser-Tests (Puppeteer) |
| `hb5/` | Sprite-Generatoren (unvollständig, siehe CLAUDE.md) |
| `icons/` | Icon-Skript und Original-PNG |

## Bauen und testen
```
npm install
cd hb4
python3 build.py        # erzeugt dist/mini-coaster-kingdom.html (153 KB)
node test3.js           # 6 Level per Tipp durchspielen
node stalltest.js       # Looping ohne Schwung
```
Zum Ansehen `hb4/dist/mini-coaster-kingdom.html` im Browser öffnen.

## Wie das Bauen funktioniert
`build.py` ersetzt in `template.html` die Platzhalter `/*LOGIC*/`, `/*GENB*/`, `/*RENDER*/`, `/*UI*/`, `/*LEVELS*/`, `/*POOL*/`, `/*STATIONS*/` und `<!--ICON-->` durch die Dateiinhalte. Spiel-Code gehört deshalb in `logic.js`, `render.js` oder `ui.js`, nicht in die fertige HTML. Eigener Code des Gerüsts (Schleife, Tipp-Knopf, Eingabe) steht am Ende von `template.html`.

## Testhook
Im Spiel gibt es `window.__hb` (Zustand, Tap-Flächen per ID, Level wählen). Die Browser-Tests tippen damit echte Knöpfe, ohne auf interne Variablen zuzugreifen.
