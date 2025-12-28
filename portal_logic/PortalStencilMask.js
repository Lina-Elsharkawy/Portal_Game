import * as THREE from 'three';

export class PortalStencilMask {
  constructor(radius = 1.0, thickness = 0.15) {
    this.radius = radius;

    // Create FILLED geometry for the mask (the "hole" you look through)
    // Radius should be inner radius
    const geometry = new THREE.CircleGeometry(radius, 64);

    // STEP 1: Stencil material - only writes to stencil buffer
    // It is "invisible" (colorWrite: false) but tags pixels on the screen.
    const material = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: false
    });

    // STEP 2: Configure material for stencil writing
    // THREE.AlwaysStencilFunc means "always pass the test"
    // THREE.ReplaceStencilOp means "replace the value in the budget with stencilRef"
    material.stencilWrite = true;
    material.stencilFunc = THREE.AlwaysStencilFunc;
    material.stencilRef = 1;
    material.stencilZPass = THREE.ReplaceStencilOp;

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.renderOrder = -1; // STEP 3: Render BEFORE the portal mesh to "tag" the pixels
  }

  setPositionAndOrientation(position, normal) {
    this.mesh.position.copy(position);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    // Tiny offset forward to avoid z-fighting with the wall
    const offset = normal.clone().multiplyScalar(0.01);
    this.mesh.position.add(offset);
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}