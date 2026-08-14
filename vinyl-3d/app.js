/**
 * =======================================================
 * ABOUT YOU — 3D INTERACTIVE VINYL & MEMORIES SHOWCASE
 * Powered by Three.js WebGL & Audio Sync Engine
 * =======================================================
 */

// --- SINKRONISASI DATA FOTO & LIRIK (Persis seperti project bout u) ---
const syncData = [
    { time: 0.0, text: "I", img: "foto1.jpg" },
    { time: 7.5, text: "Know a place", img: "foto2.jpg" },
    { time: 13.5, text: "It's somewhere I go when I need to remember your face", img: "foto3.jpg" },
    { time: 22.0, text: "We get married", img: "foto4.jpg" },
    { time: 27.5, text: "In our heads", img: "foto5.jpg" },
    { time: 34.0, text: "Something to do while we try to recall how we met", img: "foto6.jpg" },
    { time: 42.0, text: "Do you think I have forgotten?", img: "foto7.jpg" },
    { time: 47.5, text: "Do you think I have forgotten?", img: "foto8.jpg" },
    { time: 53.5, text: "Do you think I have forgotten", img: "foto9.jpg" },
    { time: 59.0, text: "About you?", img: "foto10.jpg" }
];

// --- DOM ELEMENTS ---
const audio = document.getElementById("audio-source");
const btnPlayPause = document.getElementById("btn-play-pause");
const playBtnIcon = document.getElementById("play-btn-icon");
const btnReplaySeek = document.getElementById("btn-replay-seek");
const btnFav = document.getElementById("btn-fav");
const playerController = document.getElementById("player-controller");

const timeCurrent = document.getElementById("time-current");
const timeDuration = document.getElementById("time-duration");
const progressFill = document.getElementById("progress-fill");
const seekBarWrap = document.getElementById("seek-bar-wrap");

const liveLyric = document.getElementById("live-lyric");
const hologramFrame = document.getElementById("hologram-frame-container");
const currentSlideImg = document.getElementById("current-slide-img");
const hudPhotoCounter = document.getElementById("hud-photo-counter");

const finalActionContainer = document.getElementById("final-action-container");
const btnOpenLetter = document.getElementById("btn-open-letter");
const letterModal = document.getElementById("letter-modal");
const btnCloseLetter = document.getElementById("btn-close-letter");

// State Variables
let isPlaying = false;
let currentActiveIndex = -1;
let introStarted = false;

// =======================================================
// THREE.JS 3D SCENE SETUP
// =======================================================
const container = document.getElementById("webgl-container");
let scene, camera, renderer;
let vinylGroup, vinylRecord, centerLabel, tonearmGroup, tonearmBar;
let particleSystem;

function init3D() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070709, 0.035);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    // Posisi kamera sedikit miring di atas turntable untuk view 3D terbaik
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting (Warm Room Ambient + Neon Accents)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff0e6, 1.8);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Neon Accent Lights (Pink & Blue)
    const pinkLight = new THREE.PointLight(0xff6584, 2.5, 15);
    pinkLight.position.set(-4, 3, 2);
    scene.add(pinkLight);

    const blueLight = new THREE.PointLight(0x70a1ff, 2.2, 15);
    blueLight.position.set(4, 2, -2);
    scene.add(blueLight);

    // 5. Build Turntable & Vinyl
    buildTurntable();

    // 6. Build Audio Particle Cloud
    buildAudioParticles();

    // 7. Interactive Drag / Orbit Handlers
    initInteractions();

    // 8. Handle Window Resize
    window.addEventListener("resize", onWindowResize);
}

