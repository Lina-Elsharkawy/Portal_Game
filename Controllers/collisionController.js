import * as THREE from 'three';

export class CollisionController {
  constructor(player, walls, dynamicObjects = []) {
    this.player = player;       // THREE.Object3D of the player
    this.walls = walls;         // Array of THREE.Mesh walls
    this.dynamicObjects = dynamicObjects; // Array of moving meshes

    // Player collision box size
    this.playerBox = new THREE.Box3();
  }

  update() {
    // Update player bounding box - smaller to avoid false collisions
    const playerSize = new THREE.Vector3(0.7, 1.7, 0.7);
    this.playerBox.setFromCenterAndSize(
      this.player.position,
      playerSize
    );

    // Check collision with each wall - RECOMPUTE boxes dynamically each frame
    for (let wall of this.walls) {
      const wallBox = new THREE.Box3().setFromObject(wall);
      if (this.playerBox.intersectsBox(wallBox)) {
        this.handleCollision();
        return; // Exit immediately
      }
    }

    // Check dynamic objects (recompute box every frame)
    for (let obj of this.dynamicObjects) {
      const box = new THREE.Box3().setFromObject(obj);
      if (this.playerBox.intersectsBox(box)) {
        this.handleCollision();
        return; // Exit immediately
      }
    }
  }

  handleCollision() {
    // Undo movement by restoring to previous position
    const diff = new THREE.Vector3().subVectors(
      this.player.position,
      this.player.prevPosition
    );
    
    // Only undo if player moved into collision
    if (diff.length() > 0.001) {
      this.player.position.copy(this.player.prevPosition);
    }
  }
}
