// shared.js — AC 共用腳本
(function () {
    // Active nav link
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === path);
    });

    // Sidebar scroll-spy
    const sections  = Array.from(document.querySelectorAll('section[id]'));
    const sideLinks = Array.from(document.querySelectorAll('.sidebar a'));

    function updateSpy() {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        sideLinks.forEach(a => {
            const href = a.getAttribute('href') || '';
            a.classList.toggle('active', href === '#' + current);
        });
    }

    if (sections.length) {
        window.addEventListener('scroll', updateSpy, { passive: true });
        updateSpy();
    }
})();
