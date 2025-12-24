// PortalTeleport.js
import * as THREE from 'three';

export class PortalTeleport {
  /**
   * Handles teleportation between portals
   * @param {THREE.Object3D} player - the player object
   * @param {PortalSystem} portalSystem - your portal system instance
   * @param {CollisionController} collisionController - optional, to skip collisions for 1 frame
   */
  constructor(player, portalSystem, collisionController = null) {
    this.player = player;
    this.portalSystem = portalSystem;
    this.collisionController = collisionController;

    // Better teleport cooldown system
    this.teleportCooldown = 0;
    this.cooldownDuration = 0.5; // half second cooldown
    this.lastTeleportTime = 0;

    // Track which portal we last teleported from to prevent ping-ponging
    this.lastPortalUsed = null;
  }

  update(deltaTime = 0.016) {
    // Update cooldown timer
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= deltaTime;
      return; // Skip teleport check during cooldown
    }

    const bluePortal = this.portalSystem.bluePortalData;
    const orangePortal = this.portalSystem.orangePortalData;

    // Need both portals active
    if (!bluePortal || !orangePortal) return;
    if (!this.portalSystem.bluePortalActive || !this.portalSystem.orangePortalActive) return;

    // Check distance to each portal
    const distToBlue = this.player.position.distanceTo(bluePortal.point);
    const distToOrange = this.player.position.distanceTo(orangePortal.point);

    const teleportRadius = 1.5; // Distance threshold for teleportation

    // Blue → Orange teleport
    if (distToBlue < teleportRadius && this.lastPortalUsed !== 'blue') {
      this.teleportTo(orangePortal, bluePortal, 'blue');
    }
    // Orange → Blue teleport
    else if (distToOrange < teleportRadius && this.lastPortalUsed !== 'orange') {
      this.teleportTo(bluePortal, orangePortal, 'orange');
    }
  }

  teleportTo(destinationPortal, sourcePortal, portalName) {
    // Calculate exit position based on portal normal
    const exitOffset = destinationPortal.normal.clone().multiplyScalar(2);
    const newPosition = destinationPortal.point.clone().add(exitOffset);

    // Set new position
    this.player.position.copy(newPosition);


    //TODO: FIX
    // ... inside teleportTo method ...

    // ---------------------------------------------------------
    // 1. Get Portal Rotations
    // ---------------------------------------------------------
    // We need the full rotation (Quaternion) of the portals, not just normals.
    // The portal data stored by `PortalSystem` includes `object` (the hit object).
    // Use that mesh's quaternion when available.
    const sourceQuat = sourcePortal.object ? sourcePortal.object.quaternion : (sourcePortal.mesh ? sourcePortal.mesh.quaternion : sourcePortal.quaternion);
    const destQuat = destinationPortal.object ? destinationPortal.object.quaternion : (destinationPortal.mesh ? destinationPortal.mesh.quaternion : destinationPortal.quaternion);

    if (!sourceQuat || !destQuat) {
        console.warn("Portal meshes/quaternions missing. Cannot rotate player.");
        return;
    }

    // ---------------------------------------------------------
    // 2. Calculate Relative Rotation
    // ---------------------------------------------------------
    // Formula: Destination * Rotate180 * Inverse(Source)
    // We flip 180 around Y because we are walking INTO the source 
    // but want to walk OUT of the destination.
    const rotation180 = new THREE.Quaternion();
    rotation180.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

    // Calculate the difference: remove source rotation, flip, apply dest rotation
    // Note: Three.js multiplies quaternions in reverse order of operation (Local -> World)
    const relativeRotation = rotation180.clone()
        .multiply(sourceQuat.clone().invert()) // Remove source rotation
        .premultiply(destQuat);               // Add dest rotation

    // ---------------------------------------------------------
    // 3. Apply to Player
    // ---------------------------------------------------------
    // Apply this delta to the player's current rotation
    this.player.quaternion.premultiply(relativeRotation);

    // ---------------------------------------------------------
    // 4. Preserve Momentum (Crucial for "walking through")
    // ---------------------------------------------------------
    // If you don't rotate the velocity, the player will exit facing the new way
    // but continuing to move in the OLD world direction (e.g., sliding sideways).
    if (this.player.velocity) {
        this.player.velocity.applyQuaternion(relativeRotation);
    }

    // ---------------------------------------------------------
    // 5. Fix Camera Snap-Back (The bug you likely faced)
    // ---------------------------------------------------------
    // Many camera controllers (like PointerLockControls) maintain their own 
    // internal Euler state (yaw/pitch). If you only rotate the mesh, the 
    // controller will snap the camera back to the old angle on the next mouse move.
    
    // You must force the camera/controller to accept the new forward vector.
    // This implementation depends on your specific controller, but a generic fix is:
    const camera = this.player.children.find(c => c.isCamera) || this.player.getObjectByProperty('type', 'PerspectiveCamera');
    
    if (camera) {
        // Option A: If using a custom controller on the player
        // Just ensure your controller reads from this.player.quaternion next frame
        
        // Option B: If using standard Three.js PointerLockControls
        // You might need to rotate the camera to match the player if they are decoupled
        // const euler = new THREE.Euler(0,0,0, 'YXZ');
        // euler.setFromQuaternion(this.player.quaternion);
        // camera.rotation.copy(euler); 
    }
    //TODO: END FIX


    // Update previous position to prevent collision glitches
    if (this.collisionController) {
      this.collisionController.player.prevPosition = this.player.position.clone();
    }
    this.player.prevPosition = this.player.position.clone();

    // Set cooldown and track which portal we used
    this.teleportCooldown = this.cooldownDuration;
    this.lastPortalUsed = portalName;

    // Clear the last portal after a bit longer to allow re-entry from same side
    setTimeout(() => {
      if (this.lastPortalUsed === portalName) {
        this.lastPortalUsed = null;
      }
    }, this.cooldownDuration * 1000 + 200);

  }
}
