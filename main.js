import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene } from './scenes/LevelOne.js';

// --- Setup scene and walls ---
const { scene, walls } = setupScene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// Pass walls array to CameraController for collisions
const cameraController = new CameraController(camera, scene, walls);

const renderer = createRenderer();

// --- Prevent zoom ---
window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- WINDOW RESIZE LOGIC ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() { requestAnimationFrame(animate); cameraController.update(); renderer.render(scene, camera); }

animate();
