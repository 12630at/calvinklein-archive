document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%, -50%) scale(0.5)');
    document.addEventListener('mouseup', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');

    // Flash 5 Style Preloader
    const preloader = document.getElementById('preloader');
    const mainWrapper = document.getElementById('main-wrapper');
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');

    // Start with main hidden
    mainWrapper.style.display = 'none';

    let progress = 0;
    const loadInterval = setInterval(() => {
        // Random erratic loading like old Flash sites over dial-up
        progress += Math.floor(Math.random() * 15) + 1;
        if (progress > 100) progress = 100;
        
        loadingBar.style.width = progress + '%';
        loadingText.innerText = `LOADING... ${progress}%`;

        if (progress === 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.style.overflow = 'auto'; // restore if needed
                mainWrapper.style.display = 'flex';
                
                // Add a quick glitch to the whole screen when it starts
                document.body.classList.add('glitch-effect');
                setTimeout(() => document.body.classList.remove('glitch-effect'), 300);
            }, 500);
        }
    }, 150);

    // Clock
    const clockElement = document.getElementById('clock');
    setInterval(() => {
        const now = new Date();
        clockElement.innerText = now.toISOString().split('T')[1].split('.')[0] + ' UTC';
    }, 1000);

    // Archive Interactions
    const records = document.querySelectorAll('.record');
    const previewImg = document.getElementById('preview-img');
    const metaId = document.getElementById('meta-id');

    records.forEach(record => {
        record.addEventListener('mouseenter', () => {
            records.forEach(r => r.classList.remove('selected'));
            record.classList.add('selected');
            
            const newSrc = record.getAttribute('data-img');
            const collectionName = record.children[2].innerText;
            const year = record.children[1].innerText;
            
            // Glitch effect on image change
            previewImg.classList.add('glitch-effect');
            setTimeout(() => previewImg.classList.remove('glitch-effect'), 200);

            previewImg.src = newSrc;
            metaId.innerText = `FILE: CK_${year}_${collectionName.replace(' ', '_')}.JPG`;
            
            // Make cursor react
            cursor.style.width = '30px';
            cursor.style.height = '30px';
        });

        record.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
        });
    });
});
