import * as THREE from 'three';

export class PlayerController {
  constructor(camera) {
    this.player = new THREE.Object3D();
    this.camera = camera;

    this.camera.position.set(0, 1.6, 0); // eye height
    this.player.add(this.camera);

    this.velocity = new THREE.Vector3();
    this.speed = 5; // units per second
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
}
