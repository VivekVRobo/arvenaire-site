/* ═══════════════════════════════════════════
   SCHOLARMAP — MAIN JS
   Three.js scenes + GSAP + All Interactivity
═══════════════════════════════════════════ */
'use strict';

// ─── GLOBALS ───────────────────────────────
let heroRenderer, heroCamera, heroScene, heroAnimId;
let countryRenderer, countryCamera, countryScene, countryAnimId;
let currentCountry = null;
const mouse = {x:0, y:0};

// ─── INIT ───────────────────────────────────
window.addEventListener('load', () => {
  initPreloader();
  initCursor();
  initNavbar();
  initHeroScene();
  initCountryCards();
  initTabs();
  initBlog();
  initTestimonials();
  initStepButtons();
  initFooterCountryLinks();
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  initGSAP();
  animateStats();
});

// ─── PRELOADER ──────────────────────────────
function initPreloader() {
  setTimeout(() => {
    const el = document.getElementById('preloader');
    if (el) { el.classList.add('hidden'); }
  }, 2200);
}

// ─── CUSTOM CURSOR ──────────────────────────
function initCursor() {
  const outer = document.getElementById('cursor-outer');
  const inner = document.getElementById('cursor-inner');
  if (!outer || !inner) return;
  let ox=0, oy=0;
  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    inner.style.left = e.clientX + 'px';
    inner.style.top  = e.clientY + 'px';
  });
  function animCursor() {
    ox += (mouse.x - ox) * 0.12;
    oy += (mouse.y - oy) * 0.12;
    outer.style.left = ox + 'px';
    outer.style.top  = oy + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
  document.querySelectorAll('a,button,.country-card,.country-tab,.filter-btn,.radio-btn,.checkbox-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { outer.style.width='60px'; outer.style.height='60px'; outer.style.background='rgba(108,59,255,0.12)'; });
    el.addEventListener('mouseleave', () => { outer.style.width='40px'; outer.style.height='40px'; outer.style.background='transparent'; });
  });
}

// ─── NAVBAR ─────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  const ham = document.getElementById('navHamburger');
  const mob = document.getElementById('navMobile');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
  if (ham && mob) {
    ham.addEventListener('click', () => mob.classList.toggle('open'));
  }
}

