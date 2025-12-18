// // portalRender.js
// // Handles rendering the view through portals using render-to-texture
// import * as THREE from 'three';

// export class PortalRender {
//   constructor(scene, mainCamera, portalRadius = 1.0) {
//     this.scene = scene;
//     this.mainCamera = mainCamera;
//     this.portalRadius = portalRadius;

//     // Render targets for portal views (render-to-texture)
//     const renderTargetOptions = {
//       minFilter: THREE.LinearFilter,
//       magFilter: THREE.LinearFilter,
//       format: THREE.RGBFormat,
//       stencilBuffer: false
//     };

//     this.blueRenderTarget = new THREE.WebGLRenderTarget(512, 512, renderTargetOptions);
//     this.orangeRenderTarget = new THREE.WebGLRenderTarget(512, 512, renderTargetOptions);

//     // Off-screen cameras that render from portal POV
//     this.blueLinkCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 500);
//     this.orangeLinkCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 500);

//     // Portal surface meshes (the actual "windows")
//     this.bluePortalMesh = null;
//     this.orangePortalMesh = null;

//     // Track if portals are active
//     this.blueActive = false;
//     this.orangeActive = false;
//   }

//   /**
//    * Create or update blue portal surface
//    * @param {THREE.Vector3} position - Portal position
//    * @param {THREE.Vector3} normal - Portal surface normal
//    */
//   createBluePortal(position, normal) {
//     if (this.bluePortalMesh) {
//       this.scene.remove(this.bluePortalMesh);
//     }

//     // Create portal plane geometry
//     const geometry = new THREE.CircleGeometry(this.portalRadius, 64);
    
//     // Material displays the OTHER portal's view (orange camera renders to blue portal)
//     const material = new THREE.MeshBasicMaterial({
//       map: this.orangeRenderTarget.texture,
//       side: THREE.DoubleSide,
//       transparent: true,
//       opacity: 1.0
//     });

//     this.bluePortalMesh = new THREE.Mesh(geometry, material);
    
//     // Position and orient portal
//     const offset = normal.clone().multiplyScalar(0.01);
//     this.bluePortalMesh.position.copy(position).add(offset);
    
//     const quaternion = new THREE.Quaternion().setFromUnitVectors(
//       new THREE.Vector3(0, 0, 1),
//       normal
//     );
//     this.bluePortalMesh.quaternion.copy(quaternion);

//     this.scene.add(this.bluePortalMesh);
//     this.blueActive = true;

//     console.log('🔵 Blue portal surface created');
//   }

//   /**
//    * Create or update orange portal surface
//    * @param {THREE.Vector3} position - Portal position
//    * @param {THREE.Vector3} normal - Portal surface normal
//    */
//   createOrangePortal(position, normal) {
//     if (this.orangePortalMesh) {
//       this.scene.remove(this.orangePortalMesh);
//     }

//     const geometry = new THREE.CircleGeometry(this.portalRadius, 64);
    
//     // Material displays the OTHER portal's view (blue camera renders to orange portal)
//     const material = new THREE.MeshBasicMaterial({
//       map: this.blueRenderTarget.texture,
//       side: THREE.DoubleSide,
//       transparent: true,
//       opacity: 1.0
//     });

//     this.orangePortalMesh = new THREE.Mesh(geometry, material);
    
//     const offset = normal.clone().multiplyScalar(0.01);
//     this.orangePortalMesh.position.copy(position).add(offset);
    
//     const quaternion = new THREE.Quaternion().setFromUnitVectors(
//       new THREE.Vector3(0, 0, 1),
//       normal
//     );
//     this.orangePortalMesh.quaternion.copy(quaternion);

//     this.scene.add(this.orangePortalMesh);
//     this.orangeActive = true;

//     console.log('🟠 Orange portal surface created');
//   }

//   /**
//    * Update portal camera positions based on player camera
//    * This creates the "looking through portal" effect
//    * @param {THREE.Camera} playerCamera - Main player camera
//    * @param {Object} bluePortalData - {position, normal, quaternion}
//    * @param {Object} orangePortalData - {position, normal, quaternion}
//    */
//   updatePortalCameras(playerCamera, bluePortalData, orangePortalData) {
//     if (!this.blueActive || !this.orangeActive) return;

//     // Update blue portal's linked camera (views from orange portal)
//     this._updateLinkedCamera(
//       playerCamera,
//       bluePortalData,
//       orangePortalData,
//       this.orangeLinkCamera
//     );

//     // Update orange portal's linked camera (views from blue portal)
//     this._updateLinkedCamera(
//       playerCamera,
//       orangePortalData,
//       bluePortalData,
//       this.blueLinkCamera
//     );
//   }

//   /**
//    * Transform player camera to linked camera position
//    * Graphics concept: Change of basis / coordinate system transformation
//    * @private
//    */
//   _updateLinkedCamera(playerCamera, sourcePortal, destPortal, linkCamera) {
//     // Get player position relative to source portal
//     const relativePos = new THREE.Vector3()
//       .copy(playerCamera.position)
//       .sub(sourcePortal.position);

