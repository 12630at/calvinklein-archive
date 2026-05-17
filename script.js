/* ============================================================
   KINETIC STAIRCASE TYPOGRAPHY + MENU INTERACTION
   Single Page App Integration - Sequential Narrative & Logo
   ============================================================ */

const TEXT_LINES = [
    "What began as a coat",
    "became a mirror",
    "of American desire",
    "Over five decades",
    "the body",
    "the moment",
    "the culture",
    "translated into image",
    "spare",
    "direct",
    "impossible to ignore",
    "Every campaign",
    "Every collection",
    "Every season",
    "Every name",
    "This is the archive"
];

const FINAL_FADE_MS = 1500;

// Configurazione semplice per gestire le velocità dell'animazione
const ANIM_CONFIG = {
    wordEntranceDelayMs: 250,     // Velocità con cui compaiono le singole parole di una frase
    lineReadDurationMs: 800,      // Tempo di permanenza della frase intera
    lineFadeOutDelayMs: 600,       // Ritardo (overlap): la vecchia frase resta visibile mentre entra la nuova
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function splitEntry(entry) {
    return entry.split(/\s+/).filter(Boolean);
}

let fontSize = 0;

function getViewport() {
    return { w: window.innerWidth, h: window.innerHeight };
}

let isPlaying = false;

async function play() {
    if (isPlaying) return;
    isPlaying = true;

    await sleep(1000);

    const stage = document.getElementById('stage');
    const viewport = getViewport();

    // Dimensione del testo come all'inizio
    fontSize = Math.max(14, Math.min(viewport.w * 0.025, 14));

    const lh = 1.6;

    // Creiamo il contenitore del paragrafo
    const p = document.createElement('p');
    p.style.position = 'absolute';
    p.style.left = '50%';
    // Allineando il fondo del paragrafo al centro dello schermo e spingendolo in giù
    // di mezza altezza-riga, l'ultima riga atterrerà ESATTAMENTE al centro verticale.
    p.style.bottom = '50%';
    p.style.transform = `translate(-50%, ${(fontSize * lh) / 2}px)`;
    p.style.width = '50%';
    p.style.maxWidth = '400px';
    p.style.textAlign = 'center'; // Questo garantisce l'allineamento orizzontale centrale
    p.style.margin = '0';
    p.style.lineHeight = lh;

    stage.appendChild(p);

    const allSentencesSpans = [];

    // Inseriamo tutte le parole nel paragrafo invisibile
    for (let i = 0; i < TEXT_LINES.length; i++) {
        const line = TEXT_LINES[i];
        const words = splitEntry(line);
        const sentenceSpans = [];

        // Forziamo l'ultima frase ad andare a capo da sola, per isolarla come vera "ultima riga"
        if (i === TEXT_LINES.length - 1) {
            p.appendChild(document.createElement('br'));
        }

        for (let j = 0; j < words.length; j++) {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = words[j].toUpperCase();
            span.style.fontSize = `${fontSize}px`;
            span.style.letterSpacing = window.innerWidth <= 600 ? '-0.02em' : '-0.04em';

            // --- 2000s SOFT TEXT AESTHETIC INTEGRATION ---
            span.style.color = 'rgba(40, 40, 40, 0.85)';
            span.style.textShadow = '0px 0px 1px rgba(40, 40, 40, 0.3)';
            span.style.WebkitFontSmoothing = 'antialiased';
            span.style.MozOsxFontSmoothing = 'grayscale';
            // ---------------------------------------------

            p.appendChild(span);
            // Spazio testuale
            p.appendChild(document.createTextNode(' '));

            sentenceSpans.push(span);
        }
        allSentencesSpans.push(sentenceSpans);
    }

    let previousSentenceSpans = null;

    // Animazione per singola frase
    for (let i = 0; i < allSentencesSpans.length; i++) {
        const currentSentenceSpans = allSentencesSpans[i];

        // Fade out della frase precedente con ritardo (overlap)
        if (previousSentenceSpans) {
            const spansToFade = previousSentenceSpans;
            setTimeout(() => {
                for (let span of spansToFade) {
                    span.classList.remove('flash-in');
                    span.classList.add('flash-out');
                }
            }, ANIM_CONFIG.lineFadeOutDelayMs);
        }

        // L'animazione in entrata avviene però su singola parola, una dopo l'altra
        for (let j = 0; j < currentSentenceSpans.length; j++) {
            currentSentenceSpans[j].classList.add('flash-in');
            await sleep(ANIM_CONFIG.wordEntranceDelayMs);
        }

        // Intervallo di lettura dell'intera frase
        await sleep(ANIM_CONFIG.lineReadDurationMs);

        previousSentenceSpans = currentSentenceSpans;
    }

    // Scomparsa dell'ultima frase
    if (previousSentenceSpans) {
        for (let span of previousSentenceSpans) {
            span.classList.remove('flash-in');
            span.classList.add('flash-out');
        }
    }

    await sleep(900);
    p.remove();

    // Apparizione del logo SVG finale
    const finalLogo = document.createElement('img');
    finalLogo.src = 'assets/logo_thearchive.svg';
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

    // ===== PEOPLE HOVER — FALLING NAMES =====
    const PEOPLE_NAMES = [
        'Kate Moss', 'Brooke Shields', 'Mark Wahlberg', 'Christy Turlington',
        'Bruce Weber', 'Steven Meisel', 'Richard Avedon', 'Fabien Baron',
        'Raf Simons', 'Francisco Costa', 'Italo Zucchelli', 'Zack McCollum',
        'Justin Bieber', 'Lara Stone', 'Eva Mendes', 'Jamie Dornan',
        'Tyrone Lebon', 'Willy Vanderperre', 'Mert & Marcus', 'Patti Smith',
        'Pharrell Williams', 'FKA Twigs', 'Solange', 'Bella Hadid',
        'Kendall Jenner', 'A$AP Rocky', 'Jeremy Allen White', 'Jung Kook'
    ];

    const peopleEl = document.getElementById('people');
    const fallLayer = document.getElementById('people-fall');
    const GRAVITY = 1500;
    const SPAWN_INTERVAL_MS = 80;
    const FADE_DISTANCE = 600;
    let spawnTimer = null;
    let activeParticles = [];
    let rafId = null;
    let lastTs = 0;

    function spawnName(name) {
        const el = document.createElement('span');
        el.className = 'falling-name';
        el.textContent = name;
        fallLayer.appendChild(el);

        const rect = peopleEl.getBoundingClientRect();
        const startX = rect.left + Math.random() * rect.width;
        const startY = rect.bottom;
        el.style.left = '0px';
        el.style.top = '0px';

        activeParticles.push({
            el,
            x: startX,
            y: startY,
            vy: 50 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 40,
            startY
        });
    }

    function tick(ts) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;

        const viewportH = window.innerHeight;
        for (let i = activeParticles.length - 1; i >= 0; i--) {
            const p = activeParticles[i];
            p.vy += GRAVITY * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            const fallen = p.y - p.startY;
            const opacity = Math.max(0, 1 - fallen / FADE_DISTANCE);
            p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
            p.el.style.opacity = opacity.toFixed(3);
            if (opacity <= 0 || p.y > viewportH + 50) {
                p.el.remove();
                activeParticles.splice(i, 1);
            }
        }

        if (activeParticles.length > 0 || spawnTimer) {
            rafId = requestAnimationFrame(tick);
        } else {
            rafId = null;
            lastTs = 0;
        }
    }

    function startCascade() {
        if (spawnTimer) return;
        let i = 0;
        spawnName(PEOPLE_NAMES[i++ % PEOPLE_NAMES.length]);
        spawnTimer = setInterval(() => {
            spawnName(PEOPLE_NAMES[i++ % PEOPLE_NAMES.length]);
        }, SPAWN_INTERVAL_MS);
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function stopCascade() {
        if (spawnTimer) {
            clearInterval(spawnTimer);
            spawnTimer = null;
        }
    }

    peopleEl.addEventListener('mouseenter', startCascade);
    peopleEl.addEventListener('mouseleave', stopCascade);
});