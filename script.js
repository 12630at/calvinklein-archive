/* ============================================================
   KINETIC STAIRCASE TYPOGRAPHY + MENU INTERACTION
   Single Page App Integration
   ============================================================ */

// ===== 1. THE POOL =====
const POOL = [
    "Calvin Klein", "Barry Schwartz", "Kelly Klein",
    "Richard Avedon", "Brooke Shields",
    "Bruce Weber", "Tom Hintnaus", "Carré Otis",
    "Kate Moss", "Mark Wahlberg", "Mario Sorrenti",
    "Fabien Baron", "Sam Shahid", "Neville Brody",
    "Steven Meisel", "Steven Klein", "Arthur Elgort",
    "David Sims", "Patrick Demarchelier", "Herb Ritts",
    "Mert and Marcus", "Inez and Vinoodh",
    "Christy Turlington", "Carolyn Bessette Kennedy",
    "Linda Evangelista", "Amber Valletta", "Shalom Harlow",
    "Gisele Bündchen", "Natalia Vodianova", "Lara Stone",
    "Iman", "Beverly Johnson",
    "Francisco Costa", "Italo Zucchelli", "Raf Simons",
];

const TARGET_DURATION = 10;
const SHUFFLE = true;

const APPEAR_MS             = 50;
const DARKEN_MS             = 200;
const STAGGER_MS            = 200;
const PRE_COLLAPSE_BEAT_MS  = 100;
const COLLAPSE_MS           = 300;
const POST_COLLAPSE_BEAT_MS = 150;
const FINAL_FADE_MS         = 800;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleCopy(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function estimateEntryDuration(entry) {
    const wordCount = entry.replace(/\//g, '').split(/\s+/).filter(Boolean).length;
    return wordCount * (APPEAR_MS + STAGGER_MS)
         + PRE_COLLAPSE_BEAT_MS
         + COLLAPSE_MS
         + POST_COLLAPSE_BEAT_MS;
}

function selectEntries(pool, targetSeconds, shuffle) {
    const candidates = shuffle ? shuffleCopy(pool) : [...pool];
    const selected = [];
    let budgetMs = targetSeconds * 1000;
    budgetMs -= FINAL_FADE_MS; 

    for (const entry of candidates) {
        const cost = estimateEntryDuration(entry);
        if (cost > budgetMs) break;
        selected.push(entry);
        budgetMs -= cost;
    }
    return selected;
}

function splitEntry(entry) {
    return entry.replace(/\//g, ' ').split(/\s+/).filter(Boolean);
}

let measureCtx = null;
let fontSize = 0;

function measure(text) {
    if (!measureCtx) {
        measureCtx = document.createElement('canvas').getContext('2d');
    }
    measureCtx.font = `350 ${fontSize}px Klein, sans-serif`;
    return measureCtx.measureText(text).width;
}

function getViewport() {
    return { w: window.innerWidth, h: window.innerHeight };
}

function layoutEntry(words, viewport, startY) {
    const leftMargin = viewport.w * (viewport.w < 600 ? 0.08 : 0.30);
    const rightBound = viewport.w * (viewport.w < 600 ? 0.92 : 0.60);
    let curX  = leftMargin;
    let curY  = startY;
    let yStep = viewport.h * 0.014;
    const growth = 1.18;
    const jitter = () => (Math.random() - 0.5) * fontSize * 0.5;

    const placed = [];
    let lineIndex = 0;

    for (const word of words) {
        const w = measure(word);
        if (curX + w > rightBound) {
            curX = leftMargin;
            lineIndex++;
        }
        placed.push({ word, x: curX, y: curY, lineIndex });
        curX += w + measure(' ') + jitter();
        curY += yStep;
        yStep *= growth;
    }
    return placed;
}

function createSpan(p) {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = p.word;
    span.style.left = p.x + 'px';
    span.style.top  = p.y + 'px';
    return span;
}

let collapsedStackBottomY;

function initStack(viewport) {
    collapsedStackBottomY = viewport.h * 0.25;
}

function computeCollapseTargets(placed) {
    const targets = [];
    for (const p of placed) {
        targets.push(collapsedStackBottomY + p.lineIndex * (fontSize * 1.6));
    }
    return targets;
}

function advanceCollapsedStack(placed) {
    const lineGroups = {};
    placed.forEach(p => {
        if (!lineGroups[p.lineIndex]) lineGroups[p.lineIndex] = [];
        lineGroups[p.lineIndex].push(p);
    });
    const numLines = Object.keys(lineGroups).length;
    collapsedStackBottomY += numLines * (fontSize * 1.6);
}

function currentScatterTopY() {
    return collapsedStackBottomY + fontSize * 2;
}

let isPlaying = false;

async function play() {
    if (isPlaying) return;
    isPlaying = true;
    
    const stage = document.getElementById('stage');

    const viewport = getViewport();
    fontSize = Math.max(11, Math.min(viewport.w * 0.011, 18));
    initStack(viewport);

    const entries = selectEntries(POOL, TARGET_DURATION, SHUFFLE);
    const allSpans = [];

    for (const entry of entries) {
        const words   = splitEntry(entry);
        const placed  = layoutEntry(words, viewport, currentScatterTopY());
        const spans   = placed.map(createSpan);
        spans.forEach(s => stage.appendChild(s));
        allSpans.push(...spans);

        for (let i = 0; i < spans.length; i++) {
            spans[i].style.opacity = '0.15';
            await sleep(APPEAR_MS);
            spans[i].style.opacity = '1';
            await sleep(STAGGER_MS);
        }

        await sleep(PRE_COLLAPSE_BEAT_MS);

        const targets = computeCollapseTargets(placed);
        placed.forEach((p, i) => { spans[i].style.top = targets[i] + 'px'; });
        await sleep(COLLAPSE_MS);

        advanceCollapsedStack(placed);
        await sleep(POST_COLLAPSE_BEAT_MS);
    }

    allSpans.forEach(s => {
        s.style.transition = `opacity ${FINAL_FADE_MS}ms linear`;
        s.style.opacity = '0';
    });
    
    // Also fade out the stage background
    stage.style.transition = `opacity ${FINAL_FADE_MS}ms linear`;
    stage.style.opacity = '0';
    
    await sleep(FINAL_FADE_MS);

    // End of animation -> reveal menu on the same page
    stage.style.display = 'none'; // remove stage
    const menu = document.getElementById('menu');
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'all';
}

// ===== INIT & MENU INTERACTIONS =====

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Setup Click to start animation
    const stage = document.getElementById('stage');
    stage.addEventListener('click', () => {
        if (!isPlaying) {
            document.fonts.ready.then(() => {
                play();
            });
        }
    });

    // 2. Setup Menu Interactions
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
