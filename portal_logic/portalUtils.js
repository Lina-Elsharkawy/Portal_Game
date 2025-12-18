// portalUtils.js
// Mathematical utilities for portal transformations
// Graphics concepts: Linear algebra, coordinate system transforms, quaternions
import * as THREE from 'three';

export class PortalUtils {
  /**
   * Transform a position from one portal to another
   * @param {THREE.Vector3} position - Position to transform
   * @param {Object} sourcePortal - {position, normal, quaternion}
   * @param {Object} destPortal - {position, normal, quaternion}
   * @returns {THREE.Vector3} - Transformed position
   */
  static transformPositionThroughPortal(position, sourcePortal, destPortal) {
    // Step 1: Get position relative to source portal (world → local)
    const relativePos = new THREE.Vector3()
      .copy(position)
      .sub(sourcePortal.position);

    // Step 2: Transform to source portal's local space
    const sourceInverse = sourcePortal.quaternion.clone().invert();
    relativePos.applyQuaternion(sourceInverse);

    // Step 3: Flip Z (portals face opposite directions)
    relativePos.z *= -1;

    // Step 4: Transform to destination portal's local space
    relativePos.applyQuaternion(destPortal.quaternion);

    // Step 5: Add destination portal's world position (local → world)
    const newPosition = relativePos.add(destPortal.position);

    return newPosition;
  }

  /**
   * Transform a rotation from one portal to another
   * @param {THREE.Quaternion} rotation - Rotation to transform
   * @param {Object} sourcePortal - {position, normal, quaternion}
   * @param {Object} destPortal - {position, normal, quaternion}
   * @returns {THREE.Quaternion} - Transformed rotation
   */
  static transformRotationThroughPortal(rotation, sourcePortal, destPortal) {
    // Step 1: Convert to source portal's local space
    const sourceInverse = sourcePortal.quaternion.clone().invert();
    const relativeRotation = sourceInverse.clone().multiply(rotation);

    // Step 2: Apply 180° rotation around Y axis (portals face opposite ways)
    const flip = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      Math.PI
    );
    relativeRotation.multiply(flip);

    // Step 3: Transform to destination portal's world space
    const newRotation = destPortal.quaternion.clone().multiply(relativeRotation);

    return newRotation;
  }

  /**
   * Transform a vector (like velocity) through portal
   * Used for momentum preservation
   * @param {THREE.Vector3} vector - Vector to transform
   * @param {Object} sourcePortal - {position, normal, quaternion}
   * @param {Object} destPortal - {position, normal, quaternion}
   * @returns {THREE.Vector3} - Transformed vector
   */
  static transformVectorThroughPortal(vector, sourcePortal, destPortal) {
    // Clone to avoid modifying original
    const transformedVector = vector.clone();

    // Step 1: Transform to source portal's local space
    const sourceInverse = sourcePortal.quaternion.clone().invert();
    transformedVector.applyQuaternion(sourceInverse);

    // Step 2: Flip Z component (portals face opposite directions)
    transformedVector.z *= -1;

    // Step 3: Transform to destination portal's world space
    transformedVector.applyQuaternion(destPortal.quaternion);

    return transformedVector;
  }

  /**
   * Calculate portal data from position and normal
   * @param {THREE.Vector3} position - Portal position
   * @param {THREE.Vector3} normal - Portal surface normal
   * @returns {Object} - {position, normal, quaternion}
   */
  static createPortalData(position, normal) {
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1), // Default forward
      normal.clone().normalize()
    );

    return {
      position: position.clone(),
      normal: normal.clone().normalize(),
      quaternion: quaternion
    };
  }

  /**
   * Check if a point is in front of a portal
   * @param {THREE.Vector3} point - Point to test
   * @param {Object} portalData - {position, normal}
   * @returns {boolean} - True if point is in front of portal
   */
  static isInFrontOfPortal(point, portalData) {
    const toPoint = new THREE.Vector3()
      .copy(point)
      .sub(portalData.position);
    
    return toPoint.dot(portalData.normal) > 0;
  }

  /**
   * Get the "forward" direction of a portal
   * @param {Object} portalData - {normal, quaternion}
   * @returns {THREE.Vector3} - Forward direction
   */
  static getPortalForward(portalData) {
    return portalData.normal.clone().normalize();
  }

  /**
   * Get the "up" direction of a portal
   * @param {Object} portalData - {quaternion}
   * @returns {THREE.Vector3} - Up direction
   */
  static getPortalUp(portalData) {
    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(portalData.quaternion);
    return up;
  }

  /**
   * Get the "right" direction of a portal
   * @param {Object} portalData - {quaternion}
   * @returns {THREE.Vector3} - Right direction
   */
  static getPortalRight(portalData) {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(portalData.quaternion);
    return right;
  }

  /**
   * Calculate distance from point to portal plane
   * @param {THREE.Vector3} point - Point to test
   * @param {Object} portalData - {position, normal}
   * @returns {number} - Signed distance (positive = in front)
   */
  static distanceToPortalPlane(point, portalData) {
    const toPoint = new THREE.Vector3()
      .copy(point)
      .sub(portalData.position);
    
    return toPoint.dot(portalData.normal);
  }

  /**
   * Project a point onto the portal plane
   * @param {THREE.Vector3} point - Point to project
   * @param {Object} portalData - {position, normal}
   * @returns {THREE.Vector3} - Projected point
   */
  static projectPointOntoPortal(point, portalData) {
    const distance = this.distanceToPortalPlane(point, portalData);
    const offset = portalData.normal.clone().multiplyScalar(distance);
    return point.clone().sub(offset);
  }
}