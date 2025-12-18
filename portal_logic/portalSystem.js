// import * as THREE from 'three';
// import { PortalHalo } from './portalHalo.js';

// export class PortalSystem extends THREE.Object3D {
//   constructor() {
//     super(); // make this an Object3D

//     // Create halos
//     this.blueHalo = new PortalHalo(0x0000ff);
//     this.orangeHalo = new PortalHalo(0xff6600);

//     // Add halos as children of this Object3D
//     this.add(this.blueHalo.mesh);
//     this.add(this.orangeHalo.mesh);

//     this.currentPortal = 'blue';

//     // Keyboard switching
//     window.addEventListener('keydown', (e) => {
//       if (e.key === 'q') this.currentPortal = 'blue';
//       if (e.key === 'e') this.currentPortal = 'orange';
//     });
//   }

//   update(hitInfo) {
//     if (!hitInfo) {
//       this.blueHalo.setVisible(false);
//       this.orangeHalo.setVisible(false);
//       return;
//     }

//     const halo = this.currentPortal === 'blue' ? this.blueHalo : this.orangeHalo;
//     halo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);

//     this.blueHalo.setVisible(this.currentPortal === 'blue');
//     this.orangeHalo.setVisible(this.currentPortal === 'orange');
//   }
// placePortal(hitInfo) {
//   if (!hitInfo) return;

//   const halo = this.currentPortal === 'blue' ? this.blueHalo : this.orangeHalo;
//   halo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
//   halo.setVisible(true);

//   // Optional: hide the other portal
//   const otherHalo = this.currentPortal === 'blue' ? this.orangeHalo : this.blueHalo;
//   otherHalo.setVisible(false);
// }




// }
// portalSystem.js
// Coordinates all portal subsystems
// portalSystem.js
// Coordinates all portal subsystems
// portalSystem.js
// Coordinates all portal subsystems
import * as THREE from 'three';
import { PortalHalo } from './portalHalo.js';
import { PortalRender } from './PortalRender.js';
import { PortalTeleport } from './portalTeleport.js';
import { PortalUtils } from './portalUtils.js';

