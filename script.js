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
    let   _st            = null;   // active search trigger element
    let   _searchBarH    = 0;      // panel height for the bar only
    const searchBackdrop = document.getElementById('search-backdrop');

    // --- Filtering and results rendering ---

    function filterResults(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return SEARCH_DATA.filter(item => item.text.toLowerCase().includes(q)).slice(0, 8);
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
                else if (item.type === 'archive') reverseSearchAndGoToArchiveItem(item);
            });
            searchResultsEl.appendChild(el);
        }
        const backBtn = document.createElement('button');
        backBtn.id          = 'search-back';
        backBtn.textContent = '← back';
        backBtn.className   = 'people-close';
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
            .forEach(p => { if (_st) _st.style[p] = ''; });
        searchPanel.style.transition = '';
        searchPanel.style.transform  = '';
        gsap.set(searchBackdrop, { opacity: 0 });
        searchBackdrop.style.pointerEvents = 'none';

        menu.classList.remove('search-active');
        searchStage.style.display  = 'none';
        searchStage.style.zIndex   = '';
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

        // Restore trigger visibility before sliding (it's white, will slide out)
        if (_st) { _st.style.visibility = ''; _st.style.pointerEvents = ''; }

        const slideX = `-${HALF_W}px`;
        if (_st) {
            _st.style.transition = `transform ${SLIDE_MS}ms ${SLIDE_EASE}, color 200ms ease-out`;
            _st.style.transform  = `translateX(${slideX})`;
            _st.style.color      = '#bbbdc0';
        }

        searchPanel.style.transition = `transform ${SLIDE_MS}ms ${SLIDE_EASE}`;
        searchPanel.style.transform  = `translateX(${slideX})`;

        // Fade out backdrop in sync
        searchBackdrop.style.pointerEvents = 'none';
        gsap.to(searchBackdrop, { opacity: 0, duration: SLIDE_MS / 1000, ease: 'power3.in' });

        await new Promise(r => setTimeout(r, SLIDE_MS + 60));

        // Full state cleanup
        searchActive = false;
        menu.classList.remove('search-active');
        searchStage.style.display  = 'none';
        searchStage.style.zIndex   = '';
        searchStage.setAttribute('aria-hidden', 'true');
        ['transition','transform','color','textShadow','visibility','pointerEvents']
            .forEach(p => { if (_st) _st.style[p] = ''; });
        searchPanel.style.transition = '';
        searchPanel.style.transform  = '';
        gsap.set(searchBackdrop, { opacity: 0 });
        searchBackdrop.style.pointerEvents = 'none';

        if (onComplete) onComplete();
    }

    function reverseSearchAndGoToPeople() {
        reverseSearch(() => playPeopleTransition());
    }

    function reverseSearchAndGoToArchiveItem(item) {
        reverseSearch(async () => {
            if (!archiveOpen) {
                await openArchive();
                setTimeout(() => applyArchiveFilter(item.text), 1200);
            } else {
                applyArchiveFilter(item.text);
            }
        });
    }

    // --- Input + back button activation ---

    function activateSearchInput(rect) {
        const PAD_V  = 5;
        const HALF_W = Math.round(window.innerWidth / 2);

        // Hide the original label AND disable its pointer events.
        if (_st) { _st.style.visibility = 'hidden'; _st.style.pointerEvents = 'none'; }

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

        // Determine which element triggered the search (set before calling this fn)
        if (!_st) _st = searchEl;

        const PAD_V     = 5;
        const HALF_W    = Math.round(window.innerWidth / 2);
        const RISE_MS   = 600;
        const RISE_EASE = 'cubic-bezier(0.19, 1, 0.22, 1)';

        // 1. Capture original position BEFORE any transform is applied
        const rect = _st.getBoundingClientRect();

        // 2. Panel: left:0, width:50vw — starts off-screen left at translateX(-HALF_W)
        _searchBarH = rect.height + PAD_V * 2;
        searchPanel.style.top        = `${rect.top - PAD_V}px`;
        searchPanel.style.left       = '0';
        searchPanel.style.width      = `${HALF_W}px`;
        searchPanel.style.height     = `${_searchBarH}px`;
        searchPanel.style.bottom     = 'auto';
        searchPanel.style.transition = 'none';
        searchPanel.style.transform  = `translateX(-${HALF_W}px)`;
        gsap.set(searchBackdrop, { opacity: 0 });
        searchBackdrop.style.pointerEvents = 'none';

        // 3. Fall distance: right edge of text lands at x=0
        _st.style.setProperty('--search-fall-x', `${-(rect.right + 6)}px`);

        // 4. Reveal stage (panel still off-screen)
        // When archive is open (z:12), elevate search stage above it
        searchStage.style.zIndex = archiveOpen ? '13' : '';
        searchStage.removeAttribute('aria-hidden');
        searchStage.style.display = 'block';

        // 5. Phase 1 — text falls left with wall-bounce physics
        _st.classList.add('search-falling');
        await new Promise(r => setTimeout(r, 480));

        // 6. Invisible snap: text moves to the same off-screen-left position as the panel
        _st.classList.remove('search-falling');
        _st.style.transition = 'none';
        _st.style.transform  = `translateX(-${HALF_W}px)`;
        void _st.offsetWidth;

        // 7. Phase 2 — text and panel slide in from left in perfect sync
        menu.classList.add('search-active');

        _st.style.transition = `transform ${RISE_MS}ms ${RISE_EASE}`;
        _st.style.transform  = 'translateX(0)';

        searchPanel.style.transition = `transform ${RISE_MS}ms ${RISE_EASE}`;
        searchPanel.style.transform  = 'translateX(0)';

        // Fade in backdrop as panel slides in
        gsap.to(searchBackdrop, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
        searchBackdrop.style.pointerEvents = 'auto';

        // 8. Text turns white once settled
        await new Promise(r => setTimeout(r, RISE_MS + 40));
        _st.style.transition = 'color 200ms ease-out';
        _st.style.color      = '#ffffff';
        _st.style.textShadow = 'none';

        // 9. Activate the real input
        await new Promise(r => setTimeout(r, 220));
        activateSearchInput(rect);
    }

    searchEl.addEventListener('click', (e) => {
        e.preventDefault();
        _st = searchEl;
        playSearchTransition();
    });

    document.getElementById('archive-search').addEventListener('click', (e) => {
        e.preventDefault();
        _st = document.getElementById('archive-search');
        playSearchTransition();
    });

    searchBackdrop.addEventListener('click', () => {
        if (searchActive) reverseSearch();
    });

    // ===== ARCHIVE PAGE — MASONRY + VIRTUALIZED INFINITE CANVAS =====

    const archiveStage    = document.getElementById('archive-stage');
    const archiveViewport = document.getElementById('archive-viewport');
    const archiveCanvas   = document.getElementById('archive-canvas');
    const archiveEmpty    = document.getElementById('archive-empty');
    const archiveBackBtn  = document.getElementById('archive-back');
    const archiveShowAll  = document.getElementById('archive-show-all');
    const defaultPrimary  = menu.querySelector('.menu-primary:not(.menu-primary-archive)');
    const defaultSecondary= menu.querySelector('.menu-secondary');
    const archivePrimary  = menu.querySelector('.menu-primary-archive');

    let archiveOpen     = false;
    let archiveManifest = null;
    let currentCategory = 'all';
    let items           = [];                // [{id, x, y, w, h, rot, src}]
    let tileSize        = { w: 0, h: 0 };
    let canvasOffset    = { x: 0, y: 0 };
    let switching       = false;             // category transition in progress
    const mounted       = new Map();         // key "id_tx_ty" → img element

    const CAT_MAP = {
        all:         null,
        advertising: 'adv',
        editorials:  'edi',
        collections: '__none__',
        ephemera:    '__none__',
    };

    function _hash(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }
    const rand01 = (seed, salt) => (_hash(seed + ':' + salt) % 100000) / 100000;

    const campaignGroups = new Map();    // campaignKey → array of items in same campaign

    async function loadArchiveManifest() {
        if (archiveManifest) return archiveManifest;
        const res = await fetch('archive_index.csv');
        const txt = await res.text();
        const lines = txt.trim().split(/\r?\n/);
        const header = lines.shift().split(',');
        const iFile = header.indexOf('filename');
        const iCat  = header.indexOf('category');
        const iSub  = header.indexOf('subcategory');
        const iYear = header.indexOf('year');

        archiveManifest = lines.map(line => {
            const cols = line.split(',');
            const filename = cols[iFile];
            const dims = (typeof ARCHIVE_DIMS !== 'undefined') ? ARCHIVE_DIMS[filename] : null;
            if (!dims) return null;
            const path = cols[iSub]
                ? `assets/index/${cols[iCat]}/${cols[iSub]}/${cols[iYear]}/${filename}.webp`
                : `assets/index/${cols[iCat]}/${cols[iYear]}/${filename}.webp`;
            const csv = {};
            for (let k = 0; k < header.length; k++) csv[header[k]] = cols[k] || '';
            return {
                path,
                filename,
                category: cols[iCat],
                dw: dims[0],
                dh: dims[1],
                csv,
                campaignKey: filename.replace(/_\d+$/, ''),
            };
        }).filter(Boolean);

        // Group items by campaign key for multi-photo navigation
        for (const m of archiveManifest) {
            if (!campaignGroups.has(m.campaignKey)) campaignGroups.set(m.campaignKey, []);
            campaignGroups.get(m.campaignKey).push(m);
        }
        // Stable sort each group by filename so photo numbering is consistent
        for (const arr of campaignGroups.values()) arr.sort((a, b) => a.filename.localeCompare(b.filename));

        return archiveManifest;
    }

    let _searchEnriched = false;
    function enrichSearchWithArchive() {
        if (_searchEnriched) return;
        _searchEnriched = true;
        const seen = new Set(SEARCH_DATA.map(d => d.text.toLowerCase()));
        for (const m of archiveManifest) {
            const { csv } = m;
            // Year
            if (csv.year && !seen.has(csv.year)) {
                SEARCH_DATA.push({ text: csv.year, type: 'archive', manifest: m });
                seen.add(csv.year);
            }
            // Campaign
            if (csv.campaign) {
                const label = csv.campaign.replace(/_/g, ' ');
                if (!seen.has(label)) {
                    SEARCH_DATA.push({ text: label, type: 'archive', manifest: m });
                    seen.add(label);
                }
            }
            // Description + campaign combined
            if (csv.description || csv.campaign) {
                const parts = [csv.description, csv.campaign].filter(Boolean).map(s => s.replace(/_/g, ' '));
                const label = parts.join(' ');
                if (label && !seen.has(label)) {
                    SEARCH_DATA.push({ text: label, type: 'archive', manifest: m });
                    seen.add(label);
                }
            }
            // Subcategory (e.g. "fragrance", "collection")
            if (csv.subcategory) {
                const label = csv.subcategory.replace(/_/g, ' ');
                if (!seen.has(label)) {
                    SEARCH_DATA.push({ text: label, type: 'archive', manifest: m });
                    seen.add(label);
                }
            }
        }
    }

    function filterImages(catLabel) {
        const code = CAT_MAP[catLabel];
        if (code === null)       return archiveManifest;
        if (code === '__none__') return [];
        return archiveManifest.filter(m => m.category === code);
    }

    // Masonry packing using real aspect ratios.
    // - Tile width includes trailing GAP so adjacent tile copies have proper spacing
    //   at horizontal seams (no touching columns).
    // - Tall-first placement (sort by aspect desc) produces nearly-balanced columns.
    // - Post-pass distributes leftover space in shorter columns as extra padding,
    //   so every column ends exactly at colMax → no vertical white gaps at seams.
    function buildItems(images) {
        const vw = window.innerWidth, vh = window.innerHeight;

        if (!images.length) {
            tileSize.w = Math.max(vw + 800, 2000);
            tileSize.h = Math.max(vh + 800, 1400);
            return [];
        }

        const N = images.length;
        let cols = Math.max(2, Math.round(Math.sqrt(N * 1.33)));

        const GAP = 72;
        let COL_W = 290;
        let tileW = cols * (COL_W + GAP);   // includes trailing GAP

        const MIN_TW = vw;
        if (tileW < MIN_TW) {
            COL_W = (MIN_TW / cols) - GAP;
            tileW = MIN_TW;
        }

        // Pseudo-random deterministic order → mixes portrait/landscape in every row
        const ordered = images.slice().sort((a, b) => _hash(a.path + 's') - _hash(b.path + 's'));

        const colY     = new Array(cols).fill(0);
        const colItems = Array.from({ length: cols }, () => []);
        const result   = [];

        for (let i = 0; i < ordered.length; i++) {
            const img    = ordered[i];
            const aspect = img.dw / img.dh;
            const w = COL_W;
            const h = w / aspect;
            const rot = (rand01(img.path, 'r') - 0.5) * 1.2;       // ±0.6deg — safe vs GAP=32

            let minCol = 0;
            for (let c = 1; c < cols; c++) {
                if (colY[c] < colY[minCol]) minCol = c;
            }
            const x = minCol * (COL_W + GAP);
            const y = colY[minCol];
            colY[minCol] += h + GAP;

            const it = { id: i, col: minCol, x, y, w, h, rot, src: img.path, manifest: img };
            result.push(it);
            colItems[minCol].push(it);
        }

        const colMax = Math.max(...colY);

        // Balance columns: pad shorter columns by distributing leftover space
        // evenly between items. Removes the white gap that would appear below
        // shorter columns at the tile's vertical seam.
        for (let c = 0; c < cols; c++) {
            const arr = colItems[c];
            if (!arr.length) continue;
            const extra = colMax - colY[c];
            if (extra <= 0.5) continue;
            const perItem = extra / arr.length;
            let cum = 0;
            for (const it of arr) {
                it.y += cum;
                cum += perItem;
            }
        }

        tileSize.w = tileW;
        tileSize.h = colMax;             // includes trailing GAP from last "+ h + GAP"
        return result;
    }

    function applyCanvasTransform() {
        archiveCanvas.style.transform =
            `translate3d(${canvasOffset.x}px, ${canvasOffset.y}px, 0)`;
    }

    // Virtualization — only DOM-mount items in tile copies that intersect the viewport.
    let syncQueued = false;
    function scheduleSync() {
        if (syncQueued) return;
        syncQueued = true;
        requestAnimationFrame(() => { syncQueued = false; syncMounted(); });
    }

    function createImgEl(it, wx, wy) {
        const el = document.createElement('img');
        el.className   = 'archive-img';
        el.src         = it.src;
        el.decoding    = 'async';
        el.draggable   = false;
        el.onerror     = () => el.remove();
        el.style.width  = it.w + 'px';
        el.style.height = it.h + 'px';
        el.style.left   = wx + 'px';
        el.style.top    = wy + 'px';
        el.dataset.rot    = it.rot;
        el.dataset.itemId = it.id;
        gsap.set(el, { rotation: it.rot });
        return el;
    }

    function syncMounted() {
        if (!items.length) return;
        const vw = window.innerWidth, vh = window.innerHeight;
        const MARGIN = 200;

        const x0 = -canvasOffset.x - MARGIN;
        const y0 = -canvasOffset.y - MARGIN;
        const x1 = x0 + vw + MARGIN * 2;
        const y1 = y0 + vh + MARGIN * 2;

        const tx0 = Math.floor(x0 / tileSize.w);
        const tx1 = Math.floor(x1 / tileSize.w);
        const ty0 = Math.floor(y0 / tileSize.h);
        const ty1 = Math.floor(y1 / tileSize.h);

        const needed = new Set();
        for (let tx = tx0; tx <= tx1; tx++) {
            for (let ty = ty0; ty <= ty1; ty++) {
                const dx = tx * tileSize.w;
                const dy = ty * tileSize.h;
                for (const it of items) {
                    const wx = it.x + dx;
                    const wy = it.y + dy;
                    if (wx + it.w < x0 || wx > x1) continue;
                    if (wy + it.h < y0 || wy > y1) continue;

                    const key = it.id + '_' + tx + '_' + ty;
                    needed.add(key);
                    if (!mounted.has(key)) {
                        const el = createImgEl(it, wx, wy);
                        archiveCanvas.appendChild(el);
                        mounted.set(key, el);
                    }
                }
            }
        }

        for (const [key, el] of mounted) {
            if (!needed.has(key)) {
                el.remove();
                mounted.delete(key);
            }
        }
    }

    function unmountAll() {
        for (const [, el] of mounted) el.remove();
        mounted.clear();
    }

    // ----- Drag with momentum + click detection -----
    let dragging = false;
    let dragStart = null;
    let dragOffsetStart = null;
    let lastSample = null;
    let velocity = { x: 0, y: 0 };
    let momentumTween = null;
    let downTarget = null;
    let downTime   = 0;

    archiveViewport.addEventListener('pointerdown', (e) => {
        if (switching || itemViewOpen) return;
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }
        dragging = true;
        archiveViewport.classList.add('dragging');
        archiveViewport.setPointerCapture(e.pointerId);
        dragStart = { x: e.clientX, y: e.clientY };
        dragOffsetStart = { x: canvasOffset.x, y: canvasOffset.y };
        lastSample = { x: e.clientX, y: e.clientY, t: performance.now() };
        velocity = { x: 0, y: 0 };
        downTarget = e.target;
        downTime   = performance.now();
    });

    archiveViewport.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        canvasOffset.x = dragOffsetStart.x + (e.clientX - dragStart.x);
        canvasOffset.y = dragOffsetStart.y + (e.clientY - dragStart.y);
        applyCanvasTransform();
        scheduleSync();

        const now = performance.now();
        const dt = Math.max(8, now - lastSample.t);
        velocity.x = (e.clientX - lastSample.x) / dt;
        velocity.y = (e.clientY - lastSample.y) / dt;
        lastSample = { x: e.clientX, y: e.clientY, t: now };
    });

    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        archiveViewport.classList.remove('dragging');
        try { archiveViewport.releasePointerCapture(e.pointerId); } catch(_){}

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const dist = Math.hypot(dx, dy);
        const elapsed = performance.now() - downTime;

        // Treat as click if pointer barely moved and target was an archive image
        if (dist < 6 && elapsed < 400 && downTarget && downTarget.classList && downTarget.classList.contains('archive-img')) {
            openItemView(downTarget);
            return;
        }

        if (Math.abs(velocity.x) > 0.3 || Math.abs(velocity.y) > 0.3) {
            const MOMENTUM = 260;
            momentumTween = gsap.to(canvasOffset, {
                x: canvasOffset.x + velocity.x * MOMENTUM,
                y: canvasOffset.y + velocity.y * MOMENTUM,
                duration: 1.0,
                ease: 'power3.out',
                onUpdate: () => { applyCanvasTransform(); scheduleSync(); },
                onComplete: () => { momentumTween = null; },
            });
        }
    }
    archiveViewport.addEventListener('pointerup', endDrag);
    archiveViewport.addEventListener('pointercancel', endDrag);

    // Wheel/trackpad scroll to pan the canvas
    archiveViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!archiveOpen || itemViewOpen || switching) return;
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }
        canvasOffset.x -= e.deltaX;
        canvasOffset.y -= e.deltaY;
        applyCanvasTransform();
        scheduleSync();
    }, { passive: false });

    // ----- Search filter across archive items -----
    let currentSearchQuery = '';

    function filterByQuery(manifests, query) {
        if (!query) return manifests;
        const q = query.toLowerCase().trim();
        return manifests.filter(m => {
            const c = m.csv;
            return [c.year, c.campaign, c.description, c.subcategory,
                    c.photographer, c.model, c.director, c.creative_director,
                    c.art_director, c.publication]
                .some(f => f && f.toLowerCase().replace(/_/g, ' ').includes(q));
        });
    }

    function applyArchiveFilter(query) {
        if (switching) return;
        switching = true;
        currentSearchQuery = query;
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }

        const oldEls = Array.from(mounted.values());
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const tl = gsap.timeline({ onComplete: () => { switching = false; } });

        if (oldEls.length) {
            tl.to(oldEls, {
                x: () => (Math.random() - 0.5) * 1800,
                y: () => (Math.random() - 0.5) * 1400,
                rotation: () => (Math.random() - 0.5) * 220,
                scale: 0, opacity: 0,
                duration: 0.6, ease: 'power2.in',
                stagger: { amount: 0.35, from: 'center' },
            });
        }

        tl.call(() => {
            unmountAll();
            items = buildItems(filterByQuery(archiveManifest, query));
            canvasOffset.x = -tileSize.w / 2 + cx;
            canvasOffset.y = -tileSize.h / 2 + cy;
            applyCanvasTransform();
            archiveEmpty.classList.toggle('visible', items.length === 0);
            syncMounted();
            const fresh = Array.from(mounted.values());
            gsap.set(fresh, {
                x:        () => (Math.random() - 0.5) * 1600,
                y:        () => (Math.random() - 0.5) * 1200 - 150,
                rotation: () => (Math.random() - 0.5) * 200,
                scale:    0,
                opacity:  0,
            });
        });

        tl.add(() => {
            const fresh = Array.from(mounted.values());
            if (!fresh.length) return;
            gsap.to(fresh, {
                x: 0, y: 0,
                rotation: (i, el) => parseFloat(el.dataset.rot) || 0,
                scale: 1, opacity: 1,
                duration: 0.9, ease: 'back.out(1.6)',
                stagger: { amount: 0.55, from: 'random' },
            });
        }, '+=0.05');

        tl.to({}, { duration: 1.0 });
    }

    // ----- Category switch: scatter + drop-in -----
    function setCategory(catLabel) {
        const queryActive = currentSearchQuery !== '';
        if ((catLabel === currentCategory && !queryActive) || switching) return;
        switching = true;
        currentSearchQuery = '';
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }
        currentCategory = catLabel;

        document.querySelectorAll('.menu-cat').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === catLabel);
        });
        archiveShowAll.classList.toggle('cat-all-active', catLabel === 'all');

        const oldEls = Array.from(mounted.values());
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;

        const tl = gsap.timeline({ onComplete: () => { switching = false; } });

        // 1. Scatter outward from viewport center
        if (oldEls.length) {
            tl.to(oldEls, {
                x:        () => (Math.random() - 0.5) * 1800,
                y:        () => (Math.random() - 0.5) * 1400,
                rotation: () => (Math.random() - 0.5) * 220,
                scale:    0,
                opacity:  0,
                duration: 0.6,
                ease:     'power2.in',
                stagger:  { amount: 0.35, from: 'center' },
            });
        }

        // 2. Rebuild layout & mount fresh elements (initially invisible)
        tl.call(() => {
            unmountAll();
            items = buildItems(filterImages(catLabel));
            canvasOffset.x = -tileSize.w / 2 + cx;
            canvasOffset.y = -tileSize.h / 2 + cy;
            applyCanvasTransform();
            archiveEmpty.classList.toggle('visible', items.length === 0);
            syncMounted();
            const fresh = Array.from(mounted.values());
            gsap.set(fresh, {
                x:        () => (Math.random() - 0.5) * 1600,
                y:        () => (Math.random() - 0.5) * 1200 - 150,
                rotation: () => (Math.random() - 0.5) * 200,
                scale:    0,
                opacity:  0,
            });
        });

        // 3. Drop in with bounce from random scatter
        tl.add(() => {
            const fresh = Array.from(mounted.values());
            if (!fresh.length) return;
            gsap.to(fresh, {
                x: 0, y: 0,
                rotation: (i, el) => parseFloat(el.dataset.rot) || 0,
                scale:    1,
                opacity:  1,
                duration: 0.9,
                ease:     'back.out(1.6)',
                stagger:  { amount: 0.55, from: 'random' },
            });
        }, '+=0.05');

        // Hold timeline open until drop-in finishes
        tl.to({}, { duration: 1.0 });
    }

    // ----- Smooth menu morph between default ↔ archive mode -----
    function morphMenuToArchive() {
        return new Promise(resolve => {
            const tl = gsap.timeline({ onComplete: resolve });
            tl.to([defaultPrimary, defaultSecondary], {
                opacity: 0, duration: 0.22, ease: 'power2.in',
            });
            tl.call(() => {
                gsap.set(archivePrimary, { opacity: 0, y: -6 });
                menu.classList.remove('hover-active');
                menu.classList.add('archive-active');
                // Reset default opacities (they'll be display:none under archive-active)
                defaultPrimary.style.opacity   = '';
                defaultSecondary.style.opacity = '';
            });
            tl.to(archivePrimary, {
                opacity: 1, y: 0, duration: 0.35, ease: 'power2.out',
            });
        });
    }

    function morphMenuToDefault() {
        return new Promise(resolve => {
            const tl = gsap.timeline({ onComplete: resolve });
            tl.to(archivePrimary, {
                opacity: 0, y: -4, duration: 0.22, ease: 'power2.in',
            });
            tl.call(() => {
                // Pre-stage default primary invisible BEFORE removing archive-active class
                // (defaultPrimary is display:none under archive-active, so this is invisible)
                gsap.set(defaultPrimary, { opacity: 0 });
                menu.classList.remove('archive-active');
                // archivePrimary is now display:none — reset its inline styles
                archivePrimary.style.opacity = '';
                archivePrimary.style.transform = '';
            });
            tl.to(defaultPrimary, {
                opacity: 1, duration: 0.35, ease: 'power2.out',
            });
            tl.call(() => {
                defaultPrimary.style.opacity = '';
            });
        });
    }

    async function openArchive() {
        if (archiveOpen) return;
        archiveOpen = true;

        await loadArchiveManifest();
        enrichSearchWithArchive();
        currentCategory = 'all';
        document.querySelectorAll('.menu-cat').forEach(el => el.classList.remove('active'));
        archiveShowAll.classList.add('cat-all-active');

        items = buildItems(filterImages('all'));
        canvasOffset.x = -tileSize.w / 2 + window.innerWidth  / 2;
        canvasOffset.y = -tileSize.h / 2 + window.innerHeight / 2;
        applyCanvasTransform();
        archiveEmpty.classList.toggle('visible', items.length === 0);
        archiveCanvas.style.opacity = '0';
        syncMounted();

        // Reveal stage behind menu (fades up while menu morphs)
        archiveStage.removeAttribute('aria-hidden');
        archiveStage.style.display = 'block';
        gsap.fromTo(archiveStage, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });

        // Menu morph + canvas drop-in run in parallel
        morphMenuToArchive();

        const fresh = Array.from(mounted.values());
        gsap.set(fresh, {
            x:        () => (Math.random() - 0.5) * 1600,
            y:        () => (Math.random() - 0.5) * 1200 - 150,
            rotation: () => (Math.random() - 0.5) * 200,
            scale:    0,
            opacity:  0,
        });
        gsap.set(archiveCanvas, { opacity: 1 });
        gsap.to(fresh, {
            x: 0, y: 0,
            rotation: (i, el) => parseFloat(el.dataset.rot) || 0,
            scale: 1, opacity: 1,
            duration: 0.95, ease: 'back.out(1.4)',
            stagger: { amount: 0.7, from: 'random' },
            delay: 0.25,
        });
    }

    async function closeArchive() {
        if (!archiveOpen) return;
        archiveOpen = false;
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }

        // Run stage fade + menu morph in parallel
        gsap.to(archiveStage, {
            opacity: 0, duration: 0.45, ease: 'power2.in',
            onComplete: () => {
                archiveStage.style.display = 'none';
                archiveStage.setAttribute('aria-hidden', 'true');
                archiveStage.style.opacity = '';
                unmountAll();
            },
        });

        await morphMenuToDefault();
    }

    archive.addEventListener('click', (e) => { e.preventDefault(); openArchive(); });
    archiveBackBtn.addEventListener('click', (e) => { e.preventDefault(); closeArchive(); });
    archiveShowAll.addEventListener('click', (e) => { e.preventDefault(); setCategory('all'); });

    document.querySelectorAll('.menu-cat').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            setCategory(el.dataset.cat);
        });
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (!archiveOpen) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            unmountAll();
            items = buildItems(filterImages(currentCategory));
            canvasOffset.x = -tileSize.w / 2 + window.innerWidth  / 2;
            canvasOffset.y = -tileSize.h / 2 + window.innerHeight / 2;
            applyCanvasTransform();
            syncMounted();
        }, 150);
    });

    // ===== ITEM VIEW (single image + info) =====

    const itemView         = document.getElementById('item-view');
    const itemViewBackdrop = document.getElementById('item-view-backdrop');
    const itemViewImgWrap  = document.getElementById('item-view-img-wrap');
    const itemViewInfo     = document.getElementById('item-view-info');
    const itemViewBackBtn  = document.getElementById('item-view-back');
    const itemViewNumbersEl = itemView.querySelector('.item-view-numbers');
    const itemViewTitleEl   = itemView.querySelector('.item-view-title');
    const itemViewMetaEl    = itemView.querySelector('.item-view-meta');

    let itemViewOpen   = false;
    let itemViewState  = null;

    const prettify = s => s ? s.replace(/_/g, ' ').toUpperCase() : '';

    const ACRONYM_MAP = {
        'adv': 'advertisement',
        'edi': 'editorial',
        'ss':  'spring / summer',
        'fw':  'fall / winter',
    };
    const expandLabel = s => s ? (ACRONYM_MAP[s.toLowerCase().trim()] || s) : s;

    function buildTitle(csv) {
        return prettify(csv.campaign) || prettify(csv.description) || expandLabel(csv.category).toUpperCase();
    }

    function renderItemMeta(csv) {
        itemViewMetaEl.innerHTML = '';
        const seasonStr = csv.season ? expandLabel(csv.season).toUpperCase() : '';
        const yearSeason = [csv.year, seasonStr].filter(Boolean).join(' ');
        const catExpanded = expandLabel(csv.category).toUpperCase();
        const isAdv = csv.category === 'adv';
        const catLine = (!isAdv && csv.subcategory)
            ? `${catExpanded} / ${prettify(csv.subcategory)}`
            : catExpanded;
        const mediaLine = isAdv ? prettify(csv.subcategory) : '';
        const fields = [
            ['date',              yearSeason],
            ['category',          catLine],
            ['media',             mediaLine],
            ['line',              prettify(csv.description)],
            ['photographer',      prettify(csv.photographer)],
            ['model',             prettify(csv.model)],
            ['director',          prettify(csv.director)],
            ['stylist',           prettify(csv.stylist)],
            ['art director',      prettify(csv.art_director)],
            ['creative director', prettify(csv.creative_director)],
            ['hair',              prettify(csv.hair)],
            ['makeup',            prettify(csv.makeup)],
            ['publication',       prettify(csv.publication)],
            ['issue',             prettify(csv.issue_date)],
            ['music',             prettify(csv.music)],
        ];
        for (const [label, value] of fields) {
            if (!value) continue;
            const row = document.createElement('div');
            row.className = 'item-view-meta-row';
            const l = document.createElement('span');
            l.className = 'item-view-meta-label';
            l.textContent = label;
            const v = document.createElement('span');
            v.className = 'item-view-meta-value';
            v.textContent = value;
            row.appendChild(l); row.appendChild(v);
            itemViewMetaEl.appendChild(row);
        }
    }

    function renderItemNumbers(group, currentIdx) {
        itemViewNumbersEl.innerHTML = '';
        if (group.length <= 1) return;
        for (let i = 0; i < group.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'item-view-num' + (i === currentIdx ? ' active' : '');
            btn.textContent = String(i + 1).padStart(2, '0');
            btn.addEventListener('click', () => switchItemPhoto(i));
            itemViewNumbersEl.appendChild(btn);
        }
    }

    function computeTargetRect(naturalW, naturalH) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const marginY = 60;
        const marginR = 284;            // info panel (240) + right gap (36) + breathing room (8)
        const marginL = marginR;        // symmetric → image perfectly centered in viewport
        const maxH = vh - 2 * marginY;
        const maxW = vw - marginL - marginR;
        const aspect = naturalW / naturalH;
        let h = maxH, w = h * aspect;
        if (w > maxW) { w = maxW; h = w / aspect; }
        const x = marginL + (maxW - w) / 2;
        const y = (vh - h) / 2;
        return { x, y, w, h };
    }

    function openItemView(imgEl) {
        if (itemViewOpen) return;
        const itemId = parseInt(imgEl.dataset.itemId, 10);
        const item = items[itemId];
        if (!item) return;

        itemViewOpen = true;
        document.body.classList.add('item-view-open');

        const group = (campaignGroups.get(item.manifest.campaignKey) || [item.manifest]).slice();
        const currentIdx = Math.max(0, group.findIndex(m => m.path === item.manifest.path));

        // Preload all sibling images to eliminate lag on photo switch
        group.forEach(m => { if (m.path !== item.src) { const i = new Image(); i.src = m.path; } });

        const r = imgEl.getBoundingClientRect();
        const origRect = { x: r.left, y: r.top, w: r.width, h: r.height };

        imgEl.classList.add('is-hidden');

        const clone = document.createElement('img');
        clone.src       = item.src;
        clone.draggable = false;
        itemViewImgWrap.appendChild(clone);

        itemViewState = {
            group,
            currentIdx,
            sourceEl:  imgEl,
            sourceRot: item.rot,
            cloneImg:  clone,
            origRect,
            currentManifest: item.manifest,
        };

        gsap.set(clone, {
            position: 'absolute',
            left:     origRect.x,
            top:      origRect.y,
            width:    origRect.w,
            height:   origRect.h,
            rotation: item.rot,
            transformOrigin: 'center center',
        });

        const tgt = computeTargetRect(item.manifest.dw, item.manifest.dh);

        itemViewTitleEl.textContent = buildTitle(item.manifest.csv);
        renderItemMeta(item.manifest.csv);
        renderItemNumbers(group, currentIdx);

        itemView.removeAttribute('aria-hidden');
        itemView.style.display = 'block';

        const tl = gsap.timeline();

        // Backdrop fades + blurs in
        tl.fromTo(itemViewBackdrop,
            { opacity: 0 },
            { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0);

        // Z-axis punch: image lifts toward viewer while expanding
        tl.fromTo(clone, { z: -180 }, { z: 0, duration: 0.95, ease: 'power3.out' }, 0);
        tl.to(clone, {
            left:     tgt.x,
            top:      tgt.y,
            width:    tgt.w,
            height:   tgt.h,
            rotation: 0,
            duration: 0.9,
            ease:     'power3.inOut',
        }, 0);

        // Info panel slides in from the right
        tl.fromTo(itemViewInfo,
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.35);
    }

    function switchItemPhoto(idx) {
        if (!itemViewOpen || !itemViewState) return;
        if (idx === itemViewState.currentIdx) return;
        const m = itemViewState.group[idx];
        if (!m) return;

        itemViewState.currentIdx = idx;
        itemViewState.currentManifest = m;
        itemViewNumbersEl.querySelectorAll('.item-view-num').forEach((b, i) => {
            b.classList.toggle('active', i === idx);
        });

        const clone = itemViewState.cloneImg;
        const tgt   = computeTargetRect(m.dw, m.dh);

        // Cross-fade: shrink + fade out, swap src, expand + fade in
        const tl = gsap.timeline();
        tl.to(clone, {
            opacity: 0,
            scale: 0.96,
            duration: 0.22,
            ease: 'power2.in',
            onComplete: () => {
                clone.src = m.path;
                gsap.set(clone, { left: tgt.x, top: tgt.y, width: tgt.w, height: tgt.h, scale: 1 });
            },
        });
        tl.to(clone, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    }

    function closeItemView() {
        if (!itemViewOpen) return;
        itemViewOpen = false;

        const st = itemViewState;
        const clone = st.cloneImg;
        const target = st.origRect;

        const sourceItem = items[parseInt(st.sourceEl.dataset.itemId, 10)];
        const photoSwitched = st.currentManifest.path !== sourceItem.src;

        const tl = gsap.timeline({
            onComplete: () => {
                itemView.style.display = 'none';
                itemView.setAttribute('aria-hidden', 'true');
                clone.remove();
                st.sourceEl.classList.remove('is-hidden');
                itemViewState = null;
                document.body.classList.remove('item-view-open');
            },
        });

        // Fade info out immediately
        tl.to(itemViewInfo, { x: 30, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);

        // If user navigated to a different photo, restore source img before shrinking
        if (photoSwitched) {
            tl.to(clone, {
                opacity: 0, duration: 0.18,
                onComplete: () => { clone.src = sourceItem.src; },
            }, 0);
            tl.to(clone, { opacity: 1, duration: 0.15 }, 0.18);
        }

        // Shrink back to canvas position — z animation removed to avoid stretch artifact
        gsap.set(clone, { z: 0 });
        tl.to(clone, {
            left:     target.x,
            top:      target.y,
            width:    target.w,
            height:   target.h,
            rotation: st.sourceRot,
            duration: 0.75,
            ease:     'power3.inOut',
        }, photoSwitched ? 0.3 : 0.15);

        tl.to(itemViewBackdrop, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.45');
    }

    itemViewBackBtn.addEventListener('click', (e) => { e.preventDefault(); closeItemView(); });
    itemViewBackdrop.addEventListener('click', closeItemView);

    // Escape closes item view, then archive
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (itemViewOpen)      { closeItemView(); }
        else if (archiveOpen)  { closeArchive(); }
    });
});