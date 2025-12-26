import * as THREE from 'three';
import { CameraController } from './Controllers/CameraController.js';
import { createRenderer } from './core/renderer.js';
import { setupScene as setupLevelOne } from './scenes/LevelOne.js';
import { setupScene as setupLevelTwo } from './scenes/LevelTwo.js';
import { setupScene as setupLevelThree } from './scenes/LevelThree.js';
import { PortalRaycaster } from './portal_logic/portalRayCaster.js';
import { PortalSystem } from './portal_logic/portalSystem.js';
import { PortalTeleport } from './portal_logic/portalTeleport.js';
import { PortalRenderer } from './portal_logic/PortalRender.js';
import { CubeButtonRaycaster } from './portal_logic/CubeButtonRaycaster.js';
import { audioManager } from './Controllers/AudioManager.js';

// --- UI ELEMENTS ---
const menu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const hudBlue = document.getElementById('hud-blue');
const hudOrange = document.getElementById('hud-orange');

// --- GAME STATE ---
let isGameActive = false; // Starts paused

// Level selection
const CURRENT_LEVEL = 3; 

let setupSceneFunction = setupLevelThree;
// Logic to switch levels can go here...

//--- Setup scene and walls ---
const { scene, walls, puzzle, collisionObjects, spawnPoint } = setupSceneFunction();

const portalRaycaster = new PortalRaycaster();
const cubeRaycaster = new CubeButtonRaycaster(10, new THREE.Vector3(0, 0, 0)); 
scene.add(portalRaycaster.debugRay);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

// Collect dynamic obstacles
const wallObstacles = [...walls];
if (puzzle && puzzle.door) {
    wallObstacles.push(puzzle.door.model);
}

console.log('Level loaded - Walls:', wallObstacles.length, 'Floors:', collisionObjects.length);

const cameraController = new CameraController(camera, scene, wallObstacles, collisionObjects);

// Apply Spawn Point
if (spawnPoint) {
    cameraController.getPlayer().position.copy(spawnPoint);
    cameraController.getPlayer().prevPosition = spawnPoint.clone();
}

const portalSystem = new PortalSystem();
scene.add(portalSystem);

const portalTeleport = new PortalTeleport(
  cameraController.getPlayer(),
  portalSystem,
  cameraController.collision,
  cameraController.mouse
);

const renderer = createRenderer();
const portalRenderer = new PortalRenderer(renderer, scene, camera);

// --- INPUT LISTENERS ---

// 1. Prevent zoom
window.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// 2. Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  portalRenderer.setSize(window.innerWidth, window.innerHeight);
});

// 3. START BUTTON LOGIC (Handles Menu & Audio Init)
startBtn.addEventListener('click', () => {
    // Initialize Audio Engine (Browser requires user gesture)
    audioManager.init();

    // Lock Pointer (Browser will trigger 'pointerlockchange' event below)
    document.body.requestPointerLock();
});

// 4. POINTER LOCK STATE HANDLER (Handles ESC key)
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
        // Game Locked and Active
        isGameActive = true;
        menu.style.display = 'none';
    } else {
        // User pressed ESC or Alt-Tabbed
        isGameActive = false;
        menu.style.display = 'flex'; // Show menu overlay
    }
});

