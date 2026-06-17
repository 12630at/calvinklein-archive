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
    fontSize = 12;

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
            span.style.letterSpacing = '0px';

            // --- 2000s SOFT TEXT AESTHETIC INTEGRATION ---
            span.style.color = 'rgba(40, 40, 40, 0.85)';
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

    const _deepItem = new URLSearchParams(location.search).get('item');
    document.fonts.ready.then(() => {
        if (_deepItem) openArchiveToItem(_deepItem);
        else play();
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
        document.body.classList.add('page-open');
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
        document.body.classList.remove('page-open');
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
        const tokens = q.split(/\s+/).filter(Boolean);

        // Multi-token: search archive manifests directly across all CSV fields
        if (tokens.length > 1 && archiveManifest) {
            const seen = new Set();
            const results = [];
            for (const m of archiveManifest) {
                const c = m.csv;
                const bag = [c.year, c.season, c.description, normalize(c.campaign),
                    c.subcategory, c.publication, c.photographer, c.model]
                    .filter(Boolean).join(' ').toLowerCase();
                if (tokens.every(t => bag.includes(t)) && !seen.has(m.filename)) {
                    seen.add(m.filename);
                    const descPart = c.description === 'fragrance' ? null : c.description;
                    const label = [c.year, descPart, normalize(c.campaign)]
                        .filter(Boolean).join(' ');
                    results.push({ text: label, type: 'archive', manifest: m });
                }
                if (results.length >= 8) break;
            }
            return results;
        }

        // Single token: use SEARCH_DATA
        return SEARCH_DATA.filter(item => item.text.toLowerCase().includes(tokens[0])).slice(0, 8);
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
        const c = item.manifest?.csv;
        const query = item.queryHint
            ?? (c ? (c.campaign ? normalize(c.campaign) : c.description || c.year) : item.text);
        reverseSearch(async () => {
            if (!archiveOpen) {
                await openArchive();
                setTimeout(() => applyArchiveFilter(query), 1200);
            } else {
                applyArchiveFilter(query);
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
            fontSize:      '12px',
            textTransform: 'uppercase',
            letterSpacing: '0px',
            color:         '#ffffff',
            caretColor:    '#ffffff',
            padding:       '0',
            zIndex:        '100',
            WebkitFontSmoothing: 'antialiased',
        });

        input.addEventListener('input', () => showResults(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { reverseSearch(); return; }
            if (e.key === 'Enter') {
                const matches = filterResults(input.value);
                if (!matches.length) return;
                const first = matches[0];
                if (first.type === 'people')  reverseSearchAndGoToPeople();
                else if (first.type === 'archive') reverseSearchAndGoToArchiveItem(first);
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
            const ext = dims[2] || 'webp';
            const path = cols[iSub]
                ? `assets/index/${cols[iCat]}/${cols[iSub]}/${cols[iYear]}/${filename}.${ext}`
                : `assets/index/${cols[iCat]}/${cols[iYear]}/${filename}.${ext}`;
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
                SEARCH_DATA.push({ text: csv.year, type: 'archive', manifest: m, queryHint: csv.year });
                seen.add(csv.year);
            }
            // Campaign
            if (csv.campaign) {
                const label = normalize(csv.campaign);
                if (!seen.has(label)) {
                    SEARCH_DATA.push({ text: label, type: 'archive', manifest: m, queryHint: label });
                    seen.add(label);
                }
            }
            // Description + campaign combined (skip description for fragrance)
            if (csv.description || csv.campaign) {
                const descPart = csv.description === 'fragrance' ? null : csv.description;
                const parts = [descPart, csv.campaign].filter(Boolean).map(normalize);
                const label = parts.join(' ');
                if (label && !seen.has(label)) {
                    const hint = normalize(csv.campaign) || csv.description;
                    SEARCH_DATA.push({ text: label, type: 'archive', manifest: m, queryHint: hint });
                    seen.add(label);
                }
            }
            // Subcategory
            if (csv.subcategory) {
                const label = normalize(csv.subcategory);
                if (!seen.has(label)) {
                    SEARCH_DATA.push({ text: label, type: 'archive', manifest: m, queryHint: label });
                    seen.add(label);
                }
            }
            // Models — supports comma-separated multiple models per entry
            if (csv.model) {
                for (const raw of csv.model.split(',')) {
                    const modelName = normalize(raw.trim());
                    if (!modelName) continue;
                    const modelKey = modelName.toLowerCase();
                    if (!seen.has(modelKey)) {
                        SEARCH_DATA.push({ text: modelName, type: 'archive', manifest: m, queryHint: modelName });
                        seen.add(modelKey);
                    }
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
        const ordered = images.slice().sort(() => Math.random() - 0.5);

        const colY     = new Array(cols).fill(0);
        const colItems = Array.from({ length: cols }, () => []);
        const result   = [];

        for (let i = 0; i < ordered.length; i++) {
            const img    = ordered[i];
            const aspect = img.dw / img.dh;
            const w = COL_W;
            const h = w / aspect;
            // No rotation on videos: even ±0.6° causes severe edge aliasing
            // because the browser rasterises the video texture into the
            // rotated layer at low quality.
            const rot = isVideoSrc(img.path)
                ? 0
                : (rand01(img.path, 'r') - 0.5) * 1.2;

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

    const VIDEO_EXTS = ['mp4', 'webm', 'mov'];
    function isVideoSrc(src) {
        const dot = src.lastIndexOf('.');
        if (dot < 0) return false;
        return VIDEO_EXTS.includes(src.slice(dot + 1).toLowerCase());
    }

    function createImgEl(it, wx, wy) {
        const isVideo = isVideoSrc(it.src);

        if (isVideo) {
            // Wrap in a plain div so the rotation transform lives on the wrapper,
            // not on the <video> element itself — avoids GPU compositing pixelation.
            const wrap = document.createElement('div');
            wrap.className = 'archive-img archive-video-wrap';
            wrap.style.width  = it.w + 'px';
            wrap.style.height = it.h + 'px';
            wrap.style.left   = wx + 'px';
            wrap.style.top    = wy + 'px';
            wrap.dataset.rot    = it.rot;
            wrap.dataset.itemId = it.id;
            wrap.dataset.video  = '1';
            gsap.set(wrap, { rotation: it.rot });

            const vid = document.createElement('video');
            vid.src         = it.src;
            vid.muted       = true;
            vid.loop        = true;
            vid.autoplay    = true;
            vid.playsInline = true;
            vid.setAttribute('muted', '');
            vid.setAttribute('playsinline', '');
            vid.style.width  = '100%';
            vid.style.height = '100%';
            vid.style.display = 'block';
            vid.addEventListener('loadedmetadata', () => vid.play().catch(() => {}));
            vid.play().catch(() => {});
            wrap.appendChild(vid);
            return wrap;
        }

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
        stopWheelGlide();
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
        if (dist < 6 && elapsed < 400 && downTarget && downTarget.classList && (downTarget.classList.contains('archive-img'))) {
            openItemView(downTarget);
            return;
        }
        // <video> elements may report the inner shadow DOM as target — climb up.
        if (dist < 6 && elapsed < 400 && downTarget) {
            const tile = downTarget.closest && downTarget.closest('.archive-img');
            if (tile) { openItemView(tile); return; }
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

    // Wheel/trackpad scroll to pan the canvas — smoothed.
    // Deltas accumulate into a target offset and the canvas eases toward it
    // every frame, so flicks glide to a stop instead of snapping per-tick.
    let wheelTarget = null;
    let wheelRAF    = null;
    const WHEEL_EASE = 0.16;   // higher = snappier, lower = smoother/longer glide

    function stopWheelGlide() {
        if (wheelRAF) { cancelAnimationFrame(wheelRAF); wheelRAF = null; }
        wheelTarget = null;
    }

    function wheelGlideStep() {
        if (!wheelTarget) { wheelRAF = null; return; }
        const dx = wheelTarget.x - canvasOffset.x;
        const dy = wheelTarget.y - canvasOffset.y;
        canvasOffset.x += dx * WHEEL_EASE;
        canvasOffset.y += dy * WHEEL_EASE;
        applyCanvasTransform();
        scheduleSync();
        if (Math.hypot(dx, dy) > 0.4) {
            wheelRAF = requestAnimationFrame(wheelGlideStep);
        } else {
            canvasOffset.x = wheelTarget.x;
            canvasOffset.y = wheelTarget.y;
            applyCanvasTransform();
            scheduleSync();
            wheelRAF = null;
            wheelTarget = null;
        }
    }

    archiveViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!archiveOpen || itemViewOpen || switching) return;
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }
        if (!wheelTarget) wheelTarget = { x: canvasOffset.x, y: canvasOffset.y };
        wheelTarget.x -= e.deltaX;
        wheelTarget.y -= e.deltaY;
        if (!wheelRAF) wheelRAF = requestAnimationFrame(wheelGlideStep);
    }, { passive: false });

    // ----- Search filter across archive items -----
    let currentSearchQuery = '';

    function filterByQuery(manifests, query) {
        if (!query) return manifests;
        const q = normalize(query).toLowerCase().trim();
        return manifests.filter(m => {
            const c = m.csv;
            return [c.year, c.campaign, c.description, c.subcategory,
                    c.photographer, c.model, c.director, c.creative_director,
                    c.art_director, c.publication]
                .some(f => f && normalize(f).toLowerCase().includes(q));
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
            gsap.set(fresh, { scale: 0, opacity: 0 });
        });

        tl.add(() => {
            const fresh = Array.from(mounted.values());
            if (!fresh.length) return;
            gsap.to(fresh, {
                scale: 1, opacity: 1,
                duration: 0.9, ease: 'back.out(1.6)',
                stagger: { amount: 0.55, from: 'center' },
            });
        }, '+=0.05');

        tl.to({}, { duration: 1.0 });
    }

    // ----- Category switch: scatter + drop-in -----
    function setCategory(catLabel) {
        const queryActive = currentSearchQuery !== '';
        if ((catLabel === currentCategory && !queryActive) || switching) return;

        document.querySelectorAll('.menu-cat').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === catLabel);
        });
        archiveShowAll.classList.toggle('cat-all-active', catLabel === 'all');

        // If list view is open, rebuild the list for the new category
        if (listViewOpen) {
            currentCategory    = catLabel;
            currentSearchQuery = '';
            listManifests = filterImages(catLabel);
            buildListView(listManifests);
            const rows = Array.from(archiveListInner.querySelectorAll('.archive-list-row'));
            gsap.fromTo(rows,
                { opacity: 0, x: -24 },
                { opacity: 1, x: 0, duration: 0.4, ease: 'back.out(1.2)', stagger: { amount: 0.4, from: 'start' } }
            );
            return;
        }

        switching = true;
        currentSearchQuery = '';
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }
        currentCategory = catLabel;

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
            gsap.set(fresh, { scale: 0, opacity: 0 });
        });

        // 3. Drop in with bounce
        tl.add(() => {
            const fresh = Array.from(mounted.values());
            if (!fresh.length) return;
            gsap.to(fresh, {
                scale:    1,
                opacity:  1,
                duration: 0.9,
                ease:     'back.out(1.6)',
                stagger:  { amount: 0.55, from: 'center' },
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
        document.body.classList.add('page-open');

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
        gsap.set(fresh, { scale: 0.5, opacity: 0 });
        gsap.set(archiveCanvas, { opacity: 1 });
        gsap.to(fresh, {
            scale: 1, opacity: 1,
            duration: 0.95, ease: 'back.out(1.4)',
            stagger: { amount: 0.6, from: 'center' },
            delay: 0.25,
        });

        // Show list view toggle button (CSS transition handles opacity)
        setTimeout(() => document.getElementById('list-view-btn').classList.add('visible'), 500);
    }

    async function closeArchive() {
        if (!archiveOpen) return;
        archiveOpen = false;
        document.body.classList.remove('page-open');
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }

        // If list view is open, force-close it silently first
        if (listViewOpen) {
            listViewOpen = false;
            listViewBtn.textContent = 'LIST VIEW';
            archiveList.style.display = 'none';
            archiveList.setAttribute('aria-hidden', 'true');
            archiveViewport.style.pointerEvents = '';
        }
        document.getElementById('list-view-btn').classList.remove('visible');

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

    // Deep-link: apri l'archivio direttamente sulla vista dettaglio di un item.
    // Usato dal mondo phygital: ../index.html?archive=1&item=<filename>
    async function openArchiveToItem(stem) {
        const stageEl = document.getElementById('stage');
        const menuEl  = document.getElementById('menu');
        if (stageEl) stageEl.style.display = 'none';     // salta l'intro
        if (menuEl) { menuEl.style.opacity = '1'; menuEl.style.pointerEvents = 'all'; }
        await openArchive();
        const m = archiveManifest.find(x => x.filename === stem);
        if (m) { await new Promise(r => setTimeout(r, 650)); openItemViewFromList(m); }
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
            if (listViewOpen) {
                buildListView(listManifests);
                return;
            }
            unmountAll();
            items = buildItems(filterImages(currentCategory));
            canvasOffset.x = -tileSize.w / 2 + window.innerWidth  / 2;
            canvasOffset.y = -tileSize.h / 2 + window.innerHeight / 2;
            applyCanvasTransform();
            syncMounted();
        }, 150);
    });

    // ===== LIST VIEW =====

    const listViewBtn      = document.getElementById('list-view-btn');
    const archiveList      = document.getElementById('archive-list');
    const archiveListInner = document.getElementById('archive-list-inner');

    let listViewOpen  = false;
    let listSortCol   = 'year';
    let listSortAsc   = false;  // year descending by default = most recent first
    let listManifests = [];

    const CAT_LABEL = { adv: 'Advertisement', edi: 'Editorial' };
    const SUB_LABEL = { print: 'Print', billboard: 'Billboard', tv: 'TV' };
    const SEA_LABEL = { ss: 'S/S', fw: 'F/W' };

    function _listVal(m, col) {
        switch (col) {
            case 'year':     return parseInt(m.csv.year) || 0;
            case 'season':   return m.csv.season || '';
            case 'category': return m.csv.category || '';
            case 'line':     return (m.csv.description || '').toLowerCase();
            case 'campaign': return (m.csv.campaign || m.csv.description || '').toLowerCase();
        }
        return '';
    }

    // Deduplicate manifests to one representative per campaignKey
    function uniqueCampaigns(manifests) {
        const seen = new Set();
        const result = [];
        for (const m of manifests) {
            if (seen.has(m.campaignKey)) continue;
            seen.add(m.campaignKey);
            const group = campaignGroups.get(m.campaignKey);
            result.push(group ? group[0] : m);  // always use first of group
        }
        return result;
    }

    function buildListView(manifests) {
        const unique = uniqueCampaigns(manifests);
        const sorted = unique.sort((a, b) => {
            const va = _listVal(a, listSortCol);
            const vb = _listVal(b, listSortCol);
            if (va < vb) return listSortAsc ? -1 : 1;
            if (va > vb) return listSortAsc ? 1 : -1;
            return 0;
        });

        archiveListInner.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'archive-list-table';

        // Header: # | Campaign | Year | Season | Line | Category | Sub
        const thead = document.createElement('thead');
        thead.className = 'archive-list-thead';
        const hRow = document.createElement('tr');
        const colDefs = [
            { key: 'num',      label: '#',        cls: 'th-num',      sortable: false },
            { key: 'campaign', label: 'Campaign',  cls: 'th-campaign', sortable: true  },
            { key: 'year',     label: 'Year',      cls: 'th-year',     sortable: true  },
            { key: 'season',   label: 'Season',    cls: 'th-season',   sortable: true  },
            { key: 'line',     label: 'Line',      cls: 'th-line',     sortable: true  },
            { key: 'category', label: 'Category',  cls: 'th-cat',      sortable: true  },
            { key: 'sub',      label: 'Sub',       cls: 'th-sub',      sortable: false },
        ];
        for (const cd of colDefs) {
            const th = document.createElement('th');
            th.textContent = cd.label;
            th.className = cd.cls;
            if (cd.sortable) {
                th.classList.add('sortable');
                th.classList.toggle('sort-active', cd.key === listSortCol);
                if (cd.key === listSortCol) th.classList.add(listSortAsc ? 'sort-asc' : 'sort-desc');
                th.addEventListener('click', () => {
                    if (listSortCol === cd.key) {
                        listSortAsc = !listSortAsc;
                    } else {
                        listSortCol = cd.key;
                        listSortAsc = true;
                    }
                    buildListView(listManifests);
                    const rows = Array.from(archiveListInner.querySelectorAll('.archive-list-row'));
                    gsap.fromTo(rows,
                        { opacity: 0, y: 4 },
                        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', stagger: { amount: 0.18, from: 'start' } }
                    );
                });
            }
            hRow.appendChild(th);
        }
        thead.appendChild(hRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        sorted.forEach((m, idx) => {
            const campStr   = m.csv.campaign    ? m.csv.campaign.replace(/_/g, ' ')    : m.csv.description ? m.csv.description.replace(/_/g, ' ') : '—';
            const lineStr   = m.csv.description ? m.csv.description.replace(/_/g, ' ') : '—';
            const catLabel  = CAT_LABEL[m.csv.category]    || m.csv.category    || '—';
            const subLabel  = SUB_LABEL[m.csv.subcategory] || m.csv.subcategory || '—';
            const seasonStr = SEA_LABEL[m.csv.season] || '—';

            const tr = document.createElement('tr');
            tr.className = 'archive-list-row';

            const mkTd = (cls, text) => {
                const td = document.createElement('td');
                td.className = cls;
                td.textContent = text.toUpperCase();
                return td;
            };
            tr.appendChild(mkTd('col-num',      String(idx + 1).padStart(3, '0')));
            tr.appendChild(mkTd('col-campaign', campStr));
            tr.appendChild(mkTd('col-year',     m.csv.year || '—'));
            tr.appendChild(mkTd('col-season',   seasonStr));
            tr.appendChild(mkTd('col-line',     lineStr));
            tr.appendChild(mkTd('col-cat',      catLabel));
            tr.appendChild(mkTd('col-sub',      subLabel));

            tr.addEventListener('click', () => {
                if (itemViewOpen) return;
                const rowRect = tr.getBoundingClientRect();
                const fromRect = { x: rowRect.left, y: rowRect.top + rowRect.height / 2, w: rowRect.width, h: 2 };

                // Dim all rows, highlight the selected one
                const allRows = Array.from(archiveListInner.querySelectorAll('.archive-list-row'));
                gsap.to(allRows, { opacity: 0, duration: 0.18, ease: 'power2.in' });
                gsap.to(archiveListInner.querySelectorAll('.archive-list-thead th'), { opacity: 0, duration: 0.12 });

                setTimeout(() => openItemViewFromList(m, fromRect), 150);
            });

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        archiveListInner.appendChild(table);
    }

    function openListView() {
        if (listViewOpen || switching) return;
        listViewOpen = true;
        listViewBtn.textContent = 'INFINITE VIEW';

        listManifests = filterImages(currentCategory);
        buildListView(listManifests);

        const oldEls = Array.from(mounted.values());
        const tl = gsap.timeline();

        // 1. Canvas tiles fade out cleanly
        if (oldEls.length) {
            tl.to(oldEls, {
                opacity: 0, scale: 0.97,
                duration: 0.28,
                ease: 'power2.in',
                stagger: { amount: 0.1, from: 'center' },
            });
        }

        // 2. Swap to list panel
        tl.call(() => {
            archiveViewport.style.pointerEvents = 'none';
            archiveList.removeAttribute('aria-hidden');
            archiveList.style.display = 'flex';
            archiveList.style.opacity = '0';
            gsap.set(archiveListInner.querySelectorAll('.archive-list-row'), { opacity: 0, y: 10 });
            gsap.set(archiveListInner.querySelectorAll('.archive-list-thead th'), { opacity: 0, y: 10 });
        });

        // 3. Panel fades in
        tl.to(archiveList, { opacity: 1, duration: 0.3, ease: 'power2.out' });

        // 4. Header — same gentle fade-up as the mobile menu, a touch slower
        tl.to(archiveListInner.querySelectorAll('.archive-list-thead th'), {
            opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
            stagger: { amount: 0.2, from: 'start' },
        }, '-=0.1');

        // 5. Rows stream in top-to-bottom — slowed, mobile-menu-style fade-up
        tl.to(archiveListInner.querySelectorAll('.archive-list-row'), {
            opacity: 1, y: 0,
            duration: 0.4,
            ease: 'power2.out',
            stagger: { amount: 1.2, from: 'start' },
        }, '-=0.15');
    }

    function closeListView() {
        if (!listViewOpen) return;
        listViewOpen = false;
        listViewBtn.textContent = 'LIST VIEW';

        const rows    = Array.from(archiveListInner.querySelectorAll('.archive-list-row'));
        const headers = Array.from(archiveListInner.querySelectorAll('.archive-list-thead th'));
        const tl = gsap.timeline();

        // 1. Rows fade out quickly
        if (rows.length) {
            tl.to(rows, {
                opacity: 0, y: -3,
                duration: 0.14,
                ease: 'power2.in',
                stagger: { amount: 0.15, from: 'start' },
            });
        }
        if (headers.length) {
            tl.to(headers, { opacity: 0, duration: 0.1, ease: 'power2.in' }, 0);
        }

        // 2. Panel fades out
        tl.to(archiveList, { opacity: 0, duration: 0.15, ease: 'power2.in' }, '-=0.05');

        // 3. Restore canvas — unmountAll first so scattered elements are recreated fresh
        tl.call(() => {
            archiveList.style.display = 'none';
            archiveList.setAttribute('aria-hidden', 'true');
            archiveViewport.style.pointerEvents = '';
            unmountAll();
            syncMounted();
            const fresh = Array.from(mounted.values());
            gsap.set(fresh, { scale: 0.94, opacity: 0, y: -10 });
        });

        // 4. Canvas tiles drop in cleanly
        tl.add(() => {
            const fresh = Array.from(mounted.values());
            if (!fresh.length) return;
            gsap.to(fresh, {
                scale: 1, opacity: 1, y: 0,
                rotation: (i, el) => parseFloat(el.dataset.rot || 0),
                duration: 0.38,
                ease: 'power3.out',
                stagger: { amount: 0.3, from: 'center' },
            });
        }, '+=0.04');
    }

    listViewBtn.addEventListener('click', () => {
        if (listViewOpen) closeListView();
        else openListView();
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

    const normalize = s => s ? s.replace(/_/g, ' ').replace(/\bformen\b/gi, 'for men') : '';
    const prettify  = s => normalize(s).toUpperCase();

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

    const isMobileView = () => window.innerWidth <= 600;

    // Counter "01/02" — visible on mobile (CSS), in place of the old number line.
    function renderItemCounter(group, currentIdx) {
        itemViewNumbersEl.innerHTML = '';
        if (group.length <= 1) return;
        const counter = document.createElement('span');
        counter.className = 'item-view-counter';
        counter.textContent = counterText(currentIdx, group.length);
        itemViewNumbersEl.appendChild(counter);
    }

    function counterText(idx, total) {
        return `${String(idx + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
    }

    function updateItemCounter() {
        const c = itemViewNumbersEl.querySelector('.item-view-counter');
        if (c && itemViewState) {
            c.textContent = counterText(itemViewState.currentIdx, itemViewState.group.length);
        }
    }

    // Number line — restored for VIDEO item views only.
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

    // On mobile the credits sit directly under the image; feed their top edge to CSS.
    function positionMobileInfo(tgt) {
        if (isMobileView()) {
            itemView.style.setProperty('--iv-info-top', (tgt.y + tgt.h + 16) + 'px');
        } else {
            itemView.style.removeProperty('--iv-info-top');
        }
    }

    function computeTargetRect(naturalW, naturalH) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const aspect = naturalW / naturalH;

        // Mobile: single column — image centered in the upper band, credits below.
        if (isMobileView()) {
            const M = 16;                 // page gutter
            const topGap = 16;
            const band = vh * 0.6;        // upper region reserved for the image
            const maxW = vw - 2 * M;
            const maxH = band - 2 * topGap;
            let w = maxW, h = w / aspect;
            if (h > maxH) { h = maxH; w = h * aspect; }
            const x = (vw - w) / 2;
            const y = Math.max(topGap, (band - h) / 2);   // centered in the band
            return { x, y, w, h };
        }

        const marginY = 60;
        const marginR = 284;            // info panel (240) + right gap (36) + breathing room (8)
        const marginL = marginR;        // symmetric → image perfectly centered in viewport
        const maxH = vh - 2 * marginY;
        const maxW = vw - marginL - marginR;
        let h = maxH, w = h * aspect;
        if (w > maxW) { w = maxW; h = w / aspect; }
        const x = marginL + (maxW - w) / 2;
        const y = (vh - h) / 2;
        return { x, y, w, h };
    }

    // ----- Prev / Next navigation over the image (group photos) -----
    // Left half = previous, right half = next (wrapping). On desktop a black
    // pill follows the cursor showing "Prev (01/10)" / "Next (01/10)"; on mobile
    // the same taps drive navigation and the "01/02" counter in the credits.
    let navZonesEl   = null;
    let cursorPillEl = null;

    function ensureCursorPill() {
        if (!cursorPillEl) {
            cursorPillEl = document.createElement('div');
            cursorPillEl.id = 'item-view-cursor';
            itemView.appendChild(cursorPillEl);
        }
        return cursorPillEl;
    }

    function navPillLabel(dir) {
        if (!itemViewState) return '';
        const word = dir === 'prev' ? 'Prev' : 'Next';
        return `${word} (${counterText(itemViewState.currentIdx, itemViewState.group.length)})`;
    }

    function buildNavZones() {
        if (navZonesEl) { navZonesEl.remove(); navZonesEl = null; }
        navZonesEl = document.createElement('div');
        navZonesEl.id = 'item-view-nav-zones';
        const left  = document.createElement('div'); left.className  = 'ivn-zone ivn-zone-left';
        const right = document.createElement('div'); right.className = 'ivn-zone ivn-zone-right';
        navZonesEl.appendChild(left);
        navZonesEl.appendChild(right);
        itemView.appendChild(navZonesEl);

        const pill = ensureCursorPill();

        const navTo = (dir) => {
            if (!itemViewState) return;
            const n = itemViewState.group.length;
            const next = dir === 'prev'
                ? (itemViewState.currentIdx - 1 + n) % n
                : (itemViewState.currentIdx + 1) % n;
            switchItemPhoto(next);
            if (!isMobileView()) pill.textContent = navPillLabel(dir);
        };
        const enter = (dir) => () => {
            if (isMobileView()) return;
            pill.textContent = navPillLabel(dir);
            pill.classList.add('visible');
        };
        const move = (e) => {
            if (isMobileView()) return;
            pill.style.left = e.clientX + 'px';
            pill.style.top  = e.clientY + 'px';
        };
        const leave = () => pill.classList.remove('visible');

        left.addEventListener('mouseenter', enter('prev'));
        right.addEventListener('mouseenter', enter('next'));
        left.addEventListener('mousemove', move);
        right.addEventListener('mousemove', move);
        left.addEventListener('mouseleave', leave);
        right.addEventListener('mouseleave', leave);
        left.addEventListener('click', () => navTo('prev'));
        right.addEventListener('click', () => navTo('next'));
    }

    function positionNavZones(rect) {
        if (!navZonesEl) return;
        Object.assign(navZonesEl.style, {
            position: 'fixed',
            left:   rect.x + 'px',
            top:    rect.y + 'px',
            width:  rect.w + 'px',
            height: rect.h + 'px',
        });
    }

    function removeNavZones() {
        if (navZonesEl)   { navZonesEl.remove(); navZonesEl = null; }
        if (cursorPillEl) { cursorPillEl.classList.remove('visible'); }
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

        const itemIsVideo = isVideoSrc(item.src);

        // Preload all sibling images (not videos) to eliminate lag on photo switch
        group.forEach(m => { if (m.path !== item.src && !isVideoSrc(m.path)) { const i = new Image(); i.src = m.path; } });

        const r = imgEl.getBoundingClientRect();
        const origRect = { x: r.left, y: r.top, w: r.width, h: r.height };

        imgEl.classList.add('is-hidden');

        const clone = document.createElement(itemIsVideo ? 'video' : 'img');
        clone.src       = item.src;
        clone.draggable = false;
        if (itemIsVideo) {
            clone.loop        = true;
            clone.playsInline = true;
            clone.setAttribute('playsinline', '');
            clone.muted       = false;
            clone.volume      = 1;
            clone.currentTime = 0;
            clone.play().catch(() => {});
            itemView.classList.add('is-video');
            buildVideoControls();
        } else {
            itemView.classList.remove('is-video');
        }
        itemViewImgWrap.appendChild(clone);

        itemViewState = {
            group,
            currentIdx,
            sourceEl:  imgEl,
            sourceRot: item.rot,
            cloneImg:  clone,
            origRect,
            currentManifest: item.manifest,
            isVideo:   itemIsVideo,
            userPaused: false,
            controlsEnabled: !itemIsVideo, // videos: unlocked after a short delay below
            controlsTimer: null,
        };
        if (itemIsVideo) {
            // Lock the hover speed controls for the first few seconds so the user
            // sees a chunk of normal playback before the margins start scrubbing.
            itemViewState.controlsTimer = setTimeout(() => {
                if (itemViewState) itemViewState.controlsEnabled = true;
            }, 2500);
        }

        gsap.set(clone, {
            position: 'absolute',
            left:     origRect.x,
            top:      origRect.y,
            width:    origRect.w,
            height:   origRect.h,
            rotation: item.rot,
            transformOrigin: 'center center',
        });

        itemViewTitleEl.textContent = buildTitle(item.manifest.csv);
        renderItemMeta(item.manifest.csv);
        // Video keeps the clickable number line; images get the prev/next counter.
        if (itemIsVideo) renderItemNumbers(group, currentIdx);
        else             renderItemCounter(group, currentIdx);

        itemView.removeAttribute('aria-hidden');
        itemView.style.display = 'block';

        const tgt = computeTargetRect(item.manifest.dw, item.manifest.dh);
        positionMobileInfo(tgt);
        if (itemIsVideo)            positionVideoZones(tgt);
        else if (group.length > 1) { buildNavZones(); positionNavZones(tgt); }

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

    // ----- Video item view controls (hover zones + reverse / fast-forward / stop) -----
    let videoReversing  = false;
    let _reverseCleanup = null;
    let videoZonesEl    = null;

    function stopVideoReverse() {
        videoReversing = false;
        if (_reverseCleanup) { _reverseCleanup(); _reverseCleanup = null; }
    }

    // Seeked-event-chaining reverse: after each seek completes we immediately
    // schedule the next one. This is the only browser-compatible way to show
    // backward frames — rAF-based currentTime stomping gets ignored mid-seek.
    function startVideoReverse(video) {
        if (videoReversing) return;
        videoReversing = true;
        try { video.pause(); } catch (_) {}

        const STEP = 0.08; // seconds per seek step (~12 fps backward)

        const doSeek = () => {
            if (!videoReversing) return;
            const dur = isFinite(video.duration) ? video.duration : 0;
            let t = video.currentTime - STEP;
            if (t < 0.02) t = Math.max(0.02, dur - 0.05);
            video.currentTime = t;
        };

        const onSeeked = () => {
            if (!videoReversing) return;
            // 25 ms gap lets the browser decode + paint the decoded frame
            setTimeout(doSeek, 25);
        };

        video.addEventListener('seeked', onSeeked);
        _reverseCleanup = () => video.removeEventListener('seeked', onSeeked);

        doSeek(); // start the chain
    }

    function setVideoSpeed(video, mode) {
        if (mode === 'reverse') { startVideoReverse(video); return; }
        stopVideoReverse();
        if (mode === 'paused') { video.pause(); return; }
        video.playbackRate = (mode === 'fast') ? 3 : 1;
        video.play().catch(() => {});
    }

    function buildVideoControls() {
        if (videoZonesEl) { videoZonesEl.remove(); videoZonesEl = null; }

        videoZonesEl = document.createElement('div');
        videoZonesEl.id = 'item-view-video-zones';

        const left   = document.createElement('div'); left.className = 'iv-zone iv-zone-left';
        const center = document.createElement('div'); center.className = 'iv-zone iv-zone-center';
        const right  = document.createElement('div'); right.className = 'iv-zone iv-zone-right';

        videoZonesEl.appendChild(left);
        videoZonesEl.appendChild(center);
        videoZonesEl.appendChild(right);
        itemView.appendChild(videoZonesEl);

        const getVid = () => itemViewState && itemViewState.cloneImg;
        const ready  = () => itemViewState && itemViewState.controlsEnabled && !itemViewState.userPaused;

        // Dwell delay: side zones only activate after the cursor stays inside
        // for ~260 ms, so a quick transit between back-button and credits
        // panel doesn't trigger reverse / fast-forward in passing.
        let dwellTimer = null;
        const DWELL_MS = 260;
        const cancelDwell = () => { if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; } };

        const armDwell = (mode) => () => {
            cancelDwell();
            dwellTimer = setTimeout(() => {
                dwellTimer = null;
                const v = getVid(); if (v && ready()) setVideoSpeed(v, mode);
            }, DWELL_MS);
        };

        const leaveSide = () => {
            cancelDwell();
            const v = getVid(); if (v && ready()) setVideoSpeed(v, 'normal');
        };

        left.addEventListener('mouseenter',   armDwell('reverse'));
        right.addEventListener('mouseenter',  armDwell('fast'));
        left.addEventListener('mouseleave',   leaveSide);
        right.addEventListener('mouseleave',  leaveSide);

        center.addEventListener('mouseenter', () => {
            cancelDwell();
            const v = getVid(); if (v && ready()) setVideoSpeed(v, 'normal');
        });

        center.addEventListener('click', () => {
            const v = getVid(); if (!v) return;
            itemViewState.userPaused = !itemViewState.userPaused;
            setVideoSpeed(v, itemViewState.userPaused ? 'paused' : 'normal');
            itemView.classList.toggle('video-paused', itemViewState.userPaused);
        });
    }

    function positionVideoZones(rect) {
        if (!videoZonesEl) return;
        Object.assign(videoZonesEl.style, {
            position: 'fixed',
            left:   rect.x + 'px',
            top:    rect.y + 'px',
            width:  rect.w + 'px',
            height: rect.h + 'px',
        });
    }

    function fadeOutVideoAudio(video, ms) {
        return new Promise(resolve => {
            if (!video || video.muted) { resolve(); return; }
            const startVol = video.volume;
            const start = performance.now();
            const step = (now) => {
                const k = Math.min(1, (now - start) / ms);
                video.volume = startVol * (1 - k);
                if (k < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    function switchItemPhoto(idx) {
        if (!itemViewOpen || !itemViewState) return;
        if (idx === itemViewState.currentIdx) return;
        const m = itemViewState.group[idx];
        if (!m) return;

        itemViewState.currentIdx = idx;
        itemViewState.currentManifest = m;
        updateItemCounter();
        itemViewNumbersEl.querySelectorAll('.item-view-num').forEach((b, i) => {
            b.classList.toggle('active', i === idx);
        });

        const clone = itemViewState.cloneImg;
        const tgt   = computeTargetRect(m.dw, m.dh);
        positionMobileInfo(tgt);
        if (navZonesEl) positionNavZones(tgt);
        const nextIsVideo = isVideoSrc(m.path);

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
                if (nextIsVideo) {
                    clone.currentTime = 0;
                    clone.play().catch(() => {});
                }
            },
        });
        tl.to(clone, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    }

    // Open item view when originating from the list view (no canvas element)
    function openItemViewFromList(manifest, fromRect) {
        if (itemViewOpen) return;
        itemViewOpen = true;
        document.body.classList.add('item-view-open');

        const group = (campaignGroups.get(manifest.campaignKey) || [manifest]).slice();
        const currentIdx = Math.max(0, group.findIndex(m2 => m2.filename === manifest.filename));
        const isVideo = isVideoSrc(manifest.path);

        group.forEach(m2 => {
            if (m2.path !== manifest.path && !isVideoSrc(m2.path)) {
                const im = new Image(); im.src = m2.path;
            }
        });

        const origRect = fromRect || { x: window.innerWidth / 2, y: window.innerHeight / 2, w: 4, h: 4 };

        const clone = document.createElement(isVideo ? 'video' : 'img');
        clone.src       = manifest.path;
        clone.draggable = false;
        if (isVideo) {
            clone.loop = true; clone.playsInline = true;
            clone.setAttribute('playsinline', '');
            clone.muted = false; clone.volume = 1; clone.currentTime = 0;
            clone.play().catch(() => {});
            itemView.classList.add('is-video');
            buildVideoControls();
        } else {
            itemView.classList.remove('is-video');
        }
        itemViewImgWrap.appendChild(clone);

        itemViewState = {
            group, currentIdx,
            sourceEl:        null,
            fromList:        true,
            sourceRot:       0,
            cloneImg:        clone,
            origRect,
            currentManifest: manifest,
            isVideo,
            userPaused:      false,
            controlsEnabled: !isVideo,
            controlsTimer:   null,
        };
        if (isVideo) {
            itemViewState.controlsTimer = setTimeout(() => {
                if (itemViewState) itemViewState.controlsEnabled = true;
            }, 2500);
        }

        itemViewTitleEl.textContent = buildTitle(manifest.csv);
        renderItemMeta(manifest.csv);
        if (isVideo) renderItemNumbers(group, currentIdx);
        else         renderItemCounter(group, currentIdx);

        itemView.removeAttribute('aria-hidden');
        itemView.style.display = 'block';

        const tgt = computeTargetRect(manifest.dw, manifest.dh);
        positionMobileInfo(tgt);

        // Start at target position, collapsed — mirrors the exit collapse animation
        gsap.set(clone, {
            position: 'absolute',
            left: tgt.x, top: tgt.y, width: tgt.w, height: tgt.h,
            scale: 0.08, opacity: 0,
            rotation: 0, transformOrigin: 'center center',
        });

        if (isVideo)               positionVideoZones(tgt);
        else if (group.length > 1) { buildNavZones(); positionNavZones(tgt); }

        const tl = gsap.timeline();
        tl.fromTo(itemViewBackdrop, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);
        tl.to(clone, { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }, 0);
        tl.fromTo(itemViewInfo, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.18);
    }

    function closeItemView() {
        if (!itemViewOpen) return;
        itemViewOpen = false;

        if (cursorPillEl) cursorPillEl.classList.remove('visible');

        const st = itemViewState;
        const clone = st.cloneImg;
        const target = st.origRect;

        const sourceItem = st.sourceEl ? items[parseInt(st.sourceEl.dataset.itemId, 10)] : null;
        const photoSwitched = !st.isVideo && sourceItem && st.currentManifest.path !== sourceItem.src;

        // For video: stop any reverse simulation, restore normal rate, then fade audio
        // out in parallel with the shrink animation to avoid an abrupt cut.
        if (st.isVideo) {
            stopVideoReverse();
            if (st.controlsTimer) { clearTimeout(st.controlsTimer); st.controlsTimer = null; }
            clone.playbackRate = 1;
            fadeOutVideoAudio(clone, 700);
        }

        const tl = gsap.timeline({
            onComplete: () => {
                itemView.style.display = 'none';
                itemView.setAttribute('aria-hidden', 'true');
                if (st.isVideo) { try { clone.pause(); } catch (_) {} }
                clone.remove();
                if (videoZonesEl) { videoZonesEl.remove(); videoZonesEl = null; }
                removeNavZones();
                itemView.classList.remove('is-video', 'video-paused');
                if (st.sourceEl) st.sourceEl.classList.remove('is-hidden');
                // Restore list rows if we came from list view
                if (st.fromList && listViewOpen) {
                    const rows = Array.from(archiveListInner.querySelectorAll('.archive-list-row'));
                    gsap.to(rows, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', stagger: { amount: 0.2 } });
                }
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

        gsap.set(clone, { z: 0 });

        if (st.fromList) {
            // Flash collapse: scale down to center — classic Flash "closing" effect
            tl.to(clone, {
                scale: 0.08, opacity: 0,
                duration: 0.45, ease: 'power3.in',
            }, 0.05);
        } else {
            // Shrink back to canvas position
            tl.to(clone, {
                left:     target.x,
                top:      target.y,
                width:    target.w,
                height:   target.h,
                rotation: st.sourceRot,
                duration: 0.75,
                ease:     'power3.inOut',
            }, photoSwitched ? 0.3 : 0.15);
        }

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

    // Preload archive manifest in background so search is always up to date
    loadArchiveManifest().then(enrichSearchWithArchive).catch(() => {});

    // ===== TIMELINE PAGE =====
    // The stage itself is fixed; only #timeline-scroll scrolls inside it.
    // Years use the same flash-in / flash-out keyframes as the intro words
    // (cubic-bezier(0.19, 1, 0.22, 1), blur, scale) for the 2000s Flash feel.
    // Paragraphs get an .is-visible class via IntersectionObserver and
    // GSAP drives the final easing to keep timing in sync with the rest.

    const timelineEl     = document.getElementById('timeline');
    const timelineStage  = document.getElementById('timeline-stage');
    const timelineScroll = document.getElementById('timeline-scroll');
    const timelineClose  = document.getElementById('timeline-close');

    let timelineObserver  = null;
    let timelineScrollDir = 'down';
    let timelineLastTop   = 0;

    // Track scroll direction so animations come from above when scrolling up.
    timelineScroll.addEventListener('scroll', () => {
        const st = timelineScroll.scrollTop;
        if (st > timelineLastTop + 0.5)      timelineScrollDir = 'down';
        else if (st < timelineLastTop - 0.5) timelineScrollDir = 'up';
        timelineLastTop = st;
    }, { passive: true });

    function openTimeline() {
        document.body.classList.add('timeline-open', 'page-open');
        timelineStage.removeAttribute('aria-hidden');
        timelineStage.style.display = 'block';
        void timelineStage.offsetWidth;
        timelineStage.style.opacity = '1';

        // Reset scroll + animation state every time the page is opened
        timelineScroll.scrollTop = 0;
        timelineLastTop   = 0;
        timelineScrollDir = 'down';
        const entries = timelineStage.querySelectorAll('.timeline-entry');
        entries.forEach(entry => {
            const year = entry.querySelector('.timeline-year');
            const para = entry.querySelector('.timeline-paragraph');
            year.classList.remove('flash-in', 'flash-out', 'from-above', 'to-below');
            gsap.set(year, { clearProps: 'all' });
            gsap.set(para, { opacity: 0, y: 16, filter: 'blur(4px)', clearProps: 'scale' });
        });

        // One observer per entry. When the entry's center crosses into the
        // viewport, the year flashes in immediately and the paragraph
        // follows after a short delay (year first, then paragraph).
        // Direction of the flash depends on timelineScrollDir.
        timelineObserver = new IntersectionObserver((records) => {
            for (const record of records) {
                const entry = record.target;
                const year  = entry.querySelector('.timeline-year');
                const para  = entry.querySelector('.timeline-paragraph');
                const goingUp = timelineScrollDir === 'up';

                if (record.isIntersecting) {
                    year.classList.remove('flash-out', 'to-below');
                    // from-above only when scrolling up
                    year.classList.toggle('from-above', goingUp);
                    year.classList.add('flash-in');

                    gsap.killTweensOf(para);
                    gsap.fromTo(para,
                        { opacity: 0, y: goingUp ? -16 : 16, filter: 'blur(4px)' },
                        { opacity: 1, y: 0, filter: 'blur(0px)',
                          duration: 0.9, delay: 0.55,
                          ease: 'expo.out', overwrite: true });
                } else {
                    if (year.classList.contains('flash-in')) {
                        year.classList.remove('flash-in', 'from-above');
                        // to-below only when scrolling up (entry exits downward)
                        year.classList.toggle('to-below', goingUp);
                        year.classList.add('flash-out');
                    }
                    gsap.killTweensOf(para);
                    gsap.to(para,
                        { opacity: 0, y: goingUp ? -16 : 16, filter: 'blur(4px)',
                          duration: 0.45, ease: 'power2.in', overwrite: true });
                }
            }
        }, {
            root: timelineScroll,
            threshold: 0.55,
        });

        entries.forEach(e => timelineObserver.observe(e));
    }

    function closeTimeline() {
        timelineStage.style.opacity = '0';
        setTimeout(() => {
            timelineStage.style.display = 'none';
            timelineStage.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('timeline-open', 'page-open');
            if (timelineObserver) {
                timelineObserver.disconnect();
                timelineObserver = null;
            }
        }, 650);
    }

    // Click a year → 2000s-Flash zoom-out into the archive page,
    // filtered to that year. The clicked year scales up under a heavy
    // motion blur while the rest of the page bleeds out, then the
    // archive opens and the filter is applied once the canvas settles.
    let timelineJumpInFlight = false;
    function jumpToArchiveYear(yearEl) {
        if (timelineJumpInFlight) return;
        timelineJumpInFlight = true;

        const yearText = yearEl.textContent.trim();
        const entry    = yearEl.closest('.timeline-entry');
        const para     = entry ? entry.querySelector('.timeline-paragraph') : null;

        const tl = gsap.timeline({
            onComplete: async () => {
                timelineStage.style.display = 'none';
                timelineStage.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('timeline-open');
                if (timelineObserver) { timelineObserver.disconnect(); timelineObserver = null; }
                // Reset so the page is fresh next time
                gsap.set(timelineStage, { opacity: 1 });
                gsap.set(yearEl, { clearProps: 'all' });
                if (para) gsap.set(para, { clearProps: 'all' });

                if (!archiveOpen) {
                    await openArchive();
                    setTimeout(() => applyArchiveFilter(yearText), 1200);
                } else {
                    applyArchiveFilter(yearText);
                }
                timelineJumpInFlight = false;
            }
        });

        // Year zooms toward the camera, blurs, dissolves
        tl.to(yearEl, {
            scale: 4.2,
            opacity: 0,
            filter: 'blur(28px)',
            duration: 0.7,
            ease: 'power3.in',
        }, 0);
        if (para) {
            tl.to(para, {
                opacity: 0,
                y: 24,
                filter: 'blur(6px)',
                duration: 0.45,
                ease: 'power2.in',
            }, 0);
        }
        // Whole stage washes out behind the zoom — classic Flash transition
        tl.to(timelineStage, {
            opacity: 0,
            duration: 0.55,
            ease: 'power2.in',
        }, 0.25);
    }

    // Delegated click handler — survives page open/close without re-binding
    timelineStage.addEventListener('click', (e) => {
        const yearEl = e.target.closest('.timeline-year');
        if (yearEl) jumpToArchiveYear(yearEl);
    });

    if (timelineEl) {
        timelineEl.addEventListener('click', (e) => {
            e.preventDefault();
            openTimeline();
        });
    }
    if (timelineClose) {
        timelineClose.addEventListener('click', closeTimeline);
    }

    // ===== MOBILE BURGER MENU =====
    const mobileTrigger    = document.getElementById('mobile-trigger');
    const mobileOverlay    = document.getElementById('mobile-overlay');
    const mobileNavDefault = document.getElementById('mobile-nav-default');
    const mobileNavArchive = document.getElementById('mobile-nav-archive');
    let mobileOverlayOpen  = false;

    function openMobileOverlay() {
        mobileOverlayOpen = true;
        mobileTrigger.setAttribute('aria-expanded', 'true');
        const activeNav   = archiveOpen ? mobileNavArchive : mobileNavDefault;
        const inactiveNav = archiveOpen ? mobileNavDefault : mobileNavArchive;
        activeNav.style.display   = 'flex';
        inactiveNav.style.display = 'none';

        mobileOverlay.style.display = 'flex';
        mobileOverlay.removeAttribute('aria-hidden');

        const items = activeNav.querySelectorAll('.mobile-nav-item');
        gsap.set(items, { opacity: 0, y: 10 });
        gsap.to(items, {
            opacity: 1, y: 0,
            duration: 0.22, ease: 'power2.out',
            stagger: { each: 0.04, from: 'end' },
        });
    }

    function closeMobileOverlay(cb) {
        if (!mobileOverlayOpen) { if (cb) cb(); return; }
        mobileOverlayOpen = false;
        mobileTrigger.setAttribute('aria-expanded', 'false');
        const activeNav = archiveOpen ? mobileNavArchive : mobileNavDefault;
        const items = activeNav.querySelectorAll('.mobile-nav-item');
        gsap.to(items, {
            opacity: 0, y: 8,
            duration: 0.14, ease: 'power2.in',
            stagger: { each: 0.03, from: 'start' },
            onComplete: () => {
                mobileOverlay.style.display = 'none';
                mobileOverlay.setAttribute('aria-hidden', 'true');
                if (cb) cb();
            },
        });
    }

    // Close popup on any touch/click outside
    const _closeIfOutside = (e) => {
        if (mobileOverlayOpen &&
            !mobileTrigger.contains(e.target) &&
            !mobileOverlay.contains(e.target)) {
            closeMobileOverlay();
        }
    };
    document.addEventListener('touchstart', _closeIfOutside, { passive: true });
    document.addEventListener('click',      _closeIfOutside);

    // ===== MOBILE SCROLL HIDE =====
    let mobileTriggerHidden = false;
    let mobileScrollTimer   = null;

    function hideMobileTrigger() {
        if (mobileTriggerHidden || !document.body.classList.contains('page-open')) return;
        mobileTriggerHidden = true;
        if (mobileOverlayOpen) closeMobileOverlay();
        gsap.killTweensOf(mobileTrigger);
        gsap.to(mobileTrigger, {
            opacity: 0, scale: 0.7, y: 6,
            duration: 0.18, ease: 'power2.in',
        });
    }

    function showMobileTrigger() {
        if (!mobileTriggerHidden) return;
        mobileTriggerHidden = false;
        gsap.killTweensOf(mobileTrigger);
        gsap.to(mobileTrigger, {
            opacity: 1, scale: 1, y: 0,
            duration: 0.55, ease: 'back.out(2.2)',
        });
    }

    function onMobileScrollActivity() {
        hideMobileTrigger();
        clearTimeout(mobileScrollTimer);
        mobileScrollTimer = setTimeout(showMobileTrigger, 480);
    }

    // Infinite canvas pan (touch drag)
    const archiveViewportEl = document.getElementById('archive-viewport');
    if (archiveViewportEl) {
        archiveViewportEl.addEventListener('touchmove', onMobileScrollActivity, { passive: true });
    }

    // List view scroll
    const archiveListEl = document.getElementById('archive-list');
    if (archiveListEl) {
        archiveListEl.addEventListener('scroll', onMobileScrollActivity, { passive: true });
    }

    mobileTrigger.addEventListener('click', () => {
        if (mobileOverlayOpen) closeMobileOverlay();
        else openMobileOverlay();
    });

    // Wire mobile items to existing desktop handlers
    const _mobileGo = (id, delay) => (e) => {
        e.preventDefault();
        closeMobileOverlay(() => setTimeout(() => document.getElementById(id).click(), delay || 0));
    };

    const mArchive = document.getElementById('m-archive');
    if (mArchive) mArchive.addEventListener('click', _mobileGo('archive', 50));

    const mPeople = document.getElementById('m-people');
    if (mPeople) mPeople.addEventListener('click', _mobileGo('people', 50));

    const mTimeline = document.getElementById('m-timeline');
    if (mTimeline) mTimeline.addEventListener('click', _mobileGo('timeline', 50));

    const mSearch = document.getElementById('m-search');
    if (mSearch) mSearch.addEventListener('click', _mobileGo('search', 50));

    const mArchiveBack = document.getElementById('m-archive-back');
    if (mArchiveBack) mArchiveBack.addEventListener('click', () => {
        closeMobileOverlay(() => setTimeout(() => document.getElementById('archive-back').click(), 50));
    });

    const mArchiveAll = document.getElementById('m-archive-all');
    if (mArchiveAll) mArchiveAll.addEventListener('click', _mobileGo('archive-show-all', 50));

    const mArchiveSearch = document.getElementById('m-archive-search');
    if (mArchiveSearch) mArchiveSearch.addEventListener('click', _mobileGo('archive-search', 50));

    document.querySelectorAll('.mobile-cat-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = el.dataset.cat;
            closeMobileOverlay(() => setTimeout(() => {
                const desktop = document.querySelector(`.menu-cat[data-cat="${cat}"]`);
                if (desktop) desktop.click();
            }, 50));
        });
    });
});