// Modern global JavaScript for MenstrualGuide.xyz
(function () {
    'use strict';

    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    document.addEventListener('DOMContentLoaded', () => {
        loadGlobalComponents();
        initAnimations();
        initSmoothAnchors();
        initTabs();
        initGenericFaq();
        initForms();
        initLazyImages();
    });

    async function loadGlobalComponents() {
        await Promise.all([
            loadComponent('page-header', 'components/header.html'),
            loadComponent('page-footer', 'components/footer.html')
        ]);

        initHeader();
        initFooter();
    }

    async function loadComponent(id, url) {
        const host = document.getElementById(id);
        if (!host || host.dataset.componentLoaded === 'true') return;

        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            host.innerHTML = await response.text();
            host.dataset.componentLoaded = 'true';
            window.dispatchEvent(new CustomEvent(`${id}-loaded`));
        } catch (error) {
            console.error(`Unable to load ${url}`, error);
            host.innerHTML = '<div class="component-error">Navigation component could not load. Please refresh the page.</div>';
        }
    }

    function initHeader() {
        const header = document.getElementById('page-header');
        const burger = qs('#burger-menu');
        const nav = qs('#main-nav');
        const overlay = qs('#mobile-menu-overlay');
        const dropdowns = qsa('.dropdown');
        if (!header || !burger || !nav) return;

        const setMenuState = (open) => {
            nav.classList.toggle('active', open);
            burger.classList.toggle('active', open);
            document.body.classList.toggle('menu-open', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (overlay) overlay.setAttribute('aria-hidden', String(!open));
            if (!open) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const toggle = qs('.dropdown-toggle', dropdown);
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                });
            }
        };

        burger.addEventListener('click', (event) => {
            event.stopPropagation();
            setMenuState(!nav.classList.contains('active'));
        });

        overlay?.addEventListener('click', () => setMenuState(false));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setMenuState(false);
        });

        document.addEventListener('click', (event) => {
            if (!nav.classList.contains('active')) return;
            if (!nav.contains(event.target) && !burger.contains(event.target)) setMenuState(false);
        });

        dropdowns.forEach(dropdown => {
            const toggle = qs('.dropdown-toggle', dropdown);
            if (!toggle) return;

            toggle.addEventListener('click', (event) => {
                if (window.innerWidth > 1100) return;
                event.preventDefault();
                const isOpen = dropdown.classList.toggle('active');
                toggle.setAttribute('aria-expanded', String(isOpen));
            });
        });

        qsa('#main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href') || '';
                if (!href.startsWith('#') && window.innerWidth <= 1100 && !link.classList.contains('dropdown-toggle')) {
                    setMenuState(false);
                }
            });
        });

        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 1100) setMenuState(false);
        }, 150));

        setActiveNavigation();

        const updateHeaderShadow = () => {
            header.classList.toggle('scrolled', window.scrollY > 8);
        };
        updateHeaderShadow();
        window.addEventListener('scroll', throttle(updateHeaderShadow, 100), { passive: true });
    }

    function setActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        qsa('#main-nav a').forEach(link => {
            const href = link.getAttribute('href');
            const active = href === currentPage || (currentPage === '' && href === 'index.html');
            link.classList.toggle('active', active);
            if (active) {
                const parent = link.closest('.dropdown');
                const toggle = parent ? qs('.dropdown-toggle', parent) : null;
                if (toggle) toggle.classList.add('active');
            }
        });
    }

    function initFooter() {
        const form = qs('.footer__form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = qs('.footer__input', form);
            const button = qs('.footer__button', form);
            if (!input || !button || !input.value.trim()) return;

            const originalText = button.textContent;
            button.textContent = 'Joined ✓';
            button.disabled = true;
            form.reset();

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2600);
        });
    }

    function initAnimations() {
        const animated = qsa('.fade-in, .fade-up');
        if (!animated.length) return;

        if (!('IntersectionObserver' in window)) {
            animated.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        animated.forEach(el => observer.observe(el));
    }

    function initSmoothAnchors() {
        qsa('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (event) => {
                const targetId = anchor.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const target = qs(targetId);
                if (!target) return;

                event.preventDefault();
                const headerHeight = document.getElementById('page-header')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    function initTabs() {
        qsa('.tabs').forEach(tabList => {
            const tabs = qsa('.tab', tabList);
            if (!tabs.length) return;
            const wrapper = tabList.closest('.tabs-container') || tabList.parentElement;
            const contents = qsa('.tab-content', wrapper?.parentElement || document);

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(item => item.classList.remove('active'));
                    contents.forEach(content => content.classList.remove('active'));
                    tab.classList.add('active');
                    const target = document.getElementById(tab.dataset.tab);
                    if (target) target.classList.add('active');
                });
            });
        });
    }

    function initGenericFaq() {
        qsa('.faq-item').forEach(item => {
            const question = qs('.faq-question', item) || item;
            question.addEventListener('click', () => item.classList.toggle('active'));
        });
    }

    function initForms() {
        qsa('form').forEach(form => {
            if (form.classList.contains('footer__form') || form.dataset.jsReady === 'true') return;
            form.dataset.jsReady = 'true';

            form.addEventListener('submit', (event) => {
                if (form.getAttribute('action')) return;
                event.preventDefault();
                const requiredFields = qsa('input[required], textarea[required], select[required]', form);
                const invalid = requiredFields.filter(field => !String(field.value || '').trim());
                requiredFields.forEach(field => field.classList.toggle('error', invalid.includes(field)));
                if (invalid.length) return;

                const button = qs('button[type="submit"], .btn', form);
                if (!button) return;
                const originalText = button.textContent;
                button.textContent = 'Sent ✓';
                button.disabled = true;
                form.reset();
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2600);
            });
        });
    }

    function initLazyImages() {
        const images = qsa('img[data-src]');
        if (!images.length) return;

        if (!('IntersectionObserver' in window)) {
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            });
        });

        images.forEach(img => observer.observe(img));
    }

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    function throttle(fn, limit) {
        let locked = false;
        return (...args) => {
            if (locked) return;
            locked = true;
            fn(...args);
            setTimeout(() => { locked = false; }, limit);
        };
    }
})();
