/**
 * ScholarMap Commercial Offer Configuration & Tracking
 * Single Source of Truth for Pricing, URLs, and Analytics
 */

const SCHOLARMAP_OFFERS = {
  // Tier 1: DIY Execution Kit
  kit: {
    name: "Germany Automation & Robotics Transition Kit (2026)",
    price: "₹499",
    numericPrice: 499,
    originalPrice: "₹1,499",
    url: "https://topmate.io/vivek_robotics?utm_source=scholarmap&utm_medium=website&utm_campaign=germany_transition&utm_content=kit",
    badge: "2026 Action Kit",
    note: "Instant editable files: ATS CV, 30-Company Tracker, LinkedIn scripts, portfolio blueprints, and 14-day sprint."
  },

  // Tier 2: Personalized 1-on-1 Strategy Session + Kit Included
  session: {
    name: "Germany Engineering Strategy Session (60 Min)",
    price: "₹2,499",
    numericPrice: 2499,
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
      currency: 'INR'
    });
  }
}

// Global initialization helper for CTA buttons
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-offer-link]').forEach(btn => {
    const type = btn.getAttribute('data-offer-link');
    if (SCHOLARMAP_OFFERS[type]) {
      btn.href = SCHOLARMAP_OFFERS[type].url;
      btn.addEventListener('click', () => trackOfferClick(type, btn.getAttribute('data-offer-location') || 'page_body'));
    }
  });
});
