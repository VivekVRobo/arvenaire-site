// ==========================================================================
// ELEVATE JAPAN — AAA WebGL Flight Engine v4
// Third-person chase camera · Dwell zones · Realistic flight physics
// ==========================================================================

gsap.registerPlugin(ScrollTrigger);

// ─── 1. RENDERER ──────────────────────────────────────────────────────────
const canvas = document.getElementById('webgl-canvas');
// ─── 0. PERFORMANCE LOD (Phase 5) ───────────────────────────────────────────
const isMobile = window.innerWidth <= 768;
const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: !isMobile, powerPreference: "high-performance" });
renderer.setPixelRatio(dpr);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9ecfef, 0.0009);   // less haze = more visible depth
scene.background = new THREE.Color(0x7bbde0);        // richer sky blue base

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 5, 20);

// ─── POST-PROCESSING COMPOSER (UnrealBloom + Cinematic Grade) ─────────────
let composer;
function setupComposer() {
    if (typeof THREE.EffectComposer === 'undefined' || isMobile) {
        if (!isMobile) console.warn('Post-processing not loaded — falling back to direct render.');
        // Mobile skips post-processing entirely for maximum buttery FPS + battery life
        return;
    }
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    const bloom = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.50,   // strength
        0.40,   // radius
        0.92    // threshold — VERY HIGH so only lanterns/sun bloom, NOT Doraemon
    );
    composer.addPass(bloom);

    // Cinematic colour-grade shader (no S-curve to avoid blowout)
    const gradeShader = {
        uniforms: { tDiffuse: { value: null } },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `
            uniform sampler2D tDiffuse; varying vec2 vUv;
            void main(){
                vec4 c = texture2D(tDiffuse,vUv);
                // Gentle contrast lift (no S-curve)
                c.rgb = pow(c.rgb, vec3(0.95));
                // Blockbuster grade: warm shadows, cool highlights
                float lum = dot(c.rgb,vec3(0.299,0.587,0.114));
                c.rgb = mix(c.rgb*vec3(1.04,0.97,0.88), c.rgb*vec3(0.90,0.98,1.08), lum);
                // Mild desaturation for filmic look
                float grey = dot(c.rgb,vec3(0.299,0.587,0.114));
                c.rgb = mix(vec3(grey),c.rgb,0.90);
                gl_FragColor = c;
            }`
    };
    composer.addPass(new THREE.ShaderPass(gradeShader));
}
setupComposer();

// ─── 2. LIGHTING ──────────────────────────────────────────────────────────
const sun = new THREE.DirectionalLight(0xfff4d6, 3.0);
sun.position.set(80, 200, -100);
scene.add(sun);

const fill = new THREE.DirectionalLight(0xc8e8ff, 0.6);
fill.position.set(-80, 60, 80);
scene.add(fill);

// Cinematic character lighting: ambient + camera headlight
scene.add(new THREE.AmbientLight(0xffffff, 0.4)); // Balanced ambient (was 1.2)
const camLight = new THREE.PointLight(0xfff0e0, 1.2, 200); // Lowered camera flashlight
camLight.position.set(0, 5, 10);
camera.add(camLight);
scene.add(camera); // Must add camera to scene if it holds lights

const bounce = new THREE.DirectionalLight(0xffe8c0, 0.3);
bounce.position.set(0, -50, 50);
scene.add(bounce);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// ─── 3. SKY GRADIENT SPHERE (Day -> Sunset -> Night) ────────────────────────
const skyGeo = new THREE.SphereGeometry(3000, 16, 16);
const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uProgress: { value: 0 } },
    vertexShader: `
        varying vec3 vPos;
        void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
    `,
    fragmentShader: `
        varying vec3 vPos;
        uniform float uProgress;
        void main() {
            float h = normalize(vPos).y * 0.5 + 0.5;
            
            // Morning
            vec3 z1 = vec3(0.35,0.60,0.90); vec3 h1 = vec3(0.72,0.88,0.97);
            // Golden Hour
            vec3 z2 = vec3(0.80,0.42,0.18); vec3 h2 = vec3(1.00,0.75,0.42);
            // Bioluminescent Night
            vec3 z3 = vec3(0.01,0.05,0.15); vec3 h3 = vec3(0.10,0.85,0.75);
            
            vec3 zenith = mix(mix(z1, z2, smoothstep(0.0, 0.5, uProgress)), z3, smoothstep(0.5, 1.0, uProgress));
            vec3 horizon = mix(mix(h1, h2, smoothstep(0.0, 0.5, uProgress)), h3, smoothstep(0.5, 1.0, uProgress));
            
            vec3 col = mix(horizon, zenith, h * h);
            gl_FragColor = vec4(col, 1.0);
        }
    `
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

