# CK Archive — Phygital Prototype

Prototipo phygital Calvin Klein Archive (esame IUAD · UX/UI).
Un print d'archivio CK sfocato viene "svelato" da un filtro AR.

## Flusso

1. `index.html` — mock Instagram 1:1 (390×844). Post `@calvinklein` con il print
   sfocato e il CTA **"Prova il filtro →"** che apre la camera.
2. `camera.html` — Screen 2 (camera AR / MindAR) + Screen 3 (reveal animation) con
   CTA finale **"Scopri l'archivio"**.

## Come testare

- Aprire su **smartphone** o in DevTools mobile a **390px**.
- In `camera.html`, se il target AR non è ancora compilato, usare il pulsante
  **"▶ Simula riconoscimento"** per far partire il reveal (utile in aula / desktop).
- Dare i permessi camera al browser per vedere l'anteprima live.

## Asset

| File | Origine |
|---|---|
| `assets/ck-blurred.jpg` | print sfocato fornito (`blur_1999_ss_adv_print_jeans_001.png`), con logo cK nitido |
| `assets/ck-revealed.webp` | `1999_ss_adv_print_jeans_001.webp` del repo archivio (versione nitida) |
| `assets/ck-logo.svg` | `monogram_logo.svg` del repo |
| `fonts/Klein-*.woff2` | font Klein del repo |
| `assets/targets.mind` | **da compilare** (vedi sotto) — non incluso |

## Compilare il target MindAR (prima della presentazione)

1. Compilatore: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Caricare `assets/ck-blurred.jpg` (la stessa immagine del print stampato).
3. Scaricare il `.mind` e salvarlo come **`assets/targets.mind`**.
4. `camera.html` rileva da solo il file e passa alla modalità AR reale
   (evento `targetFound` → reveal). Senza file resta la modalità Demo.

## Da completare

- `ARCHIVE_URL` in `camera.html` (in alto nello `<script>`): URL finale
  dell'archivio CK (ora punta a `../index.html`).

## Nota per il prof

Nella realtà il filtro vivrebbe come **AR filter nativo su Instagram**, distribuito
dal profilo `@calvinklein`. Qui è simulato 1:1 in web per il prototipo.
