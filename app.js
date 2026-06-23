// Immediate theme check (prevents layout flash before rendering finishes)
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Sticky Navbar & Shrink ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-links a');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- 3. Heritage Theme Toggle Handler ---
    const themeToggler = document.getElementById('themeToggler');
    themeToggler.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // --- 4. Scroll Reveal Observer (Precision 200ms opacity fades) ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 5. Stats Number Counter Animation with Custom Suffixes & Viewport Scroll-Trigger ---
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 1800; // Count-up runs over 1.8 seconds for smooth operational feel
        const startTime = performance.now();
        
        const updateCount = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out quad formula
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * target);
            
            element.textContent = `${currentValue}${suffix}`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = `${target}${suffix}`;
            }
        };
        requestAnimationFrame(updateCount);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                // unobserve immediately to ensure it fires only once and never resets when scrolling up/down
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    statsNumbers.forEach(num => statsObserver.observe(num));

    // --- 6. Professional Cost Estimator Math ---
    const tierButtons = document.querySelectorAll('.tier-tab-btn');
    const checkboxVenue = document.getElementById('scopeVenue');
    const checkboxStage = document.getElementById('scopeStage');
    const checkboxCatering = document.getElementById('scopeCatering');
    const checkboxArtists = document.getElementById('scopeArtists');
    const checkboxHospitality = document.getElementById('scopeHospitality');
    const scaleRadios = document.querySelectorAll('input[name="scaleCount"]');
    
    const ehPrice = document.getElementById('ehPrice');
    const mktPrice = document.getElementById('mktPrice');
    const rfpBtn = document.getElementById('rfpBtn');

    // Matrix boundaries (in Lakhs)
    const priceMatrix = {
        small: { // < 150 guests
            hub: { base: 3.0, cap: 5.0 },
            mkt: { base: 5.5, cap: 7.5 }
        },
        medium: { // 150 - 500 guests
            hub: { base: 7.0, cap: 12.0 },
            mkt: { base: 13.0, cap: 18.0 }
        },
        large: { // 500 - 1000+ guests
            hub: { base: 15.0, cap: 25.0 },
            mkt: { base: 28.0, cap: 38.0 }
        }
    };

    let activeTier = 'standard';

    // Live calculation routine
    function calculateBudget() {
        // Calculate Score Fraction (0 to 11 points)
        let tierPoints = 0;
        if (activeTier === 'standard') tierPoints = 0;
        else if (activeTier === 'premium') tierPoints = 3;
        else if (activeTier === 'elite') tierPoints = 6;

        let scopePoints = 0;
        if (checkboxVenue.checked) scopePoints += 1;
        if (checkboxStage.checked) scopePoints += 1;
        if (checkboxCatering.checked) scopePoints += 1;
        if (checkboxArtists.checked) scopePoints += 1;
        if (checkboxHospitality.checked) scopePoints += 1;

        const totalPoints = tierPoints + scopePoints;
        const fraction = totalPoints / 11.0; // scales between 0.0 and 1.0

        // Fetch Base Rates based on Guest scale radio
        const selectedRadio = document.querySelector('input[name="scaleCount"]:checked');
        const scaleKey = selectedRadio ? selectedRadio.value : 'medium';
        const boundaries = priceMatrix[scaleKey];

        // Compute Event Hub Rates
        const ehBase = boundaries.hub.base;
        const ehCap = boundaries.hub.cap;
        const ehLow = ehBase + (ehCap - ehBase) * 0.7 * fraction;
        const ehHigh = ehBase + (ehCap - ehBase) * (0.3 + 0.7 * fraction);

        // Compute Market Rates
        const mktBase = boundaries.mkt.base;
        const mktCap = boundaries.mkt.cap;
        const mktLow = mktBase + (mktCap - mktBase) * 0.7 * fraction;
        const mktHigh = mktBase + (mktCap - mktBase) * (0.3 + 0.7 * fraction);

        // Render outputs formatted as Lakhs
        ehPrice.textContent = `₹${ehLow.toFixed(1)}L - ₹${ehHigh.toFixed(1)}L`;
        mktPrice.textContent = `₹${mktLow.toFixed(1)}L - ₹${mktHigh.toFixed(1)}L`;
    }

    // Tab switcher events
    tierButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tierButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTier = btn.getAttribute('data-tier');
            calculateBudget();
        });
    });

    // Checkbox and Radio listener binds
    [checkboxVenue, checkboxStage, checkboxCatering, checkboxArtists, checkboxHospitality].forEach(box => {
        box.addEventListener('change', calculateBudget);
    });

    scaleRadios.forEach(radio => {
        radio.addEventListener('change', calculateBudget);
    });

    // Run initial budget projection
    calculateBudget();

    // Hook RFP button to form fields pre-fill
    rfpBtn.addEventListener('click', () => {
        const activeTabBtn = document.querySelector('.tier-tab-btn.active');
        const tierName = activeTabBtn ? activeTabBtn.textContent : 'Standard Execution';
        
        const selectedRadio = document.querySelector('input[name="scaleCount"]:checked');
        const scaleLabel = selectedRadio ? selectedRadio.parentNode.querySelector('.scale-opt-text').textContent : '150 - 500';
        
        const scopes = [];
        if (checkboxVenue.checked) scopes.push("Venue Sourcing");
        if (checkboxStage.checked) scopes.push("Stage Production");
        if (checkboxCatering.checked) scopes.push("Catering");
        if (checkboxArtists.checked) scopes.push("Celebrity Technical Riders");
        if (checkboxHospitality.checked) scopes.push("Guest Hospitality");
        
        const scopesStr = scopes.length > 0 ? scopes.join(", ") : "None";
        const ehRangeText = ehPrice.textContent;
        const mktRangeText = mktPrice.textContent;

        const eventInput = document.getElementById('event');
        const messageTextarea = document.getElementById('message');

        // Prepopulate form
        eventInput.value = `${tierName} Request`;
        eventInput.dispatchEvent(new Event('input', { bubbles: true }));

        messageTextarea.value = `Dear EVENT HUB Planning Studio,\n\nI wish to submit an RFP request for a planning consultation.\n\nTier: ${tierName}\nScale Matrix: ${scaleLabel} Attendees\nScope Requirements: ${scopesStr}\n\nEstimated Event Hub Rate: ${ehRangeText}\nEstimated Average Market Rate: ${mktRangeText}\n\nPlease contact me at your earliest convenience to arrange a technical design brief.`;
        messageTextarea.dispatchEvent(new Event('input', { bubbles: true }));

        // Scroll
        const contactSection = document.getElementById('contact');
        contactSection.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            messageTextarea.focus();
        }, 800);
    });

    // --- 7. Transparent Vendor FAQ Accordion Logic ---
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const panel = trigger.nextElementSibling;
            const icon = trigger.querySelector('.faq-icon');
            
            // Toggle active state
            trigger.classList.toggle('active');
            
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                icon.textContent = '+';
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                icon.textContent = '−';
            }
        });
    });

    // --- 8. Contact Form Submission Handling ---
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const eventVal = document.getElementById('event').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !eventVal || !message) {
            showFormMsg('Please fill out all fields before submitting.', false);
            return;
        }

        if (!validateEmail(email)) {
            showFormMsg('Please enter a valid email address.', false);
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const origBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting RFP Brief...';

        setTimeout(() => {
            submitBtn.textContent = 'RFP Brief Logged';
            showFormMsg(`Thank you, ${name}. Your architectural event RFP for "${eventVal}" has been registered in our system. A studio partner from our Nariman Point office will contact you within 24 hours.`, true);
            contactForm.reset();
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = origBtnText;
            }, 3000);
        }, 1200);
    });

    function showFormMsg(text, isSuccess) {
        formMessage.textContent = text;
        formMessage.className = 'form-message';
        
        if (isSuccess) {
            formMessage.classList.add('success');
        } else {
            formMessage.style.display = 'block';
            formMessage.style.background = '#FAF8F3';
            formMessage.style.borderColor = '#ef4444';
            formMessage.style.color = '#ef4444';
        }
        
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    // --- 9. Premium Custom Cursor System (Desktop only) ---
    const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window);
    
    if (!isMobile) {
        // Create nodes
        const cursorDot = document.createElement('div');
        cursorDot.className = 'custom-cursor-dot';
        const cursorRing = document.createElement('div');
        cursorRing.className = 'custom-cursor-ring';
        
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorRing);
        document.body.classList.add('custom-cursor-active');
        
        // Track position
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        let cursorActive = false;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!cursorActive) {
                cursorDot.style.opacity = 1;
                cursorRing.style.opacity = 1;
                cursorActive = true;
            }
            
            // Move dot instantly
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        window.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = 0;
            cursorRing.style.opacity = 0;
            cursorActive = false;
        });
        
        // Animate ring with fluid lag
        const animateRing = () => {
            const ease = 0.15; // Interpolation speed constant
            ringX += (mouseX - ringX) * ease;
            ringY += (mouseY - ringY) * ease;
            
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            requestAnimationFrame(animateRing);
        };
        requestAnimationFrame(animateRing);
        
        // Bind hover expansion states to all clickable targets
        const updateHoverBinds = () => {
            const clickables = document.querySelectorAll('a, button, .gallery-item, .tier-tab-btn, .scale-opt-label, input, textarea, select, label, .faq-trigger');
            clickables.forEach(item => {
                // Prevent duplicate binds
                if (item.getAttribute('data-cursor-bound')) return;
                
                item.addEventListener('mouseenter', () => {
                    cursorRing.classList.add('hover');
                    cursorDot.classList.add('hover');
                });
                item.addEventListener('mouseleave', () => {
                    cursorRing.classList.remove('hover');
                    cursorDot.classList.remove('hover');
                });
                item.setAttribute('data-cursor-bound', 'true');
            });
        };
        
        updateHoverBinds();
        
        // Dynamic re-binding when new elements could render
        const observer = new MutationObserver(updateHoverBinds);
        observer.observe(document.body, { childList: true, subtree: true });
    }
});
