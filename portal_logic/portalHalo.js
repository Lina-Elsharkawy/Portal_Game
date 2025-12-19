import * as THREE from 'three';

export class PortalHalo {
  constructor(color = 0x0000ff, radius = 1.0, thickness = 0.15) {
    const geometry = new THREE.RingGeometry(radius, radius + thickness, 64);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9, 
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // new: glow effect
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.visible = false;

    // Add inner glow mesh
    const glowGeometry = new THREE.RingGeometry(radius * 0.3, radius * 0.9, 64);
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
    const offset = normal.clone().multiplyScalar(0.02); 
    this.mesh.position.copy(position).add(offset);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    this.mesh.visible = true;
  }
  animate(deltaTime) {
    if (!this.mesh.visible) return;
    this.animationTime += deltaTime;
    const pulse = Math.sin(this.animationTime * 3) * 0.1 + 0.9;
    this.glowMesh.material.opacity = pulse * 0.3;
    this.glowMesh.rotation.z += deltaTime * 0.5;
  }
}
