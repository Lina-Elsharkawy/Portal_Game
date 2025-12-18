// import * as THREE from 'three';

// export class PortalHalo {
//   constructor(color = 0x0000ff, radius = 0.7, thickness = 0.1) {
//     const geometry = new THREE.RingGeometry(radius, radius + thickness, 64);
//     const material = new THREE.MeshBasicMaterial({
//       color,
//       transparent: true,
//       opacity: 0.8,
//       side: THREE.DoubleSide,
//       depthWrite: false
//     });

//     this.mesh = new THREE.Mesh(geometry, material);
//     this.mesh.rotation.x = -Math.PI / 2; // default orientation
//     this.mesh.visible = false;
//     this.mesh.scale.set(3, 3, 3);       // bigger
//     this.mesh.position.y += 0.05;      // lift slightly
//   }

//   setVisible(visible) {
//     this.mesh.visible = visible;
//   }

//   // setPositionAndOrientation(position, normal) {
//   //   this.mesh.position.copy(position);
//   //   const offset = normal.clone().multiplyScalar(0.01);
    
//   //   // Orient ring perpendicular to surface normal
//   //   const quaternion = new THREE.Quaternion().setFromUnitVectors(
//   //     new THREE.Vector3(0, 1, 0), // default normal of ring
//   //     normal
//   //   );
//   //   this.mesh.quaternion.copy(quaternion);
//   // }
//   setPositionAndOrientation(position, normal) {
//     const offset = normal.clone().multiplyScalar(0.05); // lift above surface
//     this.mesh.position.copy(position).add(offset);

//     const quaternion = new THREE.Quaternion().setFromUnitVectors(
//         new THREE.Vector3(0, 1, 0),
//         normal
//     );
//     this.mesh.quaternion.copy(quaternion);
//     this.mesh.visible = true; // ensure visible
// }

// }
// portalHalo.js
import * as THREE from 'three';

export class PortalHalo {
  constructor(color = 0x0000ff, radius = 1.0, thickness = 0.15) {
    // Create ring geometry
    const geometry = new THREE.RingGeometry(radius, radius + thickness, 64);
    
    // Create glowing material
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending // Makes it glow!
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.visible = false;

    // Add inner glow effect
    const glowGeometry = new THREE.RingGeometry(radius * 0.3, radius * 0.9, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glowMesh);

    // Animation properties
    this.animationTime = 0;
    this.baseRadius = radius;
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  setPositionAndOrientation(position, normal) {
    // Offset portal slightly in front of the wall
    const offset = normal.clone().multiplyScalar(0.02);
    this.mesh.position.copy(position).add(offset);

    // Orient portal perpendicular to the wall normal
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1), // Portal faces forward by default
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    this.mesh.visible = true;
  }

  // Animate the portal (call this in your game loop)
  animate(deltaTime) {
    if (!this.mesh.visible) return;

    this.animationTime += deltaTime;

    // Pulsing glow effect
    const pulse = Math.sin(this.animationTime * 3) * 0.1 + 0.9;
    this.glowMesh.material.opacity = pulse * 0.3;

    // Slight rotation for energy effect
    this.glowMesh.rotation.z += deltaTime * 0.5;
  }
}