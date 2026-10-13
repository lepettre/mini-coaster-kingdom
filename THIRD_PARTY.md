# Fremde Komponenten und Lizenzen

## Im Spiel (`index.html`)

Keine. Das ausgelieferte Spiel enthält ausschließlich eigenen Code. Grafiken, Pixelschrift, Musik und Klänge werden zur Laufzeit per Programmcode erzeugt; es werden keine fremden Bibliotheken, Schriften, Bilder, Aufnahmen oder Klangdateien geladen oder eingebettet.

Genutzte Browser-Schnittstellen (Canvas 2D, Web Audio API, localStorage) sind Teil des Browsers und keine eingebundenen Komponenten.

## Nur zur Entwicklung und zum Testen

Diese Pakete stehen in `package.json`, werden per `npm install` lokal geladen und **nicht** mit dem Spiel verteilt (`node_modules/` ist vom Repository ausgeschlossen). Sie unterliegen ihren eigenen Lizenzen:

| Paket | Zweck | Lizenz | Quelle |
|---|---|---|---|
| `puppeteer-core` | Browser fernsteuern für automatische Tests und Bildschirmfotos | Apache License 2.0 | https://github.com/puppeteer/puppeteer |
| `@sparticuz/chromium` | kompakter Chromium-Browser für die Tests | MIT License (der mitgelieferte Chromium-Browser steht unter BSD-3-Clause und weiteren Open-Source-Lizenzen des Chromium-Projekts) | https://github.com/Sparticuz/chromium |
| `@napi-rs/canvas` | Canvas in Node für Grafik-Generatoren und Testbilder | MIT License | https://github.com/Brooooooklyn/canvas |

Die vollständigen Lizenztexte liegen nach `npm install` jeweils in `node_modules/<paket>/LICENSE` bzw. stehen in den verlinkten Repositories.

Die Build- und Hilfsskripte nutzen außerdem Python 3 (Python Software Foundation License) und Node.js (MIT License) mit ihren Standardbibliotheken.

## Musik

Die Musikstücke (Walzer, Galopp) sind eigene Kompositionen für dieses Projekt. Es werden keine fremden Melodien oder Aufnahmen verwendet.
