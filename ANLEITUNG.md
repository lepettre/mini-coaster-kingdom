# Anleitung: Projekt mit Claude Code weiterentwickeln

## 1. Übergabe (einmalig)
1. Auf github.com ein **privates** Repo `mini-coaster-kingdom` anlegen (im mobilen Browser: github.com/new).
2. Den **Inhalt** dieses Ordners hochladen (Add file → Upload files): `CLAUDE.md`, `README.md`, `package.json`, `.gitignore`, `hb4/`, `hb5/`, `icons/`. Wenn der Upload ganze Ordner nicht annimmt: ZIP in Claude Code hochladen bzw. entpacken lassen.
3. In Claude Code das Repo wählen und schreiben:
   > Lies CLAUDE.md. Führe `npm install` aus, baue mit `cd hb4 && python3 build.py` und lass `node test3.js` und `node stalltest.js` laufen. Sonst nichts ändern. Melde nur das Ergebnis.
4. Wenn beide Tests grün sind (zuletzt: 24 von 24 Level mit 3 Sternen, „errors none"), ist die Übergabe fertig.

## 2. Normale Weiterentwicklung
- **Eine Sitzung pro Funktion.** Neue Funktion = neue Sitzung; das hält den Verbrauch niedrig.
- **Erst Vorschlag, dann Auftrag.** Claude Code zeigt, was es ändern würde; du gibst frei, zum Beispiel „Varianz go". So steht es in `CLAUDE.md`.
- **Nach jeder Änderung** muss gebaut und getestet werden; Claude Code meldet erst danach.
- **Ergebnis ansehen:** `hb4/dist/mini-coaster-kingdom.html` im Browser öffnen oder per GitHub Pages hosten.
- **Committen** nach jeder abgeschlossenen Funktion.
- **`CLAUDE.md` pflegen:** Am Ende jeder Funktion Stand und „Geplant" aktualisieren lassen. Das ist das Gedächtnis zwischen den Sitzungen.

## 3. Veröffentlichen
Das claude.ai-Artifact (https://claude.ai/artifact/LT6HNUnGZuxQj8vzQJo9Ts) lässt sich nur aus claude.ai aktualisieren: einen Chat öffnen, `hb4/dist/mini-coaster-kingdom.html` anhängen und bitten, das Artifact damit zu ersetzen. Alternative ohne claude.ai: die Datei per GitHub Pages hosten.

## 4. Nächste sinnvolle Schritte (laut CLAUDE.md)
1. Varianz-Paket: Testvarianten liegen vor (`hb4/varianz_test.json`, Vorschau `python3 build.py varianz`); nach Freigabe Phase 2.
2. Korkenzieher, Kreuzungen.
3. Tagesrätsel.

## 5. Bekannte Einschränkungen
- `hb5/parts.js` fehlt, Sprites lassen sich nicht neu erzeugen. Für das Bauen ist das egal, für neue Landschaften oder Stationsänderungen nicht.
- `test1.js` und die Looping-/Themen-Skripte wurden nach der Pfad-Umstellung nicht neu geprüft.
- Die Browser-Tests laden Chromium über `@sparticuz/chromium`; das braucht Internet beim ersten `npm install`.
