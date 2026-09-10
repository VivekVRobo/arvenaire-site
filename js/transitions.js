/**
 * ARVENAIRE page transitions
 * Shared, framework-free navigation polish with reduced-motion support.
 */
(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ensureStyles() {
    if (document.getElementById('arvenaire-transition-style')) return;
    const style = document.createElement('style');
    style.id = 'arvenaire-transition-style';
    style.textContent = `
      .page-transition-overlay{position:fixed;inset:0;z-index:10000;background:#090b11;pointer-events:none;opacity:1;transition:opacity .38s cubic-bezier(.25,1,.5,1)}
      .page-transition-overlay.fade-out{opacity:0}
      .page-transition-overlay.fade-in{opacity:1;pointer-events:auto}
      @media(prefers-reduced-motion:reduce){.page-transition-overlay{display:none!important;transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function sameDocumentHash(target) {
    return target.origin === window.location.origin &&
      target.pathname === window.location.pathname &&
      target.search === window.location.search &&
      target.hash;
  }

  function shouldTransition(link, event) {
    if (REDUCED_MOTION) return false;
    if (!link || event.defaultPrevented) return false;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.hasAttribute('download') || link.target === '_blank') return false;

    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return false;

    let target;
    try { target = new URL(link.href, window.location.href); }
    catch (_) { return false; }

    if (target.origin !== window.location.origin || sameDocumentHash(target)) return false;
    return true;
  }

  function init() {
    ensureStyles();
    if (REDUCED_MOTION) return;

    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.prepend(overlay);

    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('fade-out')));

    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!shouldTransition(link, event)) return;

      event.preventDefault();
      overlay.classList.remove('fade-out');
      overlay.classList.add('fade-in');

      window.setTimeout(() => {
        window.location.assign(link.href);
      }, 300);
    });

    window.addEventListener('pageshow', () => {
      overlay.classList.remove('fade-in');
      overlay.classList.add('fade-out');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
