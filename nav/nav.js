/* ==========================================================================
   Healthcare Navigation Menu · v1.0
   JavaScript Architecture:
     - Single DOMContentLoaded entry point
     - Scroll handler with { passive: true }
     - No inline styles — only classList API
     - All magic numbers as named constants
   ========================================================================== */

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const SCROLL_THRESHOLD = 60;      // Pixels scrolled before nav transitions (FR-04)
const MOBILE_BREAKPOINT = 768;    // Viewport width below which hamburger activates

// ---------------------------------------------------------------------------
// CSS CLASS NAMES — mirrors BEM classes in nav.css
// ---------------------------------------------------------------------------
const CLASS_NAV_SCROLLED = 'nav--scrolled';
const CLASS_LINKS_OPEN = 'nav__links--open';
const CLASS_LINK_ACTIVE = 'nav__link--active';

// ---------------------------------------------------------------------------
// DOM REFERENCES
// ---------------------------------------------------------------------------
let navElement;
let navToggle;
let navLinks;
let navLinkItems;

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  navElement = document.querySelector('.nav');
  navToggle = document.querySelector('.nav__toggle');
  navLinks = document.querySelector('.nav__links');
  navLinkItems = document.querySelectorAll('.nav__link');

  if (!navElement) return;

  initScrollHandler();
  initHamburgerToggle();
  initActiveLink();
});


// ===========================================================================
// SCROLL HANDLER — Toggles .nav--scrolled (FR-04)
// Uses { passive: true } for performance
// ===========================================================================
function initScrollHandler() {
  function handleScroll() {
    if (window.scrollY >= SCROLL_THRESHOLD) {
      navElement.classList.add(CLASS_NAV_SCROLLED);
    } else {
      navElement.classList.remove(CLASS_NAV_SCROLLED);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Run once on load for mid-page refresh
  handleScroll();
}


// ===========================================================================
// HAMBURGER TOGGLE — Mobile menu open/close (FR-09, FR-10)
// ===========================================================================
function initHamburgerToggle() {
  if (!navToggle || !navLinks) return;

  function toggleMenu(forceClose) {
    const isCurrentlyOpen = navToggle.getAttribute('aria-expanded') === 'true';
    const shouldClose = forceClose === true || isCurrentlyOpen;

    if (shouldClose) {
      navLinks.classList.remove(CLASS_LINKS_OPEN);
      navToggle.setAttribute('aria-expanded', 'false');
    } else {
      navLinks.classList.add(CLASS_LINKS_OPEN);
      navToggle.setAttribute('aria-expanded', 'true');
    }
  }

  // (a) Toggle on hamburger click (FR-10a)
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // (b) Close on click outside (FR-10b)
  document.addEventListener('click', (e) => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
      toggleMenu(true);
    }
  });

  // (c) Close on Escape key (FR-10c)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        toggleMenu(true);
        navToggle.focus();
      }
    }
  });

  // Close menu on link click (mobile)
  navLinkItems.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        toggleMenu(true);
      }
    });
  });

  // Close if resized above mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      toggleMenu(true);
    }
  }, { passive: true });
}


// ===========================================================================
// ACTIVE LINK — Marks current page link (FR-08)
// ===========================================================================
function initActiveLink() {
  if (!navLinkItems || navLinkItems.length === 0) return;

  const currentHash = window.location.hash;

  navLinkItems.forEach((link) => {
    const href = link.getAttribute('href');

    // Skip emergency link — it has its own permanent styling
    if (link.classList.contains('nav__link--emergency')) return;

    const isActive =
      href === currentHash ||
      (href === '#home' && !currentHash);

    if (isActive) {
      link.classList.add(CLASS_LINK_ACTIVE);
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove(CLASS_LINK_ACTIVE);
      link.removeAttribute('aria-current');
    }
  });

  // Update on hash change
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash;
    navLinkItems.forEach((link) => {
      if (link.classList.contains('nav__link--emergency')) return;

      const href = link.getAttribute('href');
      if (href === newHash) {
        link.classList.add(CLASS_LINK_ACTIVE);
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove(CLASS_LINK_ACTIVE);
        link.removeAttribute('aria-current');
      }
    });
  });
}
