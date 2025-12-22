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