// ─── 4. REALISTIC VOLUMETRIC CLOUDS ─────────────────────────────────────────
// Using a photorealistic cloud texture for AAA quality
const cloudTex = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/cloud.png');
const TUNNEL = 4000;

function makeCloudLayer(count, zRange, radMin, radMax, scaleMin, scaleMax, opacity) {
    const group = new THREE.Group();
    // NormalBlending + depthWrite:false + accurate opacity makes it look volumetric
    const mat = new THREE.SpriteMaterial({ 
        map: cloudTex, 
        transparent: true, 
        depthWrite: false,
        blending: THREE.NormalBlending
    });
    for (let i = 0; i < count; i++) {
        const sp = new THREE.Sprite(mat.clone());
        const z  = -(Math.random() * zRange);
        const r  = radMin + Math.random() * (radMax - radMin);
        const a  = Math.random() * Math.PI * 2;
        
        // Push clouds out horizontally, lower them slightly to form a grand sky bed, keep center clear
        const posX = Math.cos(a) * r * (1.2 + Math.random());
        const posY = Math.sin(a) * r * 0.5 + (Math.random() - 0.5) * 80 - 40; 
        sp.position.set(posX, posY, z);
        
        const sc = scaleMin + Math.random() * (scaleMax - scaleMin);
        sp.scale.set(sc * 1.5, sc, 1); // stretch slightly horizontally
        
        sp.material.opacity = opacity * (0.5 + Math.random() * 0.5);
        sp.material.rotation = (Math.random() - 0.5) * 0.5; // slight tilt
        
        // Add subtle shading variations for depth
        const shade = 0.8 + Math.random() * 0.2;
        sp.material.color.setRGB(shade, shade, shade);
        
        group.add(sp);
    }
    return group;
}

// 1500 procedural cinematic clouds
const cloudsBg  = makeCloudLayer(800, TUNNEL, 180, 500, 200, 450, 0.45);
const cloudsMid = makeCloudLayer(500, TUNNEL,  90, 200, 100, 250, 0.65);
const cloudsFg  = makeCloudLayer(200, TUNNEL,  35, 100,  60, 140, 0.40);

scene.add(cloudsBg);
scene.add(cloudsMid);
scene.add(cloudsFg);

// ─── 5. WIND MOTES (atmospheric particles) ────────────────────────────────
const moteGeo = new THREE.BufferGeometry();
const motePos = new Float32Array(2000 * 3);
for (let i = 0; i < 2000 * 3; i += 3) {
    motePos[i]   = (Math.random() - 0.5) * 600;
    motePos[i+1] = (Math.random() - 0.5) * 200;
    motePos[i+2] = -(Math.random() * TUNNEL);
}
moteGeo.setAttribute('position', new THREE.Float32BufferAttribute(motePos, 3));
const moteMesh = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    size: 0.5, color: 0xffffff, transparent: true, opacity: 0.3, sizeAttenuation: true
}));
scene.add(moteMesh);

// ─── 6. SUN DISC SPRITE ───────────────────────────────────────────────────
const sunTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128,128,0,128,128,128);
    g.addColorStop(0,'rgba(255,240,180,1)');
    g.addColorStop(0.15,'rgba(255,220,120,0.8)');
    g.addColorStop(0.4,'rgba(255,200,80,0.3)');
    g.addColorStop(1,'rgba(255,180,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
})();
const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
sunDisc.position.set(200, 180, -800);
sunDisc.scale.set(400, 400, 1);
scene.add(sunDisc);

// ─── CHERRY BLOSSOM PETALS ────────────────────────────────────────────────
const petalData = [];
(function buildPetals() {
    const petalTex = (() => {
        const c = document.createElement('canvas'); c.width = 64; c.height = 96;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32,48,0,32,48,48);
        g.addColorStop(0, 'rgba(255,183,197,1)');
        g.addColorStop(0.5,'rgba(255,160,180,0.7)');
        g.addColorStop(1, 'rgba(255,150,170,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(32,48,20,36,0,0,Math.PI*2);
        ctx.fill();
        return new THREE.CanvasTexture(c);
    })();
    const pMat = new THREE.SpriteMaterial({ map: petalTex, transparent: true, depthWrite: false, blending: THREE.NormalBlending });
    for (let i = 0; i < 200; i++) {
        const sp = new THREE.Sprite(pMat.clone());
        const z  = -(Math.random() * TUNNEL);
        sp.position.set((Math.random()-0.5)*300, (Math.random()-0.5)*80, z);
        const sc = 1.5 + Math.random() * 2.5;
        sp.scale.set(sc * 0.6, sc, 1);
        sp.material.opacity = 0.55 + Math.random() * 0.35;  // more vivid
        scene.add(sp);
        petalData.push({
            sprite: sp,
            originZ: z,
            driftX:  (Math.random()-0.5) * 0.06,
            driftY:  -(0.015 + Math.random() * 0.025),
            spinSpd: (Math.random()-0.5) * 0.04,
            wobble:  Math.random() * Math.PI * 2
        });
    }
})();