//     // Get player look direction
//     const playerForward = new THREE.Vector3(0, 0, -1);
//     playerForward.applyQuaternion(playerCamera.quaternion);

//     // Transform to destination portal space
//     const sourceInverse = sourcePortal.quaternion.clone().invert();
//     relativePos.applyQuaternion(sourceInverse);
//     playerForward.applyQuaternion(sourceInverse);

//     // Flip direction (portals face opposite directions)
//     relativePos.z *= -1;
//     playerForward.z *= -1;

//     // Apply destination portal rotation
//     relativePos.applyQuaternion(destPortal.quaternion);
//     playerForward.applyQuaternion(destPortal.quaternion);

//     // Set linked camera position
//     linkCamera.position.copy(destPortal.position).add(relativePos);

//     // Set linked camera rotation
//     const targetPoint = linkCamera.position.clone().add(playerForward);
//     linkCamera.lookAt(targetPoint);
//   }

//   /**
//    * Render portal views to textures
//    * This must be called BEFORE the main scene render
//    * @param {THREE.WebGLRenderer} renderer
//    */
//   renderPortalViews(renderer) {
//     if (!this.blueActive || !this.orangeActive) return;

//     // Hide portal meshes to avoid infinite recursion
//     const blueVisible = this.bluePortalMesh.visible;
//     const orangeVisible = this.orangePortalMesh.visible;
    
//     this.bluePortalMesh.visible = false;
//     this.orangePortalMesh.visible = false;

//     // Store original background
//     const originalBackground = this.scene.background;

//     // Render from orange portal's linked camera to blue render target
//     renderer.setRenderTarget(this.blueRenderTarget);
//     renderer.render(this.scene, this.orangeLinkCamera);

//     // Render from blue portal's linked camera to orange render target
//     renderer.setRenderTarget(this.orangeRenderTarget);
//     renderer.render(this.scene, this.blueLinkCamera);

//     // Restore render target to screen
//     renderer.setRenderTarget(null);

//     // Restore scene background
//     this.scene.background = originalBackground;

//     // Restore portal visibility
//     this.bluePortalMesh.visible = blueVisible;
//     this.orangePortalMesh.visible = orangeVisible;
//   }

//   /**
//    * Clear all portals
//    */
//   clearPortals() {
//     if (this.bluePortalMesh) {
//       this.scene.remove(this.bluePortalMesh);
//       this.bluePortalMesh = null;
//     }
//     if (this.orangePortalMesh) {
//       this.scene.remove(this.orangePortalMesh);
//       this.orangePortalMesh = null;
//     }
//     this.blueActive = false;
//     this.orangeActive = false;
//     console.log('🧹 Portal surfaces cleared');
//   }

//   /**
//    * Check if both portals are active
//    */
//   areBothPortalsActive() {
//     return this.blueActive && this.orangeActive;
//   }

//   /**
//    * Cleanup resources
//    */
//   dispose() {
//     this.blueRenderTarget.dispose();
//     this.orangeRenderTarget.dispose();
//     this.clearPortals();
//   }
// }
// portalRender.js
// Handles rendering the view through portals using render-to-texture
// portalRender.js
// Handles rendering the view through portals using render-to-texture
// Like the Portal game - shows real-time linked view
import * as THREE from 'three';
import { PortalUtils } from './portalUtils.js';

export class PortalRender {
  constructor(scene, mainCamera, portalRadius = 1.0) {
    this.scene = scene;
    this.mainCamera = mainCamera;
    this.portalRadius = portalRadius;

    // High-quality render targets
    const renderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    };

