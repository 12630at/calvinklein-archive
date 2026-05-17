/* ============================================================
   KINETIC STAIRCASE TYPOGRAPHY + MENU INTERACTION
   Single Page App Integration - Sequential Narrative & Logo
   ============================================================ */

const TEXT_LINES = [
    "Questo archivio digitale nasce da una necessità visiva",
    "preservare l'estetica pura e radicale di Calvin Klein.",
    "Un viaggio attraverso decenni di minimalismo,",
    "campagne iconiche e visioni rivoluzionarie.",
    "Custodire con cura la memoria di un brand",
    "che ha ridefinito la nostra cultura contemporanea."
];

const FINAL_FADE_MS = 800;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function splitEntry(entry) {
    return entry.split(/\s+/).filter(Boolean);
}

let measureCtx = null;
let fontSize = 0;

function measure(text) {
    if (!measureCtx) {
        measureCtx = document.createElement('canvas').getContext('2d');
    }
    measureCtx.font = `350 ${fontSize}px Klein, sans-serif`;

    const upperText = text.toUpperCase();
    let width = measureCtx.measureText(upperText).width;

    const letterSpacing = window.innerWidth <= 600 ? -0.24 : -0.36;
    width += (upperText.length * letterSpacing);

    return width + 2;
}

function getViewport() {
    return { w: window.innerWidth, h: window.innerHeight };
}

function createSpan(p) {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = p.word;
    span.style.left = p.x + 'px';
    span.style.top = p.y + 'px';
    span.style.letterSpacing = window.innerWidth <= 600 ? '-0.02em' : '-0.04em';
    span.style.fontSize = `${fontSize}px`;
    return span;
}

let isPlaying = false;

async function play() {
    if (isPlaying) return;
    isPlaying = true;

    await sleep(1000);

    const stage = document.getElementById('stage');
    const viewport = getViewport();

    const lh = 1.6;

    // Calcola una dimensione del carattere leggibile che si adatti agli schermi
    fontSize = Math.max(14, Math.min(viewport.w * 0.025, 14));

    // Calcola l'altezza totale per centrare in blocco il paragrafo verticalmente
    let totalHeight = TEXT_LINES.length * (fontSize * lh);
    let currentY = (viewport.h - totalHeight) / 2;
    if (currentY < viewport.h * 0.05) currentY = viewport.h * 0.05;

    let previousSpans = [];

    for (let i = 0; i < TEXT_LINES.length; i++) {
        const line = TEXT_LINES[i];
        const words = splitEntry(line);
        const spaceW = measure(' ');

        let lineWidth = 0;
        const wordWidths = [];
        for (const word of words) {
            const w = measure(word.toUpperCase()); // Misuriamo sul maiuscolo come da stile
            wordWidths.push(w);
            lineWidth += w;
        }
        lineWidth += spaceW * (words.length - 1);

        // Centratura orizzontale perfetta per ciascun rigo
        let curX = (viewport.w - lineWidth) / 2;

        const placed = [];
        for (let j = 0; j < words.length; j++) {
            placed.push({ word: words[j].toUpperCase(), x: curX, y: currentY });
            curX += wordWidths[j] + spaceW;
        }

        const currentSpans = placed.map(createSpan);
        currentSpans.forEach(s => stage.appendChild(s));

        // Fade out della riga precedente
        if (previousSpans.length > 0) {
            for (let j = 0; j < previousSpans.length; j++) {
                previousSpans[j].classList.remove('flash-in');
                previousSpans[j].classList.add('flash-out');
            }
        }

        // Fade in parola per parola della riga corrente
        for (let j = 0; j < currentSpans.length; j++) {
            currentSpans[j].classList.add('flash-in');
            await sleep(35); // Entrata veloce
        }

        // Tempo di lettura del verso
        await sleep(1200);

        previousSpans = currentSpans;
        currentY += (fontSize * lh);
    }

    // Scomparsa dell'ultimo rigo
    if (previousSpans.length > 0) {
        for (let j = 0; j < previousSpans.length; j++) {
            previousSpans[j].classList.remove('flash-in');
            previousSpans[j].classList.add('flash-out');
        }
    }

    await sleep(600);

    // Apparizione del logo SVG finale
    const finalLogo = document.createElement('img');
    finalLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Calvin_klein_logo_web23.svg';
    finalLogo.style.position = 'absolute';
    finalLogo.style.left = '50%';
    finalLogo.style.top = '50%';
    finalLogo.style.transform = 'translate(-50%, -50%)';
    finalLogo.style.width = '320px';
    finalLogo.style.maxWidth = '80%';
    finalLogo.style.height = 'auto';
    finalLogo.style.opacity = '0';
    finalLogo.style.transition = 'opacity 1.5s ease-in-out';

    stage.appendChild(finalLogo);

    void finalLogo.offsetWidth;
    finalLogo.style.opacity = '1';

    await sleep(3000);

    // Dissolvenza finale e chiusura dello stage
    stage.style.transition = `opacity ${FINAL_FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    stage.style.opacity = '0';

    await sleep(FINAL_FADE_MS);

    stage.style.display = 'none';
    const menu = document.getElementById('menu');
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'all';
}

// ===== INIT & MENU INTERACTIONS =====

document.addEventListener('DOMContentLoaded', () => {

    document.fonts.ready.then(() => {
        play();
    });

    const menu = document.getElementById('menu');
    const archive = document.getElementById('archive');

    archive.addEventListener('mouseenter', () => {
        menu.classList.add('hover-active');
    });

    menu.addEventListener('mouseleave', () => {
        menu.classList.remove('hover-active');
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.id !== 'archive') {
            item.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }
    });
});