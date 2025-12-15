import * as THREE from 'three';

export class PlayerController {
  constructor(camera) {
    this.player = new THREE.Object3D();
    this.camera = camera;
    this.camera.position.set(0, 1.6, 0);
    this.player.add(this.camera);

    this.velocity = new THREE.Vector3();
    this.speed = 5;
    this.jumpStrength = 8;
    this.gravity = -20;
    this.onGround = false;
  }

  getObject() {
    return this.player;
  }

  moveForward(distance) {
    this.player.translateZ(-distance);
  }

  moveRight(distance) {
    this.player.translateX(distance);
  }

  jump() {
    if (this.onGround) {
      this.velocity.y = this.jumpStrength;
      this.onGround = false;
    }
  }

  update(delta) {
    // Apply gravity
    this.velocity.y += this.gravity * delta;

    // Update vertical position
    this.player.position.y += this.velocity.y * delta;

    // Simple floor collision
    if (this.player.position.y < 1.6) {
      this.player.position.y = 1.6;
      this.velocity.y = 0;
      this.onGround = true;
    }
  }
}
