import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene } from './scenes/LevelTwo.js';
import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
import { PortalSystem } from './portal_logic/portalSystem.js';
import { PortalTeleport } from './portal_logic/portalTeleport.js'; // NEW: added
import { PortalRenderer } from './portal_logic/PortalRender.js';
import { CubeButtonRaycaster } from './portal_logic/CubeButtonRaycaster.js';
//--- Setup scene and walls ---
const { scene, walls, puzzle } = setupScene();
const portalRaycaster = new PortalRaycaster();
const cubeRaycaster = new CubeButtonRaycaster(10, new THREE.Vector3(0, 0, 0)); // Max distance 10
scene.add(portalRaycaster.debugRay);
if (puzzle && puzzle.cube) {
  // Add cube to raycaster check
  // Note: cubeRaycaster logic needs array of objects
}
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// Collect dynamic obstacles
const dynamicObstacles = [];
if (puzzle && puzzle.door) {
  dynamicObstacles.push(puzzle.door.model);
}

// Pass walls array to CameraController for collisions
const cameraController = new CameraController(camera, scene, walls, dynamicObstacles);

const portalSystem = new PortalSystem();
scene.add(portalSystem);

// NEW: Create PortalTeleport instance with collision controller
const portalTeleport = new PortalTeleport(
  cameraController.getPlayer(), // player object
  portalSystem,                  // portal system
  cameraController.collision     // collision controller
);


const renderer = createRenderer();
// const renderer = new THREE.WebGLRenderer({ 
//   canvas: document.querySelector('canvas'),
//   stencil: true,      // ← ADD THIS!
//   antialias: true,
//   alpha: false
// });
const portalRenderer = new PortalRenderer(renderer, scene, camera);

// --- Prevent zoom ---
window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- WINDOW RESIZE LOGIC ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  portalRenderer.setSize(window.innerWidth, window.innerHeight); // Update portal shader resolution
});

window.addEventListener('click', () => {
  // 1. Try to toggle Cube (Pickup/Drop)
  if (puzzle && puzzle.cube) {
    if (puzzle.cube.isHeld) {
      puzzle.cube.drop(scene);
      return; // Don't shoot portal if we just dropped something
    } else if (cubeRaycaster.hitInfo) {
      // Check if hit object is the cube or a child of the cube
      const hitObj = cubeRaycaster.hitInfo.object;
      if (hitObj === puzzle.cube.mesh || (hitObj.userData && hitObj.userData.rootParent === puzzle.cube.mesh)) {
        puzzle.cube.pickup(cameraController.getPlayer()); // Attach to player/camera
        return; // Don't shoot portal
      }
    }
  }

  // 2. Shoot Portal (if not interacting with Cube)
  if (portalRaycaster.hitInfo) {
    const placedPortal = portalSystem.placePortal(portalRaycaster.hitInfo);

    // Update portal renderer when portals are placed
    if (placedPortal) {
      portalRenderer.updatePortalMeshes(
        portalSystem.bluePortalData,
        portalSystem.orangePortalData,
        portalSystem.bluePortalActive,
        portalSystem.orangePortalActive
      );
    }
  }
});

const clock = new THREE.Clock();

// UPDATED: animate function
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  cameraController.update();
  portalTeleport.update(deltaTime);

  portalRaycaster.update(camera, walls);
  portalSystem.update(portalRaycaster.hitInfo);
  portalSystem.blueHalo.animate(deltaTime);
  portalSystem.orangeHalo.animate(deltaTime);

  // --- PUZZLE UPDATE ---
  if (puzzle) {
    // Raycast for cube selection
    if (puzzle.cube) {
      cubeRaycaster.update(camera, [puzzle.cube.mesh]);
    }

    // Update Button Logic
    if (puzzle.button && puzzle.cube) {
      puzzle.button.update(puzzle.cube.mesh);
    }

    // Update Door Animation
    if (puzzle.door) {
      puzzle.door.update(deltaTime);
    }
  }

  // NEW: Render portal views BEFORE main render
  portalRenderer.render(
    camera,
    portalSystem.bluePortalData,
    portalSystem.orangePortalData,
    portalSystem.bluePortalActive,
    portalSystem.orangePortalActive
  );

  // Main render
  renderer.render(scene, camera);
}
animate();
