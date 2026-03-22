// shared.js — AC 共用腳本

(function () {
    /* ── 1. Active nav link ── */
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === path);
    });

    /* ── 2. 漢堡選單 ── */
    const hamburger = document.querySelector('.hamburger');
    const navMenu   = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            // 展開時鎖定 body 捲動
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        navMenu.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('click', () => {
                navMenu.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        document.addEventListener('click', e => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* ── 3. 手機 sidebar 展開/收合 ── */
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const toggle = document.createElement('div');
        toggle.className = 'sidebar-toggle';
        toggle.innerHTML = '<h3>章節目錄</h3><span class="chevron">▼</span>';

        const origH3 = sidebar.querySelector('h3');
        if (origH3) {
            sidebar.insertBefore(toggle, origH3);
            origH3.style.display = 'none';
        }

        function applyMobileState() {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
                document.body.style.overflow = '';
            }
        }
        applyMobileState();
        window.addEventListener('resize', applyMobileState);

        toggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('collapsed');
            }
        });
    }

    /* ── 4. Sidebar scroll-spy ── */
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