// ─── PROCEDURAL TORII GATES ───────────────────────────────────────────────
function buildToriiGate() {
    const group = new THREE.Group();
    const matWood = new THREE.MeshLambertMaterial({ color: 0xff2400 }); // Vermilion red
    const matDark = new THREE.MeshLambertMaterial({ color: 0x111111 }); // Dark base

    // Pillars
    const pGeo = new THREE.CylinderGeometry(1.5, 1.8, 30, 8);
    const p1 = new THREE.Mesh(pGeo, matWood); p1.position.set(-10, 0, 0);
    const p2 = new THREE.Mesh(pGeo, matWood); p2.position.set(10, 0, 0);
    group.add(p1, p2);

    // Bases
    const bGeo = new THREE.CylinderGeometry(2, 2.5, 4, 8);
    const b1 = new THREE.Mesh(bGeo, matDark); b1.position.set(-10, -15, 0);
    const b2 = new THREE.Mesh(bGeo, matDark); b2.position.set(10, -15, 0);
    group.add(b1, b2);

    // Top Beam
    const tGeo = new THREE.BoxGeometry(26, 2, 2.5);
    const top = new THREE.Mesh(tGeo, matWood);
    top.position.set(0, 14, 0);
    
    // Lower Beam
    const t2Geo = new THREE.BoxGeometry(20, 1.5, 2);
    const top2 = new THREE.Mesh(t2Geo, matWood);
    top2.position.set(0, 10, 0);
    group.add(top, top2);

    // Center strut
    const cGeo = new THREE.BoxGeometry(1.5, 4, 1.5);
    const center = new THREE.Mesh(cGeo, matWood);
    center.position.set(0, 12, 0);
    group.add(center);

    return group;
}

const toriiGates = [];
for(let i=0; i<30; i++) {
    const gate = buildToriiGate();
    gate.position.set(
        (Math.random()-0.5) * 150, 
        -20 + (Math.random()-0.5) * 50, 
        -400 - Math.random() * (TUNNEL - 800)
    );
    gate.rotation.y = (Math.random() - 0.5) * 0.4;
    gate.rotation.z = (Math.random() - 0.5) * 0.2;
    gate.scale.setScalar(1.5 + Math.random() * 1.5);
    scene.add(gate);
    toriiGates.push(gate);
}

// ─── FLOATING LANTERNS ────────────────────────────────────────────────────
const lanterns = [];
const lGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.5, 8);
const lMat = new THREE.MeshLambertMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.8 });
for(let i=0; i<80; i++) {
    const lan = new THREE.Mesh(lGeo, lMat);
    lan.position.set(
        (Math.random()-0.5) * 400,
        -100 + Math.random() * 200,
        -200 - Math.random() * TUNNEL
    );
    lan.userData = { 
        driftX: (Math.random()-0.5)*0.08, 
        driftY: 0.02 + Math.random()*0.05, 
        wobble: Math.random()*Math.PI*2 
    };
    scene.add(lan);
    lanterns.push(lan);
}

// ─── THE DESTINATION ISLAND (The Grand Landing) ───────────────────────────
const island = new THREE.Group();
island.position.set(0, -65, -2600); 

// Floating Rock Base
const rockGeo = new THREE.ConeGeometry(50, 40, 7);
const rockMat = new THREE.MeshLambertMaterial({ color: 0x1a2530 });
const rock = new THREE.Mesh(rockGeo, rockMat);
rock.rotation.x = Math.PI;
rock.position.y = -20;
island.add(rock);

// Glowing grass/moss top
const grassGeo = new THREE.CylinderGeometry(50, 48, 2, 7);
const grassMat = new THREE.MeshLambertMaterial({ color: 0x113322, emissive: 0x0a1a11 });
const grass = new THREE.Mesh(grassGeo, grassMat);
island.add(grass);

// Destination Torii Gate
const destGate = buildToriiGate();
destGate.scale.setScalar(2.5);
destGate.position.set(0, 18, -10);
island.add(destGate);

scene.add(island);

