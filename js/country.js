/**
 * ARVENAIRE shared country-page runtime.
 * Handles navigation, reveal motion, scholarship status rendering and footer year.
 */
(function () {
  'use strict';

  function initNav() {
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      links.addEventListener('click', event => {
        if (event.target.closest('a')) {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function initReveal() {
    const nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    nodes.forEach(node => observer.observe(node));
  }

  function renderScholarshipStatus() {
    const host = document.querySelector('[data-scholarship-status]');
    const country = document.body.dataset.country;
    const records = window.ARVENAIRE && window.ARVENAIRE.scholarships;
    const item = records && records[country];
    if (!host || !item) return;

    host.innerHTML = `
      <div>
        <div class="status-top">
          <span class="status-pill" data-status="${item.status}">${item.statusLabel}</span>
          <span>${item.cycle}</span>
        </div>
        <h3>${item.programme}</h3>
        <p class="status-deadline">${item.deadlineLabel}</p>
        <p class="status-note">${item.note}</p>
        <div class="source-links">
          ${item.sources.map(source => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label} ↗</a>`).join('')}
        </div>
      </div>
      <div class="verified">Official-source review: ${item.verifiedOn}</div>`;
  }

  function setYear() {
    document.querySelectorAll('[data-current-year]').forEach(el => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function init() {
    initNav();
    initReveal();
    renderScholarshipStatus();
    setYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
