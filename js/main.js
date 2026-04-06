/**
 * MEISEL HEALTH — Main JavaScript
 * Vanilla JS, no dependencies. Modern syntax for direct script inclusion.
 * Handles: navigation, scroll effects, animations, FAQ, parallax, cookies.
 */

(function () {
  'use strict';

  /* =========================================================================
   * UTILITIES
   * ======================================================================= */

  /** Debounce — limits function execution to once per `wait` ms */
  const debounce = (fn, wait = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), wait);
    };
  };

  /** True when viewport is narrower than 768px */
  const isMobile = () => window.innerWidth < 768;

  /** Sticky nav height in px — used for scroll offset */
  const NAV_HEIGHT = 72;


  /* =========================================================================
   * 1. MOBILE NAVIGATION
   *    Hamburger toggle, full-screen overlay, scroll lock, ESC to close.
   * ======================================================================= */

  const initMobileNav = () => {
    const nav       = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav__hamburger');
    const overlay   = document.querySelector('.nav__overlay');
    const links     = overlay?.querySelectorAll('a');

    if (!hamburger || !overlay) return;

    const open = () => {
      hamburger.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      hamburger.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    };

    const toggle = () => {
      const isOpen = overlay.classList.contains('active');
      isOpen ? close() : open();
    };

    hamburger.addEventListener('click', toggle);

    // Close on link click inside overlay
    links?.forEach(link => link.addEventListener('click', close));

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  };


  /* =========================================================================
   * 2. SCROLL REVEAL ANIMATIONS
   *    IntersectionObserver watches `.reveal` elements.
   *    Adds `.visible` class once. Supports data-delay for stagger.
   * ======================================================================= */

  const initScrollReveal = () => {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = el.dataset.delay;

          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }

          el.classList.add('visible');
          observer.unobserve(el); // once: true behavior
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach(el => observer.observe(el));
  };


  /* =========================================================================
   * 3. NAV SCROLL EFFECT
   *    Adds `.nav--scrolled` (shadow) when scrolled past 50px.
   * ======================================================================= */

  const initNavScroll = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load in case page is already scrolled
    onScroll();
  };


  /* =========================================================================
   * 4. HERO STAGGERED LOAD
   *    On DOMContentLoaded, fade-in hero elements using data-hero-delay.
   *    Expected markup: .hero__element[data-hero-delay="200|400|550|700|900"]
   * ======================================================================= */

  // Hero stagger is handled by pure CSS animations (.hero-reveal--*).
  // No JS needed. Keeping this as a no-op for the init call.
  const initHeroStagger = () => {};


  /* =========================================================================
   * 5. TICKER ANIMATION — JS FALLBACK
   *    The ticker uses pure CSS animation (translateX, 35s linear infinite).
   *    This fallback checks if the CSS animation is running. If not, it
   *    clones the content and drives it with requestAnimationFrame.
   * ======================================================================= */

  const initTickerFallback = () => {
    const ticker = document.querySelector('.ticker');
    if (!ticker) return;

    const track = ticker.querySelector('.ticker__track');
    if (!track) return;

    // Check if CSS animation is running after a short delay
    setTimeout(() => {
      const style = getComputedStyle(track);
      const animName = style.animationName || style.webkitAnimationName || 'none';
      const animState = style.animationPlayState || style.webkitAnimationPlayState || 'running';

      // If CSS animation is working, do nothing
      if (animName !== 'none' && animState === 'running') return;

      // Fallback: drive with rAF
      const content = track.innerHTML;
      track.innerHTML = content + content; // duplicate for seamless loop

      let position = 0;
      const speed = 0.5; // px per frame (~30px/s at 60fps)

      const animate = () => {
        position -= speed;
        const halfWidth = track.scrollWidth / 2;

        if (Math.abs(position) >= halfWidth) {
          position = 0;
        }

        track.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
      };

      // Disable CSS animation, enable JS fallback
      track.style.animation = 'none';
      track.style.display = 'inline-flex';
      track.style.whiteSpace = 'nowrap';
      requestAnimationFrame(animate);
    }, 500);
  };


  /* =========================================================================
   * 6. FAQ ACCORDION
   *    Click `.faq__question` to toggle `.faq__item--open` on parent.
   *    Animates answer height. Only one open at a time.
   * ======================================================================= */

  const initFaqAccordion = () => {
    const questions = document.querySelectorAll('.faq__question');
    if (!questions.length) return;

    questions.forEach(question => {
      question.addEventListener('click', () => {
        const item   = question.closest('.faq__item');
        const answer = item?.querySelector('.faq__answer');
        const icon   = question.querySelector('.faq__icon');
        if (!item || !answer) return;

        const isOpen = item.classList.contains('faq__item--open');

        // Close all other items first (one-at-a-time behavior)
        document.querySelectorAll('.faq__item--open').forEach(openItem => {
          if (openItem === item) return;
          const openAnswer = openItem.querySelector('.faq__answer');
          const openIcon   = openItem.querySelector('.faq__icon');

          openItem.classList.remove('faq__item--open');
          if (openAnswer) {
            openAnswer.style.maxHeight = '0';
          }
          if (openIcon) {
            openIcon.textContent = '+';
            openIcon.setAttribute('aria-label', 'Expand');
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('faq__item--open');
          answer.style.maxHeight = '0';
          if (icon) {
            icon.textContent = '+';
            icon.setAttribute('aria-label', 'Expand');
          }
        } else {
          item.classList.add('faq__item--open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          if (icon) {
            icon.textContent = '\u2212'; // minus sign
            icon.setAttribute('aria-label', 'Collapse');
          }
        }
      });
    });

    // Recalculate open answer height on resize (content reflow)
    window.addEventListener('resize', debounce(() => {
      const openAnswer = document.querySelector('.faq__item--open .faq__answer');
      if (openAnswer) {
        openAnswer.style.maxHeight = openAnswer.scrollHeight + 'px';
      }
    }));
  };


  /* =========================================================================
   * 7. SMOOTH SCROLL
   *    All anchor links (href="#...") scroll smoothly with nav offset.
   * ======================================================================= */

  const initSmoothScroll = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({
        top,
        behavior: 'smooth'
      });

      // Update URL hash without jumping
      history.pushState(null, '', targetId);
    });
  };


  /* =========================================================================
   * 8. PARALLAX EFFECT
   *    Elements with `.parallax-photo` translate at 0.6x scroll speed.
   *    Uses rAF for performance. Disabled on mobile.
   * ======================================================================= */

  const initParallax = () => {
    const elements = document.querySelectorAll('.parallax-photo');
    if (!elements.length) return;

    let ticking = false;
    let enabled = !isMobile();

    const update = () => {
      if (!enabled) return;

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Only process if element is in/near viewport
        if (rect.bottom < -100 || rect.top > viewHeight + 100) return;

        // Calculate offset: 0.6x speed means image moves 40% slower
        const scrolled = rect.top;
        const offset = scrolled * 0.4; // inverse of 0.6x

        el.style.transform = `translateY(${offset}px)`;
        el.style.willChange = 'transform';
      });
    };

    const onScroll = () => {
      if (!enabled || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Re-evaluate on resize
    window.addEventListener('resize', debounce(() => {
      enabled = !isMobile();
      if (!enabled) {
        // Remove transforms on mobile
        elements.forEach(el => {
          el.style.transform = '';
          el.style.willChange = '';
        });
      }
    }));

    // Initial run
    update();
  };


  /* =========================================================================
   * 9. PHOTO STRIP HOVER — TOUCH SUPPORT
   *    On touchstart add .hover class; on touchend remove after 300ms.
   * ======================================================================= */

  const initPhotoStripTouch = () => {
    const photos = document.querySelectorAll('.photo-strip__col');
    if (!photos.length) return;

    photos.forEach(photo => {
      photo.addEventListener('touchstart', () => {
        photo.classList.add('hover');
      }, { passive: true });

      photo.addEventListener('touchend', () => {
        setTimeout(() => {
          photo.classList.remove('hover');
        }, 300);
      }, { passive: true });

      photo.addEventListener('touchcancel', () => {
        photo.classList.remove('hover');
      }, { passive: true });
    });
  };


  /* =========================================================================
   * 10. PERFORMANCE UTILITIES
   *     Passive listeners already applied above.
   *     This section handles will-change cleanup.
   * ======================================================================= */

  const initPerformanceCleanup = () => {
    // Remove will-change from parallax elements when scrolling stops
    let scrollTimer;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.querySelectorAll('.parallax-photo').forEach(el => {
          el.style.willChange = '';
        });
      }, 200);
    }, { passive: true });
  };


  /* =========================================================================
   * 11. COOKIE CONSENT
   *     Minimal bottom bar. Stores preference in localStorage.
   * ======================================================================= */

  const initCookieConsent = () => {
    const STORAGE_KEY = 'meisel_cookie_consent';

    // If already accepted, do nothing
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Build the bar
    const bar = document.createElement('div');
    bar.className = 'cookie-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');

    bar.innerHTML = `
      <div class="cookie-consent__inner">
        <p class="cookie-consent__text">
          We use cookies to improve your experience. By continuing to browse,
          you agree to our use of cookies.
        </p>
        <div class="cookie-consent__actions">
          <button class="cookie-consent__accept" type="button">Accept</button>
          <button class="cookie-consent__dismiss" type="button" aria-label="Dismiss">
            &times;
          </button>
        </div>
      </div>
    `;

    // Styles — injected inline so no external CSS dependency
    const style = document.createElement('style');
    style.textContent = `
      .cookie-consent {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: #072c26;
        border-top: 1px solid rgba(196, 206, 98, 0.25);
        padding: 16px 24px;
        transform: translateY(100%);
        transition: transform 400ms ease;
        font-family: 'Jost', 'Helvetica Neue', sans-serif;
      }
      .cookie-consent--visible {
        transform: translateY(0);
      }
      .cookie-consent__inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        flex-wrap: wrap;
      }
      .cookie-consent__text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        line-height: 1.5;
        letter-spacing: 0.02em;
        margin: 0;
        flex: 1;
        min-width: 200px;
      }
      .cookie-consent__actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }
      .cookie-consent__accept {
        background: #0e574b;
        color: #ffffff;
        border: 1.5px solid #c4ce62;
        font-family: 'Jost', 'Helvetica Neue', sans-serif;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 0 20px;
        height: 36px;
        cursor: pointer;
        transition: background 200ms ease;
        border-radius: 0;
      }
      .cookie-consent__accept:hover {
        background: #072c26;
      }
      .cookie-consent__dismiss {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.45);
        font-size: 22px;
        cursor: pointer;
        padding: 4px 8px;
        line-height: 1;
        transition: color 150ms ease;
      }
      .cookie-consent__dismiss:hover {
        color: rgba(255, 255, 255, 0.8);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(bar);

    // Slide in after a short delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.classList.add('cookie-consent--visible');
      });
    });

    const dismiss = () => {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      bar.classList.remove('cookie-consent--visible');
      setTimeout(() => bar.remove(), 400);
    };

    bar.querySelector('.cookie-consent__accept')?.addEventListener('click', dismiss);
    bar.querySelector('.cookie-consent__dismiss')?.addEventListener('click', dismiss);
  };


  /* =========================================================================
   * INITIALIZATION
   * ======================================================================= */

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollReveal();
    initNavScroll();
    initHeroStagger();
    initTickerFallback();
    initFaqAccordion();
    initSmoothScroll();
    initParallax();
    initPhotoStripTouch();
    initPerformanceCleanup();
    initCookieConsent();
  });

})();
