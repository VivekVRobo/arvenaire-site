/**
 * korea_scene.js
 * Real-photo cinematic background with scroll-driven crossfades.
 * Snowflakes float on a Canvas 2D overlay above the photos.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     PHOTO BACKGROUND CROSSFADE
     Each section gets its own photo. As the user
     scrolls into a new section, the photo smoothly
     crossfades.
  ───────────────────────────────────────────── */
  var photos = document.querySelectorAll('.kr-photo');
  var currentPhoto = 0;

  function setPhoto(index) {
    if (index === currentPhoto) return;
    photos.forEach(function (el, i) {
      el.classList.toggle('kr-photo--active', i === index);
    });
    currentPhoto = index;
  }

  // Section → photo mapping
  var sectionPhotoMap = {
    'kr-sec-0':          0,
    'kr-sec-1':          1,
    'kr-sec-2':          2,
    'kr-sec-3':          3,
    'kr-sec-4':          4,
    'kr-sec-transition': 4,
  };

  // IntersectionObserver drives the crossfade
  var secObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var idx = sectionPhotoMap[e.target.id];
        if (idx !== undefined) setPhoto(idx);
      }
    });
  }, { threshold: 0.35 });

  Object.keys(sectionPhotoMap).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) secObs.observe(el);
  });

  /* ─────────────────────────────────────────────
     CANVAS SNOW OVERLAY
  ───────────────────────────────────────────── */
  var canvas = document.getElementById('kr-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ─────────────────────────────────────────────
     SNOWFLAKES
  ───────────────────────────────────────────── */
  var FLAKE_COUNT = 150;
  var flakes = [];

  function makeFlake(fromTop) {
    return {
      x:     Math.random() * W,
      y:     fromTop ? (-30 - Math.random() * H) : (Math.random() * H),
      size:  1 + Math.random() * 3.5,
      vx:   -0.5 + Math.random() * 1.0,
      vy:    0.3 + Math.random() * 0.8,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.005 + Math.random() * 0.01,
      alpha: 0.3 + Math.random() * 0.7
    };
  }

  for (var i = 0; i < FLAKE_COUNT; i++) flakes.push(makeFlake(false));

  function resetFlake(f) {
    f.x     = Math.random() * W;
    f.y     = -30 - Math.random() * 50;
    f.size  = 1 + Math.random() * 3.5;
    f.vx    = -0.5 + Math.random() * 1.0;
    f.vy    = 0.3 + Math.random() * 0.8;
    f.swing = Math.random() * Math.PI * 2;
    f.swingSpeed = 0.005 + Math.random() * 0.01;
    f.alpha = 0.3 + Math.random() * 0.7;
  }

  function drawFlake(f) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, ' + f.alpha + ')';
    ctx.fill();
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  }

  /* ─────────────────────────────────────────────
     RENDER LOOP  — canvas is ONLY snow + vignette
  ───────────────────────────────────────────── */
  function render() {
    requestAnimationFrame(render);

    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0; // Reset shadow for clearRect

    // Snowflakes
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.swing += f.swingSpeed;
      f.x += f.vx + Math.sin(f.swing) * 0.2;
      f.y += f.vy;
      
      // Wrap around
      if (f.y > H + 40) {
        resetFlake(f);
      } else if (f.x > W + 40) {
        f.x = -20;
      } else if (f.x < -40) {
        f.x = W + 20;
      }
      
      drawFlake(f);
    }
    
    // Reset shadow blur before drawing vignette
    ctx.shadowBlur = 0;

    // Subtle vignette
    var vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.9);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0,0,6,0.45)');
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  render();

})();
