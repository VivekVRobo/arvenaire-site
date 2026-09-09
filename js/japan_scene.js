/**
 * japan_scene.js
 * Real-photo cinematic background with scroll-driven crossfades.
 * Cherry blossoms float on a Canvas 2D overlay above the photos.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     PHOTO BACKGROUND CROSSFADE
     Each section gets its own photo. As the user
     scrolls into a new section, the photo smoothly
     crossfades.
  ───────────────────────────────────────────── */
  var photos = document.querySelectorAll('.jp-photo');
  var currentPhoto = 0;

  function setPhoto(index) {
    if (index === currentPhoto) return;
    photos.forEach(function (el, i) {
      el.classList.toggle('jp-photo--active', i === index);
    });
    currentPhoto = index;
  }

  // Section → photo mapping
  var sectionPhotoMap = {
    'jp-sec-0':          0,
    'jp-sec-1':          1,
    'jp-sec-2':          2,
    'jp-sec-3':          3,
    'jp-sec-transition': 3,
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
     CANVAS BLOSSOM OVERLAY
  ───────────────────────────────────────────── */
  var canvas = document.getElementById('jp-canvas');
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
     CHERRY BLOSSOM PETALS
  ───────────────────────────────────────────── */
  var PETAL_COUNT = 48;
  var petals = [];

  function makePetal(fromTop) {
    return {
      x:     fromTop ? (Math.random() * W * 1.2 - W * 0.1) : (W + 60),
      y:     fromTop ? (-30 - Math.random() * H * 0.5)     : (Math.random() * H * 0.75),
      size:  3 + Math.random() * 8,
      spin:  (Math.random() - 0.5) * 0.05,
      angle: Math.random() * Math.PI * 2,
      vx:   -0.4 - Math.random() * 0.7,
      vy:    0.45 + Math.random() * 0.8,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.010 + Math.random() * 0.016,
      alpha: 0.28 + Math.random() * 0.52,
      hue:  338 + Math.random() * 25,
      sat:  45 + Math.random() * 35,
      lit:  78 + Math.random() * 18,
    };
  }

  for (var i = 0; i < PETAL_COUNT; i++) petals.push(makePetal(true));

  function resetPetal(p) {
    p.x     = W + 60;
    p.y     = Math.random() * H * 0.8;
    p.size  = 3 + Math.random() * 8;
    p.spin  = (Math.random() - 0.5) * 0.05;
    p.angle = Math.random() * Math.PI * 2;
    p.vx    = -0.4 - Math.random() * 0.7;
    p.vy    = 0.45 + Math.random() * 0.8;
    p.swing = Math.random() * Math.PI * 2;
    p.swingSpeed = 0.010 + Math.random() * 0.016;
    p.alpha = 0.28 + Math.random() * 0.52;
    p.hue   = 338 + Math.random() * 25;
    p.sat   = 45 + Math.random() * 35;
    p.lit   = 78 + Math.random() * 18;
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = 'hsl(' + p.hue + ',' + p.sat + '%,' + p.lit + '%)';
    var s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo( s * 0.85, -s * 0.5,  s * 0.65,  s * 0.65,  0,  s);
    ctx.bezierCurveTo(-s * 0.65,  s * 0.65, -s * 0.85, -s * 0.5,  0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ─────────────────────────────────────────────
     RENDER LOOP  — canvas is ONLY petals + vignette
     The photos handle the background.
  ───────────────────────────────────────────── */
  function render() {
    requestAnimationFrame(render);

    ctx.clearRect(0, 0, W, H);

    // Petals
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.swing += p.swingSpeed;
      p.x += p.vx + Math.sin(p.swing) * 0.35;
      p.y += p.vy;
      p.angle += p.spin;
      if (p.x < -60 || p.y > H + 40) resetPetal(p);
      drawPetal(p);
    }

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
