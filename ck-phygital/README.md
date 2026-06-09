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

1. `ck-phygital/index.html` — mock Instagram a pieno schermo. Post `@calvinklein` con il
   print sfocato e il CTA **"Prova il filtro →"** che apre la camera.
2. `camera.html` — **fotocamera di Instagram** (feed ad alta risoluzione). MindAR serve
   **solo a riconoscere** il print sfocato. Al riconoscimento parte un **flash high-key**:
   l'esposizione del feed sale gradualmente fino a bruciare l'ambiente in **bianco**.
3. Subito dopo l'esperienza si **stacca dal tracking** ed entra in un **mondo virtuale 360°
   bianco** (niente più jitter di MindAR): la foto, perfettamente planare e stabile, sta
   davanti all'utente e fa il **deblur** sfocato→nitido. Tutt'attorno, su una sfera,
   **fluttuano** decine di **campagne d'archivio** pescate **a caso** da `archive_index.csv`
   distribuite in modo **uniforme** sulla sfera (Fibonacci → niente sovrapposizioni),
   ridimensionate a 640px per la memoria mobile. Ci si guarda intorno **solo col
   giroscopio** (il permesso si chiede al tap iniziale di avvio, obbligatorio su iOS).
   **Tap su una campagna** → apre la sua **item view** nell'archivio
   (`../index.html?archive=1&item=<filename>`, gestito in `script.js`).
4. Dopo una breve attesa, dal **centro** della foto **emerge una CTA 3D estrusa nel font
   Klein** ("DISCOVER THE ARCHIVE", volume reale, senza sfondo) che avanza lungo Z verso
   l'utente → tap sulla CTA → archivio (`../index.html?archive=1`). Foto e CTA **fluttuano
   insieme**; anche le campagne fluttuano.

Su **desktop** il gate "▶ Anteprima" avvia lo stesso mondo 360° (senza camera) con una
lenta **auto-rotazione** per mostrarlo (il giroscopio non c'è su desktop).

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
| `assets/print_1999_ss_adv_print_jeans_001.jpg` | print **nitido** rivelato nel mondo 360 |
| `../archive_index.csv` · `../archive_dims.js` | sorgente delle campagne casuali che fluttuano nel 360 (caricati da `camera.html`) |
| `../assets/index/**` | immagini delle campagne nel mondo 360 (tap → item view dell'archivio) |
| `assets/ck-logo.svg` · `fonts/Klein-*.woff2` | logo + font dal repo |
| `vendor/` | MindAR + Three.js **in locale** (niente CDN) |
| `vendor/three-addons/{loaders/FontLoader.js,geometries/TextGeometry.js}` | testo 3D estruso della CTA (three r146, in locale) |
| `vendor/three-addons/fonts/klein.typeface.json` | font **Klein** in formato typeface (generato da `fonts/Klein-Medium.woff2` con fontTools) |

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