// ─── HERO THREE.JS SCENE ────────────────────
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  heroRenderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

  heroCamera = new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
  heroCamera.position.set(0, 0, 5);

  heroScene = new THREE.Scene();

  // Ambient + directional light
  heroScene.add(new THREE.AmbientLight(0x6C3BFF, 0.4));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dLight.position.set(5, 5, 5);
  heroScene.add(dLight);

  // Floating particles
  const pGeo = new THREE.BufferGeometry();
  const pCount = 2000;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 20;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({color:0x6C3BFF, size:0.04, transparent:true, opacity:0.6});
  const particles = new THREE.Points(pGeo, pMat);
  heroScene.add(particles);

  // Wireframe sphere (globe)
  const globeGeo = new THREE.SphereGeometry(1.8, 24, 24);
  const globeMat = new THREE.MeshBasicMaterial({color:0x6C3BFF, wireframe:true, transparent:true, opacity:0.2});
  const globe = new THREE.Mesh(globeGeo, globeMat);
  heroScene.add(globe);

  // Inner solid sphere
  const innerGeo = new THREE.SphereGeometry(1.7, 32, 32);
  const innerMat = new THREE.MeshPhongMaterial({color:0x0a0e1a, transparent:true, opacity:0.9, shininess:100});
  heroScene.add(new THREE.Mesh(innerGeo, innerMat));

  // Country markers on globe
  const markerColors = [0xFF1744, 0xFFCC00, 0xCC0000, 0x003478, 0x006DAE];
  const markerPositions = [
    [0.5, 0.9, 1.4],   // Japan
    [-1.2, 1.0, 0.8],  // Germany
    [1.2, 0.6, 1.2],   // China
    [0.7, 0.7, 1.5],   // Korea
    [0.3, -1.2, 1.2]   // Australia
  ];
  markerPositions.forEach((pos, i) => {
    const mGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const mMat = new THREE.MeshPhongMaterial({color: markerColors[i], emissive: markerColors[i], emissiveIntensity:0.5});
    const marker = new THREE.Mesh(mGeo, mMat);
    const v = new THREE.Vector3(...pos).normalize().multiplyScalar(1.82);
    marker.position.copy(v);
    heroScene.add(marker);
    // Pulse ring
    const rGeo = new THREE.RingGeometry(0.07, 0.1, 16);
    const rMat = new THREE.MeshBasicMaterial({color:markerColors[i], side:THREE.DoubleSide, transparent:true, opacity:0.7});
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(v);
    ring.lookAt(0,0,0);
    heroScene.add(ring);
  });

  // Floating geometric shapes
  const shapes = [];
  const shapeGeos = [
    new THREE.TetrahedronGeometry(0.2),
    new THREE.OctahedronGeometry(0.18),
    new THREE.IcosahedronGeometry(0.15),
  ];
  for (let i = 0; i < 8; i++) {
    const geo = shapeGeos[i % shapeGeos.length];
    const mat = new THREE.MeshPhongMaterial({color:0x6C3BFF, wireframe:true, transparent:true, opacity:0.4});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*5, (Math.random()-0.5)*4 - 3);
    shapes.push(mesh);
    heroScene.add(mesh);
  }

  // Animate
  let t = 0;
  function animHero() {
    heroAnimId = requestAnimationFrame(animHero);
    t += 0.005;
    globe.rotation.y = t * 0.3;
    particles.rotation.y = t * 0.05;
    shapes.forEach((s, i) => {
      s.rotation.x = t * (0.5 + i * 0.1);
      s.rotation.y = t * (0.3 + i * 0.07);
    });
    heroCamera.position.x += (mouse.x / window.innerWidth * 0.5 - heroCamera.position.x) * 0.03;
    heroCamera.position.y += (-mouse.y / window.innerHeight * 0.3 - heroCamera.position.y) * 0.03;
    heroCamera.lookAt(0, 0, 0);
    heroRenderer.render(heroScene, heroCamera);
  }
  animHero();

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    heroRenderer.setSize(w, h);
    heroCamera.aspect = w / h;
    heroCamera.updateProjectionMatrix();
  });
}

