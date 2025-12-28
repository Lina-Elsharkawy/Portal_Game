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

    // STEP 1: Calculate the source portal's coordinate system (where it is and where it faces)
    const sourceMatrix = new THREE.Matrix4();
    const sourceQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      sourcePortal.normal
    );
    sourceMatrix.compose(sourcePortal.point, sourceQuat, new THREE.Vector3(1, 1, 1));

    // STEP 2: Calculate the destination portal's coordinate system
    const destMatrix = new THREE.Matrix4();
    const destQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      destPortal.normal
    );
    destMatrix.compose(destPortal.point, destQuat, new THREE.Vector3(1, 1, 1));

    // STEP 3: Create a "Rotation Matrix" (180 degrees) because we want to look 
    // OUT of the second portal in the opposite direction we entered the first.
    const rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI);
    const inverseSource = new THREE.Matrix4().copy(sourceMatrix).invert();

    // STEP 4: Combine them into a "Relative Transform Matrix"
    // This matrix "teleports" any point in front of Portal A to the same relative point in front of Portal B
    const portalRecurseMatrix = new THREE.Matrix4()
      .multiply(destMatrix)
      .multiply(rotationMatrix)
      .multiply(inverseSource);

    // STEP 5: Apply this matrix to the player camera's world position
    // This moves our "virtual camera" to where it should be looking out from the destination portal
    this.camera.matrixAutoUpdate = false;
    this.camera.matrixWorld.copy(portalRecurseMatrix).multiply(playerCamera.matrixWorld);
    this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert();

    // 3. Update Intrinsics (in case main camera changed)
    this.camera.fov = playerCamera.fov;
    this.camera.aspect = playerCamera.aspect;
    this.camera.near = playerCamera.near;
    this.camera.far = playerCamera.far;
    this.camera.updateProjectionMatrix();

    // STEP 6: "Oblique Near Plane Clipping" (A bit advanced)
    // We want to cut off any 3D models that are sitting BETWEEN our virtual camera 
    // and the destination portal (like the wall the portal is on).
    // This ensures only the scene "inside" the portal is rendered.
    const clipPlane = new THREE.Plane();
    const normal = destPortal.normal.clone();
    const point = destPortal.point.clone();

    // Transform the destination portal's plane into the virtual camera's space
    clipPlane.setFromNormalAndCoplanarPoint(normal, point);
    clipPlane.applyMatrix4(this.camera.matrixWorldInverse);

    // Call the helper to modify the camera's projection matrix
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