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

// ===== SEARCH DATA — all searchable content on the site =====
const SEARCH_DATA = [
    // People section
    { text: 'Kate Moss',          type: 'people' },
    { text: 'Brooke Shields',     type: 'people' },
    { text: 'Mark Wahlberg',      type: 'people' },
    { text: 'Christy Turlington', type: 'people' },
    { text: 'Eva Mendes',         type: 'people' },
    { text: 'Lara Stone',         type: 'people' },
    { text: 'Bella Hadid',        type: 'people' },
    { text: 'Kendall Jenner',     type: 'people' },
    { text: 'FKA Twigs',          type: 'people' },
    { text: 'Solange',            type: 'people' },
    { text: 'Patti Smith',        type: 'people' },
    { text: 'Jung Kook',          type: 'people' },
    { text: 'Jeremy Allen White', type: 'people' },
    { text: 'Justin Bieber',      type: 'people' },
    { text: 'Bruce Weber',        type: 'people' },
    { text: 'Steven Meisel',      type: 'people' },
    { text: 'Richard Avedon',     type: 'people' },
    { text: 'Fabien Baron',       type: 'people' },
    { text: 'Tyrone Lebon',       type: 'people' },
    { text: 'Willy Vanderperre',  type: 'people' },
    { text: 'Mert & Marcus',      type: 'people' },
    { text: 'Raf Simons',         type: 'people' },
    { text: 'Francisco Costa',    type: 'people' },
    { text: 'Italo Zucchelli',    type: 'people' },
    { text: 'Jamie Dornan',       type: 'people' },
    { text: "A\$AP Rocky",        type: 'people' },
    { text: 'Pharrell Williams',  type: 'people' },
    { text: 'Zack McCollum',      type: 'people' },
    // Navigation
    { text: 'Archive',     type: 'nav' },
    { text: 'People',      type: 'nav' },
    { text: 'Timeline',    type: 'nav' },
    { text: 'Profile',     type: 'nav' },
    { text: 'About',       type: 'nav' },
    { text: 'Collections', type: 'nav' },
    { text: 'Advertising', type: 'nav' },
    { text: 'Editorials',  type: 'nav' },
    { text: 'Invitations', type: 'nav' },
    { text: 'Ephemera',    type: 'nav' },
    // Intro narrative lines
    { text: 'What began as a coat',      type: 'content' },
    { text: 'became a mirror',           type: 'content' },
    { text: 'of American desire',        type: 'content' },
    { text: 'Over five decades',         type: 'content' },
    { text: 'the body',                  type: 'content' },
    { text: 'the moment',                type: 'content' },
    { text: 'the culture',               type: 'content' },
    { text: 'translated into image',     type: 'content' },
    { text: 'spare',                     type: 'content' },
    { text: 'direct',                    type: 'content' },
    { text: 'impossible to ignore',      type: 'content' },
    { text: 'Every campaign',            type: 'content' },
    { text: 'Every collection',          type: 'content' },
    { text: 'Every season',              type: 'content' },
    { text: 'Every name',                type: 'content' },
    { text: 'This is the archive',       type: 'content' },
];

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
        // Reset search immediately so it's hidden before people-stage fades out
        resetSearch();

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

    // ===== SEARCH =====

    const searchEl       = document.getElementById('search');
    const searchStage    = document.getElementById('search-stage');
    const searchPanel    = document.getElementById('search-panel');
    const searchResultsEl = document.getElementById('search-results');
    let   searchActive   = false;

    // --- Filtering and results rendering ---

    function filterResults(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return SEARCH_DATA.filter(item =>
            item.text.toLowerCase().includes(q)
        ).slice(0, 6);
    }

    function showResults(query) {
        searchResultsEl.innerHTML = '';
        const matches = filterResults(query);
        for (const item of matches) {
            const el = document.createElement('span');
            el.className    = 'search-result';
            el.textContent  = item.text.toUpperCase();
            el.dataset.type = item.type;
            el.addEventListener('click', () => {
                if (item.type === 'people') reverseSearchAndGoToPeople();
            });
            searchResultsEl.appendChild(el);
        }
        // Back button is always the last child of the results container:
        // - no results  → only item, appears just below the bar (beside input)
        // - with results → appears after the full list
        const backBtn = document.createElement('button');
        backBtn.id        = 'search-back';
        backBtn.textContent = '← back';
        backBtn.className = 'people-close';
        backBtn.addEventListener('click', () => reverseSearch());
        searchResultsEl.appendChild(backBtn);
    }

    // --- State management ---

    function _cleanupSearchPanel() {
        if (searchPanel._focusInput) {
            searchPanel.removeEventListener('click', searchPanel._focusInput);
            delete searchPanel._focusInput;
        }
        searchPanel.style.pointerEvents = '';
        searchPanel.style.cursor        = '';
    }

    // Instant teardown: no animation — used when navigating away (closePeopleStage)
    function resetSearch() {
        if (!searchActive) return;
        searchActive = false;

        document.getElementById('search-input')?.remove();
        document.getElementById('search-back')?.remove();
        searchResultsEl.innerHTML = '';

        _cleanupSearchPanel();
        ['visibility','pointerEvents','color','textShadow','transition','transform']
            .forEach(p => { searchEl.style[p] = ''; });
        searchPanel.style.transition = '';
        searchPanel.style.transform  = '';

        menu.classList.remove('search-active');
        searchStage.style.display = 'none';
        searchStage.setAttribute('aria-hidden', 'true');
    }

    // Animated teardown: slides everything back left, then calls onComplete
    async function reverseSearch(onComplete) {
        const SLIDE_MS   = 380;
        const SLIDE_EASE = 'cubic-bezier(0.55, 0, 1, 0.5)';
        const HALF_W     = Math.round(window.innerWidth / 2);

        // Remove interactive UI immediately so nothing intercepts during slide-out
        document.getElementById('search-input')?.remove();
        document.getElementById('search-back')?.remove();
        searchResultsEl.innerHTML = '';

        _cleanupSearchPanel();

        // Restore searchEl visibility before sliding (it's white, will slide out)
        searchEl.style.visibility    = '';
        searchEl.style.pointerEvents = '';

        const slideX = `-${HALF_W}px`;
        searchEl.style.transition = `transform ${SLIDE_MS}ms ${SLIDE_EASE}, color 200ms ease-out`;
        searchEl.style.transform  = `translateX(${slideX})`;
        searchEl.style.color      = '#bbbdc0';

        searchPanel.style.transition = `transform ${SLIDE_MS}ms ${SLIDE_EASE}`;
        searchPanel.style.transform  = `translateX(${slideX})`;

        await new Promise(r => setTimeout(r, SLIDE_MS + 60));

        // Full state cleanup
        searchActive = false;
        menu.classList.remove('search-active');
        searchStage.style.display = 'none';
        searchStage.setAttribute('aria-hidden', 'true');
        ['transition','transform','color','textShadow','visibility','pointerEvents']
            .forEach(p => { searchEl.style[p] = ''; });
        searchPanel.style.transition = '';
        searchPanel.style.transform  = '';

        if (onComplete) onComplete();
    }

    function reverseSearchAndGoToPeople() {
        reverseSearch(() => playPeopleTransition());
    }

    // --- Input + back button activation ---

    function activateSearchInput(rect) {
        const PAD_V  = 5;
        const HALF_W = Math.round(window.innerWidth / 2);

        // Hide the original label AND disable its pointer events.
        // visibility:hidden keeps layout intact but still receives pointer events
        // by default — pointer-events:none passes clicks through to the input below.
        searchEl.style.visibility    = 'hidden';
        searchEl.style.pointerEvents = 'none';

        // Input overlay at the exact position of the search label
        const input = document.createElement('input');
        input.id           = 'search-input';
        input.type         = 'text';
        input.autocomplete = 'off';
        input.spellcheck   = false;
        Object.assign(input.style, {
            position:      'fixed',
            left:          `${rect.left}px`,
            top:           `${rect.top}px`,
            width:         `${HALF_W - rect.left}px`,
            height:        `${rect.height}px`,
            background:    'transparent',
            border:        'none',
            outline:       'none',
            fontFamily:    'Klein, sans-serif',
            fontWeight:    '350',
            fontSize:      '14px',
            textTransform: 'uppercase',
            letterSpacing: '-0.35px',
            color:         '#ffffff',
            caretColor:    '#ffffff',
            padding:       '0',
            zIndex:        '100',
            WebkitFontSmoothing: 'antialiased',
        });

        input.addEventListener('input', () => showResults(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { reverseSearch(); }
            else if (e.key === 'Enter') {
                const matches = filterResults(input.value);
                if (matches.length && matches[0].type === 'people') reverseSearchAndGoToPeople();
            }
        });

        searchStage.appendChild(input);

        // Clicking anywhere on the black panel re-focuses the input.
        // The panel covers the full left half; the input only covers the text area.
        searchPanel.style.pointerEvents = 'auto';
        searchPanel.style.cursor        = 'text';
        searchPanel._focusInput = () => document.getElementById('search-input')?.focus();
        searchPanel.addEventListener('click', searchPanel._focusInput);

        // Position the results container just below the bar.
        // The back button lives INSIDE this container as the last child,
        // so it flows naturally: alone when no results, after the list when results exist.
        const barBottom = rect.top + rect.height + PAD_V;
        searchResultsEl.style.top  = `${barBottom + 12}px`;
        searchResultsEl.style.left = `${rect.left}px`;

        // Initialise: render just the back button (query is empty at activation)
        showResults('');

        requestAnimationFrame(() => input.focus());
    }

    // --- Main animation ---

    async function playSearchTransition() {
        if (searchActive) return;
        searchActive = true;

        const PAD_V     = 5;
        const HALF_W    = Math.round(window.innerWidth / 2);
        const RISE_MS   = 600;
        const RISE_EASE = 'cubic-bezier(0.19, 1, 0.22, 1)';

        // 1. Capture original position BEFORE any transform is applied
        const rect = searchEl.getBoundingClientRect();

        // 2. Panel: left:0, width:50vw — starts off-screen left at translateX(-HALF_W)
        searchPanel.style.top        = `${rect.top - PAD_V}px`;
        searchPanel.style.left       = '0';
        searchPanel.style.width      = `${HALF_W}px`;
        searchPanel.style.height     = `${rect.height + PAD_V * 2}px`;
        searchPanel.style.bottom     = 'auto';
        searchPanel.style.transition = 'none';
        searchPanel.style.transform  = `translateX(-${HALF_W}px)`;

        // 3. Fall distance: right edge of text lands at x=0
        searchEl.style.setProperty('--search-fall-x', `${-(rect.right + 6)}px`);

        // 4. Reveal stage (panel still off-screen)
        searchStage.removeAttribute('aria-hidden');
        searchStage.style.display = 'block';

        // 5. Phase 1 — text falls left with wall-bounce physics
        searchEl.classList.add('search-falling');
        await new Promise(r => setTimeout(r, 480));

        // 6. Invisible snap: text moves to the same off-screen-left position as the panel
        searchEl.classList.remove('search-falling');
        searchEl.style.transition = 'none';
        searchEl.style.transform  = `translateX(-${HALF_W}px)`;
        void searchEl.offsetWidth;

        // 7. Phase 2 — text and panel slide in from left in perfect sync
        //    Adding search-active NOW hides other menu items in sync with the slide-in
        menu.classList.add('search-active');

        searchEl.style.transition = `transform ${RISE_MS}ms ${RISE_EASE}`;
        searchEl.style.transform  = 'translateX(0)';

        searchPanel.style.transition = `transform ${RISE_MS}ms ${RISE_EASE}`;
        searchPanel.style.transform  = 'translateX(0)';

        // 8. Text turns white once settled
        await new Promise(r => setTimeout(r, RISE_MS + 40));
        searchEl.style.transition = 'color 200ms ease-out';
        searchEl.style.color      = '#ffffff';
        searchEl.style.textShadow = 'none';

        // 9. Activate the real input
        await new Promise(r => setTimeout(r, 220));
        activateSearchInput(rect);
    }

    searchEl.addEventListener('click', (e) => {
        e.preventDefault();
        playSearchTransition();
    });

    // ===== ARCHIVE PAGE — INFINITE CANVAS =====

    const archiveStage    = document.getElementById('archive-stage');
    const archiveViewport = document.getElementById('archive-viewport');
    const archiveCanvas   = document.getElementById('archive-canvas');
    const archiveEmpty    = document.getElementById('archive-empty');
    const archiveCloseBtn = document.getElementById('archive-close');

    let archiveOpen        = false;
    let archiveManifest    = null;       // [{path, category}, ...]
    let currentCategory    = 'all';      // 'all' | 'advertising' | 'editorials' | 'collections' | 'ephemera'
    let canvasOffset       = { x: 0, y: 0 };
    let tileSize           = { w: 0, h: 0 };
    let tileEls            = [];         // 4 tile container elements (2x2)

    // Maps menu category labels to manifest category codes
    const CAT_MAP = {
        all:         null,
        advertising: 'adv',
        editorials:  'edi',
        collections: '__none__',
        ephemera:    '__none__',
    };

    // FNV-1a hash → deterministic pseudo-random [0,1) per (filename, salt)
    function _hash(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }
    function rand01(seed, salt) { return (_hash(seed + ':' + salt) % 100000) / 100000; }

    // Parse archive_index.csv → [{path, category}]
    async function loadArchiveManifest() {
        if (archiveManifest) return archiveManifest;
        const res = await fetch('archive_index.csv');
        const txt = await res.text();
        const lines = txt.trim().split(/\r?\n/);
        const header = lines.shift().split(',');
        const iFile = header.indexOf('filename');
        const iYear = header.indexOf('year');
        const iCat  = header.indexOf('category');
        const iSub  = header.indexOf('subcategory');
        archiveManifest = lines.map(line => {
            const cols = line.split(',');
            const filename = cols[iFile];
            const year     = cols[iYear];
            const cat      = cols[iCat];
            const sub      = cols[iSub];
            const path = sub
                ? `assets/index/${cat}/${sub}/${year}/${filename}.webp`
                : `assets/index/${cat}/${year}/${filename}.webp`;
            return { path, category: cat };
        });
        return archiveManifest;
    }

    function filterImages(catLabel) {
        const code = CAT_MAP[catLabel];
        if (code === null)        return archiveManifest;            // all
        if (code === '__none__')  return [];                          // empty categories
        return archiveManifest.filter(m => m.category === code);
    }

    // Build one tile of images using deterministic layout.
    // Returns a fresh DOM element fully populated.
    function buildTile(images) {
        const tile = document.createElement('div');
        tile.className = 'archive-tile';
        tile.style.width  = tileSize.w + 'px';
        tile.style.height = tileSize.h + 'px';

        const MIN_W = 140, MAX_W = 320, MARGIN = 360;
        const usableW = Math.max(100, tileSize.w - MARGIN);
        const usableH = Math.max(100, tileSize.h - MARGIN);

        for (const img of images) {
            const seed = img.path;
            const w   = MIN_W + rand01(seed, 'w') * (MAX_W - MIN_W);
            const x   = rand01(seed, 'x') * usableW;
            const y   = rand01(seed, 'y') * usableH;
            const rot = (rand01(seed, 'r') - 0.5) * 4; // ±2deg

            const el = document.createElement('img');
            el.className = 'archive-img';
            el.src       = img.path;
            el.loading   = 'lazy';
            el.onerror   = () => el.remove();
            el.style.width     = w + 'px';
            el.style.left      = x + 'px';
            el.style.top       = y + 'px';
            el.style.transform = `rotate(${rot.toFixed(2)}deg)`;
            tile.appendChild(el);
        }
        return tile;
    }

    function computeTileSize() {
        tileSize.w = Math.max(2400, window.innerWidth  + 400);
        tileSize.h = Math.max(1800, window.innerHeight + 400);
    }

    // Build the 2x2 grid of identical tile copies inside the canvas.
    function rebuildCanvas(images) {
        archiveCanvas.innerHTML = '';
        tileEls = [];

        if (!images.length) {
            archiveEmpty.classList.add('visible');
            return;
        }
        archiveEmpty.classList.remove('visible');

        const proto = buildTile(images);

        for (let i = 0; i < 4; i++) {
            const t = (i === 0) ? proto : proto.cloneNode(true);
            const col = i % 2, row = (i / 2) | 0;
            t.style.transform = `translate(${col * tileSize.w}px, ${row * tileSize.h}px)`;
            archiveCanvas.appendChild(t);
            tileEls.push(t);
        }
    }

    // Stagger fade-in for all images in the first tile (clones inherit via class).
    function animateImagesIn() {
        const imgs = archiveCanvas.querySelectorAll('.archive-img');
        if (typeof gsap === 'undefined') {
            imgs.forEach(i => { i.style.opacity = '1'; });
            return;
        }
        gsap.fromTo(imgs,
            { opacity: 0, scale: 0.92 },
            {
                opacity: 1, scale: 1,
                duration: 0.7,
                ease: 'power3.out',
                stagger: { amount: 0.8, from: 'random' },
                onComplete: () => imgs.forEach(i => { i.style.willChange = 'auto'; }),
            }
        );
    }

    function applyCanvasTransform() {
        // Normalize offset so it stays within [-tileSize, 0] — keeps the 2x2
        // grid always covering the viewport from origin.
        const ox = ((canvasOffset.x % tileSize.w) - tileSize.w) % tileSize.w;
        const oy = ((canvasOffset.y % tileSize.h) - tileSize.h) % tileSize.h;
        archiveCanvas.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
    }

    // Drag with pointer events
    let dragging = false;
    let dragStart = null;
    let dragOffsetStart = null;

    archiveViewport.addEventListener('pointerdown', (e) => {
        dragging = true;
        archiveViewport.classList.add('dragging');
        archiveViewport.setPointerCapture(e.pointerId);
        dragStart = { x: e.clientX, y: e.clientY };
        dragOffsetStart = { x: canvasOffset.x, y: canvasOffset.y };
    });
    archiveViewport.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        canvasOffset.x = dragOffsetStart.x + (e.clientX - dragStart.x);
        canvasOffset.y = dragOffsetStart.y + (e.clientY - dragStart.y);
        applyCanvasTransform();
    });
    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        archiveViewport.classList.remove('dragging');
        try { archiveViewport.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    archiveViewport.addEventListener('pointerup', endDrag);
    archiveViewport.addEventListener('pointercancel', endDrag);

    // Category filter: fade out → swap → fade in
    function setCategory(catLabel) {
        if (catLabel === currentCategory) return;
        currentCategory = catLabel;

        document.querySelectorAll('.menu-cat').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === catLabel);
        });

        const oldImgs = archiveCanvas.querySelectorAll('.archive-img');
        const next = () => {
            rebuildCanvas(filterImages(catLabel));
            animateImagesIn();
        };
        if (oldImgs.length && typeof gsap !== 'undefined') {
            gsap.to(oldImgs, {
                opacity: 0, scale: 0.96, duration: 0.35, ease: 'power2.in',
                stagger: { amount: 0.25, from: 'random' },
                onComplete: next,
            });
        } else {
            next();
        }
    }

    async function openArchive() {
        if (archiveOpen) return;
        archiveOpen = true;

        // Swap menu to archive-mode (keeps menu in its original position)
        menu.classList.remove('hover-active');
        menu.classList.add('archive-active');

        await loadArchiveManifest();
        computeTileSize();
        currentCategory = 'all';
        document.querySelectorAll('.menu-cat').forEach(el => el.classList.remove('active'));
        rebuildCanvas(filterImages('all'));

        // Center the canvas roughly so first paint isn't all at top-left
        canvasOffset.x = -tileSize.w / 4;
        canvasOffset.y = -tileSize.h / 4;
        applyCanvasTransform();

        archiveStage.removeAttribute('aria-hidden');
        archiveStage.style.display = 'block';
        void archiveStage.offsetWidth;
        archiveStage.style.opacity = '1';

        // Wait for fade-in to start before animating images
        setTimeout(animateImagesIn, 300);
    }

    function closeArchive() {
        if (!archiveOpen) return;
        archiveOpen = false;

        archiveStage.style.opacity = '0';
        setTimeout(() => {
            archiveStage.style.display = 'none';
            archiveStage.setAttribute('aria-hidden', 'true');
            archiveCanvas.innerHTML = '';
            menu.classList.remove('archive-active');
        }, 650);
    }

    archive.addEventListener('click', (e) => {
        e.preventDefault();
        openArchive();
    });

    archiveCloseBtn.addEventListener('click', closeArchive);

    document.querySelectorAll('.menu-cat').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setCategory(el.dataset.cat);
        });
    });

    window.addEventListener('resize', () => {
        if (!archiveOpen) return;
        computeTileSize();
        rebuildCanvas(filterImages(currentCategory));
        applyCanvasTransform();
        animateImagesIn();
    });
});