    this.blueRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, renderTargetOptions);
    this.orangeRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, renderTargetOptions);

    // Portal-view cameras
    this.blueLinkCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.orangeLinkCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    // Portal meshes
    this.bluePortalMesh = null;
    this.orangePortalMesh = null;

    this.blueActive = false;
    this.orangeActive = false;
  }

  /**
   * Create blue portal surface
   */
  createBluePortal(position, normal) {
    if (this.bluePortalMesh) {
      this.bluePortalMesh.geometry.dispose();
      this.bluePortalMesh.material.dispose();
      this.scene.remove(this.bluePortalMesh);
      this.bluePortalMesh = null;
    }

    const geometry = new THREE.CircleGeometry(this.portalRadius, 64);
    const material = new THREE.MeshBasicMaterial({
      map: this.orangeRenderTarget.texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    });

    this.bluePortalMesh = new THREE.Mesh(geometry, material);
    this.bluePortalMesh.name = 'bluePortalMesh';
    
    const offset = normal.clone().multiplyScalar(0.01);
    this.bluePortalMesh.position.copy(position).add(offset);
    
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.bluePortalMesh.quaternion.copy(quaternion);

    this.scene.add(this.bluePortalMesh);
    this.blueActive = true;

    console.log('🔵 Blue portal created');
  }

  /**
   * Create orange portal surface
   */
  createOrangePortal(position, normal) {
    if (this.orangePortalMesh) {
      this.orangePortalMesh.geometry.dispose();
      this.orangePortalMesh.material.dispose();
      this.scene.remove(this.orangePortalMesh);
      this.orangePortalMesh = null;
    }

    const geometry = new THREE.CircleGeometry(this.portalRadius, 64);
    const material = new THREE.MeshBasicMaterial({
      map: this.blueRenderTarget.texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    });

    this.orangePortalMesh = new THREE.Mesh(geometry, material);
    this.orangePortalMesh.name = 'orangePortalMesh';
    
    const offset = normal.clone().multiplyScalar(0.01);
    this.orangePortalMesh.position.copy(position).add(offset);
    
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.orangePortalMesh.quaternion.copy(quaternion);

    this.scene.add(this.orangePortalMesh);
    this.orangeActive = true;

    console.log('🟠 Orange portal created');
  }

  /**
   * Update portal camera positions based on player camera
   * This is the core Portal game mechanic!
   */
  updatePortalCameras(playerCamera, bluePortalData, orangePortalData) {
    if (!this.blueActive || !this.orangeActive) return;

    // Camera looking into BLUE portal shows view from ORANGE side
    this._updateLinkedCamera(
      playerCamera,
      bluePortalData,
      orangePortalData,
      this.orangeLinkCamera
    );

    // Camera looking into ORANGE portal shows view from BLUE side
    this._updateLinkedCamera(
      playerCamera,
      orangePortalData,
      bluePortalData,
      this.blueLinkCamera
    );
  }

  /**
   * Transform camera to see through the linked portal
   * This is the magic that makes Portal work!
   */
  _updateLinkedCamera(playerCamera, sourcePortal, destPortal, linkCamera) {
    // Get player position relative to source portal
    const relativePos = new THREE.Vector3()
      .copy(playerCamera.position)
      .sub(sourcePortal.position);

    // Get player look direction
    const playerForward = new THREE.Vector3(0, 0, -1);
    playerForward.applyQuaternion(playerCamera.quaternion);

    // Transform to source portal's local space
    const sourceInverse = sourcePortal.quaternion.clone().invert();
    relativePos.applyQuaternion(sourceInverse);
    playerForward.applyQuaternion(sourceInverse);

    // Mirror across Z axis (portals are mirrors across their plane)
    relativePos.z *= -1;
    playerForward.z *= -1;

    // Transform to destination portal's space
    relativePos.applyQuaternion(destPortal.quaternion);
    playerForward.applyQuaternion(destPortal.quaternion);

    // Set linked camera position
    linkCamera.position.copy(destPortal.position).add(relativePos);

    // Set linked camera to look forward
    const targetPoint = linkCamera.position.clone().add(playerForward);
    linkCamera.lookAt(targetPoint);

    // Match field of view
    linkCamera.fov = playerCamera.fov;
    linkCamera.updateProjectionMatrix();
  }

  /**
   * Render both portal views to textures
   * MUST be called BEFORE main scene render
   */
  renderPortalViews(renderer) {
    if (!this.blueActive || !this.orangeActive) return;

    // Temporarily hide portals to prevent infinite recursion
    const blueVis = this.bluePortalMesh.visible;
    const orangeVis = this.orangePortalMesh.visible;
    this.bluePortalMesh.visible = false;
    this.orangePortalMesh.visible = false;

    // Render blue portal view (from orange side)
    renderer.setRenderTarget(this.blueRenderTarget);
    renderer.setClearColor(0x000000);
    renderer.clear();
    renderer.render(this.scene, this.blueLinkCamera);

    // Render orange portal view (from blue side)
    renderer.setRenderTarget(this.orangeRenderTarget);
    renderer.setClearColor(0x000000);
    renderer.clear();
    renderer.render(this.scene, this.orangeLinkCamera);

    // Return to main render target
    renderer.setRenderTarget(null);

    // Restore portal visibility
    this.bluePortalMesh.visible = blueVis;
    this.orangePortalMesh.visible = orangeVis;
  }

  /**
   * Clear all portals
   */
  clearPortals() {
    if (this.bluePortalMesh) {
      this.bluePortalMesh.geometry.dispose();
      this.bluePortalMesh.material.dispose();
      this.scene.remove(this.bluePortalMesh);
      this.bluePortalMesh = null;
    }
    if (this.orangePortalMesh) {
      this.orangePortalMesh.geometry.dispose();
      this.orangePortalMesh.material.dispose();
      this.scene.remove(this.orangePortalMesh);
      this.orangePortalMesh = null;
    }
    this.blueActive = false;
    this.orangeActive = false;
    console.log('🧹 Portals cleared');
  }

  /**
   * Check if both portals are active
   */
  areBothPortalsActive() {
    return this.blueActive && this.orangeActive;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.blueRenderTarget.dispose();
    this.orangeRenderTarget.dispose();
    this.clearPortals();
  }
}