// ─── 7. WAYPOINTS — Dwell zones make Doraemon pause at text sections ──────
// Z barely changes during dwell → scroll slows character to hover
const WPTS = [
    { p: 0.00, z:  -40 },
    { p: 0.13, z: -600 },   // approach WP1
    { p: 0.20, z: -640 },   // ← WP1 DWELL START
    { p: 0.33, z: -670 },   // ← WP1 DWELL END   (30z over 13% = very slow)
    { p: 0.42, z:-1350 },   // fast flight
    { p: 0.47, z:-1500 },   // approach WP2
    { p: 0.50, z:-1525 },   // ← WP2 DWELL START
    { p: 0.63, z:-1555 },   // ← WP2 DWELL END
    { p: 0.72, z:-2300 },   // fast flight
    { p: 0.80, z:-2460 },   // approach WP3
    { p: 0.83, z:-2480 },   // ← WP3 DWELL START
    { p: 0.96, z:-2530 },   // ← WP3 DWELL END
    { p: 1.00, z:-2600 },
];

function getTargetZ(p) {
    for (let i = 0; i < WPTS.length - 1; i++) {
        const a = WPTS[i], b = WPTS[i+1];
        if (p >= a.p && p <= b.p) {
            const t = (p - a.p) / (b.p - a.p);
            const s = t * t * (3 - 2 * t); // smoothstep
            return a.z + (b.z - a.z) * s;
        }
    }
    return WPTS[WPTS.length-1].z;
}

// Flight speed: low in dwell zones, high between them
function getFlightSpeed(p) {
    for (let i = 0; i < WPTS.length - 1; i++) {
        const a = WPTS[i], b = WPTS[i+1];
        if (p >= a.p && p <= b.p) {
            const dz = Math.abs(b.z - a.z);
            const dp = b.p - a.p;
            return THREE.MathUtils.clamp(dz / dp / 6500, 0, 1);
        }
    }
    return 0;
}

// ─── 8. LOAD DORAEMON ─────────────────────────────────────────────────────
let doraemon = null, propeller = null;
const loader = new THREE.GLTFLoader();

// Physics state
const phys = { x:0, y:-1, z:-40, rotZ:0, rotX:0, velocity:0, hoverBob:0, orbitAngle:0 };
// Camera state (smooth follow)
const cam  = { x:0, y:5, z:18 };
// Game state
let gameStarted = false;

// ─── PROCEDURAL AUDIO ENGINE ──────────────────────────────────────────────
let audioCtx, windGain, windFilter, noiseSrc;
function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();
    
    windGain = audioCtx.createGain();
    windGain.gain.value = 0.01;
    
    windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 300;
    
    // Generate white noise buffer
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;
    noiseSrc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(audioCtx.destination);
    
    noiseSrc.start();
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

// ─── INITIALIZATION & DIVE ────────────────────────────────────────────────
function onAssetsLoaded() {
    const barTrack = document.querySelector('.ls-bar-track');
    const pctEl = document.getElementById('ls-percent');
    const startBtn = document.getElementById('start-btn');
    if (barTrack) barTrack.style.display = 'none';
    if (pctEl) pctEl.style.display = 'none';
    if (startBtn) {
        startBtn.style.display = 'block';
        startBtn.onclick = () => {
            initAudio();
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 700);
            
            // Set camera high up for cinematic dive down to Doraemon
            cam.y = 150;
            cam.z = 200;
            gameStarted = true;
        };
    }
}

// ─── MOUSE PARALLAX ───────────────────────────────────────────────────────
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    // Normalize to -1 to 1
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ─── PROCEDURAL DORAEMON FALLBACK ────────────────────────────────────────
function buildProceduralDoraemon() {
    const g = new THREE.Group();
    const blue  = new THREE.MeshPhongMaterial({ color: 0x1a7fff, shininess: 60 });
    const white = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 40 });
    const red   = new THREE.MeshPhongMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0.2 });
    const gold  = new THREE.MeshPhongMaterial({ color: 0xffcc00, shininess: 120 });
    const black = new THREE.MeshPhongMaterial({ color: 0x111111 });

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 20), blue);
    body.scale.y = 0.88; g.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.15, 20, 20), blue);
    head.position.y = 1.6; g.add(head);

    // White face oval
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.92, 16, 16), white);
    face.position.set(0.22, 1.6, 0.72); face.scale.z = 0.38; g.add(face);

    // Eyes
    [-0.28, 0.28].forEach(x => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), black);
        eye.position.set(x, 1.92, 1.05); g.add(eye);
        const shine = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), white);
        shine.position.set(x + 0.04, 1.95, 1.14); g.add(shine);
    });

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), red);
    nose.position.set(0, 1.58, 1.12); g.add(nose);

    // Belly
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.72, 14, 14), white);
    belly.position.set(0, -0.08, 0.82); belly.scale.z = 0.42; belly.scale.y = 0.88; g.add(belly);

    // Collar + bell
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.11, 10, 24), red);
    collar.position.y = 0.52; collar.rotation.x = Math.PI / 2; g.add(collar);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), gold);
    bell.position.set(0, 0.36, 0.9); g.add(bell);

    // Arms
    [-1, 1].forEach(s => {
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), blue);
        arm.scale.set(0.55, 1, 0.75); arm.position.set(s * 1.35, 0.15, 0.25); g.add(arm);
    });

    // Compute head top in LOCAL space BEFORE scale (needed for copter mount)
    const preBox = new THREE.Box3().setFromObject(g);
    const headTopY = preBox.max.y;

    // Scale to 5 units tall
    const ht = new THREE.Vector3(); preBox.getSize(ht);
    g.scale.setScalar(14 / ht.y);   // match GLB scale (massive)
    g.rotation.y = Math.PI;
    return { group: g, headTopY };
}

