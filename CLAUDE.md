# Mini Coaster Kingdom – Übergabe an Claude Code

Puzzle-Spiel im Stil von RollerCoaster Tycoon (früher „Hängebahn“). Eine HTML-Datei, gebaut aus hb4/.
Bisher entwickelt in einem claude.ai-Projekt. Veröffentlichte Fassung: https://claude.ai/artifact/LT6HNUnGZuxQj8vzQJo9Ts
Ausführlicher Stand, Aufbau und Build-Befehle: siehe 01_README.md.

## Erste Aufgabe (einmalig)
1. Die Bündeldateien (*.txt) anhand der Zeilen „===== FILE: pfad =====“ … „===== END =====“ entpacken.
   Das Python-Snippet steht in 01_README.md. Ergebnis: hb4/, hb5/, icons/.
2. Fehlende Sprites (station_*.json) nach README neu erzeugen und die Tests laufen lassen.
3. Committen. Sonst nichts ändern.

## Arbeitsregeln (Jan)
- Deutsch und kurz antworten.
- Erst einen Vorschlag zeigen, dann bauen – nur nach ausdrücklichem Auftrag (z. B. „Varianz go“).
  Auf Fragen wie „wie lässt sich das verbessern?“ nur Vorschläge machen.
- Keine ungefragten Rückfragen der Art „Willst du X oder Y?“.
- Token sparen: gezielt lesen, Aufgaben bündeln, nichts unnötig neu erzeugen.
- Nichts erfinden: Annahmen als offene Frage kennzeichnen.
- Fehler per Testskript finden. Nach jeder Phase eine kurze Testliste mit 5 Punkten.

## Stand am 2026-10-12: Varianz-Paket (geplant, NICHTS gebaut)
Ziel: Die Level 1-4 bis Ende abwechslungsreicher machen. Level 1-1 bis 1-3 bleiben unverändert.
- **Grundrisse:** layouts.js anbinden. P3 = lange Südrückfahrt (8×8), P4 = 9×9, P2 = Nordost als Zwischenvariante. P5 (7×7) entfällt.
  Station und Rückstrecke sind bisher in allen Leveln gleich.
- **Pflicht-Flaggen:** neues Level-Feld flags:[[i,j],…]. Die Strecke muss jede Flagge befahren (Prüfung in judge, logic.js), dazu ein Fahnen-Sprite im Render.
  Ab Kapitel 2 eine Flagge, ab Kapitel 3 zwei, ab Kapitel 4 bis zu drei. Keine Flagge auf späteren Kreuzungszellen.
- **Hindernisse:** Schablonen statt nur eines Teich-Klecks – L-Form, Zeile, Zickzack, Doppelteich.
- **Gewünschter Weg, ein fester Baukasten:**
  - Die bekannte Lösungsstrecke bestehender Level wiederverwenden.
  - Flaggen auf diese Strecke setzen, Schablonen daneben.
  - Ein einziger Solver-Lauf prüft die Lösungszahl.
  - Den teuren Walk nur für die neuen Grundrisse P3 und P4 einsetzen.
  - Ergebnis fest in levels24.json. Den Zufallsmodus (genb.js, pool.json) nicht anfassen.
- **Zuerst nur 2–3 Testvarianten zur Durchsicht** (mit Solver-Check und Textansicht des Bretts):
  1. P3 mit L-Hindernis
  2. P4 (9×9) mit einer Flagge
  3. Bisheriger Grundriss mit zwei Flaggen und Doppelteich

  Erst nach Jans Freigabe die restlichen Level erzeugen.

## Nur theoretisch besprochen (nicht beschlossen)
- **Größere Karten:** Bis 9×9 unproblematisch. Darüber wird der Solver teuer, und die Felder werden am iPhone zu klein.
- **Kreuzungen:** Eine Gerade über oder unter einer queren Geraden, mit Höhenunterschied ≥ 2.
  Nötig wären Änderungen an occupied(), am Solver-Schlüssel (z/Richtung), an der Zeichenreihenfolge und den Stützen im Render sowie an maxSol.
- **Korkenzieher C:** In logic.js unter KINDS schon definiert, aber nicht in ORDER und nicht im Generator. Das ist die günstigste neue Bauteil-Erweiterung.
- **Weitere Bauteil-Ideen:** Steilabfahrt (z−2), Turbo-Lift (Schwung zugeben), Tunnel.
- **Vorgeschlagene Reihenfolge:** 9×9 → Korkenzieher → Kreuzungen.

## Veröffentlichen
Das claude.ai-Artefakt kann nur in claude.ai aktualisiert werden: dort die gebaute haengebahn.html hochladen.
Alternativ über GitHub Pages hosten.
