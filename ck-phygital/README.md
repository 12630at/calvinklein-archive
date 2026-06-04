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
2. `camera.html` — **fotocamera di Instagram 1:1** (story/effetto AR). Inquadri il print
   sfocato e MindAR ci **sovrappone in AR**, ancorata al target, la versione nitida:
   il print si "trasforma" sul posto (nessuno shutter da premere).
3. Esce un popup **"Click to discover the archive"** dalla foto → tap → archivio
   (`../index.html?archive=1`).

## Nomenclatura asset

- Print/billboard reale (nitido):  `print_<nome>.jpg`  → es. `print_1999_ss_adv_print_jeans_001.jpg`
- Versione sfocata (target AR):    `blur_print_<nome>` → `.jpg` (immagine) + `.mind` (target)

## Come testare

- Aprire su **smartphone** (o GitHub Pages) — la camera richiede **https/localhost**.
- Stampare/mostrare a schermo `assets/blur_print_1999_ss_adv_print_jeans_001.jpg` e
  inquadrarlo: al riconoscimento la foto si rivela in AR + popup archivio.
- **Solo mobile:** la fotocamera parte unicamente da smartphone. Su desktop
  `camera.html` mostra un gate con un'**anteprima** della rivelazione.

## Asset

| File | Ruolo |
|---|---|
| `assets/blur_print_1999_ss_adv_print_jeans_001.jpg` | print **sfocato** — ciò che si stampa/inquadra |
| `assets/blur_print_1999_ss_adv_print_jeans_001.mind` | target MindAR (compilato dallo sfocato) |
| `assets/print_1999_ss_adv_print_jeans_001.jpg` | print **nitido** rivelato in AR |
| `assets/ck-logo.svg` · `fonts/Klein-*.woff2` | logo + font dal repo |
| `vendor/` | MindAR + Three.js **in locale** (niente CDN) |

## Ricompilare il target (solo se cambia il print)

Compilatore: https://hiukim.github.io/mind-ar-js-doc/tools/compile → caricare lo
**sfocato** → salvare il `.mind` come `blur_print_<nome>.mind`.

## Config

- `ARCHIVE_URL` (in alto nello `<script>` di `camera.html`) = `../index.html`:
  sullo stesso sito GitHub Pages punta alla home dell'archivio. Sostituire con un
  URL assoluto solo se l'archivio è hostato su un dominio diverso.

## Nota per il prof

Nella realtà il filtro vivrebbe come **AR filter nativo su Instagram**, distribuito
dal profilo `@calvinklein`. Qui è simulato 1:1 in web per il prototipo.
