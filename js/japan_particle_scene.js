/* ============================================================
   ARVENAIRE — Japan Particle Scene
   Inspired by sebastien-lempens.com aesthetic:
   - 12,000-particle galaxy rotating around a glowing crimson orb
   - Cherry blossom drift particles (pink)
   - Torii gate wireframe  
   - Scroll-driven camera + particle morphing via GSAP
   - Mouse parallax
   - UnrealBloom post-processing
   ============================================================ */
'use strict';

(function () {

/* ─── CONFIG ─────────────────────────────────────────────── */
const C = {
    particleCount  : 12000,
    blossomCount   : 300,
    bloomStrength  : 1.4,
    bloomRadius    : 0.5,
    bloomThreshold : 0.08,
    bgColor        : 0x03050D,
};

/* ─── GLOBALS ────────────────────────────────────────────── */
let renderer, scene, camera, composer;
let clock;
let particleMesh, blossomMesh, toriiGroup, sunMesh, sunGlow;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let scrollRatio = 0;
let raf;

/* ─── PARTICLE DATA ──────────────────────────────────────── */
let posArr,    // current rendered positions
    posA,      // shape A: galaxy spiral
    posB,      // shape B: compressed sphere
    posC;      // shape C: scatter / explosion

/* ─── INIT ───────────────────────────────────────────────── */
function init() {
    const canvas = document.getElementById('jp-canvas');
    if (!canvas) return;

    /* Renderer */
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    /* Scene */
    scene = new THREE.Scene();
    scene.background = new THREE.Color(C.bgColor);
    scene.fog = new THREE.FogExp2(C.bgColor, 0.018);

    /* Camera */
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 1.5, 11);

    clock = new THREE.Clock();

    buildParticles();
    buildBlossoms();
    buildSun();
    buildTorii();
    buildLights();
    buildPostProcessing();
    setupScroll();
    setupMouse();

    window.addEventListener('resize', onResize);
    animate();

    /* Signal loader */
    window.jpSceneReady = true;
}

/* ─── GALAXY PARTICLES ───────────────────────────────────── */
function buildParticles() {
    const n = C.particleCount;
    posA = new Float32Array(n * 3);  // galaxy
    posB = new Float32Array(n * 3);  // sphere
    posC = new Float32Array(n * 3);  // scatter
    posArr = new Float32Array(n * 3);

    const colors = new Float32Array(n * 3);

    /* Shape A — 2-arm spiral galaxy */
    for (let i = 0; i < n; i++) {
        const r     = 0.4 + Math.pow(Math.random(), 0.5) * 7;
        const arm   = Math.floor(Math.random() * 2);
        const angle = (arm * Math.PI) + (r * 1.6) + (Math.random() - 0.5) * 0.8;
        const scatter   = Math.random() * 0.5;
        posA[i*3]   = Math.cos(angle) * r + (Math.random()-0.5)*scatter;
        posA[i*3+1] = (Math.random()-0.5) * 0.8;
        posA[i*3+2] = Math.sin(angle) * r + (Math.random()-0.5)*scatter;

        /* Color gradient: core = warm white, outer = blue-ish */
        const t = r / 7;
        colors[i*3]   = 0.7 + (1-t)*0.3;
        colors[i*3+1] = 0.7 + (1-t)*0.1;
        colors[i*3+2] = 0.8 + t*0.2;
    }

    /* Shape B — sphere */
    const sphereGeo = new THREE.SphereGeometry(3.5, 64, 64);
    const sverts = sphereGeo.attributes.position.array;
    for (let i = 0; i < n; i++) {
        const si = (i % (sverts.length / 3)) * 3;
        posB[i*3]   = sverts[si]   + (Math.random()-0.5)*0.3;
        posB[i*3+1] = sverts[si+1] + (Math.random()-0.5)*0.3;
        posB[i*3+2] = sverts[si+2] + (Math.random()-0.5)*0.3;
    }

    /* Shape C — explosion scatter */
    for (let i = 0; i < n; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2*Math.random()-1);
        const r     = 4 + Math.random() * 10;
        posC[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        posC[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
        posC[i*3+2] = r * Math.cos(phi);
    }

    /* Start at galaxy */
    posArr.set(posA);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.028,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    particleMesh = new THREE.Points(geo, mat);
    scene.add(particleMesh);
}

/* ─── CHERRY BLOSSOMS ────────────────────────────────────── */
function buildBlossoms() {
    const n = C.blossomCount;
    const positions = new Float32Array(n * 3);
    const velocities = new Float32Array(n); // drift speed

    for (let i = 0; i < n; i++) {
        positions[i*3]   = (Math.random()-0.5) * 16;
        positions[i*3+1] = Math.random() * 12 - 2;
        positions[i*3+2] = (Math.random()-0.5) * 10;
        velocities[i]    = 0.004 + Math.random() * 0.008;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.07,
        color: 0xFFB7C5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    blossomMesh = new THREE.Points(geo, mat);
    blossomMesh._velocities = velocities;
    scene.add(blossomMesh);
}

/* ─── CENTRAL SUN (Japan rising sun motif) ───────────────── */
function buildSun() {
    /* Core sphere */
    const geo = new THREE.SphereGeometry(0.7, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF2D2D });
    sunMesh = new THREE.Mesh(geo, mat);
    sunMesh.position.set(0, 0, 0);
    scene.add(sunMesh);

    /* Outer glow ring (additive disc) */
    const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFF4444,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    sunGlow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(sunGlow);

    /* Equatorial ring */
    const ringGeo = new THREE.TorusGeometry(1.1, 0.008, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF6B6B, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    /* Second tilted ring */
    const ring2 = ring.clone();
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);
}

/* ─── TORII GATE WIREFRAME ───────────────────────────────── */
function buildTorii() {
    toriiGroup = new THREE.Group();
    toriiGroup.position.set(0, -1.2, -6);
    toriiGroup.scale.setScalar(1.6);

    const mat = new THREE.LineBasicMaterial({
        color: 0xFF2D2D,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    function line(...pts) {
        const g = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
        toriiGroup.add(new THREE.Line(g, mat));
    }

    /* Left pillar */ line([-1.5,-2.5,0],[-1.5,2,0]);
    /* Right pillar */ line([1.5,-2.5,0],[1.5,2,0]);
    /* Shimagi (column caps) */ line([-1.7,2,0],[1.7,2,0]);
    /* Kasagi — curved top beam (approximated) */
    const kasagiPts = [];
    for (let i = 0; i <= 24; i++) {
        const t = i/24;
        const x = -2.1 + t*4.2;
        const y = 2.7 + Math.sin(t*Math.PI)*0.35;
        kasagiPts.push(new THREE.Vector3(x,y,0));
    }
    const kg = new THREE.BufferGeometry().setFromPoints(kasagiPts);
    toriiGroup.add(new THREE.Line(kg, mat));

    /* Nuki (middle beam) */ line([-1.5,1.2,0],[1.5,1.2,0]);
    /* Outer kasagi ends */ line([-2.1,2.5,0],[-2.1,2.7,0]); line([2.1,2.5,0],[2.1,2.7,0]);

    scene.add(toriiGroup);
}

/* ─── LIGHTS ─────────────────────────────────────────────── */
function buildLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pt = new THREE.PointLight(0xFF2D2D, 3, 12);
    pt.position.set(0, 0, 0);
    scene.add(pt);
}

/* ─── BLOOM POST-PROCESSING ──────────────────────────────── */
function buildPostProcessing() {
    try {
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        const bloom = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            C.bloomStrength, C.bloomRadius, C.bloomThreshold
        );
        composer.addPass(bloom);
    } catch(e) {
        console.warn('Bloom not available, rendering without:', e);
        composer = null;
    }
}

/* ─── SCROLL SETUP ───────────────────────────────────────── */
function setupScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer = document.getElementById('jp-scroll');
    if (!scrollContainer) return;

    /* Main scroll timeline driving camera + particle morph */
    gsap.timeline({
        scrollTrigger: {
            trigger: scrollContainer,
            start: 'top top',
            end:   'bottom bottom',
            scrub: 1.5,
            onUpdate: (self) => {
                scrollRatio = self.progress;
                updateParticleMorph(scrollRatio);
            }
        }
    })
    .to(camera.position, { z: 3.5, y: 0, duration: 0.4 }, 0)
    .to(camera.position, { z: 2,   y: 0.5, duration: 0.2 }, 0.4)
    .to(camera.position, { z: 0.5, y: 0, duration: 0.3 }, 0.6)
    .to(camera.position, { z: -2,  y: -1, duration: 0.1 }, 0.9);

    /* Text reveals handled by IntersectionObserver in japan.html */
}

/* ─── PARTICLE MORPH ─────────────────────────────────────── */
function updateParticleMorph(t) {
    if (!particleMesh) return;
    const pos = particleMesh.geometry.attributes.position.array;
    const n   = C.particleCount;

    /* 0→0.35: galaxy, 0.35→0.65: → sphere, 0.65→1: → scatter */
    let srcA, srcB, alpha;
    if (t < 0.35) {
        srcA = posA; srcB = posA; alpha = 0;
    } else if (t < 0.65) {
        srcA = posA; srcB = posB; alpha = (t - 0.35) / 0.30;
    } else {
        srcA = posB; srcB = posC; alpha = (t - 0.65) / 0.35;
    }
    alpha = Math.min(1, Math.max(0, alpha));
    const eased = alpha < 0.5 ? 2*alpha*alpha : -1+(4-2*alpha)*alpha;

    for (let i = 0; i < n * 3; i++) {
        pos[i] = srcA[i] + (srcB[i] - srcA[i]) * eased;
    }
    particleMesh.geometry.attributes.position.needsUpdate = true;
}

/* ─── MOUSE PARALLAX ─────────────────────────────────────── */
function setupMouse() {
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
}

/* ─── ANIMATION LOOP ─────────────────────────────────────── */
function animate() {
    raf = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t  = clock.getElapsedTime();

    /* Smooth mouse */
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    /* Rotate galaxy */
    if (particleMesh) {
        particleMesh.rotation.y += 0.0008;
    }

    /* Pulse central sun */
    if (sunMesh) {
        const pulse = 1 + Math.sin(t * 2.2) * 0.06;
        sunMesh.scale.setScalar(pulse);
        sunGlow.scale.setScalar(pulse * 1.05);
    }

    /* Float torii */
    if (toriiGroup) {
        toriiGroup.position.y = -1.2 + Math.sin(t * 0.5) * 0.08;
        toriiGroup.rotation.y = Math.sin(t * 0.3) * 0.04;
    }

    /* Drift blossoms */
    if (blossomMesh) {
        const bpos = blossomMesh.geometry.attributes.position.array;
        const vels = blossomMesh._velocities;
        for (let i = 0; i < C.blossomCount; i++) {
            bpos[i*3+1] -= vels[i];
            bpos[i*3]   += Math.sin(t + i) * 0.001;
            if (bpos[i*3+1] < -4) bpos[i*3+1] = 10;
        }
        blossomMesh.geometry.attributes.position.needsUpdate = true;
    }

    /* Camera parallax (mouse) */
    camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.4 - camera.position.y + 1.5) * 0.02;
    camera.lookAt(0, 0, 0);

    /* Render */
    if (composer) composer.render();
    else renderer.render(scene, camera);
}

/* ─── RESIZE ─────────────────────────────────────────────── */
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

/* ─── BOOT ───────────────────────────────────────────────── */
function boot() {
    if (typeof THREE === 'undefined') {
        setTimeout(boot, 100);
        return;
    }
    init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}

})();
