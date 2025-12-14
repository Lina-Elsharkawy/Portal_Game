export class KeyboardController {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.code] = true);
    window.addEventListener('keyup', e => this.keys[e.code] = false);
  }

  getDirection() {
    return {
      forward: this.keys['KeyW'],
      backward: this.keys['KeyS'],
      left: this.keys['KeyA'],
      right: this.keys['KeyD']
    };
  }
}
