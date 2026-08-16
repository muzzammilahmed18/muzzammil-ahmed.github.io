document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // THEME TOGGLE
    // ============================================================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    let currentTheme = localStorage.getItem('ma-theme') || 'dark';

    // Apply initial theme
    if (currentTheme === 'light') {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark');
        currentTheme = 'dark';
    }

    // Build theme toggle SVG
    function buildThemeToggle() {
        const isDark = currentTheme === 'dark';
        themeToggle.innerHTML = `
            <span class="theme-toggle-bg ${isDark ? 'dark-bg' : 'light-bg'}"></span>
            <svg viewBox="0 0 32 32" width="22" height="22">
                ${isDark ? `
                    <g class="moon-icon">
                        <path d="M22.5 19.6A8.2 8.2 0 0 1 12.9 9.9a8.4 8.4 0 1 0 9.6 9.7Z" fill="var(--accent)"/>
                        <circle cx="7" cy="8" r="1" fill="currentColor" opacity="0.75"/>
                        <circle cx="20" cy="5" r="0.7" fill="currentColor" opacity="0.75"/>
                        <circle cx="24" cy="17" r="0.9" fill="currentColor" opacity="0.75"/>
                        <circle cx="10" cy="21" r="0.6" fill="currentColor" opacity="0.75"/>
                    </g>
                ` : `
                    <g class="sun-icon">
                        <circle cx="16" cy="16" r="6" fill="var(--accent)"/>
                        ${Array.from({ length: 8 }).map((_, i) => {
                            const a = (i * Math.PI) / 4;
                            return `
                                <line 
                                    x1="${16 + Math.cos(a) * 9}" 
                                    y1="${16 + Math.sin(a) * 9}" 
                                    x2="${16 + Math.cos(a) * 12}" 
                                    y2="${16 + Math.sin(a) * 12}" 
                                    stroke="var(--accent)" 
                                    stroke-width="1.8" 
                                    stroke-linecap="round"
                                />
                            `;
                        }).join('')}
                    </g>
                `}
            </svg>
        `;
    }

    buildThemeToggle();

    // Toggle theme
    themeToggle.addEventListener('click', function() {
        if (currentTheme === 'dark') {
            html.classList.remove('dark');
            currentTheme = 'light';
        } else {
            html.classList.add('dark');
            currentTheme = 'dark';
        }
        localStorage.setItem('ma-theme', currentTheme);
        buildThemeToggle();
        // Update cursor ring for theme
        updateCursorRing();
    });

    // ============================================================
    // PRELOADER
    // ============================================================
    const preloader = document.getElementById('preloader');
    
    setTimeout(function() {
        preloader.classList.add('hidden');
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 600);
    }, 1250);

    // ============================================================
    // SCROLL PROGRESS
    // ============================================================
    const progressFill = document.querySelector('.scroll-progress-fill');
    let progressFrame = 0;

    function updateScrollProgress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        progressFill.style.transform = `scaleX(${progress})`;
    }

    function handleScrollProgress() {
        if (!progressFrame) {
            progressFrame = requestAnimationFrame(function() {
                updateScrollProgress();
                progressFrame = 0;
            });
        }
    }

    updateScrollProgress();
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    window.addEventListener('resize', handleScrollProgress, { passive: true });

    // ============================================================
    // CUSTOM CURSOR
    // ============================================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorLabel = document.querySelector('.cursor-ring-label');
    let isCursorEnabled = false;
    let cursorTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let cursorCurrent = { x: cursorTarget.x, y: cursorTarget.y };
    let cursorFrame = 0;

    // Check if pointer is fine (desktop)
    if (window.matchMedia('(pointer: fine)').matches) {
        isCursorEnabled = true;
        document.body.classList.add('cursor-none-all');
    }

    function updateCursorRing() {
        if (!isCursorEnabled) return;
        const isDark = document.documentElement.classList.contains('dark');
        cursorRing.style.borderColor = 'var(--accent)';
        cursorRing.style.boxShadow = '0 0 24px -8px var(--accent)';
    }

    function handleCursorMove(e) {
        if (!isCursorEnabled) return;
        cursorTarget.x = e.clientX;
        cursorTarget.y = e.clientY;
        
        cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        
        // Check for interactive elements
        const target = e.target;
        const interactive = target.closest('a, button, input, textarea, [data-cursor]');
        
        if (interactive) {
            const cursorAttr = interactive.getAttribute('data-cursor');
            if (cursorAttr && cursorAttr !== 'true') {
                cursorRing.classList.add('label');
                if (!cursorLabel) {
                    const label = document.createElement('span');
                    label.className = 'cursor-ring-label';
                    label.textContent = cursorAttr;
                    cursorRing.appendChild(label);
                } else {
                    cursorLabel.textContent = cursorAttr;
                }
                cursorRing.style.width = '76px';
                cursorRing.style.height = '76px';
                cursorRing.classList.add('active');
            } else {
                cursorRing.classList.remove('label');
                if (cursorLabel) cursorLabel.textContent = '';
                cursorRing.style.width = '52px';
                cursorRing.style.height = '52px';
                cursorRing.classList.add('active');
            }
        } else {
            cursorRing.classList.remove('label');
            if (cursorLabel) cursorLabel.textContent = '';
            cursorRing.style.width = '34px';
            cursorRing.style.height = '34px';
            cursorRing.classList.remove('active');
        }
    }

    function cursorLoop() {
        if (!isCursorEnabled) return;
        cursorCurrent.x += (cursorTarget.x - cursorCurrent.x) * 0.16;
        cursorCurrent.y += (cursorTarget.y - cursorCurrent.y) * 0.16;
        cursorRing.style.transform = `translate3d(${cursorCurrent.x}px, ${cursorCurrent.y}px, 0) translate(-50%, -50%)`;
        cursorFrame = requestAnimationFrame(cursorLoop);
    }

    if (isCursorEnabled) {
        document.addEventListener('pointermove', handleCursorMove, { passive: true });
        cursorLoop();
    }

    // ============================================================
    // NAVBAR SCROLL EFFECT
    // ============================================================
    const navbar = document.getElementById('navbar');
    let isScrolled = false;

    function handleNavbarScroll() {
        if (window.scrollY > 24) {
            if (!isScrolled) {
                navbar.classList.add('scrolled');
                isScrolled = true;
            }
        } else {
            if (isScrolled) {
                navbar.classList.remove('scrolled');
                isScrolled = false;
            }
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // ============================================================
    // NAVIGATION - SMOOTH SCROLL
    // ============================================================
    function scrollToSection(id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // All navigation buttons
    document.querySelectorAll('[data-target]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            scrollToSection(target);
            // Close mobile menu
            closeMobileMenu();
        });
    });

    // ============================================================
    // MOBILE MENU
    // ============================================================
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    let isMenuOpen = false;

    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        menuToggle.classList.toggle('open', isMenuOpen);
        mobileMenu.classList.toggle('open', isMenuOpen);
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
        menuToggle.setAttribute('aria-label', isMenuOpen ? 'Close menu' : 'Open menu');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    function closeMobileMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            menuToggle.classList.remove('open');
            mobileMenu.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }
    }

    menuToggle.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });

    // ============================================================
    // ACTIVE NAV LINK
    // ============================================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = ['home', 'about', 'skills', 'experience', 'projects', 'services', 'contact'];

    function updateActiveNav() {
        const scrollPos = window.scrollY + 150;
        let currentSection = 'home';

        sections.forEach(function(id) {
            const section = document.getElementById(id);
            if (section) {
                const offsetTop = section.offsetTop;
                const offsetBottom = offsetTop + section.offsetHeight;
                if (scrollPos >= offsetTop && scrollPos < offsetBottom) {
                    currentSection = id;
                }
            }
        });

        navLinks.forEach(function(link) {
            const target = link.getAttribute('data-target');
            link.classList.toggle('active', target === currentSection);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav, { passive: true });
    updateActiveNav();

    // ============================================================
    // SCROLL REVEAL
    // ============================================================
    function handleScrollReveal() {
        const reveals = document.querySelectorAll('[data-reveal]');
        
        reveals.forEach(function(el) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const threshold = 0.88;
            
            if (rect.top < windowHeight * threshold) {
                el.classList.add('visible');
            }
        });
    }

    // Initial check
    setTimeout(handleScrollReveal, 100);
    window.addEventListener('scroll', handleScrollReveal, { passive: true });
    window.addEventListener('resize', handleScrollReveal, { passive: true });

    // ============================================================
    // TYPEWRITER EFFECT
    // ============================================================
    const typedText = document.getElementById('typedText');
    const words = ['Software Engineer', 'Full-Stack Developer', 'AI/ML Enthusiast', 'Problem Solver', 'Private Tutor'];
    let wordIndex = 0;
    let charIndex = 0;
    let isErasing = false;
    let typewriterTimer = null;
    let typewriterSpeed = 70;
    let eraseSpeed = 34;
    let holdMs = 2000;

    function typewriterTick() {
        const currentWord = words[wordIndex] || '';
        
        if (!isErasing) {
            charIndex = Math.min(charIndex + 1, currentWord.length);
            typedText.textContent = currentWord.slice(0, charIndex);
            
            if (charIndex >= currentWord.length) {
                isErasing = true;
                typewriterTimer = setTimeout(typewriterTick, holdMs);
                return;
            }
            typewriterTimer = setTimeout(typewriterTick, typewriterSpeed);
        } else {
            charIndex = Math.max(charIndex - 1, 0);
            typedText.textContent = currentWord.slice(0, charIndex);
            
            if (charIndex <= 0) {
                isErasing = false;
                wordIndex = (wordIndex + 1) % words.length;
                typewriterTimer = setTimeout(typewriterTick, 320);
                return;
            }
            typewriterTimer = setTimeout(typewriterTick, eraseSpeed);
        }
    }

    // Start typewriter after preloader
    setTimeout(function() {
        typewriterTimer = setTimeout(typewriterTick, 500);
    }, 1500);

    // ============================================================
    // EXPERIENCE TIMELINE ANIMATION
    // ============================================================
    const timelineAccent = document.querySelector('.timeline-line-accent');

    function checkTimeline() {
        if (!timelineAccent) return;
        const rect = timelineAccent.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.78) {
            timelineAccent.classList.add('visible');
        }
    }

    window.addEventListener('scroll', checkTimeline, { passive: true });
    setTimeout(checkTimeline, 200);

    // ============================================================
    // CONTACT FORM
    // ============================================================
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validateField(id, value) {
        const errorEl = document.getElementById(id + '-error');
        const inputEl = document.getElementById(id);
        
        if (!errorEl || !inputEl) return true;

        let isValid = true;
        let errorMsg = '';

        switch(id) {
            case 'name':
                if (!value.trim()) {
                    errorMsg = 'Please tell me your name.';
                    isValid = false;
                } else if (value.trim().length > 100) {
                    errorMsg = 'Name must be under 100 characters.';
                    isValid = false;
                }
                break;
            case 'email':
                if (!value.trim()) {
                    errorMsg = 'An email is required so I can reply.';
                    isValid = false;
                } else if (!emailRegex.test(value.trim())) {
                    errorMsg = 'That email doesn\'t look valid.';
                    isValid = false;
                }
                break;
            case 'subject':
                if (!value.trim()) {
                    errorMsg = 'Add a short subject.';
                    isValid = false;
                }
                break;
            case 'message':
                if (!value.trim()) {
                    errorMsg = 'Your message can\'t be empty.';
                    isValid = false;
                } else if (value.trim().length > 1000) {
                    errorMsg = 'Keep it under 1000 characters.';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            errorEl.textContent = errorMsg;
            errorEl.classList.add('visible');
            inputEl.classList.add('error');
        } else {
            errorEl.classList.remove('visible');
            inputEl.classList.remove('error');
        }

        return isValid;
    }

    // Real-time validation on blur
    document.querySelectorAll('#contactForm .form-input').forEach(function(input) {
        input.addEventListener('blur', function() {
            validateField(this.id, this.value);
        });
        
        input.addEventListener('input', function() {
            // Clear error while typing
            const errorEl = document.getElementById(this.id + '-error');
            if (errorEl) {
                errorEl.classList.remove('visible');
                this.classList.remove('error');
            }
        });
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        const isNameValid = validateField('name', name);
        const isEmailValid = validateField('email', email);
        const isSubjectValid = validateField('subject', subject);
        const isMessageValid = validateField('message', message);
        
        if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending…';
            
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
                formSuccess.classList.add('visible');
                
                // Reset form
                contactForm.reset();
                
                setTimeout(function() {
                    formSuccess.classList.remove('visible');
                }, 4000);
            }, 900);
        }
    });

    // ============================================================
    // BACK TO TOP
    // ============================================================
    const backToTop = document.getElementById('backToTop');

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================================
    // MAGNETIC BUTTON EFFECT
    // ============================================================
    document.querySelectorAll('.magnetic-btn').forEach(function(btn) {
        btn.addEventListener('pointermove', function(e) {
            if (window.matchMedia('(pointer: coarse)').matches) return;
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
            this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        
        btn.addEventListener('pointerleave', function() {
            this.style.transform = 'translate3d(0,0,0)';
        });
    });

    // ============================================================
    // PROJECT CARD HOVER - Visual effect
    // ============================================================
    document.querySelectorAll('[data-project]').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            const visual = this.querySelector('.project-visual-inner');
            if (visual) {
                visual.style.transition = 'transform 0.3s ease';
                visual.style.transform = 'translateY(-8px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const visual = this.querySelector('.project-visual-inner');
            if (visual) {
                visual.style.transform = 'translateY(0)';
            }
        });
    });

    // ============================================================
    // HANDLE REDUCED MOTION PREFERENCE
    // ============================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // Disable animations
        document.querySelectorAll('[data-reveal]').forEach(function(el) {
            el.classList.add('visible');
        });
        document.querySelector('.scroll-progress-fill').style.transform = 'scaleX(0)';
    }

    // ============================================================
    // KEYBOARD NAVIGATION - Arrow keys for sections
    // ============================================================
    let currentSectionIndex = 0;

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            currentSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
            scrollToSection(sections[currentSectionIndex]);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
            scrollToSection(sections[currentSectionIndex]);
        }
    });

    // ============================================================
    // UPDATE CURSOR ON THEME CHANGE
    // ============================================================
    function updateCursorRing() {
        if (!isCursorEnabled) return;
        const isDark = document.documentElement.classList.contains('dark');
        cursorRing.style.borderColor = 'var(--accent)';
        cursorRing.style.boxShadow = '0 0 24px -8px var(--accent)';
    }

    // ============================================================
    // CONSOLE WELCOME
    // ============================================================
    console.log('%c Muzzammil Ahmed ', 'background: #c8a87c; color: #1b1917; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 4px;');
    console.log('%c Software Engineer · Full-Stack · AI ', 'color: #c8a87c; font-size: 14px;');
    console.log('%c 📧 m89015294@gmail.com ', 'color: #8a8a8a; font-size: 12px;');

});