// ─── COUNTRY SCENES ─────────────────────────
const CountryScenes = {
  japan(scene) {
    scene.fog = new THREE.Fog(0x0D0810, 5, 30);
    scene.add(new THREE.AmbientLight(0xFF1744, 0.3));
    const dl = new THREE.DirectionalLight(0xFFB7C5, 1);
    dl.position.set(3, 5, 3);
    scene.add(dl);
    // Mount Fuji
    const fuji = new THREE.Mesh(new THREE.ConeGeometry(4, 2.5, 32), new THREE.MeshPhongMaterial({color:0x2a2060, wireframe:false}));
    fuji.position.set(4, -2, -5);
    scene.add(fuji);
    // Snow cap
    const snow = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 16), new THREE.MeshPhongMaterial({color:0xffffff}));
    snow.position.set(4, -0.6, -5);
    scene.add(snow);
    // Torii Gate
    const redMat = new THREE.MeshPhongMaterial({color:0xFF1744, emissive:0xFF1744, emissiveIntensity:0.2});
    const pillar = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    [-0.5, 0.5].forEach(x => { const p = new THREE.Mesh(pillar, redMat); p.position.set(x, 0, 0); scene.add(p); });
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.12), redMat);
    beam1.position.set(0, 1.3, 0); scene.add(beam1);
    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), redMat);
    beam2.position.set(0, 1.0, 0); scene.add(beam2);
    // Sakura particles
    const spGeo = new THREE.BufferGeometry();
    const spPos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500 * 3; i++) spPos[i] = (Math.random() - 0.5) * 20;
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    scene.add(new THREE.Points(spGeo, new THREE.PointsMaterial({color:0xFFB7C5, size:0.06, transparent:true, opacity:0.8})));
  },

  germany(scene) {
    scene.fog = new THREE.Fog(0x0A0A0A, 8, 40);
    scene.add(new THREE.AmbientLight(0x222200, 0.5));
    const dl = new THREE.DirectionalLight(0xFFCC00, 1.2);
    dl.position.set(-3, 5, 3);
    scene.add(dl);
    // Brandenburg Gate pillars (6 pairs)
    const goldMat = new THREE.MeshPhongMaterial({color:0xFFCC00, shininess:80});
    const pillarGeo = new THREE.BoxGeometry(0.15, 2, 0.15);
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * 0.4;
      const p = new THREE.Mesh(pillarGeo, goldMat);
      p.position.set(x, 0, 0); scene.add(p);
    }
    // Top platform
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 0.4), goldMat);
    top.position.set(0, 1.1, 0); scene.add(top);
    // Quadriga top (simplified cube group)
    const qMat = new THREE.MeshPhongMaterial({color:0xFFD700});
    const qBody = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.5), qMat);
    qBody.position.set(0, 1.45, 0); scene.add(qBody);
    // Gold particles
    const gpGeo = new THREE.BufferGeometry();
    const gpPos = new Float32Array(800 * 3);
    for (let i = 0; i < 800 * 3; i++) gpPos[i] = (Math.random() - 0.5) * 16;
    gpGeo.setAttribute('position', new THREE.BufferAttribute(gpPos, 3));
    scene.add(new THREE.Points(gpGeo, new THREE.PointsMaterial({color:0xFFCC00, size:0.05, transparent:true, opacity:0.5})));
    // Grid floor
    scene.add(new THREE.GridHelper(20, 30, 0x222200, 0x111100));
  },

  china(scene) {
    scene.fog = new THREE.Fog(0x0A0505, 6, 35);
    scene.add(new THREE.AmbientLight(0x330000, 0.4));
    const dl = new THREE.DirectionalLight(0xFFD700, 1.0);
    dl.position.set(2, 6, 2);
    scene.add(dl);
    const redMat = new THREE.MeshPhongMaterial({color:0xCC0000, shininess:60});
    const goldMat = new THREE.MeshPhongMaterial({color:0xFFD700, shininess:100});
    // Pagoda — 5 stacked levels
    for (let i = 0; i < 5; i++) {
      const w = 2 - i * 0.3;
      const level = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, w), redMat);
      level.position.set(0, i * 0.55 - 1, 0); scene.add(level);
      // Curved roof (cone)
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.7, 0.35, 4), goldMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, i * 0.55 - 0.75, 0); scene.add(roof);
    }
    // Spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.8, 8), goldMat);
    spire.position.set(0, 2.0, 0); scene.add(spire);
    // Red lanterns (spheres)
    [-1.2, 1.2].forEach(x => {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshPhongMaterial({color:0xFF4444, emissive:0xFF0000, emissiveIntensity:0.4}));
      l.position.set(x, 0.5, 0.3); scene.add(l);
    });
    // Gold particles
    const gpGeo = new THREE.BufferGeometry();
    const gpPos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000 * 3; i++) gpPos[i] = (Math.random() - 0.5) * 18;
    gpGeo.setAttribute('position', new THREE.BufferAttribute(gpPos, 3));
    scene.add(new THREE.Points(gpGeo, new THREE.PointsMaterial({color:0xFFD700, size:0.05, transparent:true, opacity:0.5})));
  },

  southKorea(scene) {
    scene.fog = new THREE.Fog(0x050A14, 8, 40);
    scene.add(new THREE.AmbientLight(0x000033, 0.4));
    const dl = new THREE.DirectionalLight(0xCCDDFF, 1.0);
    dl.position.set(-2, 6, 3);
    scene.add(dl);
    const blueMat = new THREE.MeshPhongMaterial({color:0x003478, shininess:80});
    const whiteMat = new THREE.MeshPhongMaterial({color:0xCCCCCC, shininess:100});
    // N Seoul Tower — tall pole
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 5, 12), whiteMat);
    tower.position.set(0, 0.5, 0); scene.add(tower);
    // Platform bands
    [0.5, 1.2, 2.0].forEach(y => {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 8, 24), blueMat);
      t.position.set(0, y + 0.5, 0); t.rotation.x = Math.PI / 2; scene.add(t);
    });
    // Observation deck
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.5, 12), new THREE.MeshPhongMaterial({color:0x003478,shininess:60}));
    deck.position.set(0, 3.5, 0); scene.add(deck);
    // Hanok-inspired curved roofs
    [-2, 2].forEach(x => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1), new THREE.MeshPhongMaterial({color:0x8B4513}));
      base.position.set(x, -1.8, -2); scene.add(base);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 4), new THREE.MeshPhongMaterial({color:0x1a3a6e}));
      roof.rotation.y = Math.PI / 4;
      roof.position.set(x, -1.25, -2); scene.add(roof);
    });
    // City grid
    scene.add(new THREE.GridHelper(20, 20, 0x001133, 0x000822));
    // Blue particles
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(600 * 3);
    for (let i = 0; i < 600 * 3; i++) bgPos[i] = (Math.random()-0.5)*18;
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos,3));
    scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({color:0x4488FF,size:0.05,transparent:true,opacity:0.4})));
  },

  australia(scene) {
    scene.fog = new THREE.Fog(0x020D1A, 8, 40);
    scene.add(new THREE.AmbientLight(0x001122, 0.4));
    const dl = new THREE.DirectionalLight(0xFFB500, 1.2);
    dl.position.set(4, 5, 2);
    scene.add(dl);
    const whiteMat = new THREE.MeshPhongMaterial({color:0xF5F5F0, shininess:120, side:THREE.DoubleSide});
    const blueMat = new THREE.MeshPhongMaterial({color:0x006DAE, shininess:60});
    // Opera House shells — LatheGeometry curves
    const makeShell = (xOff, scale, rot) => {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 0.6;
        pts.push(new THREE.Vector2(Math.sin(a) * scale, i * 0.12));
      }
      const geo = new THREE.LatheGeometry(pts, 12, 0, Math.PI);
      const mesh = new THREE.Mesh(geo, whiteMat);
      mesh.position.set(xOff, -1, 0);
      mesh.rotation.y = rot;
      scene.add(mesh);
    };
    makeShell(-1, 0.8, 0.2);
    makeShell(0, 1.0, 0);
    makeShell(1, 0.75, -0.2);
    makeShell(0.5, 0.55, 0.1);
    // Harbour bridge arch
    const archCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.5, -1, -2),
      new THREE.Vector3(0, 2.5, -2),
      new THREE.Vector3(3.5, -1, -2)
    );
    const archPts = archCurve.getPoints(30);
    const archGeo = new THREE.BufferGeometry().setFromPoints(archPts);
    scene.add(new THREE.Line(archGeo, new THREE.LineBasicMaterial({color:0xCCCCCC, linewidth:2})));
    // Water — blue plane
    const water = new THREE.Mesh(new THREE.PlaneGeometry(20,10), new THREE.MeshPhongMaterial({color:0x004488,transparent:true,opacity:0.5}));
    water.rotation.x = -Math.PI/2; water.position.y = -2.5; scene.add(water);
    // Golden sun particles
    const sgGeo = new THREE.BufferGeometry();
    const sgPos = new Float32Array(800 * 3);
    for (let i = 0; i < 800 * 3; i++) sgPos[i] = (Math.random()-0.5)*20;
    sgGeo.setAttribute('position', new THREE.BufferAttribute(sgPos, 3));
    scene.add(new THREE.Points(sgGeo, new THREE.PointsMaterial({color:0xFFB500,size:0.06,transparent:true,opacity:0.4})));
  }
};

