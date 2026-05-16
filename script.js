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

// We don't need selectEntries or estimateEntryDuration anymore, 
// because we will show ALL entries.

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
    
    const upperText = text.toUpperCase();
    let width = measureCtx.measureText(upperText).width;
    
    const letterSpacing = window.innerWidth <= 600 ? -0.24 : -0.36;
    width += (upperText.length * letterSpacing);
    
    // Add a tiny buffer to prevent accidental touching
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
    span.style.top  = p.y + 'px';
    return span;
}

let isPlaying = false;

async function play() {
    if (isPlaying) return;
    isPlaying = true;
    
    // 1. Slight delay like 1 second before the initial animation starts
    await sleep(1000); 
    
    const stage = document.getElementById('stage');
    const viewport = getViewport();
    fontSize = Math.max(11, Math.min(viewport.w * 0.011, 18));
    
    // We want ALL the names to appear and scatter them
    const entries = shuffleCopy(POOL);
    const allSpans = [];
    
    // Divide the screen into a loose grid to scatter names without overlapping
    // Minimum cell width ~300px
    const cols = viewport.w < 600 ? 2 : Math.max(2, Math.floor(viewport.w / 300));
    const rows = Math.ceil(entries.length / cols);
    const cellW = viewport.w / cols;
    const cellH = viewport.h / rows;
    
    const cells = [];
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            cells.push({r, c});
        }
    }
    const shuffledCells = shuffleCopy(cells);

    // Display each name sequentially but very quickly
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const cell = shuffledCells[i];
        if (!cell) break; // safety
        
        const padX = cellW * 0.1;
        const padY = cellH * 0.1;
        
        const startX = cell.c * cellW + padX + Math.random() * (cellW * 0.2);
        const startY = cell.r * cellH + padY + Math.random() * (cellH * 0.3);
        
        const words = splitEntry(entry);
        
        let curX = startX;
        let curY = startY;
        let yStep = fontSize * 1.4;
        const jitter = () => (Math.random() * fontSize * 0.2);
        
        const placed = [];
        for (const word of words) {
            const w = measure(word);
            // Wrap to next line if word exceeds cell boundaries
            if (curX + w > (cell.c + 1) * cellW - padX) {
                curX = startX;
                curY += yStep;
            }
            placed.push({ word, x: curX, y: curY });
            curX += w + measure(' ') + jitter();
        }
        
        const spans = placed.map(createSpan);
        spans.forEach(s => stage.appendChild(s));
        allSpans.push(...spans);
        
        // Fast stagger animation for words
        for (let j = 0; j < spans.length; j++) {
            spans[j].style.opacity = '1';
            await sleep(40); // 40ms per word
        }
    }
    
    // Pause briefly so the fully scattered page can be seen
    await sleep(800);

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
    
    // 1. Start animation on load automatically
    document.fonts.ready.then(() => {
        play();
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