// ─── BUILD BAMBOO COPTER (standalone — works with GLB or procedural) ──────────
function buildCopter(headTopY) {
    if (!doraemon) return;
    const copter = new THREE.Group();
    copter.scale.setScalar(0.18); // AAA proportion: very small relative to body

    // Stick
    const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8),
        new THREE.MeshLambertMaterial({ color: 0xf9ca24 })
    );
    stick.position.y = 0.7;
    copter.add(stick);

    // Hub
    const hub = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0xf0932b })
    );
    hub.position.y = 1.45;
    copter.add(hub);

    // Propeller group
    propeller = new THREE.Group();
    propeller.position.y = 1.45;
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0xf9ca24, side: THREE.DoubleSide });
    const bLen = 2.2;

    [-1, 1].forEach(d => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(bLen, 0.05, 0.26), bladeMat);
        b.position.x = d * bLen * 0.5;
        propeller.add(b);
    });
    [-1, 1].forEach(d => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, bLen), bladeMat);
        b.position.z = d * bLen * 0.5;
        propeller.add(b);
    });

    copter.add(propeller);
    // Position copter base exactly on top of the local head
    copter.position.y = headTopY;
    doraemon.add(copter);
}

loader.load('suraj-doremon.glb',
    (gltf) => {
        doraemon = gltf.scene;
        const box = new THREE.Box3().setFromObject(doraemon);
        const sz  = new THREE.Vector3();
        box.getSize(sz);
        const uScale = 14 / sz.y;    // MASSIVE AAA character scale
        doraemon.scale.setScalar(uScale);
        doraemon.rotation.y = Math.PI;
        doraemon.position.set(phys.x, phys.y, phys.z);
        
        // Fix: Strip emissiveness and extreme glare from GLB materials so it doesn't glow white 
        doraemon.traverse((child) => {
            if (child.isMesh && child.material) {
                // If the model came with glowing materials, clamp it down
                if (child.material.emissive) child.material.emissive.setHex(0x000000);
                if (child.material.emissiveIntensity !== undefined) child.material.emissiveIntensity = 0;
                // Reduce metalness/roughness blowout under ACESFilmic
                if (child.material.metalness !== undefined) child.material.metalness = Math.min(child.material.metalness, 0.2);
                if (child.material.roughness !== undefined) child.material.roughness = Math.max(child.material.roughness, 0.6);
            }
        });
        
        scene.add(doraemon);

        // Compute exact head-top in local space for copter mount. 
        // Because copter becomes a CHILD, it inherits uScale natively.
        // DO NOT multiply by uScale, otherwise it blows way past the head!
        const headTopLocal = box.max.y;
        buildCopter(headTopLocal);

        // Done loading
        onAssetsLoaded();
    },
    (xhr) => {
        const pct = xhr.lengthComputable ? Math.floor(xhr.loaded / xhr.total * 100) : 50;
        const bar = document.getElementById('ls-bar');
        if (bar) bar.style.width = pct + '%';
        const pctEl = document.getElementById('ls-percent');
        if (pctEl) pctEl.textContent = pct + '%';
    },
    (err) => {
        const result = buildProceduralDoraemon();
        doraemon = result.group;
        doraemon.position.set(phys.x, phys.y, phys.z);
        scene.add(doraemon);
        buildCopter(result.headTopY);
        onAssetsLoaded();
    }
);

// ─── 9. SCROLL TRACKER ────────────────────────────────────────────────────
const state = { progress: 0, prevZ: -40 };

ScrollTrigger.create({
    trigger: '#scroll-driver',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { state.progress = self.progress; }
});

// ─── 10. MAGIC TEXT INIT ──────────────────────────────────────────────────
function splitChars(el) {
    const raw = el.innerHTML;
    el.innerHTML = raw.split('').map(ch =>
        ch === ' '
            ? '<span class="char" style="display:inline-block;width:0.28em"> </span>'
            : `<span class="char" style="display:inline-block;will-change:transform">${ch}</span>`
    ).join('');
}

function initMagicText() {
    document.querySelectorAll('.magic-split').forEach(splitChars);
}