// 5. GAMEPLAY CLICKS (Shooting/Pickup)
window.addEventListener('click', () => {

  // Safety net for audio
  if (!audioManager.isMusicLoopActive()) {
      console.log("⚠️ Music loop died. Restarting...");
      audioManager.init();
      audioManager.startAmbientMusic();
  }

  // IGNORE clicks if we are in the menu
  if (!isGameActive) return;

  // Cube Logic
  if (puzzle && puzzle.cube) {
    if (puzzle.cube.isHeld) {
      puzzle.cube.drop(scene);
      return; 
    } else if (cubeRaycaster.hitInfo) {
      const hitObj = cubeRaycaster.hitInfo.object;
      if (hitObj === puzzle.cube.mesh || (hitObj.userData && hitObj.userData.rootParent === puzzle.cube.mesh)) {
        puzzle.cube.pickup(cameraController.getPlayer());
        return; 
      }
    }
  }

  // Portal Logic
  if (portalRaycaster.hitInfo) {
    const placedPortal = portalSystem.placePortal(portalRaycaster.hitInfo);

    if (placedPortal === 'blue') audioManager.playPortalShoot('blue');
    if (placedPortal === 'orange') audioManager.playPortalShoot('orange');

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

// --- HELPER: Sync HUD Icons ---
function updateHUD() {
    if (portalSystem.bluePortalActive) {
        hudBlue.style.opacity = '1.0';
        hudBlue.style.boxShadow = '0 0 20px #00aaff';
    } else {
        hudBlue.style.opacity = '0.2';
        hudBlue.style.boxShadow = 'none';
    }

    if (portalSystem.orangePortalActive) {
        hudOrange.style.opacity = '1.0';
        hudOrange.style.boxShadow = '0 0 20px #ffaa00';
    } else {
        hudOrange.style.opacity = '0.2';
        hudOrange.style.boxShadow = 'none';
    }
}

const clock = new THREE.Clock();

// --- MAIN LOOP ---
function animate() {
  requestAnimationFrame(animate);

  // 1. Always render the scene (so the menu has a 3D background)
  // Render portals first
  portalRenderer.render(
    camera,
    portalSystem.bluePortalData,
    portalSystem.orangePortalData,
    portalSystem.bluePortalActive,
    portalSystem.orangePortalActive
  );
  // Main render
  renderer.render(scene, camera);

  // 2. STOP HERE if game is paused (Menu is open)
  if (!isGameActive) return;

  // --- EVERYTHING BELOW ONLY RUNS WHILE PLAYING ---

  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, 0.05); 

  // Updates
  cameraController.update(deltaTime);
  portalTeleport.update(deltaTime);
  
  // Raycasting
  const portalSurfaces = [...wallObstacles, ...collisionObjects];
  portalRaycaster.update(camera, portalSurfaces);
  
  portalSystem.update(portalRaycaster.hitInfo);
  portalSystem.blueHalo.animate(deltaTime);
  portalSystem.orangeHalo.animate(deltaTime);
  
  // HUD Update
  updateHUD();

  // Puzzle Update
  if (puzzle) {
    if (puzzle.cube) {
      cubeRaycaster.update(camera, [puzzle.cube.mesh]);
    }
    if (puzzle.button && puzzle.cube) {
      puzzle.button.update(puzzle.cube.mesh);
    }
    if (puzzle.door) {
      puzzle.door.update(deltaTime);
    }
  }

  // Death / Spike Logic
  try {
    const playerObj = cameraController.getPlayer();
    if (playerObj) {
      const playerBox = new THREE.Box3().setFromCenterAndSize(playerObj.position, new THREE.Vector3(0.7, 1.7, 0.7));
      let died = false;

      if (playerObj.position.y < -10) died = true;

      if (!died && scene.userData && Array.isArray(scene.userData.spikes)) {
        for (let s of scene.userData.spikes) {
          const sBox = new THREE.Box3().setFromObject(s);
          if (playerBox.intersectsBox(sBox)) {
            died = true;
            break;
          }
        }
      }

      if (died) {
        audioManager.playDeath(); // Play Death Sound

        const spawn = (scene.userData && scene.userData.spawnPoint) ? scene.userData.spawnPoint.clone() : new THREE.Vector3(1, 1, 1);
        playerObj.position.copy(spawn);
        if (playerObj.prevPosition) playerObj.prevPosition.copy(spawn);
        
        if (cameraController.player) {
          if (cameraController.player.velocity) cameraController.player.velocity.set(0, 0, 0);
          cameraController.player.onGround = true;
        }
        if (scene.userData && typeof scene.userData.handlePlayerDeath === 'function') {
          scene.userData.handlePlayerDeath();
        }
      }
    }
  } catch (e) {
    console.warn('Death check error:', e);
  }
}

animate();