export class PortalSystem extends THREE.Object3D {
  constructor(scene, mainCamera, renderer, cameraController = null) {
    super();

    this.scene = scene;
    this.mainCamera = mainCamera;
    this.renderer = renderer;
    this.cameraController = cameraController; // For collision registration

    // === SUBSYSTEMS ===
    
    // Visual preview halos
    this.blueHalo = new PortalHalo(0x4444ff);
    this.orangeHalo = new PortalHalo(0xff6600);
    this.add(this.blueHalo.mesh);
    this.add(this.orangeHalo.mesh);

    // Portal rendering system (render-to-texture)
    this.portalRender = new PortalRender(scene, mainCamera, 1.0);

    // Teleportation system
    this.portalTeleport = new PortalTeleport(0.8);

    // === STATE ===
    
    this.currentPortal = 'blue'; // Which portal gun is selected
    
    // Portal placement tracking
    this.bluePortalPlaced = false;
    this.orangePortalPlaced = false;

    // Portal data for transforms
    this.bluePortalData = null;
    this.orangePortalData = null;

    // === CONTROLS ===
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'q' || e.key === 'Q') {
        this.currentPortal = 'blue';
        console.log('🔵 Blue portal selected');
      }
      if (e.key === 'e' || e.key === 'E') {
        this.currentPortal = 'orange';
        console.log('🟠 Orange portal selected');
      }
      if (e.key === 'r' || e.key === 'R') {
        this.clearAllPortals();
      }
    });
  }

  /**
   * Update preview halos (shows where portal will be placed)
   * Call every frame with raycaster hitInfo
   */
  updatePreview(hitInfo, deltaTime) {
    // Update teleport cooldown
    this.portalTeleport.update(deltaTime);

    // Animate portal halos
    this.blueHalo.animate(deltaTime);
    this.orangeHalo.animate(deltaTime);

    // Get current portal halo
    const previewHalo = this.currentPortal === 'blue' ? this.blueHalo : this.orangeHalo;
    const isPlaced = this.currentPortal === 'blue' ? this.bluePortalPlaced : this.orangePortalPlaced;

    if (!hitInfo) {
      // No surface hit - hide preview
      if (!isPlaced) previewHalo.setVisible(false);
      return;
    }

    // Show preview at hit location
    if (!isPlaced) {
      previewHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      previewHalo.setVisible(true);
    }
  }

  /**
   * Place a portal at the hit location
   * Call this on click
   */
  placePortal(hitInfo) {
    if (!hitInfo) return;

    const portalData = PortalUtils.createPortalData(hitInfo.point, hitInfo.normal);

    if (this.currentPortal === 'blue') {
      // Place blue portal
      this.bluePortalData = portalData;
      this.bluePortalPlaced = true;
      
      this.blueHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      this.blueHalo.setVisible(true);
      
      this.portalRender.createBluePortal(hitInfo.point, hitInfo.normal);
      
      // Register with collision system
      if (this.cameraController && this.portalRender.bluePortalMesh) {
        this.cameraController.registerPortalForCollision(this.portalRender.bluePortalMesh);
      }
      
      console.log('🔵 Blue portal placed');
    } else {
      // Place orange portal
      this.orangePortalData = portalData;
      this.orangePortalPlaced = true;
      
      this.orangeHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      this.orangeHalo.setVisible(true);
      
      this.portalRender.createOrangePortal(hitInfo.point, hitInfo.normal);
      
      // Register with collision system
      if (this.cameraController && this.portalRender.orangePortalMesh) {
        this.cameraController.registerPortalForCollision(this.portalRender.orangePortalMesh);
      }
      
      console.log('🟠 Orange portal placed');
    }

    // Check if both portals are now active
    if (this.areBothPortalsActive()) {
      console.log('✅ Both portals active - linking enabled!');
    }
  }

  /**
   * Render portal views to textures
   * MUST be called before main scene render
   */
  renderPortalViews() {
    if (!this.areBothPortalsActive()) return;

    // Update portal camera positions
    this.portalRender.updatePortalCameras(
      this.mainCamera,
      this.bluePortalData,
      this.orangePortalData
    );

    // Render portal views to textures
    this.portalRender.renderPortalViews(this.renderer);
  }

  /**
   * Check and execute player teleportation
   * Returns teleport data if teleportation occurred
   */
  checkTeleportation(playerPosition, playerRotation, playerVelocity) {
    if (!this.areBothPortalsActive()) return null;

    const result = this.portalTeleport.checkAndTeleport(
      playerPosition,
      playerRotation,
      playerVelocity,
      this.bluePortalData,
      this.orangePortalData
    );

    if (result) {
      console.log('✨ Teleportation executed!', result);
    }

    return result;
  }

  /**
   * Check if player is near a portal (for UI/effects)
   */
  getNearbyPortal(playerPosition) {
    if (!this.areBothPortalsActive()) return null;
    return this.portalTeleport.getNearbyPortal(
      playerPosition,
      this.bluePortalData,
      this.orangePortalData
    );
  }

  /**
   * Check if both portals are placed and active
   */
  areBothPortalsActive() {
    return this.bluePortalPlaced && 
           this.orangePortalPlaced && 
           this.portalRender.areBothPortalsActive();
  }

  /**
   * Clear all portals
   */
  clearAllPortals() {
    // Clear halos
    this.blueHalo.setVisible(false);
    this.orangeHalo.setVisible(false);
    
    // Clear render system
    this.portalRender.clearPortals();
    
    // Clear teleport system
    this.portalTeleport.reset();

    // Clear portals from collision
    if (this.cameraController) {
      this.cameraController.clearPortalsFromCollision();
    }
    
    // Clear state
    this.bluePortalPlaced = false;
    this.orangePortalPlaced = false;
    this.bluePortalData = null;
    this.orangePortalData = null;
    
    console.log('🧹 All portals cleared');
  }

  /**
   * Get current portal color for crosshair/UI
   */
  getCurrentPortalColor() {
    return this.currentPortal === 'blue' ? 0x4444ff : 0xff6600;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.portalRender.dispose();
  }
}