// ─── COUNTRY CANVAS SETUP ───────────────────
function initCountryCanvas(countryKey) {
  const canvas = document.getElementById('country-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  if (countryAnimId) cancelAnimationFrame(countryAnimId);
  if (countryRenderer) {
    countryRenderer.dispose();
    countryRenderer.forceContextLoss();
  }

  countryRenderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  countryRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  countryRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

  countryCamera = new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, 0.1, 200);
  countryCamera.position.set(0, 1.5, 6);
  countryCamera.lookAt(0, 0, 0);

  countryScene = new THREE.Scene();

  // Build country-specific scene
  if (CountryScenes[countryKey]) CountryScenes[countryKey](countryScene);

  let t = 0;
  function animCountry() {
    countryAnimId = requestAnimationFrame(animCountry);
    t += 0.008;
    // Slowly rotate scene
    if (countryScene.children.length) {
      countryScene.children.forEach(child => {
        if (child.isPoints) child.rotation.y = t * 0.04;
      });
    }
    countryCamera.position.x = Math.sin(t * 0.15) * 0.5;
    countryCamera.lookAt(0, 0.5, 0);
    countryRenderer.render(countryScene, countryCamera);
  }
  animCountry();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    countryRenderer.setSize(w, h);
    countryCamera.aspect = w / h;
    countryCamera.updateProjectionMatrix();
  });
}

