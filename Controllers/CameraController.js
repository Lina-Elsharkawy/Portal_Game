import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { KeyboardController } from './keyboardController.js';
import { MouseController } from './MouseController.js';

export class CameraController {
  constructor(camera, scene) {
    this.camera = camera;

    this.player = new PlayerController(camera);
    scene.add(this.player.getObject());

    this.keyboard = new KeyboardController();
    this.mouse = new MouseController(this.player.getObject(), camera);

    this.clock = new THREE.Clock();
  }

  update() {
    const delta = this.clock.getDelta();
    const input = this.keyboard.getDirection();
    const move = this.player.speed * delta;

    if (input.forward) this.player.moveForward(move);
    if (input.backward) this.player.moveForward(-move);
    if (input.left) this.player.moveRight(-move);
    if (input.right) this.player.moveRight(move);
  }

  getPlayer() {
    return this.player.getObject();
  }
}