// ─── 11. TEXT WAYPOINTS ───────────────────────────────────────────────────
const TEXT_WPS = [
    { id: 'wp-hero', from: 0.00, to: 0.16 },
    { id: 'wp-1',    from: 0.17, to: 0.40 },
    { id: 'wp-2',    from: 0.46, to: 0.68 },
    { id: 'wp-3',    from: 0.78, to: 1.00 },
];

const wpState = {};

function revealText(el) {
    if (!el) return;
    // Kill any ongoing animations on this element tree
    gsap.killTweensOf(el);
    gsap.killTweensOf(el.querySelectorAll('*'));

    const label   = el.querySelector('.wp-label');
    const chars   = el.querySelectorAll('.char');
    const desc    = el.querySelector('.wp-desc, .cl-body');
    const cta     = el.querySelector('.wp-cta, .cl-btn');
    const chips   = el.querySelector('.wp-chips');
    const eyebrow = el.querySelector('.hero-eyebrow');
    const scrollCue = el.querySelector('.hero-scroll-cue');

    // Make parent visible first
    gsap.set(el, { autoAlpha: 1, y: 0, filter: 'blur(0px)' });

    const tl = gsap.timeline();

    if (eyebrow) {
        tl.fromTo(eyebrow,
            { autoAlpha: 0, y: 16, letterSpacing:'14px' },
            { autoAlpha: 1, y: 0,  letterSpacing:'10px', duration: 1.1, ease: 'power2.out' }
        );
    }

    if (label) {
        tl.fromTo(label,
            { autoAlpha: 0, x: -20 },
            { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out' },
            eyebrow ? '-=0.5' : '0'
        );
    }

    if (chars.length > 0) {
        tl.fromTo(chars,
            { autoAlpha: 0, y: 38, filter: 'blur(10px)', rotateX: 70 },
            { autoAlpha: 1, y: 0,  filter: 'blur(0px)',  rotateX: 0,
              duration: 0.5, stagger: 0.025, ease: 'power3.out' },
            label ? '-=0.1' : '0'
        );
    }

    if (desc) {
        tl.fromTo(desc,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0,  duration: 0.65, ease: 'power2.out' },
            '-=0.1'
        );
    }

    if (cta) {
        tl.fromTo(cta,
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
            '-=0.1'
        );
    }

    if (chips) {
        tl.fromTo(chips.querySelectorAll('.wp-chip'),
            { autoAlpha: 0, y: 12, scale: 0.9 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.4)' },
            '-=0.2'
        );
    }

    if (scrollCue) {
        tl.fromTo(scrollCue,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0,  duration: 0.8, ease: 'power2.out' },
            '-=0.3'
        );
    }
}

function hideText(el) {
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
        autoAlpha: 0,
        y: -16,
        filter: 'blur(5px)',
        duration: 0.55,
        ease: 'power2.in'
    });
}

let prevActiveWP = null;

function updateTextOverlays(p) {
    TEXT_WPS.forEach(wp => {
        const el = document.getElementById(wp.id);
        if (!el) return;
        const inside = (p >= wp.from && p <= wp.to);
        if (inside && wpState[wp.id] !== 'in') {
            wpState[wp.id] = 'in';
            revealText(el);
        } else if (!inside && wpState[wp.id] === 'in') {
            wpState[wp.id] = 'out';
            hideText(el);
        }
    });
}

// ─── 12. CLOCK ────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let elapsed = 0;

