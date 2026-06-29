/* ------------------------------------------------------------------ *
 * CK Flipbook — interactive 3D zine viewer (three.js + GSAP)
 *
 * Renders a stack of double-sided page "sheets" hinged at a central
 * spine. Page 1 is the front cover (only right page visible), the last
 * page is the back cover. Clicking the right/left half — or the on-screen
 * arrows — flips a sheet forward/back with a GSAP-eased page turn.
 *
 * Exposed as window.CKFlipbook.create(opts) -> instance{ animateIn,
 * dispose }. Requires global THREE (r128 UMD) and GSAP.
 * ------------------------------------------------------------------ */
(function () {
    'use strict';

    const PAGE_ASPECT  = 2400 / 3228;   // all zine pages share this portrait ratio
    const PAGE_H       = 4;             // world height of a page
    const PAGE_W       = PAGE_H * PAGE_ASPECT;
    const Z_STEP       = 0.0025;        // per-sheet depth offset (avoids z-fighting)
    const PRELOAD      = 3;             // sheets to keep textured around the current spread
    const FLIP_DUR     = 0.9;          // seconds per page turn

    function create(opts) {
        const mount = opts.mount;
        const pages = opts.pages;       // array of image URLs, page_001 … page_NNN
        const onFlip = opts.onFlip || function () {};

        // --- container + controls ---------------------------------------
        const root = document.createElement('div');
        root.className = 'flipbook-root';

        const canvasWrap = document.createElement('div');
        canvasWrap.className = 'flipbook-canvas';
        root.appendChild(canvasWrap);

        // Full-height transparent click zones (left = prev, right = next).
        const zoneL = document.createElement('button');
        zoneL.className = 'flipbook-zone flipbook-zone-left';
        zoneL.setAttribute('aria-label', 'previous page');
        const zoneR = document.createElement('button');
        zoneR.className = 'flipbook-zone flipbook-zone-right';
        zoneR.setAttribute('aria-label', 'next page');
        root.appendChild(zoneL);
        root.appendChild(zoneR);

        // Bottom control bar: ‹  page counter  ›
        const bar = document.createElement('div');
        bar.className = 'flipbook-bar';
        const prevBtn = document.createElement('button');
        prevBtn.className = 'flipbook-arrow';
        prevBtn.setAttribute('aria-label', 'previous page');
        prevBtn.textContent = '‹';
        const counter = document.createElement('div');
        counter.className = 'flipbook-counter';
        const nextBtn = document.createElement('button');
        nextBtn.className = 'flipbook-arrow';
        nextBtn.setAttribute('aria-label', 'next page');
        nextBtn.textContent = '›';
        bar.appendChild(prevBtn);
        bar.appendChild(counter);
        bar.appendChild(nextBtn);
        root.appendChild(bar);

        mount.appendChild(root);

        // --- three.js scene ---------------------------------------------
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        canvasWrap.appendChild(renderer.domElement);

        const bookGroup = new THREE.Group();
        scene.add(bookGroup);

        // Soft contact shadow grounding the book on the white backdrop.
        const shadowTex = makeShadowTexture();
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5,
        });
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W * 3.4, PAGE_H * 1.5), shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -PAGE_H / 2 - 0.02;
        shadow.renderOrder = -1;
        bookGroup.add(shadow);

        // --- sheets ------------------------------------------------------
        // Sheet k: front = page (2k), back = page (2k+1)  (0-based page index)
        const numSheets = Math.ceil(pages.length / 2);
        const sheets = [];

        function blankMat() {
            return new THREE.MeshBasicMaterial({ color: 0xf2f2f2, side: THREE.FrontSide });
        }

        for (let k = 0; k < numSheets; k++) {
            const pivot = new THREE.Group();          // hinged at spine (x = 0)

            const geom = new THREE.PlaneGeometry(PAGE_W, PAGE_H, 1, 1);

            const frontMat = blankMat();
            const front = new THREE.Mesh(geom, frontMat);
            front.position.set(PAGE_W / 2, 0, 0.001);

            const backMat = blankMat();
            const back = new THREE.Mesh(geom, backMat);
            back.position.set(PAGE_W / 2, 0, -0.001);
            back.rotation.y = Math.PI;                 // its textured face points -z

            pivot.add(front, back);
            bookGroup.add(pivot);

            sheets.push({
                pivot, front, back, frontMat, backMat,
                frontIdx: 2 * k,
                backIdx: 2 * k + 1,
                flipped: false,
                loaded: false,
                loading: false,
            });
        }

        // currentLeaf = index of the next sheet to flip forward (0..maxLeaf).
        // With an odd page count the final sheet's back is blank, so we stop one
        // sheet early — the last real page then rests as the final right page.
        const maxLeaf = (pages.length % 2 === 0) ? numSheets : numSheets - 1;
        let currentLeaf = 0;
        let animating = false;

        function layout(animate) {
            // Resting rotation/depth for every sheet based on flipped state, and
            // horizontal shift so a single-page view (cover / back cover) centers.
            for (let k = 0; k < sheets.length; k++) {
                const s = sheets[k];
                const targetRot = s.flipped ? -Math.PI : 0;
                const targetZ = s.flipped ? k * Z_STEP : -k * Z_STEP;
                s.pivot.rotation.y = targetRot;
                s.pivot.position.z = targetZ;
            }
            const onlyRight = currentLeaf === 0;
            const onlyLeft = currentLeaf === numSheets;
            const targetX = onlyRight ? -PAGE_W / 2 : onlyLeft ? PAGE_W / 2 : 0;
            if (animate) {
                gsap.to(bookGroup.position, { x: targetX, duration: FLIP_DUR, ease: 'power3.inOut' });
            } else {
                bookGroup.position.x = targetX;
            }
            updateCounter();
        }

        function updateCounter() {
            // Human (1-based) page numbers currently visible.
            const total = pages.length;
            let label;
            if (currentLeaf === 0) {
                label = '01 / ' + pad(total);                  // front cover, alone
            } else if (currentLeaf === numSheets) {
                label = pad(total) + ' / ' + pad(total);       // back cover, alone (even totals)
            } else {
                const leftHuman  = 2 * currentLeaf;            // page_002, 004, …
                const rightHuman = 2 * currentLeaf + 1;        // page_003, 005, …
                label = rightHuman > total
                    ? pad(leftHuman) + ' / ' + pad(total)
                    : pad(leftHuman) + '–' + pad(rightHuman) + ' / ' + pad(total);
            }
            counter.textContent = label;
        }

        function ensureTextures(center) {
            for (let k = Math.max(0, center - PRELOAD); k <= Math.min(numSheets - 1, center + PRELOAD); k++) {
                loadSheet(sheets[k]);
            }
            pruneTextures(center);
        }

        // Cap GPU memory: dispose textures for sheets far from the current spread.
        // 115 full pages at once would exhaust VRAM, so only a window stays live.
        function pruneTextures(center) {
            const KEEP = PRELOAD + 2;
            for (let k = 0; k < numSheets; k++) {
                if (k < center - KEEP || k > center + KEEP) unloadSheet(sheets[k]);
            }
        }

        function loadSheet(s) {
            if (s.loaded || s.loading) return;
            s.loading = true;
            applyTexture(s, 'front', pages[s.frontIdx]);
            if (s.backIdx < pages.length) applyTexture(s, 'back', pages[s.backIdx]);
            s.loaded = true;
        }

        function unloadSheet(s) {
            if (!s.loaded && !s.loading) return;
            [s.frontMat, s.backMat].forEach(m => {
                if (m.map) { m.map.dispose(); m.map = null; }
                m.color.set(0xf2f2f2);
                m.needsUpdate = true;
            });
            s.loaded = false;
            s.loading = false;
        }

        // Decode the page, downscale to a sane texture width, and upload as a
        // CanvasTexture. Downscaling keeps VRAM and decode cost in check while
        // staying crisp at the on-screen page size.
        const MAX_TEX_W = 1400;
        function applyTexture(s, which, url) {
            if (!url) return;
            const img = new Image();
            img.onload = () => {
                if (!s.loading && !s.loaded) return;   // sheet was pruned mid-load
                let cw = img.naturalWidth, ch = img.naturalHeight;
                if (cw > MAX_TEX_W) { ch = Math.round(ch * MAX_TEX_W / cw); cw = MAX_TEX_W; }
                const cv = document.createElement('canvas');
                cv.width = cw; cv.height = ch;
                cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
                const tex = new THREE.CanvasTexture(cv);
                tex.encoding = THREE.sRGBEncoding;
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                const mat = which === 'front' ? s.frontMat : s.backMat;
                if (mat.map) mat.map.dispose();
                mat.map = tex;
                mat.color.set(0xffffff);
                mat.needsUpdate = true;
            };
            img.src = url;
        }

        function flipNext() {
            if (animating || currentLeaf >= maxLeaf) return;
            const s = sheets[currentLeaf];
            animating = true;
            ensureTextures(currentLeaf + 1);
            s.flipped = true;
            currentLeaf++;
            const lift = 0.35 + currentLeaf * Z_STEP;
            const tl = gsap.timeline({ onComplete: () => { animating = false; layout(false); } });
            tl.to(s.pivot.rotation, { y: -Math.PI, duration: FLIP_DUR, ease: 'power2.inOut' }, 0);
            tl.to(s.pivot.position, { z: lift, duration: FLIP_DUR / 2, ease: 'power2.out' }, 0);
            tl.to(s.pivot.position, { z: (currentLeaf - 1) * Z_STEP, duration: FLIP_DUR / 2, ease: 'power2.in' }, FLIP_DUR / 2);
            shiftBook();
            onFlip(currentLeaf);
        }

        function flipPrev() {
            if (animating || currentLeaf <= 0) return;
            currentLeaf--;
            const s = sheets[currentLeaf];
            animating = true;
            ensureTextures(currentLeaf);
            s.flipped = false;
            const lift = 0.35 + currentLeaf * Z_STEP;
            const tl = gsap.timeline({ onComplete: () => { animating = false; layout(false); } });
            tl.to(s.pivot.rotation, { y: 0, duration: FLIP_DUR, ease: 'power2.inOut' }, 0);
            tl.to(s.pivot.position, { z: lift, duration: FLIP_DUR / 2, ease: 'power2.out' }, 0);
            tl.to(s.pivot.position, { z: -currentLeaf * Z_STEP, duration: FLIP_DUR / 2, ease: 'power2.in' }, FLIP_DUR / 2);
            shiftBook();
            onFlip(currentLeaf);
        }

        function shiftBook() {
            const onlyRight = currentLeaf === 0;
            const onlyLeft = currentLeaf === numSheets;
            const targetX = onlyRight ? -PAGE_W / 2 : onlyLeft ? PAGE_W / 2 : 0;
            gsap.to(bookGroup.position, { x: targetX, duration: FLIP_DUR, ease: 'power3.inOut', onUpdate: updateCounter });
        }

        zoneR.addEventListener('click', flipNext);
        zoneL.addEventListener('click', flipPrev);
        nextBtn.addEventListener('click', flipNext);
        prevBtn.addEventListener('click', flipPrev);
        document.addEventListener('keydown', onKey);
        function onKey(e) {
            if (e.key === 'ArrowRight') flipNext();
            else if (e.key === 'ArrowLeft') flipPrev();
        }

        // --- camera fit + resize ----------------------------------------
        function resize() {
            const w = root.clientWidth || window.innerWidth;
            const h = root.clientHeight || window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;

            // Fit the fully-open spread (width 2*PAGE_W) with margin.
            const fovV = THREE.MathUtils.degToRad(camera.fov);
            const margin = 1.22;
            const distH = (PAGE_H * margin / 2) / Math.tan(fovV / 2);
            const spreadW = PAGE_W * 2 * margin;
            const distW = (spreadW / 2) / (Math.tan(fovV / 2) * camera.aspect);
            const dist = Math.max(distH, distW);
            camera.position.set(0, 0.15, dist);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', resize);
        resize();

        // --- render loop -------------------------------------------------
        let raf = null;
        function tick() {
            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        }
        tick();

        // --- initial state -----------------------------------------------
        ensureTextures(0);
        layout(false);
        bookGroup.rotation.x = -0.18;   // subtle tilt for depth

        // --- entrance animation -----------------------------------------
        function animateIn() {
            gsap.from(bookGroup.rotation, { y: -0.5, duration: 1.0, ease: 'power3.out' });
            gsap.from(bookGroup.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.9, ease: 'power3.out' });
            gsap.from(root, { opacity: 0, duration: 0.5, ease: 'power2.out' });
        }

        function dispose() {
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            document.removeEventListener('keydown', onKey);
            gsap.killTweensOf(bookGroup.position);
            gsap.killTweensOf(bookGroup.rotation);
            gsap.killTweensOf(bookGroup.scale);
            sheets.forEach(s => {
                gsap.killTweensOf(s.pivot.rotation);
                gsap.killTweensOf(s.pivot.position);
                [s.frontMat, s.backMat].forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
                s.front.geometry.dispose();
            });
            shadowMat.map.dispose();
            shadowMat.dispose();
            shadow.geometry.dispose();
            renderer.dispose();
            if (root.parentNode) root.parentNode.removeChild(root);
        }

        return { animateIn, dispose, el: root };
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function makeShadowTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
        g.addColorStop(0, 'rgba(0,0,0,0.30)');
        g.addColorStop(0.6, 'rgba(0,0,0,0.10)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
        const tex = new THREE.CanvasTexture(c);
        tex.encoding = THREE.sRGBEncoding;
        return tex;
    }

    window.CKFlipbook = { create };
})();
