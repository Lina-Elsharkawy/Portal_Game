export class MouseController {
  constructor(player, camera) {
    this.player = player;
    this.camera = camera;

    this.pitch = 0;
    this.sensitivity = 0.002;

    document.body.addEventListener('click', () => {
      document.body.requestPointerLock();
    });

    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement !== document.body) return;

      this.player.rotation.y -= e.movementX * this.sensitivity;

      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      this.camera.rotation.x = this.pitch;
    });
  }
}