// ─── 13. ANIMATION LOOP ───────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    elapsed += delta;

    const p = state.progress;

    // ── Sky colour shift ──────────────────────────────────────────────────
    // Progress naturally across the whole journey for 3-phase day/night cycle
    skyMat.uniforms.uProgress.value = THREE.MathUtils.lerp(skyMat.uniforms.uProgress.value, p, 0.02);

    // r128-compatible colour lerp for fog/background based on 3 phases
    const cMorning = new THREE.Color(0x9ecfef);
    const cGolden = new THREE.Color(0xe8a87c);
    const cNight = new THREE.Color(0x020d26);
    
    let envCol = new THREE.Color();
    if (p < 0.5) {
        envCol.copy(cMorning).lerp(cGolden, p * 2.0);
    } else {
        envCol.copy(cGolden).lerp(cNight, (p - 0.5) * 2.0);
    }
    scene.fog.color.copy(envCol);
    scene.background.copy(envCol);

    // ── Flight speed & AUDIO ──────────────────────────────────────────────
    const rawSpeed   = getFlightSpeed(p);
    const inDwell    = rawSpeed < 0.12;          // true at waypoints
    phys.velocity    = THREE.MathUtils.lerp(phys.velocity, rawSpeed, 0.05);

    // Audio responsiveness
    if (windGain && windFilter && gameStarted) {
        // Wind roars when flying fast, quiets during dwell
        const targetVol = inDwell ? 0.05 : 0.3 * (phys.velocity * 0.8);
        const targetFreq = inDwell ? 200 : 400 + (phys.velocity * 800);
        windGain.gain.value = THREE.MathUtils.lerp(windGain.gain.value, targetVol, 0.1);
        windFilter.frequency.value = THREE.MathUtils.lerp(windFilter.frequency.value, targetFreq, 0.1);
    }

    // ── Target Z for camera + character ───────────────────────────────────
    const targetZ  = getTargetZ(p);

    // ── Doraemon position ─────────────────────────────────────────────────
    if (doraemon) {
        // Natural S-curve sway + MOUSE PARALLAX offset
        const swayAmp  = inDwell ? 1.2 : 6.5;
        const bobAmp   = inDwell ? 0.8 : 2.0;
        const swayFreq = inDwell ? 0.18 : 0.22;
        const bobFreq  = inDwell ? 0.30 : 0.16;

        let targetX  = Math.sin(elapsed * swayFreq) * swayAmp - 2.5 + (mouseX * 4.0);
        let targetY  = Math.cos(elapsed * bobFreq) * bobAmp + (mouseY * 4.0);
        let targetRotX = inDwell ? 0 : -0.12;

        // ── Phase 3: The Landing Sequence ──
        let propSpeed = 0.08 + phys.velocity * 0.55;
        if (p > 0.98) {
            const landingProgress = (p - 0.98) / 0.02; // 0 to 1
            targetY = THREE.MathUtils.lerp(targetY, -61, landingProgress); // Land on island top
            targetRotX = THREE.MathUtils.lerp(targetRotX, 0, landingProgress); // Level out
            propSpeed = THREE.MathUtils.lerp(propSpeed, 0, landingProgress);   // Engine cutoff
        }

        // Smooth position
        phys.x = THREE.MathUtils.lerp(phys.x, targetX, 0.06);
        phys.y = THREE.MathUtils.lerp(phys.y, targetY, 0.06);
        phys.z = THREE.MathUtils.lerp(phys.z, targetZ - 12, 0.05); // slightly ahead of resting Z

        // Banking: tilt toward the direction of lateral motion
        const lateralDelta = targetX - phys.x;
        const bankTarget   = inDwell ? 0 : THREE.MathUtils.clamp(lateralDelta * 0.18, -0.3, 0.3);
        phys.rotZ          = THREE.MathUtils.lerp(phys.rotZ, bankTarget, 0.08);

        // Pitch
        phys.rotX          = THREE.MathUtils.lerp(phys.rotX, targetRotX, 0.06);

        // Micro turbulence during flight
        const turbX = (inDwell || p > 0.98) ? 0 : (Math.random() - 0.5) * 0.012;
        const turbY = (inDwell || p > 0.98) ? 0 : (Math.random() - 0.5) * 0.010;

        doraemon.position.set(phys.x + turbX, phys.y + turbY, phys.z);
        doraemon.rotation.z = phys.rotZ;
        doraemon.rotation.x = phys.rotX;

        // Propeller speed
        if (propeller) {
            propeller.rotation.y += propSpeed;
        }
    }

    // ── Follow Camera ─────────────────────────────────────────────────────
    // During hover: slowly orbit at fixed Z. During flight: chase from behind.
    if (inDwell) {
        phys.orbitAngle += delta * 0.08;  // very slow orbit
        const orbitR = 20;
        const cx = phys.x + Math.sin(phys.orbitAngle) * orbitR * 0.35;
        const cz = phys.z + orbitR + Math.cos(phys.orbitAngle) * orbitR * 0.12;
        cam.x = THREE.MathUtils.lerp(cam.x, cx, 0.03);
        cam.y = THREE.MathUtils.lerp(cam.y, phys.y + 4.5, 0.03);
        cam.z = THREE.MathUtils.lerp(cam.z, cz, 0.03);
    } else {
        cam.x = THREE.MathUtils.lerp(cam.x, phys.x * 0.3, 0.04);
        cam.y = THREE.MathUtils.lerp(cam.y, phys.y + 4.0, 0.04);
        cam.z = THREE.MathUtils.lerp(cam.z, phys.z + 11, 0.04);  // 11 behind = close AAA chase cam
    }
    camera.position.set(cam.x, cam.y, cam.z);

    // Camera look target: slightly ahead of Doraemon + Parallax
    const lookAt = new THREE.Vector3(phys.x * 0.5 + (mouseX * 3), phys.y + 0.5 + (mouseY * 3), phys.z - 10);
    camera.lookAt(lookAt);

    // ── Update text overlays ──────────────────────────────────────────────
    updateTextOverlays(p);

    // ── Speed overlay ─────────────────────────────────────────────────────
    const speedOverlay = document.getElementById('speed-lines');
    if (speedOverlay) {
        speedOverlay.style.opacity = (phys.velocity * 0.65).toFixed(2);
    }

    // ── Camera shake — turbulence during flight ───────────────────────────
    const shakeAmt = phys.velocity * 0.12;
    const noiseX = (Math.sin(elapsed * 13.7) * 0.5 + Math.sin(elapsed * 7.3) * 0.5);
    const noiseY = (Math.sin(elapsed * 9.1)  * 0.5 + Math.sin(elapsed * 5.7) * 0.5);
    camera.position.x += noiseX * shakeAmt;
    camera.position.y += noiseY * shakeAmt * 0.6;

    // ── Update cherry blossom petals ──────────────────────────────────────
    petalData.forEach(pd => {
        pd.wobble += 0.018;
        pd.sprite.position.x += pd.driftX + Math.sin(pd.wobble) * 0.025;
        pd.sprite.position.y += pd.driftY;
        pd.sprite.material.rotation += pd.spinSpd;
        // Reset petal when it drifts too low or too high
        if (pd.sprite.position.y < -60) {
            pd.sprite.position.y = 50;
            pd.sprite.position.x = (Math.random()-0.5)*300;
        }
    });

    // ── Animation: Wind Motes Weather Shift (Parallax & Depth) ────────────
    const pos = moteGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
        pos[i+2] += 2.0 + (phys.velocity * 300); // storm speeds up rushing at us
        pos[i+1] -= p * 0.4; // Starts drifting down heavily like snow/rain at end
        if (pos[i+2] > phys.z + 50) {
            pos[i+2] = phys.z - 600 - Math.random() * 200;
            pos[i+1] = phys.y + (Math.random() - 0.5) * 200;
        }
    }
    moteGeo.attributes.position.needsUpdate = true;

    // ── Animation: Lanterns Physics ───────────────────────────────────────
    lanterns.forEach(lan => {
        lan.position.x += lan.userData.driftX;
        lan.position.y += lan.userData.driftY;
        lan.userData.wobble += 0.02;
        lan.rotation.z = Math.sin(lan.userData.wobble) * 0.1;
        lan.rotation.x = Math.cos(lan.userData.wobble + 1) * 0.1;
        
        // Loop back if passed camera
        if (lan.position.z > camera.position.z + 20) {
            lan.position.z = phys.z - 600 - Math.random() * 400;
            lan.position.y = -100 + Math.random() * 200;
        }
    });

    // ── Render (use bloom composer if available, else direct) ─────────────
    if (composer) { composer.render(); } else { renderer.render(scene, camera); }
}

