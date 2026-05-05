# Gross ICT — Webseite

Statische Webseite für **Gross ICT** (Stefan Gross, Zell LU) — gebaut mit Vanilla HTML / CSS / JS, plus einer
Remotion-Komposition für den Showcase-Einspieler im Hero.

## Stack

- **Frontend:** statisches HTML, CSS-Custom-Properties (Cream + warmes Graphit + Gold), reines JS
- **Showcase-Video:** [Remotion](https://remotion.dev/) v4 (siehe [`remotion-showcase/`](./remotion-showcase))
- **Server:** kein Build-Step — direkt ausliefern. Lokal mit z. B. `npx serve .`

## Seiten

- `index.html` — Startseite (Hero · Showcase-Video · Leistungen · USP · Prozess · CTA)
- `leistungen.html` — Detailbeschreibung der 7 Disziplinen
- `rechner.html` — Webseitenrechner mit Live-Pricing (Festpreis-Konfigurator)
- `support.html` — Helpdesk-Seite mit Quick-Connect-Code (TeamViewer) + SLA-Pakete + FAQ
- `referenzen.html` — abgeschlossene Projekte (Steinmann Melktechnik, Ackert Garten, Rollende Pizzeria)
- `ueber-uns.html`, `kontakt.html`, `impressum.html`, `datenschutz.html`

## Lokal entwickeln

```bash
npx serve .          # statisch ausliefern, Standardport 3000
# oder
npx serve -l 8765 .  # eigener Port
```

Dann öffnen: <http://localhost:8765/>

## Showcase-Video neu rendern

```bash
cd remotion-showcase
npm install                # einmalig
npm run studio             # interaktive Vorschau im Browser
npm run render             # rendert assets/showcase.mp4 (≈ 80 s, 9 MB)
npm run render:poster      # rendert assets/showcase-poster.jpg
```

Texte / Preise / Szenen ändern in [`remotion-showcase/src/Showcase.tsx`](./remotion-showcase/src/Showcase.tsx).

## Design-Tokens

Definiert in [`css/style.css`](./css/style.css) im `:root`-Block.

| Token | Wert | Einsatz |
|---|---|---|
| `--gold` | `#e6b24a` | Primärakzent |
| `--gold-deep` | `#c8943a` | Hover, Texthervorhebung |
| `--graphite` | `#2c2820` | „Dunkel" — warm, NICHT schwarz |
| `--cream` | `#f7efe5` | Standardhintergrund |
| `--cream-light` | `#fcf7f0` | Karten |
| `--cream-deep` | `#ede2d2` | abgesetzte Sektionen |

## Lizenz / Inhalte

Alle Texte, Logo, Referenzbilder: © Gross ICT, Stefan Gross.