// ─── COUNTRY SELECTION ───────────────────────
function initCountryCards() {
  document.querySelectorAll('.country-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.country;
      selectCountry(key);
    });
  });
}

function selectCountry(key) {
  const data = SCHOLARMAP_DATA[key];
  if (!data) return;
  currentCountry = key;

  // Update CSS theme
  const htmlEl = document.documentElement;
  htmlEl.className = htmlEl.className.replace(/country-\w+/g, '');
  htmlEl.classList.add('country-' + key);

  // Mark active card
  document.querySelectorAll('.country-card').forEach(c => c.classList.toggle('active', c.dataset.country === key));

  // Populate detail section
  document.getElementById('detail-flag').textContent = data.flag;
  document.getElementById('detail-name').textContent = data.name;
  document.getElementById('detail-native').textContent = data.native;
  document.getElementById('detail-tagline').textContent = data.tagline;

  // Render tab content
  renderScholarships(data);
  renderUniversities(data);
  renderCost(data);
  renderLanguage(data);
  renderProsCons(data);

  // Show detail section
  const detail = document.getElementById('country-detail');
  detail.classList.add('visible');
  detail.style.background = data.colors.bg;

  // Init 3D scene for country
  initCountryCanvas(data.scene || key);

  // Activate first tab
  activateTab('scholarships');

  // Smooth scroll
  gsap.to(window, {duration:1.2, scrollTo:{y:'#country-detail', offsetY:0}, ease:'power3.inOut'});
}

// ─── TAB RENDERER HELPERS ───────────────────
function renderScholarships(data) {
  const grid = document.getElementById('scholarships-grid');
  grid.innerHTML = data.scholarships.map((s, i) => {
    const dots = ['Low','Medium','High','Very High'].indexOf(s.difficulty) + 1 || 2;
    const dotsHtml = [1,2,3,4].map(d => `<span class="dot ${d<=dots?'filled':''}"></span>`).join('');
    const coversHtml = s.covers.map(c => `<span class="sc-cover-item">${c}</span>`).join('');
    return `
    <div class="scholarship-card">
      <div class="sc-header">
        <div><div class="sc-name">${s.name}</div><div class="sc-org">${s.org}</div></div>
        <span class="sc-badge">${s.badge}</span>
      </div>
      <div class="sc-amount">💰 ${s.amount}</div>
      <div class="sc-grid">
        <div class="sc-item"><label>Deadline</label><span>📅 ${s.deadline}</span></div>
        <div class="sc-item"><label>Level</label><span>${s.level}</span></div>
        <div class="sc-item"><label>Min GPA</label><span>📊 ${s.gpa}</span></div>
        <div class="sc-item"><label>English</label><span>${s.english}</span></div>
      </div>
      <div class="sc-covers">${coversHtml}</div>
      <div class="sc-difficulty-bar"><label>Competition</label><span style="font-size:0.8rem;color:var(--c-muted)">${s.difficulty}</span><div class="difficulty-dots">${dotsHtml}</div></div>
      <a href="${s.url}" target="_blank" rel="noopener" class="sc-link">Official Website →</a>
    </div>`;
  }).join('');
}

function renderUniversities(data) {
  document.getElementById('universities-grid').innerHTML = data.universities.map(u => `
    <div class="uni-card">
      <div class="uni-rank">🏆 ${u.rank}</div>
      <div class="uni-name">${u.name}</div>
      <div class="uni-city">📍 ${u.city}</div>
      <div class="uni-fields">${u.fields}</div>
    </div>`).join('');
}

