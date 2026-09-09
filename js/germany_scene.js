/**
 * germany_scene.js
 * Cinematic Germany storytelling background.
 * Autumn leaves · Golden hour · Canvas 2D overlay
 */
(function () {
  'use strict';

  /* ─── PHOTO CROSSFADE ─── */
  var photos = document.querySelectorAll('.de-photo');
  var currentPhoto = 0;

  function setPhoto(index) {
    if (index === currentPhoto) return;
    photos.forEach(function (el, i) {
      el.classList.toggle('de-photo--active', i === index);
    });
    currentPhoto = index;
  }

  var sectionPhotoMap = {
    'de-sec-0':          0,
    'de-sec-1':          1,
    'de-sec-2':          2,
    'de-sec-3':          3,
    'de-sec-4':          4,
    'de-sec-5':          5,
    'de-sec-transition': 5,
  };

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

  /* ─── CANVAS AUTUMN LEAVES ─── */
  var canvas = document.getElementById('de-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* Autumn leaf colours — amber, gold, russet, burnt sienna */
  var LEAF_PALETTES = [
    { h: 30,  s: 85, l: 52 },  // amber
    { h: 42,  s: 90, l: 58 },  // gold
    { h: 18,  s: 78, l: 44 },  // burnt orange
    { h: 10,  s: 70, l: 38 },  // russet
    { h: 50,  s: 80, l: 62 },  // pale gold
    { h: 355, s: 65, l: 42 },  // deep red
  ];

  var LEAF_COUNT = 42;
  var leaves = [];

  function pickColour() {
    var p = LEAF_PALETTES[Math.floor(Math.random() * LEAF_PALETTES.length)];
    return 'hsl(' + p.h + ',' + p.s + '%,' + p.l + '%)';
  }

  function makeLeaf(fromTop) {
    var size = 5 + Math.random() * 11;
    return {
      x:     fromTop ? (Math.random() * W * 1.2 - W * 0.1) : (W + 80),
      y:     fromTop ? (-40 - Math.random() * H * 0.6)      : (Math.random() * H * 0.8),
      size:  size,
      spin:  (Math.random() - 0.5) * 0.055,
      angle: Math.random() * Math.PI * 2,
      vx:   -0.5 - Math.random() * 0.9,
      vy:    0.5 + Math.random() * 0.9,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.008 + Math.random() * 0.014,
      alpha: 0.32 + Math.random() * 0.48,
      colour: pickColour(),
      /* leaf shape: 3-point or 5-point variation */
      points: Math.random() < 0.5 ? 3 : 5,
    };
  }

  function resetLeaf(lf) {
    var size = 5 + Math.random() * 11;
    lf.x     = W + 80;
    lf.y     = Math.random() * H * 0.8;
    lf.size  = size;
    lf.spin  = (Math.random() - 0.5) * 0.055;
    lf.angle = Math.random() * Math.PI * 2;
    lf.vx    = -0.5 - Math.random() * 0.9;
    lf.vy    = 0.5 + Math.random() * 0.9;
    lf.swing = Math.random() * Math.PI * 2;
    lf.swingSpeed = 0.008 + Math.random() * 0.014;
    lf.alpha = 0.32 + Math.random() * 0.48;
    lf.colour = pickColour();
    lf.points = Math.random() < 0.5 ? 3 : 5;
  }

  for (var i = 0; i < LEAF_COUNT; i++) leaves.push(makeLeaf(true));

  /* Draw a simple maple-style leaf */
  function drawLeaf(lf) {
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.angle);
    ctx.globalAlpha = lf.alpha;
    ctx.fillStyle = lf.colour;

    var s = lf.size;
    if (lf.points === 3) {
      /* Simple 3-lobe leaf */
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo( s * 0.9, -s * 0.3,  s * 0.6,  s * 0.7,  0,  s * 0.9);
      ctx.bezierCurveTo(-s * 0.6,  s * 0.7, -s * 0.9, -s * 0.3,  0, -s);
      ctx.closePath();
    } else {
      /* 5-point maple leaf approximation */
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo( s * 0.35, -s * 0.35);
      ctx.lineTo( s,  0);
      ctx.lineTo( s * 0.4,  s * 0.5);
      ctx.lineTo( 0,  s * 0.85);
      ctx.lineTo(-s * 0.4,  s * 0.5);
      ctx.lineTo(-s,  0);
      ctx.lineTo(-s * 0.35, -s * 0.35);
      ctx.closePath();
    }
    ctx.fill();

    /* Stem */
    ctx.strokeStyle = lf.colour;
    ctx.globalAlpha = lf.alpha * 0.6;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.85);
    ctx.lineTo(0, s * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  /* ─── RENDER LOOP ─── */
  function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < leaves.length; i++) {
      var lf = leaves[i];
      lf.swing += lf.swingSpeed;
      lf.x += lf.vx + Math.sin(lf.swing) * 0.4;
      lf.y += lf.vy;
      lf.angle += lf.spin;
      if (lf.x < -80 || lf.y > H + 50) resetLeaf(lf);
      drawLeaf(lf);
    }

    /* Vignette */
    var vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(2,1,6,0.42)');
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  render();

})();
