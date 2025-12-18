// import * as THREE from 'three';
// import { PlayerController } from './PlayerController.js';
// import { KeyboardController } from './keyboardController.js';
// import { MouseController } from './MouseController.js';
// import { CollisionController } from './collisionController.js';

// export class CameraController {
//   constructor(camera, scene, walls) {
//     this.camera = camera;
//     this.player = new PlayerController(camera);
//     scene.add(this.player.getObject());

//     this.keyboard = new KeyboardController();
//     this.mouse = new MouseController(this.player.getObject(), camera);

//     this.collision = new CollisionController(this.player.getObject(), walls);
//     this.player.getObject().prevPosition = this.player.getObject().position.clone();

//     this.clock = new THREE.Clock();
//   }

//   update() {
//     const delta = this.clock.getDelta();
//     const input = this.keyboard.getDirection();
//     const move = this.player.speed * delta;

//     this.player.getObject().prevPosition = this.player.getObject().position.clone();

//     // --- Movement ---
//     if (input.forward) this.player.moveForward(move);
//     if (input.backward) this.player.moveForward(-move);
//     if (input.left) this.player.moveRight(-move);
//     if (input.right) this.player.moveRight(move);

//     // --- Jump ---
//     if (this.keyboard.keys['Space']) {
//       this.player.jump();
//     }

//     // --- Gravity & vertical movement ---
//     this.player.update(delta);

//     // --- Collision check ---
//     this.collision.update();
//   }

//   getPlayer() {
//     return this.player.getObject();
//   }
// }
// CameraController.js
// CameraController.js
import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { KeyboardController } from './keyboardController.js';
import { MouseController } from './MouseController.js';
import { CollisionController } from './collisionController.js';

export class CameraController {
  constructor(camera, scene, walls) {
    this.camera = camera;
    this.scene = scene;
    this.player = new PlayerController(camera);
    scene.add(this.player.getObject());

    this.keyboard = new KeyboardController();
    this.mouse = new MouseController(this.player.getObject(), camera);

    this.collision = new CollisionController(this.player.getObject(), walls);
    this.player.getObject().prevPosition = this.player.getObject().position.clone();

    this.clock = new THREE.Clock();
  }

  /**
   * Register portal meshes with collision system
   * Call this from main.js after portals are placed
   */
  registerPortalForCollision(portalMesh) {
    this.collision.registerPortalMesh(portalMesh);
  }

  /**
   * Clear portals from collision
   */
  clearPortalsFromCollision() {
    this.collision.clearPortals();
  }

  update() {
    const delta = this.clock.getDelta();
    const input = this.keyboard.getDirection();
    const move = this.player.speed * delta;

    this.player.getObject().prevPosition = this.player.getObject().position.clone();

    // --- Movement ---
    if (input.forward) this.player.moveForward(move);
    if (input.backward) this.player.moveForward(-move);
    if (input.left) this.player.moveRight(-move);
    if (input.right) this.player.moveRight(move);

    // --- Jump ---
    if (this.keyboard.keys['Space']) {
      this.player.jump();
    }

    // --- Gravity & vertical movement ---
    this.player.update(delta);

    // --- Collision check ---
    this.collision.update();
  }

  getPlayer() {
    return this.player.getObject();
  }

  /**
   * Get player velocity for teleportation
   */
  getVelocity() {
    if (this.player && this.player.velocity) {
      return this.player.velocity.clone();
    }
    return new THREE.Vector3();
  }

  /**
   * Set player velocity (used after teleportation)
   */
  setVelocity(velocity) {
    if (this.player && this.player.velocity) {
      this.player.velocity.copy(velocity);
      console.log('📊 Velocity updated after teleport:', velocity);
    }
  }

  /**
   * Get the actual player controller for advanced operations
   */
  getPlayerController() {
    return this.player;
  }
}