function renderCost(data) {
  const c = data.cost;
  const icons = ['🏠','🍱','🚇'];
  const labels = ['Accommodation','Food','Transport'];
  const vals = [c.accommodation, c.food, c.transport];
  document.getElementById('cost-grid').innerHTML = vals.map((v, i) => `
    <div class="cost-item">
      <div class="icon">${icons[i]}</div>
      <label>${labels[i]}</label>
      <div class="val">${v}</div>
    </div>`).join('') + `
    <div class="cost-item" style="border:2px solid var(--c-primary)">
      <div class="icon">💳</div>
      <label>Total Monthly</label>
      <div class="val" style="font-size:1.2rem">${c.total}</div>
    </div>`;
  document.getElementById('cost-note').innerHTML = `💡 <strong>Pro Tip:</strong> ${c.note}`;
}

function renderLanguage(data) {
  const l = data.language;
  const v = data.visa;
  document.getElementById('language-grid').innerHTML = `
    <div class="info-item">
      <h4>🗣️ Language Requirement</h4>
      <p>${l.requirement}</p>
    </div>
    <div class="info-item">
      <h4>🇬🇧 English Proficiency</h4>
      <p>${l.english}</p>
    </div>
    <div class="info-item" style="border-left:3px solid var(--c-primary)">
      <h4>💡 Expert Tip</h4>
      <p>${l.tip}</p>
    </div>
    <div class="info-item">
      <h4>✈️ Visa Type</h4>
      <p><strong>${v.type}</strong><br>Processing: ${v.processing}<br>Cost: ${v.cost}</p>
    </div>`;
}

function renderProsCons(data) {
  document.getElementById('proscons-grid').innerHTML = `
    <div class="pros-list">
      <h4>✅ Why ${data.name}?</h4>
      <ul>${data.pros.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>
    <div class="cons-list">
      <h4>⚠️ Things to Consider</h4>
      <ul>${data.cons.map(c => `<li>${c}</li>`).join('')}</ul>
    </div>`;
}

// ─── TABS ───────────────────────────────────
function initTabs() {
  document.getElementById('country-tabs')?.addEventListener('click', e => {
    const btn = e.target.closest('.country-tab');
    if (btn) activateTab(btn.dataset.tab);
  });
}
function activateTab(tabKey) {
  document.querySelectorAll('.country-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabKey));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabKey));
}

// ─── BLOG ───────────────────────────────────
function initBlog() {
  renderBlogPosts('all');
  document.getElementById('blogFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderBlogPosts(btn.dataset.filter);
  });
}
function renderBlogPosts(filter) {
  const posts = filter === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.country === filter);
  document.getElementById('blog-grid').innerHTML = posts.map(p => `
    <div class="blog-card" data-country="${p.country||''}">
      <div class="blog-card-emoji">${p.emoji}</div>
      <div class="blog-card-content">
        <span class="blog-tag">${p.tag}</span>
        <h3 class="blog-title">${p.title}</h3>
        <p class="blog-excerpt">${p.excerpt}</p>
        <div class="blog-meta">
          <span>${p.date} · ${p.readTime} read</span>
          <span class="blog-read-more">Read More →</span>
        </div>
      </div>
    </div>`).join('');
}

