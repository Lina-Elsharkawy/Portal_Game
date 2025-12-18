// import * as THREE from 'three';

// export class CollisionController {
//   constructor(player, walls) {
//     this.player = player;       // THREE.Object3D of the player
//     this.walls = walls;         // Array of THREE.Mesh walls

//     // Precompute bounding boxes for walls
//     this.wallBoxes = this.walls.map(wall => {
//       const box = new THREE.Box3().setFromObject(wall);
//       return box;
//     });

//     // Player collision box size
//     this.playerBox = new THREE.Box3();
//   }

//   update() {
//     // Update player bounding box
//     this.playerBox.setFromCenterAndSize(
//       this.player.position,
//       new THREE.Vector3(1, 3, 1) // width, height, depth of player
//     );

//     // Check collision with each wall
//     for (let wallBox of this.wallBoxes) {
//       if (this.playerBox.intersectsBox(wallBox)) {
//         // Simple collision response: stop the player
//         // Could be improved with sliding along wall
//         this.player.position.sub(this.player.position.clone().sub(this.player.prevPosition));
//         break;
//       }
//     }

//     // Store current position for next frame
//     this.player.prevPosition = this.player.position.clone();
//   }
// }
// collisionController.js
// collisionController.js
import * as THREE from 'three';

export class CollisionController {
  constructor(player, walls) {
    this.player = player;       // THREE.Object3D of the player
    this.walls = walls;         // Array of THREE.Mesh walls
    this.portalMeshes = [];     // Will store portal meshes to exclude

    // Precompute bounding boxes for walls (excluding portals)
    this.wallBoxes = this.walls
      .filter(wall => !this.isPortalMesh(wall))
      .map(wall => {
        const box = new THREE.Box3().setFromObject(wall);
        return box;
      });

    // Player collision box size
    this.playerBox = new THREE.Box3();
  }

  /**
   * Check if a mesh is a portal
   * Portals are circular meshes with specific material properties
   */
  isPortalMesh(mesh) {
    if (!mesh.geometry) return false;
    
    // Check if it's a CircleGeometry (portals use this)
    if (mesh.geometry instanceof THREE.CircleGeometry) {
      return true;
    }
    
    // Check by name if set
    if (mesh.name && (mesh.name.includes('portal') || mesh.name.includes('Portal'))) {
      return true;
    }
    
    // Check if it has a map material (render target texture)
    if (mesh.material && mesh.material.map && mesh.material.map.isWebGLRenderTarget) {
      return true;
    }

    return false;
  }

  /**
   * Register portal meshes to exclude from collision
   * Call this after portals are created
   */
  registerPortalMesh(mesh) {
    if (!this.portalMeshes.includes(mesh)) {
      this.portalMeshes.push(mesh);
    }
  }

  /**
   * Clear registered portals (when portals are cleared)
   */
  clearPortals() {
    this.portalMeshes = [];
  }

  update() {
    // Update player bounding box
    this.playerBox.setFromCenterAndSize(
      this.player.position,
      new THREE.Vector3(1, 3, 1) // width, height, depth of player
    );

    // Check collision with each wall (excluding portals)
    for (let i = 0; i < this.walls.length; i++) {
      const wall = this.walls[i];

      // Skip portals
      if (this.isPortalMesh(wall) || this.portalMeshes.includes(wall)) {
        continue;
      }

      // Update wall box
      const wallBox = new THREE.Box3().setFromObject(wall);

      if (this.playerBox.intersectsBox(wallBox)) {
        // Simple collision response: revert to previous position
        this.player.position.copy(this.player.prevPosition);
        break;
      }
    }

    // Store current position for next frame
    this.player.prevPosition = this.player.position.clone();
  }
}