function buildTurntable() {
    // Parent Group
    vinylGroup = new THREE.Group();
    scene.add(vinylGroup);

    // --- Turntable Base Platform (Plinth) ---
    const baseGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.35, 64);
    const baseMat = new THREE.MeshStandardMaterial({
        color: 0x18181f,
        roughness: 0.3,
        metalness: 0.7
    });
    const plinth = new THREE.Mesh(baseGeo, baseMat);
    plinth.position.y = -0.2;
    plinth.receiveShadow = true;
    vinylGroup.add(plinth);

    // Shiny Metallic Rim on Plinth
    const rimGeo = new THREE.TorusGeometry(3.65, 0.04, 16, 100);
    const rimMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.95,
        roughness: 0.1
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.05;
    vinylGroup.add(rim);

    // --- Vinyl Record Disc ---
    const vinylGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.05, 80);
    
    // Texture Grooves Procedural Shader/Material
    const vinylMat = new THREE.MeshStandardMaterial({
        color: 0x0c0c0e,
        roughness: 0.35,
        metalness: 0.85,
        bumpScale: 0.05
    });

    vinylRecord = new THREE.Mesh(vinylGeo, vinylMat);
    vinylRecord.position.y = 0.02;
    vinylRecord.castShadow = true;
    vinylGroup.add(vinylRecord);

    // --- Center Album Label ---
    const textureLoader = new THREE.TextureLoader();
    const albumTexture = textureLoader.load("album.jpg");
    
    const labelGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.055, 64);
    const labelMat = new THREE.MeshStandardMaterial({
        map: albumTexture,
        roughness: 0.4,
        metalness: 0.2
    });
    centerLabel = new THREE.Mesh(labelGeo, labelMat);
    centerLabel.position.y = 0.03;
    vinylRecord.add(centerLabel);

    // Center Spindle Pin
    const spindleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 32);
    const spindleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.95,
        roughness: 0.1
    });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.y = 0.15;
    vinylGroup.add(spindle);

    // --- 3D Tonearm (Jarum Pemutar Vinyl) ---
    tonearmGroup = new THREE.Group();
    tonearmGroup.position.set(2.6, 0.15, -1.8);
    vinylGroup.add(tonearmGroup);

    // Base pivot
    const pivotGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 32);
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x22222a, metalness: 0.8, roughness: 0.2 });
    const pivot = new THREE.Mesh(pivotGeo, pivotMat);
    tonearmGroup.add(pivot);

    // Arm bar
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.0, 16);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.15 });
    tonearmBar = new THREE.Mesh(armGeo, armMat);
    tonearmBar.position.set(-0.9, 0.2, 1.2);
    tonearmBar.rotation.x = Math.PI / 2;
    tonearmBar.rotation.z = -Math.PI / 5.5;
    tonearmGroup.add(tonearmBar);

    // Cartridge / Needle Head
    const headGeo = new THREE.BoxGeometry(0.18, 0.12, 0.35);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.3 });
    const needleHead = new THREE.Mesh(headGeo, headMat);
    needleHead.position.set(-1.8, 0.15, 2.4);
    tonearmGroup.add(needleHead);

    // Initial Rest Angle
    tonearmGroup.rotation.y = -0.35;
}

function buildAudioParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Lingkaran di sekeliling piringan
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.8 + Math.random() * 2.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        scales[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
        color: 0xffbe76,
        size: 0.12,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// =======================================================
// INTERACTION & ORBIT CONTROL (DRAG TO ROTATE 3D)
// =======================================================
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationY = 0;
let targetRotationX = 0;

function initInteractions() {
    const dom = renderer.domElement;

    // Mouse Events
    dom.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.005;

        // Batasi sudut vertikal
        targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch Events (HP / Android Support)
    dom.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.009;
        targetRotationX += deltaY * 0.006;
        targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX));

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// =======================================================
// RENDER LOOP & ANIMATIONS
// =======================================================
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 1. Vinyl Rotation
    if (isPlaying && vinylRecord) {
        vinylRecord.rotation.y += 1.8 * delta;
    }

    // 2. Tonearm Smooth Move
    if (tonearmGroup) {
        const targetArmAngle = isPlaying ? 0.15 : -0.35;
        tonearmGroup.rotation.y += (targetArmAngle - tonearmGroup.rotation.y) * 4.0 * delta;
    }

    // 3. User Orbit Drag Interpolation
    if (vinylGroup) {
        vinylGroup.rotation.y += (targetRotationY - vinylGroup.rotation.y) * 5.0 * delta;
        vinylGroup.rotation.x += (targetRotationX - vinylGroup.rotation.x) * 5.0 * delta;

        // Auto gentle idle sway if not dragging
        if (!isDragging) {
            targetRotationY += 0.08 * delta;
        }
    }

    // 4. Particle Field Ambient Floating
    if (particleSystem) {
        particleSystem.rotation.y = time * 0.15;
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(time * 2 + positions[i]) * 0.002;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// =======================================================
// AUDIO PLAYBACK & MEMORY SYNC CONTROLLER
// =======================================================
btnPlayPause.addEventListener("click", togglePlay);

function togglePlay() {
    if (audio.paused) {
        audio.play().then(() => {
            isPlaying = true;
            playBtnIcon.textContent = "pause";
            playerController.classList.add("playing");
            
            if (!introStarted) {
                introStarted = true;
                hologramFrame.classList.remove("hidden");
            }
        }).catch(err => {
            console.log("Audio play error / User interaction needed", err);
        });
    } else {
        audio.pause();
        isPlaying = false;
        playBtnIcon.textContent = "play_arrow";
        playerController.classList.remove("playing");
    }
}

// Audio Time Update Event (Syncing Lyrics & Photos)
audio.addEventListener("timeupdate", () => {
    const curTime = audio.currentTime;
    const duration = audio.duration || 60;

    // Progress Bar
    const progressPercent = (curTime / duration) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // Time Labels
    timeCurrent.textContent = formatTime(curTime);
    timeDuration.textContent = "-" + formatTime(duration - curTime);

    // Sync Memory Slides & Lyrics
    let activeIdx = -1;
    for (let i = 0; i < syncData.length; i++) {
        if (curTime >= syncData[i].time) {
            activeIdx = i;
        } else {
            break;
        }
    }

    if (activeIdx !== -1 && activeIdx !== currentActiveIndex) {
        currentActiveIndex = activeIdx;
        updateSlide(currentActiveIndex);
    }
});

// Update Slide Photo & Lyric
function updateSlide(index) {
    const data = syncData[index];
    
    // 1. Update Lyric
    liveLyric.style.opacity = 0;
    liveLyric.style.transform = "translateY(8px) scale(0.96)";
    
    setTimeout(() => {
        liveLyric.textContent = data.text;
        liveLyric.style.opacity = 1;
        liveLyric.style.transform = "translateY(0) scale(1)";
    }, 250);

    // 2. Update Image & Counter
    currentSlideImg.style.opacity = 0.4;
    currentSlideImg.style.transform = "scale(0.96)";
    
    setTimeout(() => {
        currentSlideImg.src = data.img;
        hudPhotoCounter.textContent = `${String(index + 1).padStart(2, '0')} / 10`;
        currentSlideImg.style.opacity = 1;
        currentSlideImg.style.transform = "scale(1)";
    }, 200);
}

// Format Seconds to M:SS
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// Seek on Progress Bar Click
seekBarWrap.addEventListener("click", (e) => {
    const rect = seekBarWrap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
    }
});

// Replay Button
btnReplaySeek.addEventListener("click", () => {
    audio.currentTime = 0;
    currentActiveIndex = -1;
    if (audio.paused) {
        togglePlay();
    }
});

// Heart Button Toggle
btnFav.addEventListener("click", () => {
    btnFav.classList.toggle("active");
});

// Audio Ended Handler
audio.addEventListener("ended", () => {
    isPlaying = false;
    playBtnIcon.textContent = "replay";
    playerController.classList.remove("playing");

    // Fade out photo frame gently
    hologramFrame.style.opacity = "0";
    setTimeout(() => {
        hologramFrame.classList.add("hidden");
    }, 1200);

    // Show romantic letter button
    finalActionContainer.classList.remove("hidden");
});

// Romantic Letter Modal Actions
btnOpenLetter.addEventListener("click", () => {
    letterModal.classList.remove("hidden");
    setTimeout(() => {
        letterModal.classList.add("active");
    }, 10);
});

btnCloseLetter.addEventListener("click", () => {
    letterModal.classList.remove("active");
    setTimeout(() => {
        letterModal.classList.add("hidden");
    }, 400);
});

// =======================================================
// INITIALIZATION
// =======================================================
window.addEventListener("DOMContentLoaded", () => {
    init3D();
    animate();
});