// ─── TESTIMONIALS ────────────────────────────
const TESTIMONIALS = [
  {text:"ScholarMap helped me prepare my MEXT Research Plan step-by-step. Their supervisor email templates secured me a professor acceptance from Kyoto University on the first attempt!",name:"Priya Sharma",info:"MEXT Scholar, Kyoto University",init:"PS",country:"Japan",gpa:"8.4",field:"Robotics",ielts:"7.5"},
  {text:"I thought Germany required high tuition or German language fluency. ScholarMap showed me the English-taught paths and helped me frame my Motivation Letter for DAAD.",name:"Rahul Verma",info:"DAAD Scholar, TU Munich",init:"RV",country:"Germany",gpa:"8.1",field:"Mechanical",ielts:"7.0"},
  {text:"China's CSC is highly underrated. ScholarMap's profile analyzer accurately suggested Tsinghua University. The scholarship covers tuition, lodging, and a stipend!",name:"Anjali Patel",info:"CSC Scholar, Tsinghua Univ",init:"AP",country:"China",gpa:"7.8",field:"Comp. Sci",ielts:"6.5"},
  {text:"The Global Korea Scholarship (GKS) package is incredible. ScholarMap guided me through the apostille process, Embassy Track selection, and mock interviews.",name:"Vikram Singh",info:"GKS Scholar, Seoul Nat. Uni",init:"VS",country:"S. Korea",gpa:"8.6",field:"AI & Data",ielts:"7.5"},
  {text:"I used the SOP review service for the Australia Awards. The specific research critique was elite — I secured a full Research Training Program (RTP) scholarship.",name:"Meera Nair",info:"RTP Scholar, ANU Canberra",init:"MN",country:"Australia",gpa:"8.9",field:"Biotech",ielts:"8.0"},
  {text:"I was about to waste months on general consulting. ScholarMap redirected me to the MEXT University Route. Securing professor support early made all the difference.",name:"Arjun Reddy",info:"MEXT Scholar, Osaka University",init:"AR",country:"Japan",gpa:"7.9",field:"Physics",ielts:"7.0"},
  {text:"Best advice for Germany. They helped me get my APS Certificate early and structured my CV according to German standards. Now at LMU Munich with DAAD funding.",name:"Sneha Gupta",info:"DAAD Scholar, LMU Munich",init:"SG",country:"Germany",gpa:"8.2",field:"Electrical",ielts:"7.5"},
  {text:"The profile evaluation tool was spot on. I knew exactly where I stood for Melbourne and Sydney, and the timeline tracker kept my applications on track.",name:"Karan Mehta",info:"RTP Scholar, Uni Melbourne",init:"KM",country:"Australia",gpa:"8.3",field:"Civil Eng",ielts:"7.5"}
];
function initTestimonials() {
  // Duplicate for seamless loop
  const both = [...TESTIMONIALS, ...TESTIMONIALS];
  document.getElementById('testimonials-track').innerHTML = both.map(t => `
    <div class="testimonial-card" style="width:410px; display:flex; flex-direction:column; justify-content:space-between; margin-right:24px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span class="testimonial-stars">★★★★★</span>
          <span style="font-size:0.65rem; font-weight:700; color:var(--c-accent); border:1px solid var(--c-accent); padding:3px 10px; border-radius:99px; background:rgba(255,209,102,0.06); text-transform:uppercase;">${t.country} Profile</span>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;">
          <span style="font-size:0.68rem; background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-weight:500;">📊 CGPA: ${t.gpa}</span>
          <span style="font-size:0.68rem; background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-weight:500;">🎓 Field: ${t.field}</span>
          <span style="font-size:0.68rem; background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-weight:500;">🇬🇧 IELTS: ${t.ielts}</span>
        </div>
        <p class="testimonial-text" style="font-size:0.88rem; line-height:1.6; margin-bottom:16px;">"${t.text}"</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:14px; margin-top:10px;">
        <div class="testimonial-author">
          <div class="testimonial-avatar" style="font-size:0.85rem;">${t.init}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-info" style="font-size:0.72rem; color:var(--c-primary); font-weight:600;">${t.info}</div>
          </div>
        </div>
      </div>
    </div>`).join('');
}

// ─── PROFILE EVALUATOR ──────────────────────
let currentStep = 1;
const totalSteps = 4;

function initStepButtons() {
  // Radio buttons
  document.querySelectorAll('.radio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.radio-group');
      group.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  // Checkbox buttons
  document.querySelectorAll('.checkbox-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('selected'));
  });
}

function nextStep(from) {
  if (from < totalSteps) {
    document.getElementById('step-' + from).classList.remove('active');
    document.getElementById('step-' + (from + 1)).classList.add('active');
    currentStep = from + 1;
    updateStepDots();
  }
}
function prevStep(from) {
  if (from > 1) {
    document.getElementById('step-' + from).classList.remove('active');
    document.getElementById('step-' + (from - 1)).classList.add('active');
    currentStep = from - 1;
    updateStepDots();
  }
}
function updateStepDots() {
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === currentStep);
    dot.classList.toggle('done', i + 1 < currentStep);
  });
}

