// // import * as THREE from 'three';
// // import { CameraController } from './Controllers/CameraController.js';
// // import { createRenderer } from './core/renderer.js';
// // import { setupScene } from './scenes/LevelOne.js';
// // import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
// // import { PortalSystem } from './portal_logic/portalSystem.js';
// // // --- Setup scene and walls ---
// // const { scene, walls } = setupScene();
// // const portalRaycaster = new PortalRaycaster();
// // scene.add(portalRaycaster.debugRay);
// // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// // // Pass walls array to CameraController for collisions
// // const cameraController = new CameraController(camera, scene, walls);

// // const portalSystem = new PortalSystem();
// // scene.add(portalSystem);

// // const renderer = createRenderer();

// // // --- Prevent zoom ---
// // window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// // // --- WINDOW RESIZE LOGIC ---
// // window.addEventListener('resize', () => {
// //     camera.aspect = window.innerWidth / window.innerHeight;
// //     camera.updateProjectionMatrix();
// //     renderer.setSize(window.innerWidth, window.innerHeight);
// // });
// // window.addEventListener('click', () => {
// //   if (portalRaycaster.hitInfo) {
// //     // Log the hit point for debugging
// //     console.log('Hit detected at', portalRaycaster.hitInfo.point);
// //     portalSystem.placePortal(portalRaycaster.hitInfo);
// //   } else {
// //     console.log('No hit detected');
// //   }
// // });



// // function animate() {
// //   requestAnimationFrame(animate);

// //   cameraController.update(); // updates player/camera

// //   portalRaycaster.update(
// //     camera,    // camera for direction
// //     walls      // array of objects to hit
// //   );

// //   portalSystem.update(portalRaycaster.hitInfo);

// //   renderer.render(scene, camera);
// // }
// // animate();
// // main.js
// import * as THREE from 'three';
// import { CameraController } from './Controllers/CameraController.js';
// import { createRenderer } from './core/renderer.js';
// import { setupScene } from './scenes/LevelOne.js';
// import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
// import { PortalSystem } from './portal_logic/portalSystem.js';

// // === SETUP ===

// const { scene, walls } = setupScene();

// const camera = new THREE.PerspectiveCamera(
//   75, 
//   window.innerWidth / window.innerHeight, 
//   0.1, 
//   500
// );

// const renderer = createRenderer();

// const cameraController = new CameraController(camera, scene, walls);

// const portalRaycaster = new PortalRaycaster();
// scene.add(portalRaycaster.debugRay);

// // Portal system now gets scene, camera, and renderer
// const portalSystem = new PortalSystem(scene, camera, renderer);
// scene.add(portalSystem);

// // === WINDOW HANDLING ===

// window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// window.addEventListener('resize', () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });

// // === INPUT HANDLING ===

// window.addEventListener('click', () => {
//   if (portalRaycaster.hitInfo) {
//     console.log('🎯 Placing portal...');
//     portalSystem.placePortal(portalRaycaster.hitInfo);
//   }
// });

// // === GAME LOOP ===

// const clock = new THREE.Clock();

// function animate() {
//   requestAnimationFrame(animate);

//   const deltaTime = clock.getDelta();

//   // 1. Update player/camera movement
//   cameraController.update();

//   // 2. Update raycaster for portal placement
//   portalRaycaster.update(camera, walls);

//   // 3. Update portal preview
//   portalSystem.updatePreview(portalRaycaster.hitInfo, deltaTime);

//   // 4. Check for teleportation
//   const teleportData = portalSystem.checkTeleportation(
//     camera.position,
//     camera.quaternion,
//     cameraController.velocity || new THREE.Vector3()
//   );

//   // 5. Apply teleportation if it occurred
//   if (teleportData) {
//     camera.position.copy(teleportData.position);
//     camera.quaternion.copy(teleportData.rotation);
    
//     // Update velocity if your camera controller supports it
//     if (cameraController.velocity) {
//       cameraController.velocity.copy(teleportData.velocity);
//     }
    
//     console.log('🌀 Player teleported!');
//   }

//   // 6. Render portal views (MUST happen before main render)
//   portalSystem.renderPortalViews(renderer);

