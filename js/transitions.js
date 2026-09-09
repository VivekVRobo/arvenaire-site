/**
 * ARVENAIRE Cinematic Page Transitions
 * Prevents sudden jumps when navigating between pages.
 */
(function() {
  // Create overlay on DOMContentLoaded or immediately if body is ready
  function initOverlay() {
    if (document.querySelector('.page-transition-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.prepend(overlay);
    
    // Smoothly fade out the overlay after page loads
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 50);

    // Intercept internal link clicks for smooth fade-out
    document.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Avoid interrupting command clicks (Ctrl/Cmd click to open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      
      // Check if it's an internal link
      const isInternal = (
        (href.endsWith('.html') || href === 'index.html' || href === 'blog.html' || href.indexOf('.html?') !== -1) &&
        !link.getAttribute('target') &&
        !href.startsWith('#') &&
        !href.startsWith('javascript:')
      );
      
      if (isInternal) {
        // Check if same page hash change
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetPath = href.split('?')[0].split('#')[0];
        
        if (currentPath === targetPath && href.includes('#')) {
          // It's an anchor link on the same page, let it scroll naturally
          return;
        }
        
        e.preventDefault();
        overlay.classList.remove('fade-out');
        overlay.classList.add('fade-in');
        
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      }
    });
  }

  if (document.body) {
    initOverlay();
  } else {
    document.addEventListener('DOMContentLoaded', initOverlay);
  }
})();
