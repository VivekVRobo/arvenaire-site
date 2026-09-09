/**
 * ScholarMap Commercial Offer Configuration & Tracking
 * Single Source of Truth for Pricing, URLs, and Analytics
 */

const SCHOLARMAP_OFFERS = {
  // Tier 1: DIY Execution Kit
  kit: {
    name: "Germany Automation & Robotics Transition Kit (2026)",
    version: "1.2 FINAL",
    price: "₹499",
    numericPrice: 499,
    currency: "INR",
    url: "https://topmate.io/vivek_robotics?utm_source=scholarmap&utm_medium=website&utm_campaign=germany_transition&utm_content=kit",
    badge: "2026 Action Kit",
    note: "Editable ATS CV pack, 30-company tracker, outreach scripts, four portfolio blueprints, four GitHub README templates, official-source verification, CV bullet bank, German search terms, and a 14-day sprint."
  },

  // Tier 2: Personalized 1-on-1 Strategy Session + Kit Included
  session: {
    name: "Germany Engineering Strategy Session (60 Min)",
    price: "₹2,499",
    numericPrice: 2499,
    currency: "INR",
    duration: "60 minutes",
    url: "https://topmate.io/vivek_robotics?utm_source=scholarmap&utm_medium=website&utm_campaign=germany_transition&utm_content=strategy_session",
    badge: "1-on-1 Personalized Advisory",
    bonus: "Includes complete ₹499 Transition Kit automatically",
    note: "60-minute 1-on-1 consultation covering profile review, university strategy, CV positioning, and Werkstudent roadmap."
  }
};

// Analytics Event Tracking Helper
function trackOfferClick(offerType, locationName) {
  const offer = SCHOLARMAP_OFFERS[offerType];
  if (!offer) return;

  console.log(`[ScholarMap Analytics] Clicked ${offerType} (${offer.price}) from ${locationName}`);
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'select_promotion', {
      promotion_name: offer.name,
      creative_slot: locationName,
      value: offer.numericPrice,
      currency: offer.currency || 'INR'
    });
  }
}

// Global initialization helper for CTA buttons and grounded product copy.
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-offer-link]').forEach(btn => {
    const type = btn.getAttribute('data-offer-link');
    if (SCHOLARMAP_OFFERS[type]) {
      btn.href = SCHOLARMAP_OFFERS[type].url;
      btn.addEventListener('click', () => trackOfferClick(type, btn.getAttribute('data-offer-location') || 'page_body'));
    }
  });

  // Do not show a crossed-out reference price unless ScholarMap has a real,
  // supportable prior selling price for the same product.
  document.querySelectorAll('.offer-original-price').forEach(el => el.remove());

  // Keep legacy HTML copy synchronized with the final v1.2 buyer bundle.
  document.querySelectorAll('.offer-features li').forEach(li => {
    const text = li.textContent.trim();
    if (text.startsWith('3 portfolio project blueprints')) {
      li.textContent = '4 portfolio project blueprints (TwinCAT, ROS2, embedded systems, machine vision)';
    }
  });

  // Replace speculative value/savings claims with concrete deliverable value.
  const valueBox = document.querySelector('.price-value-callout .pvc-text');
  if (valueBox) {
    const heading = valueBox.querySelector('h4');
    const paragraph = valueBox.querySelector('p');
    if (heading) heading.textContent = 'What ₹499 actually buys';
    if (paragraph) {
      paragraph.innerHTML = 'A reusable engineering-application execution pack: two editable CV files, 30 reviewed employer portals, outreach scripts, four portfolio blueprints, four technical README templates, an official-source checklist, a CV bullet bank, German job-search terms, and a 14-day sprint. <strong>No admission, job, salary, scholarship, or visa outcome is guaranteed.</strong>';
    }
  }
});
