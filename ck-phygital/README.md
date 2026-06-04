# CK Archive — Phygital Prototype

Prototipo phygital Calvin Klein Archive (esame IUAD · UX/UI).
Un print d'archivio CK sfocato viene "svelato" da un filtro AR.

## Entry point (link unico)

Il repo ha **un solo URL** (`…/calvinklein-archive/` = root `index.html` = archivio).
La root smista per dispositivo:
- **Desktop** → apre direttamente l'**archivio**.
- **Mobile** → redirect a `ck-phygital/index.html` (esperienza phygital).
- Ritorno dal reveal: `?archive=1` evita il redirect e mostra l'archivio anche su mobile.

## Flusso (mobile)

1. `ck-phygital/index.html` — mock Instagram 1:1 (390×844). Post `@calvinklein` con il
   print sfocato e il CTA **"Prova il filtro →"** che apre la camera.
2. `camera.html` — Screen 2 (camera AR / MindAR) + Screen 3 (reveal animation) con
   CTA finale **"Scopri l'archivio"** → `../index.html?archive=1`.

## Come testare

- Aprire su **smartphone** (o GitHub Pages) — la camera richiede **https/localhost**.
- `camera.html` replica la **fotocamera di Instagram** (story/effetto AR): feed live
  via `getUserMedia`, con MindAR che gira sul video (`vendor/` locale, niente CDN).
- Inquadrare il print `assets/print_1999_ss_adv_print_jeans_001.jpg` (stampato o a
  schermo): al riconoscimento parte il reveal → CTA archivio.
- **Fallback sempre disponibile:** un tap sullo **shutter** avvia il reveal (utile in
  aula o se il riconoscimento è incerto).
- **Solo mobile:** la fotocamera parte unicamente da smartphone. Su desktop
  `camera.html` mostra un gate "apri da smartphone" con un'**anteprima reveal**.

## Asset

| File | Origine |
|---|---|
| `assets/print_1999_ss_adv_print_jeans_001.jpg` | print sfocato fornito (logo cK nitido) |
| `assets/print_1999_ss_adv_print_jeans_001.mind` | target MindAR **compilato** da quell'immagine |
| `assets/ck-revealed.webp` | `1999_ss_adv_print_jeans_001.webp` del repo (versione nitida) |
| `assets/ck-logo.svg` | `monogram_logo.svg` del repo |
| `fonts/Klein-*.woff2` | font Klein del repo |

## Ricompilare il target (solo se cambia il print)

Compilatore: https://hiukim.github.io/mind-ar-js-doc/tools/compile → caricare il `.jpg`
→ salvare il `.mind` con lo stesso nome del print. `camera.html` lo rileva da solo.

## Config

- `ARCHIVE_URL` (in alto nello `<script>` di `camera.html`) = `../index.html`:
  sullo stesso sito GitHub Pages punta alla home dell'archivio. Sostituire con un
  URL assoluto solo se l'archivio è hostato su un dominio diverso.

## Nota per il prof

Nella realtà il filtro vivrebbe come **AR filter nativo su Instagram**, distribuito
dal profilo `@calvinklein`. Qui è simulato 1:1 in web per il prototipo.
