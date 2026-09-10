/**
 * ARVENAIRE commercial configuration.
 * Single source of truth for public offer names, prices, durations and checkout URLs.
 */
(function () {
  'use strict';

  const OFFERS = Object.freeze({
    kit: Object.freeze({
      name: 'Germany Automation & Robotics Transition Kit (2026)',
      version: '1.2 FINAL',
      price: '₹499',
      numericPrice: 499,
      currency: 'INR',
      url: 'https://topmate.io/vivekvrobo/2291780?utm_source=arvenaire&utm_medium=website&utm_campaign=germany_transition&utm_content=kit',
      badge: '2026 Action Kit',
      note: 'Editable ATS CV pack, 30-company tracker, outreach scripts, four portfolio blueprints, four GitHub README templates, official-source verification checklist, CV bullet bank, German search terms, and a 14-day sprint.'
    }),
    session: Object.freeze({
      name: 'Germany Engineering Strategy Session (120 Min)',
      price: '₹2,499',
      numericPrice: 2499,
      currency: 'INR',
      duration: '120 minutes',
      url: 'https://topmate.io/vivekvrobo/2291828?utm_source=arvenaire&utm_medium=website&utm_campaign=germany_transition&utm_content=strategy_session',
      badge: '1-on-1 Personalized Advisory',
      bonus: 'Includes the complete ₹499 Transition Kit',
      note: 'A 120-minute 1-on-1 working session for profile review, role direction, CV positioning, application strategy and practical next steps.'
    })
  });

  function track(type, locationName) {
    const offer = OFFERS[type];
    if (!offer) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'select_promotion', {
        promotion_name: offer.name,
        creative_slot: locationName || 'page_body',
        value: offer.numericPrice,
        currency: offer.currency
      });
    }
  }

  function bind(root) {
    (root || document).querySelectorAll('[data-offer-link]').forEach(link => {
      const type = link.dataset.offerLink;
      const offer = OFFERS[type];
      if (!offer) return;
      link.href = offer.url;
      if (link.dataset.offerBound === 'true') return;
      link.dataset.offerBound = 'true';
      link.addEventListener('click', () => track(type, link.dataset.offerLocation));
    });

    (root || document).querySelectorAll('[data-offer-price]').forEach(el => {
      const offer = OFFERS[el.dataset.offerPrice];
      if (offer) el.textContent = offer.price;
    });

    (root || document).querySelectorAll('[data-offer-duration]').forEach(el => {
      const offer = OFFERS[el.dataset.offerDuration];
      if (offer && offer.duration) el.textContent = offer.duration;
    });
  }

  window.ARVENAIRE = window.ARVENAIRE || {};
  window.ARVENAIRE.offers = OFFERS;
  window.ARVENAIRE.trackOffer = track;
  window.ARVENAIRE.bindOffers = bind;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => bind(document));
  else bind(document);
})();
