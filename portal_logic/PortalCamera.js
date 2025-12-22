import * as THREE from 'three';

export class PortalCamera {
  constructor(mainCamera) {
    this.camera = mainCamera.clone(); // Clone to keep intrinsics
    this.mainCamera = mainCamera;
  }

  /**
   * Update camera position, orientation, and projection matrix
   */
  updateFromPortals(playerCamera, sourcePortal, destPortal) {
    if (!sourcePortal || !destPortal) return;

    // 1. Calculate Relative Transform Matrix (Source -> Destination)
    // Destination Normal is inverted because we look OUT of it
    const sourceMatrix = new THREE.Matrix4();
    const sourceQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      sourcePortal.normal
    );
    sourceMatrix.compose(sourcePortal.point, sourceQuat, new THREE.Vector3(1, 1, 1));

    // We want to enter source opposite to normal, and exit destination matching normal
    // But mathematically, standard "180 degree rotation" logic applies
    const destMatrix = new THREE.Matrix4();
    const destQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      destPortal.normal
    );
    destMatrix.compose(destPortal.point, destQuat, new THREE.Vector3(1, 1, 1));

    // Transform: Dest * Rotation(PI_Y) * Inverse(Source)
    // This maps points relative to Source to points relative to Dest, with 180 flip
    const rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI);
    const inverseSource = new THREE.Matrix4().copy(sourceMatrix).invert();

    // Full Transform Matrix
    const portalRecurseMatrix = new THREE.Matrix4()
      .multiply(destMatrix)
      .multiply(rotationMatrix)
      .multiply(inverseSource);

    // 2. Set Virtual Camera Position/Rotation
    // Instead of decomposed lookAt, we apply the matrix to the player camera's world matrix
    this.camera.matrixAutoUpdate = false;
    this.camera.matrixWorld.copy(portalRecurseMatrix).multiply(playerCamera.matrixWorld);
    this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert();

    // 3. Update Intrinsics (in case main camera changed)
    this.camera.fov = playerCamera.fov;
    this.camera.aspect = playerCamera.aspect;
    this.camera.near = playerCamera.near;
    this.camera.far = playerCamera.far;
    this.camera.updateProjectionMatrix();

    // 4. Oblique Near Plane Clipping
    // We need the destination portal plane in Camera Space
    // Plane: Normal pointing OUT of portal (into the room we are rendering) -> destPortal.normal
    // Point: destPortal.point
    // BUT we need it in the Virtual Camera's View Space.

    // Helper to get plane in camera space
    const clipPlane = new THREE.Plane();
    const normal = destPortal.normal.clone();
    const point = destPortal.point.clone();

    // Transform plane to camera space
    // Plane equation: Nx*x + Ny*y + Nz*z + d = 0
    // d = -dot(Normal, Point)
    clipPlane.setFromNormalAndCoplanarPoint(normal, point);
    clipPlane.applyMatrix4(this.camera.matrixWorldInverse);

    // Check if camera is behind plane (shouldn't happen with standard logic but good safety)
    // Modify projection matrix (Oblique Frustum)
    this.makeObliqueProjection(this.camera.projectionMatrix, clipPlane);
  }

  // http://www.terathon.com/code/oblique.html
  makeObliqueProjection(projectionMatrix, clipPlane) {
    const normal = new THREE.Vector4(clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant);
    const clipPlaneVector = new THREE.Vector4();

    const q = new THREE.Vector4();
    q.x = ((normal.x >= 0.0 ? 1.0 : -1.0) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
    q.y = ((normal.y >= 0.0 ? 1.0 : -1.0) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
    q.z = -1.0;
    q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

    const dot = normal.dot(q);
    const c = new THREE.Vector4();

    // Calculate scaling factor c
    c.x = normal.x * (2.0 / dot);
    c.y = normal.y * (2.0 / dot);
    c.z = normal.z * (2.0 / dot);
    c.w = normal.w * (2.0 / dot);

    // Replace near plane (3rd row)
    projectionMatrix.elements[2] = c.x;
    projectionMatrix.elements[6] = c.y;
    projectionMatrix.elements[10] = c.z + 1.0;
    projectionMatrix.elements[14] = c.w;
  }
}