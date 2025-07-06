// Main JavaScript for MenstrualGuide.xyz
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== Component Loading ==========
    async function loadComponent(id, url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = html;
                // Dispatch event when component is loaded
                window.dispatchEvent(new CustomEvent(`${id}-loaded`));
                
                // Initialize component-specific functionality
                if (id === 'page-header') {
                    initializeHeader();
                } else if (id === 'page-footer') {
                    initializeFooter();
                }
            }
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `
                    <div class="component-error">
                        <p>Failed to load component. Please refresh the page.</p>
                    </div>
                `;
            }
        }
    }

    // Load header and footer
    loadComponent('page-header', 'components/header.html');
    loadComponent('page-footer', 'components/footer.html');

    // ========== Header Functionality ==========
    function initializeHeader() {
        const header = document.querySelector('.header');
        const burger = document.querySelector('.header__burger');
        const nav = document.querySelector('.header__nav');
        const dropdowns = document.querySelectorAll('.dropdown');
        
        // Scroll behavior
        let lastScroll = 0;
        const scrollThreshold = 50;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add scrolled class for shadow
            if (currentScroll > 0) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
            
            // Hide/show header based on scroll direction
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                header?.classList.add('hide');
            } else {
                header?.classList.remove('hide');
            }
            
            lastScroll = currentScroll;
        });
        
        // Mobile menu toggle
        if (burger && nav) {
            burger.addEventListener('click', () => {
                burger.classList.toggle('active');
                nav.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }
        
        // Handle dropdowns in mobile view
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 992) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav && nav.classList.contains('active')) {
                if (!nav.contains(e.target) && !burger.contains(e.target)) {
                    nav.classList.remove('active');
                    burger?.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
        
        // Close mobile menu on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                nav?.classList.remove('active');
                burger?.classList.remove('active');
                document.body.classList.remove('menu-open');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
        
        // Set active navigation item
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.header__nav a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // ========== Footer Functionality ==========
    function initializeFooter() {
        const newsletterForm = document.querySelector('.footer__form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = newsletterForm.querySelector('.footer__input');
                if (input && input.value) {
                    // Show success message
                    const button = newsletterForm.querySelector('.footer__button');
                    const originalText = button.textContent;
                    button.textContent = 'Thank you!';
                    button.disabled = true;
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        input.value = '';
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 3000);
                }
            });
        }
    }

    // ========== Fade-in Animations ==========
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // ========== Smooth Scroll ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== Testimonials Slider ==========
    const testimonialTrack = document.getElementById('testimonial-track');
    const testimonialDots = document.querySelectorAll('.slider-dots .dot');
    let currentTestimonial = 0;
    let testimonialInterval;

    function showTestimonial(index) {
        if (!testimonialTrack) return;
        
        currentTestimonial = index;
        const offset = -100 * index;
        testimonialTrack.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        testimonialDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextTestimonial() {
        const totalTestimonials = testimonialDots.length;
        showTestimonial((currentTestimonial + 1) % totalTestimonials);
    }

    // Auto-advance testimonials
    if (testimonialTrack) {
        testimonialInterval = setInterval(nextTestimonial, 5000);
        
        // Dot click handlers
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(testimonialInterval);
                showTestimonial(index);
                testimonialInterval = setInterval(nextTestimonial, 5000);
            });
        });
        
        // Pause on hover
        const slider = document.querySelector('.testimonials-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
            slider.addEventListener('mouseleave', () => {
                testimonialInterval = setInterval(nextTestimonial, 5000);
            });
        }
    }

    // ========== FAQ Toggles ==========
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // ========== Tab Functionality ==========
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ========== Form Handling ==========
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Skip newsletter forms as they're handled separately
            if (form.classList.contains('footer__form') || form.classList.contains('newsletter-form')) {
                return;
            }
            
            e.preventDefault();
            
            // Basic form validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Show success message
                const button = form.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                button.textContent = 'Thank you!';
                button.disabled = true;
                
                // Reset form after delay
                setTimeout(() => {
                    form.reset();
                    button.textContent = originalText;
                    button.disabled = false;
                }, 3000);
            }
        });
    });

    // ========== Lazy Loading Images ==========
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // ========== Mobile Touch Improvements ==========
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        // Swipe functionality for testimonials
        if (testimonialTrack) {
            if (touchEndX < touchStartX - 50) {
                // Swipe left
                nextTestimonial();
            } else if (touchEndX > touchStartX + 50) {
                // Swipe right
                const totalTestimonials = testimonialDots.length;
                showTestimonial((currentTestimonial - 1 + totalTestimonials) % totalTestimonials);
            }
        }
    }

    // ========== Performance Optimization ==========
    // Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for resize events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========== Accessibility Improvements ==========
    // Skip to main content
    const skipLink = document.querySelector('.skip-to-main');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) {
                main.tabIndex = -1;
                main.focus();
            }
        });
    }

    // ========== Error Handling ==========
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        // You could send errors to a logging service here
    });

    // ========== Page-Specific Initialization ==========
    const currentPageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Initialize page-specific features
    switch(currentPageName) {
        case 'index':
            console.log('Homepage initialized');
            break;
        case 'products':
            console.log('Products page initialized');
            break;
        case 'cycle':
            console.log('Cycle page initialized');
            break;
        // Add more page-specific initializations as needed
    }

    console.log('MenstrualGuide.xyz - All systems initialized ✓');
}); 