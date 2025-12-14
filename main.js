import * as THREE from 'three';
import { CameraController } from './Controllers/cameraController.js';
import { setupScene } from './scenes/LevelOne.js';

const scene = setupScene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraController = new CameraController(camera, scene);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- WINDOW RESIZE LOGIC ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    cameraController.update();
    renderer.render(scene, camera);
}

animate();
