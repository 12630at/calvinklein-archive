document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menu');
    const archive = document.getElementById('archive');

    // ON_HOVER on "Archive" → CHANGE_TO Variant2 (300ms ease-out)
    // Show secondary menu and change Archive color
    archive.addEventListener('mouseenter', () => {
        menu.classList.add('hover-active');
    });

    // When mouse leaves the entire menu component, revert to Default
    menu.addEventListener('mouseleave', () => {
        menu.classList.remove('hover-active');
    });

    // Prevent default on all links (no destination pages yet)
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
});