//   // 7. Render main scene
//   renderer.render(scene, camera);
// }

// animate();

// // === CONSOLE HELP ===

// console.log('🎮 PORTAL GAME CONTROLS');
// console.log('━━━━━━━━━━━━━━━━━━━━━━');
// console.log('Q - Select Blue Portal');
// console.log('E - Select Orange Portal');
// console.log('Click - Place Portal');
// console.log('R - Clear All Portals');
// console.log('WASD - Move');
// console.log('Mouse - Look Around');
// console.log('━━━━━━━━━━━━━━━━━━━━━━');
// console.log('Blue portal active?', portalSystem.bluePortalData);
// console.log('Orange portal active?', portalSystem.orangePortalData);
// console.log('Player distance to blue:', camera.position.distanceTo(portalSystem.bluePortalData.position));
// console.log('Player distance to orange:', camera.position.distanceTo(portalSystem.orangePortalData.position));
// main.js
// main.js
import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene } from './scenes/LevelOne.js';
import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
import { PortalSystem } from './portal_logic/portalSystem.js';

// === SETUP ===

const { scene, walls } = setupScene();

const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  500
);

const renderer = createRenderer();

const cameraController = new CameraController(camera, scene, walls);

const portalRaycaster = new PortalRaycaster();
scene.add(portalRaycaster.debugRay);

// Portal system now gets scene, camera, renderer, AND cameraController
const portalSystem = new PortalSystem(scene, camera, renderer, cameraController);
scene.add(portalSystem);

// === WINDOW HANDLING ===

window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === INPUT HANDLING ===

window.addEventListener('click', () => {
  if (portalRaycaster.hitInfo) {
    console.log('🎯 Placing portal...');
    portalSystem.placePortal(portalRaycaster.hitInfo);
  }
});

// === GAME LOOP ===

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // 1. Update player/camera movement
  cameraController.update();

  // 2. Update raycaster for portal placement
  portalRaycaster.update(camera, walls);

  // 3. Update portal preview
  portalSystem.updatePreview(portalRaycaster.hitInfo, deltaTime);

  // 4. Render portal views FIRST (must happen before main render)
  portalSystem.renderPortalViews();

  // 5. Check for teleportation
  const playerObj = cameraController.getPlayer();
  const teleportData = portalSystem.checkTeleportation(
    playerObj.position,
    playerObj.quaternion,
    cameraController.getVelocity()
  );

  // 6. Apply teleportation if it occurred
  if (teleportData) {
    // Teleport the player object (which contains camera)
    playerObj.position.copy(teleportData.position);
    playerObj.quaternion.copy(teleportData.rotation);
    
    // Also update prevPosition to prevent collision issues
    playerObj.prevPosition = teleportData.position.clone();
    
    // Apply the transformed velocity to keep momentum
    cameraController.setVelocity(teleportData.velocity);
    
    console.log('🌀 Player teleported!');
    console.log('💨 Velocity preserved:', teleportData.velocity);
  }

  // 7. Render main scene
  renderer.render(scene, camera);
}

animate();

// === CONSOLE HELP ===

console.log('🎮 PORTAL GAME CONTROLS');
console.log('━━━━━━━━━━━━━━━━━━━━━━');
console.log('Q - Select Blue Portal');
console.log('E - Select Orange Portal');
console.log('Click - Place Portal');
console.log('R - Clear All Portals');
console.log('WASD - Move');
console.log('Mouse - Look Around');
console.log('━━━━━━━━━━━━━━━━━━━━━━');

// Debug: Log portal distances every 2 seconds
setInterval(() => {
  if (portalSystem.areBothPortalsActive()) {
    const playerPos = cameraController.getPlayer().position;
    const distToBlue = playerPos.distanceTo(portalSystem.bluePortalData.position);
    const distToOrange = playerPos.distanceTo(portalSystem.orangePortalData.position);
    console.log(`📍 Distance - Blue: ${distToBlue.toFixed(2)}, Orange: ${distToOrange.toFixed(2)} (threshold: 1.0)`);
  }
}, 2000);