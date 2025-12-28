import * as THREE from 'three';

export class PortalHalo {
  constructor(color = 0x0000ff, radius = 1.08, thickness = 0.17) {
    // Size chosen between original and previous change: close to the portal mask
    // so there is no visible gap, but still mostly outside the portal opening.
    // STEP 1: Create the "Ring" border around the portal.
    // This uses RingGeometry to create the thin colored border you see on the wall.
    const geometry = new THREE.RingGeometry(radius, radius + thickness, 64);

    // STEP 2: Use AdditiveBlending for a "Glow" effect.
    // This makes the colors look like they are emitting light (simulating a neon effect).
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.visible = false;

    // STEP 3: Add an "Inner Glow" mesh.
    // This fills the area slightly inside the border to make the transition look softer.
    const glowGeometry = new THREE.RingGeometry(radius * 0.32, radius * 0.92, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glowMesh);
    this.animationTime = 0;
    this.baseRadius = radius;
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  setPositionAndOrientation(position, normal) {
    // STEP 4: Tiny offset forward.
    // We push the glow slightly off the wall (0.035 units) so it doesn't flicker against the wall texture.
    const offset = normal.clone().multiplyScalar(0.035);
    this.mesh.position.copy(position).add(offset);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    this.mesh.visible = true;
  }

  animate(deltaTime) {
    // STEP 5: Pulse Animation.
    // This makes the glow "breathe" by changing its opacity over time using a Sine wave.
    if (!this.mesh.visible) return;
    this.animationTime += deltaTime;
    const pulse = Math.sin(this.animationTime * 3) * 0.1 + 0.9;
    this.glowMesh.material.opacity = pulse * 0.3;
    this.glowMesh.rotation.z += deltaTime * 0.5;
  }
}