function runEvaluation() {
  const profile = {
    level: document.getElementById('ev-level').value,
    gpa: document.getElementById('ev-gpa').value,
    field: document.getElementById('ev-field').value,
    ielts: document.getElementById('ev-ielts').value,
    toefl: document.getElementById('ev-toefl').value,
    budget: document.querySelector('#budgetGroup .radio-btn.selected')?.dataset.val || 'medium',
    research: document.querySelector('#researchGroup .radio-btn.selected')?.dataset.val === 'yes',
    work: document.querySelector('#workGroup .radio-btn.selected')?.dataset.val || 'none',
    name: document.getElementById('ev-name').value || 'Student'
  };

  const results = evaluateProfile(profile);
  renderResults(profile, results);

  document.getElementById('results-panel').classList.add('visible');
  gsap.to(window, {duration:1, scrollTo:'#results-panel', ease:'power2.inOut'});
}

function renderResults(profile, results) {
  const name = profile.name;
  document.getElementById('results-heading').innerHTML = `${name}'s Scholarship <span class="highlight">Match</span>`;
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  document.getElementById('results-list').innerHTML = results.map((r, i) => {
    const reasonsHtml = r.reasons.map(re => `<span class="reason-tag">✓ ${re}</span>`).join('');
    const warnsHtml = r.warnings.map(w => `<span class="warning-tag">⚠ ${w}</span>`).join('');
    return `
    <div class="result-card">
      <div class="result-rank">${medals[i]}</div>
      <div style="flex:1">
        <div class="result-flag">${r.data.flag}</div>
        <div class="result-name">${r.data.name} <span style="font-size:1rem;color:var(--c-muted);font-weight:400">${r.data.tagline}</span></div>
        <div style="display:flex;align-items:center;gap:12px;margin:10px 0">
          <div class="result-score-bar">
            <div class="result-score-fill" style="width:0%" data-target="${r.score}%"></div>
          </div>
          <span style="font-family:var(--font-display);font-weight:800;font-size:1.1rem;color:var(--c-primary)">${r.score}%</span>
        </div>
        <div class="result-reasons">${reasonsHtml}${warnsHtml}</div>
      </div>
      <button class="result-cta" onclick="selectCountry('${r.country}')">Explore ${r.data.name} →</button>
    </div>`;
  }).join('');

  // Animate score bars
  setTimeout(() => {
    document.querySelectorAll('.result-score-fill').forEach(bar => {
      bar.style.width = bar.dataset.target;
    });
  }, 200);
}

function resetEvaluator() {
  currentStep = 1;
  document.querySelectorAll('.step-panel').forEach((p, i) => p.classList.toggle('active', i===0));
  updateStepDots();
  document.getElementById('results-panel').classList.remove('visible');
  document.querySelectorAll('.radio-btn,.checkbox-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.form-control').forEach(el => { el.value = ''; });
  gsap.to(window, {duration:1, scrollTo:'#profile', ease:'power2.inOut'});
}

// ─── FOOTER COUNTRY LINKS ────────────────────
function initFooterCountryLinks() {
  document.querySelectorAll('[data-country]').forEach(link => {
    if (link.tagName === 'A') {
      link.addEventListener('click', e => {
        e.preventDefault();
        const key = link.dataset.country;
        if (SCHOLARMAP_DATA[key]) selectCountry(key);
      });
    }
  });
}

// ─── GSAP SCROLL ANIMATIONS ─────────────────
function initGSAP() {
  gsap.utils.toArray('.gsap-reveal').forEach(el => {
    gsap.fromTo(el, {opacity:0, y:50}, {
      opacity:1, y:0, duration:0.8, ease:'power3.out',
      scrollTrigger:{trigger:el, start:'top 85%', toggleActions:'play none none none'}
    });
  });
}

// ─── ANIMATED STAT COUNTERS ─────────────────
function animateStats() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 1800;
        const start = performance.now();
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, {threshold:0.5});
  document.querySelectorAll('.stat-num').forEach(el => observer.observe(el));
}