// ─── 14. START ────────────────────────────────────────────────────────────
initMagicText();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});

// ─── 15. PHASE 4: DYNAMIC DATA & UI AUDIO ─────────────────────────────────
function playHoverSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    // Subtle glassy UI tick
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function populateScholarships() {
    // Requires data.js to be loaded
    if (typeof SCHOLARMAP_DATA === 'undefined') return;
    const grid = document.getElementById('scholarship-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const scholarships = SCHOLARMAP_DATA.japan.scholarships;
    
    scholarships.forEach(s => {
        const card = document.createElement('div');
        card.className = 'scaffold-card';
        card.innerHTML = `
            <div style="font-size: 0.8rem; letter-spacing: 2px; color: var(--gold); margin-bottom: 0.5rem; text-transform: uppercase;">${s.badge}</div>
            <h3 style="font-size: 2.2rem; margin-bottom: 0.2rem;">${s.name}</h3>
            <div style="color: rgba(255,255,255,0.5); font-size: 0.95rem; margin-bottom: 1.5rem; font-style: italic;">${s.org}</div>
            
            <div style="display: flex; flex-direction: column; gap: 0.8rem; border-left: 2px solid rgba(255, 71, 87, 0.4); padding-left: 1rem; margin-bottom: 2rem;">
                <div><strong style="color:var(--accent);">Stipend:</strong> ${s.amount}</div>
                <div><strong style="color:var(--accent);">Deadline:</strong> ${s.deadline}</div>
                <div><strong style="color:var(--accent);">Difficulty:</strong> ${s.difficulty}</div>
                <div style="color:rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 0.5rem;"><strong>Covers:</strong> ${s.covers.join(' • ')}</div>
            </div>
            
            <button onclick="window.location.href='contact.html?scholarship=${encodeURIComponent(s.name)}'">Enquire Now</button>
        `;
        
        card.addEventListener('mouseenter', playHoverSound);
        grid.appendChild(card);
    });
}

// Call population immediately so the HTML scaffold is ready when they arrive
populateScholarships();
