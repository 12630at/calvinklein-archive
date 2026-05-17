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

let skipSignal      = false;
let cancelCurrentSleep = null;
let introAudio      = null;

function playIntroAudio() {
    introAudio = new Audio('assets/calvinklein_intro.mp3');
    introAudio.play().catch(() => {});
}

function stopIntroAudio() {
    if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
        introAudio = null;
    }
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        if (skipSignal) { reject(new Error('skip')); return; }
        const id = setTimeout(resolve, ms);
        cancelCurrentSleep = () => { clearTimeout(id); reject(new Error('skip')); };
    });
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
    try {

    await sleep(1000);

    const skipBtn = document.getElementById('skip-intro');
    if (skipBtn) skipBtn.classList.add('flash-in');

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
    playIntroAudio();

    await sleep(3000);

    // Dissolvenza finale e chiusura dello stage
    stage.style.transition = `opacity ${FINAL_FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    stage.style.opacity = '0';

    await sleep(FINAL_FADE_MS);

    stopIntroAudio();
    stage.style.display = 'none';
    const menu = document.getElementById('menu');
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'all';
    } catch(e) { /* interrupted by skip — skipToLogo() takes over */ }
}

// ===== SKIP INTRO =====

async function skipToLogo() {
    const stage = document.getElementById('stage');
    const menu  = document.getElementById('menu');
    const skipBtn = document.getElementById('skip-intro');
    if (skipBtn) skipBtn.style.display = 'none';

    // Cross-fade: fade out current state
    stage.style.transition = 'opacity 350ms ease-out';
    stage.style.opacity    = '0';
    await new Promise(r => setTimeout(r, 380));

    // Clear text animation debris
    stage.innerHTML = '';

    // Build logo (identical to end of play())
    const finalLogo = document.createElement('img');
    finalLogo.src = 'assets/logo_thearchive.svg';
    finalLogo.style.cssText = [
        'position:absolute', 'left:50%', 'top:50%',
        'transform:translate(-50%,-50%)', 'width:320px',
        'max-width:80%', 'height:auto', 'opacity:0',
        'transition:opacity 1.2s ease-in-out'
    ].join(';');
    stage.appendChild(finalLogo);

    // Fade stage back in
    stage.style.transition = 'opacity 350ms ease-in';
    stage.style.opacity    = '1';
    await new Promise(r => setTimeout(r, 400));

    // Reveal logo
    finalLogo.style.opacity = '1';
    playIntroAudio();
    await new Promise(r => setTimeout(r, 2400));

    // Final fade out → show menu
    stage.style.transition = `opacity ${FINAL_FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    stage.style.opacity    = '0';
    await new Promise(r => setTimeout(r, FINAL_FADE_MS));

    stopIntroAudio();
    stage.style.display      = 'none';
    menu.style.opacity       = '1';
    menu.style.pointerEvents = 'all';
    // Reset so sleep() works normally for subsequent interactions
    skipSignal         = false;
    cancelCurrentSleep = null;
}

// ===== INIT & MENU INTERACTIONS =====

document.addEventListener('DOMContentLoaded', () => {

    document.fonts.ready.then(() => {
        play();
    });

    const skipBtn = document.getElementById('skip-intro');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (skipSignal) return;
            skipSignal = true;
            if (cancelCurrentSleep) cancelCurrentSleep();
            skipToLogo();
        });
    }

    const menu = document.getElementById('menu');
    const archive = document.getElementById('archive');

    archive.addEventListener('mouseenter', () => {
        menu.classList.add('hover-active');
    });

    // Remove hover-active when entering any other primary item (not archive)
    // so the submenu closes when the cursor moves to people/timeline/etc.
    // menu.mouseleave handles the case of leaving the menu entirely.
    document.querySelectorAll('.menu-primary .menu-item:not(#archive)').forEach(item => {
        item.addEventListener('mouseenter', () => {
            menu.classList.remove('hover-active');
        });
    });

    menu.addEventListener('mouseleave', () => {
        menu.classList.remove('hover-active');
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.id !== 'archive' && item.id !== 'people') {
            item.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }
    });

    const peopleEl = document.getElementById('people');

    // ===== PEOPLE CLICK — TRANSITION ANIMATION =====

    // 18 names at 20° spacing — chord 139 px at r=400, no text overlap
    const ORBIT_ENTRIES = [
        { name: 'Kate Moss',      deg:   0 },
        { name: 'Naomi Campbell', deg:  20 },
        { name: 'Cindy Crawford', deg:  40 },
        { name: 'Bruce Weber',    deg:  60 },
        { name: 'Steven Meisel',  deg:  80 },
        { name: 'Richard Avedon', deg: 100 },
        { name: 'Raf Simons',     deg: 120 },
        { name: 'Fabien Baron',   deg: 140 },
        { name: 'Mario Sorrenti', deg: 160 },
        { name: 'Justin Bieber',  deg: 180 },
        { name: 'Lara Stone',     deg: 200 },
        { name: 'Eva Mendes',     deg: 220 },
        { name: 'Patti Smith',    deg: 240 },
        { name: 'Mert & Marcus',  deg: 260 },
        { name: 'FKA Twigs',      deg: 280 },
        { name: 'Bella Hadid',    deg: 300 },
        { name: "A$AP Rocky",     deg: 320 },
        { name: 'Kendall Jenner', deg: 340 },
    ];

    const ORBIT_RADIUS    = 400;
    const ORBIT_SPEED_DPS = 144;
    const ORBIT_TURNS     = 3;
    const ORBIT_TOTAL_DEG = 360 * ORBIT_TURNS;
    const TRAIL_IN_DEG    = 8;
    const TRAIL_SPAN_DEG  = 80;  // ~4 names visible simultaneously at 20° spacing

    function buildOrbitSlots(orbitEl) {
        const toRad = d => d * Math.PI / 180;
        return ORBIT_ENTRIES.map(entry => {
            const r = toRad(entry.deg);
            const x = Math.round(Math.sin(r) * ORBIT_RADIUS);
            const y = Math.round(-Math.cos(r) * ORBIT_RADIUS);

            const slot = document.createElement('div');
            slot.className = 'orbit-slot';
            slot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

            const nameEl = document.createElement('span');
            nameEl.className = 'orbit-name';
            nameEl.textContent = entry.name.toUpperCase();
            nameEl.style.opacity = '0';
            nameEl.style.filter  = 'blur(4px)';

            slot.appendChild(nameEl);
            orbitEl.appendChild(slot);
            return nameEl;
        });
    }

    function runOrbitRotation(bottle, nameEls) {
        return new Promise(resolve => {
            let totalDeg  = 0;
            let prevTs    = null;
            // lastTrigger[i]: totalDeg when name i was last swept — init far past so age >> TRAIL_SPAN → opacity 0
            const lastTrigger = ORBIT_ENTRIES.map(() => -9999);
            const nextTrigger = ORBIT_ENTRIES.map(e => e.deg);

            function frame(ts) {
                if (prevTs === null) { prevTs = ts; requestAnimationFrame(frame); return; }

                const dt = Math.min((ts - prevTs) / 1000, 0.05);
                prevTs = ts;
                totalDeg += ORBIT_SPEED_DPS * dt;

                for (let i = 0; i < ORBIT_ENTRIES.length; i++) {
                    if (totalDeg >= nextTrigger[i]) {
                        lastTrigger[i] = nextTrigger[i];
                        nextTrigger[i] += 360;
                    }

                    // Trail curve: quick rise, linear fade
                    const age = totalDeg - lastTrigger[i];
                    let opacity;
                    if (age <= 0 || age >= TRAIL_SPAN_DEG) {
                        opacity = 0;
                    } else if (age < TRAIL_IN_DEG) {
                        opacity = age / TRAIL_IN_DEG;
                    } else {
                        opacity = 1 - (age - TRAIL_IN_DEG) / (TRAIL_SPAN_DEG - TRAIL_IN_DEG);
                    }
                    nameEls[i].style.opacity = opacity.toFixed(3);
                    nameEls[i].style.filter  = `blur(${((1 - opacity) * 3).toFixed(1)}px)`;
                }

                const displayDeg = totalDeg >= ORBIT_TOTAL_DEG ? 0 : totalDeg % 360;
                bottle.style.transform = `rotate(${displayDeg}deg)`;

                if (totalDeg < ORBIT_TOTAL_DEG) {
                    requestAnimationFrame(frame);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(frame);
        });
    }

    async function playPeopleTransition() {
        const peopleStage = document.getElementById('people-stage');
        const bottle      = document.getElementById('people-bottle');
        const orbitEl     = document.getElementById('people-orbit');
        const contentEl   = document.getElementById('people-content');

        peopleStage.removeAttribute('aria-hidden');
        peopleStage.style.display = 'block';
        void peopleStage.offsetWidth;
        peopleStage.style.opacity = '1';

        await sleep(500);
        bottle.style.opacity = '1';
        await sleep(600);

        const nameEls = buildOrbitSlots(orbitEl);

        // Drives rotation + trail opacity per frame; resolves at exactly 0° after ORBIT_TURNS rotations
        await runOrbitRotation(bottle, nameEls);

        // Trail has naturally faded; ensure all names are invisible before cleanup
        for (const el of nameEls) {
            el.style.opacity = '0';
            el.style.filter  = 'blur(4px)';
        }

        await sleep(300);

        bottle.style.transition = 'opacity 600ms ease-in-out';
        bottle.style.opacity    = '0';

        await sleep(700);

        orbitEl.querySelectorAll('.orbit-slot').forEach(s => s.remove());
        bottle.style.transform  = '';
        bottle.style.transition = '';
        bottle.style.opacity    = '0';

        contentEl.classList.add('visible');
    }

    async function closePeopleStage() {
        const peopleStage = document.getElementById('people-stage');
        const contentEl   = document.getElementById('people-content');

        contentEl.classList.remove('visible');
        await sleep(400);

        peopleStage.style.opacity = '0';
        await sleep(650);

        peopleStage.style.display = 'none';
        peopleStage.setAttribute('aria-hidden', 'true');
    }

    peopleEl.addEventListener('click', (e) => {
        e.preventDefault();
        playPeopleTransition();
    });

    document.getElementById('people-close').addEventListener('click', () => {
        closePeopleStage();
    });
});