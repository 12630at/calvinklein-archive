/* ------------------------------------------------------------------ *
 * CK Flipbook — interactive 3D zine viewer (three.js + GSAP)
 *
 * A real magazine: leaves hinged at a central spine. The front cover and
 * the back cover are single pages shown centred; the interior reads as
 * two-page spreads. Pages are segmented meshes that curl in 3D as they
 * turn, lit so the bend is visible. Turning is DRAG-ONLY — grab the right
 * page and pull it left, or the left page and pull it right (the arrows /
 * keyboard also flip). The turning page stays glued at the spread's depth
 * (no z lift) and the two open pages are coplanar, meeting flush.
 *
 * Exposed as window.CKFlipbook.create(opts) -> instance{ animateIn,
 * dispose, el }. Requires global THREE (r128 UMD) and GSAP.
 * ------------------------------------------------------------------ */
(function () {
    'use strict';

    const PAGE_ASPECT = 2400 / 3228;   // all zine pages share this portrait ratio
    const PAGE_H      = 4;             // world height of a page
    const PAGE_W      = PAGE_H * PAGE_ASPECT;
    const SEG         = 30;            // width segments per page (for a smooth curl)
    const CURL_AMP    = 0.5;           // peak page bulge (world units) at mid-turn
    const Z_STEP      = 0.004;         // depth between stacked (hidden) pages
    const PRELOAD     = 3;             // leaves textured on each side of the spread
    const FLIP_DUR    = 0.85;          // seconds for a drag-release snap
    const ARROW_DUR   = 0.32;          // seconds for an arrow/keyboard turn (snappy)
    const MAX_TEX_W   = 1400;          // textures downscaled to this width

    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const pad = n => String(n).padStart(2, '0');

    function create(opts) {
        const mount = opts.mount;
        const pages = opts.pages;       // image URLs, page_001 … page_NNN (in order)

        // --- faces: one per page, in order. Front cover = faces[0], back
        // cover = last face; both are shown single and centred. -----------
        const faces  = pages.slice();
        const humans = pages.map((_, i) => i + 1);   // sequential page number per face
        const total  = pages.length;

        // --- container + controls ---------------------------------------
        const root = document.createElement('div');
        root.className = 'flipbook-root';

        const canvasWrap = document.createElement('div');
        canvasWrap.className = 'flipbook-canvas';
        root.appendChild(canvasWrap);

        const bar = document.createElement('div');
        bar.className = 'flipbook-bar';
        const prevBtn = mkBtn('flipbook-arrow', '‹', 'previous page');
        const counter = document.createElement('div');
        counter.className = 'flipbook-counter';
        const nextBtn = mkBtn('flipbook-arrow', '›', 'next page');
        bar.append(prevBtn, counter, nextBtn);
        // Bar lives inside the canvas area so it stays centred under the book.
        canvasWrap.appendChild(bar);

        mount.appendChild(root);

        // --- three.js scene ---------------------------------------------
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        canvasWrap.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.72));
        const key = new THREE.DirectionalLight(0xffffff, 0.42);
        key.position.set(0.4, 0.6, 1.2);
        scene.add(key);

        const bookGroup = new THREE.Group();
        bookGroup.rotation.x = -0.1;      // subtle tilt for depth
        scene.add(bookGroup);

        // Soft contact shadow grounding the book on the white backdrop.
        const shadowTex = makeShadowTexture();
        const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(PAGE_W * 3.6, PAGE_H * 1.5),
            new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -PAGE_H / 2 - 0.02;
        shadow.renderOrder = -1;
        bookGroup.add(shadow);

        // --- leaf template (flat base vertices, spine at x = 0) -----------
        const tpl = new THREE.PlaneGeometry(PAGE_W, PAGE_H, SEG, 1);
        tpl.translate(PAGE_W / 2, 0, 0);        // left edge on the spine
        const baseArr = tpl.attributes.position.array.slice();
        const vCount  = tpl.attributes.position.count;
        tpl.dispose();

        // --- leaves ------------------------------------------------------
        // Leaf k: front face = faces[2k] (a right page), back face = faces[2k+1]
        // (the page seen on the left once the leaf is turned).
        const numLeaves = Math.ceil(faces.length / 2);
        const leaves = [];
        for (let k = 0; k < numLeaves; k++) {
            const pivot = new THREE.Group();    // hinged at the spine
            const geom = new THREE.PlaneGeometry(PAGE_W, PAGE_H, SEG, 1);
            geom.translate(PAGE_W / 2, 0, 0);

            const frontMat = paperMat();
            const backMat  = paperMat();
            const front = new THREE.Mesh(geom, frontMat);          // +z face
            const back  = new THREE.Mesh(geom, backMat);           // -z face (BackSide)
            backMat.side  = THREE.BackSide;
            frontMat.side = THREE.FrontSide;
            pivot.add(front, back);
            bookGroup.add(pivot);

            leaves.push({
                pivot, geom, frontMat, backMat,
                frontIdx: 2 * k, backIdx: 2 * k + 1,
                flipped: false, loaded: false, loading: false,
            });
        }

        // currentLeaf = number of turned leaves = index of the next to turn.
        let currentLeaf = 0;
        const maxLeaf = numLeaves;
        let animating = false;          // an auto (tap/arrow/snap) tween is running

        // --- geometry deformation ----------------------------------------
        // theta 0 = flat on the right; theta PI = flat on the left. The page
        // bulges (cylindrical curl) most at theta = PI/2.
        function setLeafShape(leaf, theta) {
            const curl = Math.sin(theta) * CURL_AMP;
            const a = leaf.geom.attributes.position.array;
            for (let i = 0; i < vCount; i++) {
                const x = baseArr[i * 3];
                a[i * 3]     = x;
                a[i * 3 + 1] = baseArr[i * 3 + 1];
                a[i * 3 + 2] = Math.sin((x / PAGE_W) * Math.PI) * curl;
            }
            leaf.geom.attributes.position.needsUpdate = true;
            leaf.geom.computeVertexNormals();
            leaf.pivot.rotation.y = -theta;     // turn toward the viewer, then left
        }

        function restZ(k) {
            // Visible top of each stack sits at z = 0 so the two open pages are
            // coplanar; deeper pages recede behind.
            return (leaves[k].flipped
                ? -((currentLeaf - 1) - k)
                : -(k - currentLeaf)) * Z_STEP;
        }

        function centerXFor(L) {
            if (L <= 0)        return -PAGE_W / 2;   // front cover alone (right)
            if (L >= maxLeaf)  return  PAGE_W / 2;   // back cover alone (left)
            return 0;                                // open spread, centred on spine
        }

        function layout() {
            for (let k = 0; k < numLeaves; k++) {
                const leaf = leaves[k];
                setLeafShape(leaf, leaf.flipped ? Math.PI : 0);
                leaf.pivot.position.set(0, 0, restZ(k));
            }
            bookGroup.position.x = centerXFor(currentLeaf);
            updateCounter();
        }

        // --- counter -----------------------------------------------------
        function updateCounter() { counter.textContent = counterFor(currentLeaf); }
        function counterFor(L) {
            const leftH  = humans[2 * L - 1];   // back of last turned leaf
            const rightH = humans[2 * L];       // front of current leaf
            let label;
            if (!leftH)        label = pad(rightH || total);          // front cover
            else if (!rightH)  label = pad(leftH);                    // back cover
            else               label = pad(leftH) + '–' + pad(rightH);
            return label + ' / ' + pad(total);
        }

        // --- textures (downscaled, windowed to cap VRAM) -----------------
        function ensureTextures(center) {
            for (let k = Math.max(0, center - PRELOAD); k <= Math.min(numLeaves - 1, center + PRELOAD); k++) {
                loadLeaf(leaves[k]);
            }
            for (let k = 0; k < numLeaves; k++) {
                if (k < center - (PRELOAD + 2) || k > center + (PRELOAD + 2)) unloadLeaf(leaves[k]);
            }
        }
        function loadLeaf(leaf) {
            if (leaf.loaded || leaf.loading) return;
            leaf.loading = true;
            applyTexture(leaf, 'front', faces[leaf.frontIdx]);
            applyTexture(leaf, 'back',  faces[leaf.backIdx]);
            leaf.loaded = true;
        }
        function unloadLeaf(leaf) {
            if (!leaf.loaded && !leaf.loading) return;
            [leaf.frontMat, leaf.backMat].forEach(m => {
                if (m.map) { m.map.dispose(); m.map = null; }
                m.color.set(0xf4f2ec);
                m.needsUpdate = true;
            });
            leaf.loaded = false;
            leaf.loading = false;
        }
        function applyTexture(leaf, which, url) {
            if (!url) return;                       // blank face keeps paper colour
            const img = new Image();
            img.onload = () => {
                if (!leaf.loading && !leaf.loaded) return;
                let cw = img.naturalWidth, ch = img.naturalHeight;
                if (cw > MAX_TEX_W) { ch = Math.round(ch * MAX_TEX_W / cw); cw = MAX_TEX_W; }
                const cv = document.createElement('canvas');
                cv.width = cw; cv.height = ch;
                cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
                const tex = new THREE.CanvasTexture(cv);
                tex.encoding = THREE.sRGBEncoding;
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                if (which === 'back') {             // back is viewed mirrored — flip U
                    tex.wrapS = THREE.RepeatWrapping;
                    tex.repeat.x = -1;
                }
                const mat = which === 'front' ? leaf.frontMat : leaf.backMat;
                if (mat.map) mat.map.dispose();
                mat.map = tex;
                mat.color.set(0xffffff);
                mat.needsUpdate = true;
            };
            img.src = url;
        }

        // --- turning (drag + auto) ---------------------------------------
        // A turn is parametrised by progress p in [0,1] toward the target state.
        // Exactly one turn can be in flight: `active` describes it, `drag` is set
        // while a pointer drives it, `flipTween` while a tween settles it.
        let active = null;   // { leafIndex, dir, fromX, toX }
        let flipTween = null;

        function beginFlip(dir) {
            if (active || animating || drag) return false;
            if (dir > 0 && currentLeaf >= maxLeaf) return false;
            if (dir < 0 && currentLeaf <= 0) return false;
            const leafIndex = dir > 0 ? currentLeaf : currentLeaf - 1;
            ensureTextures(dir > 0 ? currentLeaf + 1 : currentLeaf - 1);
            active = {
                leafIndex, dir,
                fromX: centerXFor(currentLeaf),
                toX:   centerXFor(currentLeaf + dir),
            };
            // The turning page stays glued at the spread's depth (z = 0) — no
            // lift. Push the page it will land on back so the turning page stacks
            // on top cleanly. Use HALF a step: a full Z_STEP would land it exactly
            // on top of the NEXT stacked leaf (which already rests at -Z_STEP),
            // z-fighting and flashing the opposite page to the wrong photo.
            leaves[leafIndex].pivot.position.z = 0;
            const coverIdx = dir > 0 ? leafIndex - 1 : leafIndex + 1;
            if (leaves[coverIdx]) leaves[coverIdx].pivot.position.z = -Z_STEP * 0.5;
            return true;
        }

        function setFlipProgress(p) {
            if (!active) return;
            p = clamp(p, 0, 1);
            const leaf = leaves[active.leafIndex];
            const theta = active.dir > 0 ? p * Math.PI : (1 - p) * Math.PI;
            setLeafShape(leaf, theta);
            leaf.pivot.position.z = 0;
            bookGroup.position.x = lerp(active.fromX, active.toX, p);
        }

        function endFlip(commit) {
            if (!active) return;
            const leaf = leaves[active.leafIndex];
            if (commit) {
                leaf.flipped = active.dir > 0;
                currentLeaf += active.dir;
            }
            active = null;
            layout();                 // settle every leaf flat + restack + recentre
        }

        // Run the settling tween for the current `active` turn from p→target.
        function runTween(fromP, toP, commit, dur) {
            if (flipTween) flipTween.kill();
            animating = true;
            const o = { p: fromP };
            flipTween = gsap.to(o, {
                p: toP, duration: dur, ease: 'power2.out',
                onUpdate: () => setFlipProgress(o.p),
                onComplete: () => { flipTween = null; animating = false; endFlip(commit); },
            });
        }
        // Auto turn (arrows / keyboard): tween progress 0→1, snappy.
        function autoFlip(dir) {
            if (!beginFlip(dir)) return;
            setFlipProgress(0);
            runTween(0, 1, true, ARROW_DUR);
        }

        nextBtn.addEventListener('click', () => autoFlip(1));
        prevBtn.addEventListener('click', () => autoFlip(-1));
        document.addEventListener('keydown', onKey);
        function onKey(e) {
            if (e.repeat) return;            // ignore key auto-repeat (would queue flips)
            if (e.key === 'ArrowRight') { e.preventDefault(); autoFlip(1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); autoFlip(-1); }
        }

        // --- pointer drag on the canvas ----------------------------------
        const cvs = renderer.domElement;
        cvs.style.touchAction = 'none';
        let drag = null;   // { startX, lastX, lastT, vx, dir, moved }

        cvs.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;          // primary button only
            if (active || animating || drag) return;
            const rect = cvs.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width;
            const dir = nx > 0.5 ? 1 : -1;
            if (!beginFlip(dir)) return;
            drag = { startX: e.clientX, lastX: e.clientX, lastT: performance.now(), vx: 0, dir, moved: false, w: rect.width, pid: e.pointerId };
            try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
            setFlipProgress(0);
        });
        cvs.addEventListener('pointermove', (e) => {
            if (!drag) return;
            // If the button is no longer down, a pointerup was missed — finish the
            // drag instead of letting the page follow the cursor on its own.
            if (e.buttons === 0) { endDrag(e); return; }
            const dx = e.clientX - drag.startX;
            if (Math.abs(dx) > 4) drag.moved = true;
            // Drag spans roughly half the canvas for a full turn.
            const span = drag.w * 0.55;
            const p = drag.dir > 0 ? (-dx / span) : (dx / span);
            setFlipProgress(p);
            const now = performance.now();
            const dt = Math.max(8, now - drag.lastT);
            drag.vx = (e.clientX - drag.lastX) / dt;
            drag.lastX = e.clientX; drag.lastT = now;
        });
        function endDrag(e) {
            if (!drag) return;
            const d = drag; drag = null;
            try { cvs.releasePointerCapture(d.pid); } catch (_) {}
            if (!d.moved) {                 // a plain click does nothing — turning is drag-only
                endFlip(false);
                return;
            }
            const dx = e.clientX - d.startX;
            const span = d.w * 0.55;
            const p = clamp(d.dir > 0 ? (-dx / span) : (dx / span), 0, 1);
            // Commit if dragged past halfway or flicked in the turn direction.
            const flick = (d.dir > 0 ? -d.vx : d.vx) > 0.5;
            runTween(p, (p > 0.5 || flick) ? 1 : 0, p > 0.5 || flick, FLIP_DUR * 0.5);
        }
        cvs.addEventListener('pointerup', endDrag);
        cvs.addEventListener('pointercancel', endDrag);
        // Safety nets: if the pointer/window loses the drag, cancel it cleanly.
        cvs.addEventListener('lostpointercapture', () => { if (drag) { const d = drag; drag = null; endFlip(false); } });
        window.addEventListener('blur', onBlur);
        function onBlur() { if (drag) { drag = null; } if (active && !flipTween) endFlip(false); }

        // --- camera fit + resize -----------------------------------------
        const COUNTER_GAP = 26;    // px between the book's bottom edge and the counter
        const BAR_H = 18;          // approx counter height
        function resize() {
            const w = canvasWrap.clientWidth || root.clientWidth || window.innerWidth;
            const h = canvasWrap.clientHeight || root.clientHeight || window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            const fovV = THREE.MathUtils.degToRad(camera.fov);
            const margin = 1.34;
            const distH = (PAGE_H * margin / 2) / Math.tan(fovV / 2);
            const spreadW = PAGE_W * 2 * margin;
            const distW = (spreadW / 2) / (Math.tan(fovV / 2) * camera.aspect);
            const dist = Math.max(distH, distW);
            camera.position.set(0, 0, dist);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();

            // Centre the book + counter as a single block. Lift the book by half
            // the counter zone so the empty space above the book equals the space
            // below the counter, then pin the counter just under the book's edge.
            const pxPerWorld = h / (2 * dist * Math.tan(fovV / 2));
            const shiftPx = (COUNTER_GAP + BAR_H) / 2;
            bookGroup.position.y = shiftPx / pxPerWorld;   // book centred slightly high
            const bookHalfPx   = (PAGE_H / 2) * pxPerWorld;
            const bookBottomPx = (h / 2 - shiftPx) + bookHalfPx;
            bar.style.bottom = Math.max(12, Math.round(h - bookBottomPx - COUNTER_GAP - BAR_H)) + 'px';
        }
        window.addEventListener('resize', resize);
        resize();

        // --- render loop -------------------------------------------------
        let raf = null;
        (function tick() { renderer.render(scene, camera); raf = requestAnimationFrame(tick); })();

        ensureTextures(0);
        layout();

        // --- public ------------------------------------------------------
        function animateIn() {
            gsap.from(bookGroup.rotation, { y: -0.5, duration: 1.0, ease: 'power3.out' });
            gsap.from(bookGroup.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.9, ease: 'power3.out' });
            gsap.from(root, { opacity: 0, duration: 0.5, ease: 'power2.out' });
        }
        function dispose() {
            if (raf) cancelAnimationFrame(raf);
            if (flipTween) flipTween.kill();
            window.removeEventListener('resize', resize);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('keydown', onKey);
            gsap.killTweensOf(bookGroup.position);
            gsap.killTweensOf(bookGroup.rotation);
            gsap.killTweensOf(bookGroup.scale);
            leaves.forEach(leaf => {
                [leaf.frontMat, leaf.backMat].forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
                leaf.geom.dispose();
            });
            shadowTex.dispose();
            shadow.material.map.dispose();
            shadow.material.dispose();
            shadow.geometry.dispose();
            renderer.dispose();
            if (root.parentNode) root.parentNode.removeChild(root);
        }

        return { animateIn, dispose, el: root };
    }

    function mkBtn(cls, text, label) {
        const b = document.createElement('button');
        b.className = cls; b.textContent = text; b.setAttribute('aria-label', label);
        return b;
    }
    function paperMat() {
        return new THREE.MeshLambertMaterial({ color: 0xf4f2ec });
    }
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
