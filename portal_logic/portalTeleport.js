// // // // portalTeleport.js
// // // // Handles player teleportation through portals with momentum preservation
// // // import * as THREE from 'three';
// // // import { PortalUtils } from './portalUtils.js';

// // // export class PortalTeleport {
// // //   constructor(teleportThreshold = 0.5) {
// // //     this.teleportThreshold = teleportThreshold;

// // //     // Track which portal player was near last frame (prevent double teleport)
// // //     this.lastNearPortal = null;

// // //     // Cooldown to prevent rapid back-and-forth teleportation
// // //     this.teleportCooldown = 0;
// // //     this.cooldownDuration = 0.3; // seconds
// // //   }

// // //   /**
// // //    * Update teleport system (call every frame)
// // //    * @param {number} deltaTime - Time since last frame
// // //    */
// // //   update(deltaTime) {
// // //     if (this.teleportCooldown > 0) {
// // //       this.teleportCooldown -= deltaTime;
// // //     }
// // //   }

// // //   /**
// // //    * Check if player should teleport and execute teleportation
// // //    * @param {THREE.Vector3} playerPosition - Current player position
// // //    * @param {THREE.Quaternion} playerRotation - Current player rotation
// // //    * @param {THREE.Vector3} playerVelocity - Current player velocity
// // //    * @param {Object} bluePortalData - {position, normal, quaternion}
// // //    * @param {Object} orangePortalData - {position, normal, quaternion}
// // //    * @returns {Object|null} - Teleport result or null if no teleport
// // //    */
// // //   checkAndTeleport(
// // //     playerPosition,
// // //     playerRotation,
// // //     playerVelocity,
// // //     bluePortalData,
// // //     orangePortalData
// // //   ) {
// // //     // Can't teleport during cooldown
// // //     if (this.teleportCooldown > 0) return null;

// // //     // Check distance to each portal
// // //     const distToBlue = playerPosition.distanceTo(bluePortalData.position);
// // //     const distToOrange = playerPosition.distanceTo(orangePortalData.position);

// // //     // Determine if player is entering a portal
// // //     let enteringPortal = null;
// // //     let exitPortal = null;

// // //     if (distToBlue < this.teleportThreshold && this.lastNearPortal !== 'blue') {
// // //       enteringPortal = bluePortalData;
// // //       exitPortal = orangePortalData;
// // //       this.lastNearPortal = 'blue';
// // //     } else if (distToOrange < this.teleportThreshold && this.lastNearPortal !== 'orange') {
// // //       enteringPortal = orangePortalData;
// // //       exitPortal = bluePortalData;
// // //       this.lastNearPortal = 'orange';
// // //     }

// // //     // Reset lastNearPortal if player is far from both portals
// // //     if (distToBlue > this.teleportThreshold * 2 && distToOrange > this.teleportThreshold * 2) {
// // //       this.lastNearPortal = null;
// // //     }

// // //     // No teleportation needed
// // //     if (!enteringPortal) return null;

// // //     // Execute teleportation
// // //     console.log(`🌀 Teleporting through portal!`);

// // //     const result = this._executeTeleport(
// // //       playerPosition,
// // //       playerRotation,
// // //       playerVelocity,
// // //       enteringPortal,
// // //       exitPortal
// // //     );

// // //     // Start cooldown
// // //     this.teleportCooldown = this.cooldownDuration;

// // //     return result;
// // //   }

// // //   /**
// // //    * Execute the actual teleportation transform
// // //    * Graphics concept: Coordinate system transformation, momentum preservation
// // //    * @private
// // //    */
// // //   _executeTeleport(playerPosition, playerRotation, playerVelocity, sourcePortal, destPortal) {
// // //     // Transform position through portal
// // //     const newPosition = PortalUtils.transformPositionThroughPortal(
// // //       playerPosition,
// // //       sourcePortal,
// // //       destPortal
// // //     );

// // //     // Transform rotation through portal
// // //     const newRotation = PortalUtils.transformRotationThroughPortal(
// // //       playerRotation,
// // //       sourcePortal,
// // //       destPortal
// // //     );

// // //     // Transform velocity through portal (momentum preservation)
// // //     const newVelocity = PortalUtils.transformVectorThroughPortal(
// // //       playerVelocity,
// // //       sourcePortal,
// // //       destPortal
// // //     );

// // //     // Push player slightly out of exit portal to prevent immediate re-entry
// // //     const pushOffset = destPortal.normal.clone().multiplyScalar(0.5);
// // //     newPosition.add(pushOffset);

// // //     return {
// // //       position: newPosition,
// // //       rotation: newRotation,
// // //       velocity: newVelocity,
// // //       exitNormal: destPortal.normal.clone()
// // //     };
// // //   }

// // //   /**
// // //    * Force reset teleport state (useful when portals are moved/cleared)
// // //    */
// // //   reset() {
// // //     this.lastNearPortal = null;
// // //     this.teleportCooldown = 0;
// // //     console.log('🔄 Teleport system reset');
// // //   }

// // //   /**
// // //    * Check if player is near any portal (for effects/sounds)
// // //    * @param {THREE.Vector3} playerPosition
// // //    * @param {Object} bluePortalData
// // //    * @param {Object} orangePortalData
// // //    * @returns {string|null} - 'blue', 'orange', or null
// // //    */
// // //   getNearbyPortal(playerPosition, bluePortalData, orangePortalData) {
// // //     const distToBlue = playerPosition.distanceTo(bluePortalData.position);
// // //     const distToOrange = playerPosition.distanceTo(orangePortalData.position);

// // //     const proximityThreshold = this.teleportThreshold * 1.5;

// // //     if (distToBlue < proximityThreshold) return 'blue';
// // //     if (distToOrange < proximityThreshold) return 'orange';
// // //     return null;
// // //   }
// // // }
// // // portalTeleport.js
// // // Handles player teleportation through portals with momentum preservation
// // import * as THREE from 'three';
// // import { PortalUtils } from './portalUtils.js';

// // export class PortalTeleport {
// //   constructor(teleportThreshold = 1.0) {
// //     this.teleportThreshold = teleportThreshold;

// //     // Track state to prevent rapid re-teleportation
// //     this.teleporting = false; // Currently in teleport animation?
// //     this.lastTeleportPortal = null; // Which portal did we just use? ('blue' or 'orange')
// //     this.teleportCooldown = 0;
// //     this.cooldownDuration = 0.1; // Very short cooldown - just to prevent same-frame double-teleport
// //   }

// //   /**
// //    * Update teleport system (call every frame)
// //    * @param {number} deltaTime - Time since last frame
// //    */
// //   update(deltaTime) {
// //     if (this.teleportCooldown > 0) {
// //       this.teleportCooldown -= deltaTime;
// //     }
// //   }

// //   /**
// //    * Check if player should teleport and execute teleportation
// //    * @param {THREE.Vector3} playerPosition - Current player position
// //    * @param {THREE.Quaternion} playerRotation - Current player rotation
// //    * @param {THREE.Vector3} playerVelocity - Current player velocity
// //    * @param {Object} bluePortalData - {position, normal, quaternion}
// //    * @param {Object} orangePortalData - {position, normal, quaternion}
// //    * @returns {Object|null} - Teleport result or null if no teleport
// //    */
// //   checkAndTeleport(
// //     playerPosition,
// //     playerRotation,
// //     playerVelocity,
// //     bluePortalData,
// //     orangePortalData
// //   ) {
// //     // Can't teleport during cooldown
// //     if (this.teleportCooldown > 0) {
// //       return null;
// //     }

// //     // Check distance to each portal
// //     const distToBlue = playerPosition.distanceTo(bluePortalData.position);
// //     const distToOrange = playerPosition.distanceTo(orangePortalData.position);

// //     // Determine if player is entering a portal
// //     let enteringPortal = null;
// //     let exitPortal = null;
// //     let enteringFromWhich = null;

// //     // Check if player is in front of the portal (not behind it)
// //     const blueInFront = PortalUtils.isInFrontOfPortal(playerPosition, bluePortalData);
// //     const orangeInFront = PortalUtils.isInFrontOfPortal(playerPosition, orangePortalData);

// //     // Debug logging
// //     console.log(`🔍 Blue: dist=${distToBlue.toFixed(2)}, inFront=${blueInFront}, lastPortal=${this.lastTeleportPortal}`);
// //     console.log(`🔍 Orange: dist=${distToOrange.toFixed(2)}, inFront=${orangeInFront}, lastPortal=${this.lastTeleportPortal}`);

// //     // Only teleport if:
// //     // 1. Close enough to portal
// //     // 2. Didn't just teleport from this portal
// //     if (distToBlue < this.teleportThreshold && this.lastTeleportPortal !== 'blue') {
// //       enteringPortal = bluePortalData;
// //       exitPortal = orangePortalData;
// //       enteringFromWhich = 'blue';
// //       console.log('✅ TELEPORTING via blue portal!');
// //     } else if (distToOrange < this.teleportThreshold && this.lastTeleportPortal !== 'orange') {
// //       enteringPortal = orangePortalData;
// //       exitPortal = bluePortalData;
// //       enteringFromWhich = 'orange';
// //       console.log('✅ TELEPORTING via orange portal!');
// //     }

// //     // No teleportation needed
// //     if (!enteringPortal) {
// //       // If player is far from both portals, reset the lock
// //       if (distToBlue > this.teleportThreshold * 2 && distToOrange > this.teleportThreshold * 2) {
// //         this.lastTeleportPortal = null;
// //       }
// //       return null;
// //     }

// //     // Execute teleportation
// //     console.log(`🌀 Teleporting through ${enteringFromWhich} portal!`);

// //     const result = this._executeTeleport(
// //       playerPosition,
// //       playerRotation,
// //       playerVelocity,
// //       enteringPortal,
// //       exitPortal
// //     );

// //     // Track which portal we just used (to prevent immediate re-entry)
// //     this.lastTeleportPortal = enteringFromWhich;

// //     // Start cooldown (very short - just to prevent same-frame issues)
// //     this.teleportCooldown = this.cooldownDuration;

// //     console.log(`⏱️ Cooldown: ${this.cooldownDuration}s`);
// //     console.log(`🔒 Can't re-enter: ${this.lastTeleportPortal}`);

// //     return result;
// //   }

// //   /**
// //    * Execute the actual teleportation transform
// //    * Graphics concept: Coordinate system transformation, momentum preservation
// //    * @private
// //    */
// //   _executeTeleport(playerPosition, playerRotation, playerVelocity, sourcePortal, destPortal) {
// //     // Transform position through portal
// //     const newPosition = PortalUtils.transformPositionThroughPortal(
// //       playerPosition,
// //       sourcePortal,
// //       destPortal
// //     );

// //     // Transform rotation through portal
// //     const newRotation = PortalUtils.transformRotationThroughPortal(
// //       playerRotation,
// //       sourcePortal,
// //       destPortal
// //     );

// //     // Transform velocity through portal (momentum preservation)
// //     const newVelocity = PortalUtils.transformVectorThroughPortal(
// //       playerVelocity,
// //       sourcePortal,
// //       destPortal
// //     );

// //     // Push player out of exit portal to prevent immediate re-entry
// //     const pushOffset = destPortal.normal.clone().multiplyScalar(1.5);
// //     newPosition.add(pushOffset);

// //     // Boost velocity in exit direction
// //     const velocityBoost = destPortal.normal.clone().multiplyScalar(0.3);
// //     newVelocity.add(velocityBoost);

// //     return {
// //       position: newPosition,
// //       rotation: newRotation,
// //       velocity: newVelocity,
// //       exitNormal: destPortal.normal.clone()
// //     };
// //   }

// //   /**
// //    * Force reset teleport state (useful when portals are moved/cleared)
// //    */
// //   reset() {
// //     this.lastTeleportPortal = null;
// //     this.teleportCooldown = 0;
// //     this.teleporting = false;
// //     console.log('🔄 Teleport system reset');
// //   }

// //   /**
// //    * Check if player is near any portal (for effects/sounds)
// //    * @param {THREE.Vector3} playerPosition
// //    * @param {Object} bluePortalData
// //    * @param {Object} orangePortalData
// //    * @returns {string|null} - 'blue', 'orange', or null
// //    */
// //   getNearbyPortal(playerPosition, bluePortalData, orangePortalData) {
// //     const distToBlue = playerPosition.distanceTo(bluePortalData.position);
// //     const distToOrange = playerPosition.distanceTo(orangePortalData.position);

// //     const proximityThreshold = this.teleportThreshold * 1.5;

// //     if (distToBlue < proximityThreshold) return 'blue';
// //     if (distToOrange < proximityThreshold) return 'orange';
// //     return null;
// //   }
// // }
// // portalTeleport.js
// // Handles player teleportation through portals with momentum preservation
// // PortalTeleport.js - Enhanced debug version
// import * as THREE from 'three';
// import { PortalUtils } from './portalUtils.js';

// export class PortalTeleport {
//   constructor(portalRadius = 1.0) {
//     this.portalRadius = portalRadius;

//     // Store last frame distances to detect plane crossing
//     this.lastBluePlaneDist = null;
//     this.lastOrangePlaneDist = null;

//     // Prevent instant re-teleport
//     this.cooldown = 0;
//     this.cooldownTime = 0.15;

//     // Debug
//     this.debugMode = false;
//   }

//   update(deltaTime) {
//     if (this.cooldown > 0) {
//       this.cooldown -= deltaTime;
//     }
//   }

//   checkAndTeleport(
//     playerPosition,
//     playerRotation,
//     playerVelocity,
//     bluePortal,
//     orangePortal
//   ) {
//     if (this.cooldown > 0) {
//       if (this.debugMode) {
//         console.log(`⏱️ Cooldown active: ${this.cooldown.toFixed(2)}s`);
//       }
//       return null;
//     }

//     // Check blue portal crossing
//     const blueResult = this._checkPortalCrossing(
//       playerPosition,
//       playerRotation,
//       playerVelocity,
//       bluePortal,
//       orangePortal,
//       'blue'
//     );
//     if (blueResult) return blueResult;

//     // Check orange portal crossing
//     const orangeResult = this._checkPortalCrossing(
//       playerPosition,
//       playerRotation,
//       playerVelocity,
//       orangePortal,
//       bluePortal,
//       'orange'
//     );
//     if (orangeResult) return orangeResult;

//     return null;
//   }

//   _checkPortalCrossing(
//     playerPosition,
//     playerRotation,
//     playerVelocity,
//     sourcePortal,
//     destPortal,
//     color
//   ) {
//     const planeDist = PortalUtils.distanceToPortalPlane(
//       playerPosition,
//       sourcePortal
//     );

//     const lastDist =
//       color === 'blue'
//         ? this.lastBluePlaneDist
//         : this.lastOrangePlaneDist;

//     // Save distance for next frame
//     if (color === 'blue') {
//       this.lastBluePlaneDist = planeDist;
//     } else {
//       this.lastOrangePlaneDist = planeDist;
//     }

//     // Need previous frame to detect crossing
//     if (lastDist === null) {
//       if (this.debugMode) {
//         console.log(`${color} portal: Initializing (dist: ${planeDist.toFixed(3)})`);
//       }
//       return null;
//     }

//     // Debug every frame when close
//     if (this.debugMode && Math.abs(planeDist) < 2.0) {
//       console.log(`${color} portal check:`, {
//         lastDist: lastDist.toFixed(3),
//         currentDist: planeDist.toFixed(3),
//         crossed: lastDist > 0 && planeDist <= 0
//       });
//     }

//     // Detect FRONT → BACK crossing
//     const crossedPlane = lastDist > 0 && planeDist <= 0;

//     if (!crossedPlane) {
//       return null;
//     }

//     console.log(`🚨 PLANE CROSSED! ${color} portal`);
//     console.log(`  Last distance: ${lastDist.toFixed(3)}`);
//     console.log(`  Current distance: ${planeDist.toFixed(3)}`);

//     // Check if within portal radius (circle)
//     const projected = PortalUtils.projectPointOntoPortal(
//       playerPosition,
//       sourcePortal
//     );
//     const radiusDist = projected.distanceTo(sourcePortal.position);

//     console.log(`  Radius check: ${radiusDist.toFixed(3)} / ${this.portalRadius}`);

//     if (radiusDist > this.portalRadius) {
//       console.log(`  ❌ Outside portal radius - no teleport`);
//       return null;
//     }

//     console.log(`  ✅ Inside portal - TELEPORTING!`);
//     console.log(`🌀 TELEPORT via ${color} portal`);

//     this.cooldown = this.cooldownTime;

//     return this._executeTeleport(
//       playerPosition,
//       playerRotation,
//       playerVelocity,
//       sourcePortal,
//       destPortal
//     );
//   }

//   _executeTeleport(playerPosition, playerRotation, playerVelocity, source, dest) {
//     console.log('📊 Teleport input:', {
//       position: playerPosition,
//       velocity: playerVelocity,
//       speed: playerVelocity.length().toFixed(2) + ' m/s'
//     });

//     const newPosition = PortalUtils.transformPositionThroughPortal(
//       playerPosition,
//       source,
//       dest
//     );

//     const newRotation = PortalUtils.transformRotationThroughPortal(
//       playerRotation,
//       source,
//       dest
//     );

//     const newVelocity = PortalUtils.transformVectorThroughPortal(
//       playerVelocity,
//       source,
//       dest
//     );

//     // Push player out of exit portal to prevent immediate re-trigger
//     // 0.1m is very small, making it feel seamless
//     const pushDistance = 0.1;
//     newPosition.add(dest.normal.clone().multiplyScalar(pushDistance));

//     // Optional: Add a tiny boost in the exit direction to ensure clear exit
//     newVelocity.add(dest.normal.clone().multiplyScalar(0.1));

//     console.log('📊 Teleport output:', {
//       position: newPosition,
//       velocity: newVelocity,
//       speed: newVelocity.length().toFixed(2) + ' m/s'
//     });

//     // Reset distance tracking for both portals
//     this.lastBluePlaneDist = null;
//     this.lastOrangePlaneDist = null;

//     return {
//       position: newPosition,
//       rotation: newRotation,
//       velocity: newVelocity
//     };
//   }

//   reset() {
//     this.lastBluePlaneDist = null;
//     this.lastOrangePlaneDist = null;
//     this.cooldown = 0;
//   }

//   // Toggle debug logging
//   enableDebug() {
//     this.debugMode = true;
//     console.log('🔍 Teleport debug mode enabled');
//   }

//   disableDebug() {
//     this.debugMode = false;
//     console.log('🔍 Teleport debug mode disabled');
//   }
// }
// portalTeleport.js
// Handles player teleportation through portals with momentum preservation
// portalTeleport.js
// Handles player teleportation through portals with momentum preservation
import * as THREE from 'three';
import { PortalUtils } from './portalUtils.js';

export class PortalTeleport {
  constructor(teleportThreshold = 1.0) {
    this.teleportThreshold = teleportThreshold;
    
    // Track state to prevent rapid re-teleportation
    this.teleporting = false; // Currently in teleport animation?
    this.lastTeleportPortal = null; // Which portal did we just use? ('blue' or 'orange')
    this.teleportCooldown = 0;
    this.cooldownDuration = 0.1; // Very short cooldown - just to prevent same-frame double-teleport
  }

  /**
   * Update teleport system (call every frame)
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= deltaTime;
    }
  }

  /**
   * Check if player should teleport and execute teleportation
   * @param {THREE.Vector3} playerPosition - Current player position
   * @param {THREE.Quaternion} playerRotation - Current player rotation
   * @param {THREE.Vector3} playerVelocity - Current player velocity
   * @param {Object} bluePortalData - {position, normal, quaternion}
   * @param {Object} orangePortalData - {position, normal, quaternion}
   * @returns {Object|null} - Teleport result or null if no teleport
   */
  checkAndTeleport(
    playerPosition,
    playerRotation,
    playerVelocity,
    bluePortalData,
    orangePortalData
  ) {
    // Can't teleport during cooldown
    if (this.teleportCooldown > 0) {
      return null;
    }

    // Check distance to each portal
    const distToBlue = playerPosition.distanceTo(bluePortalData.position);
    const distToOrange = playerPosition.distanceTo(orangePortalData.position);

    // Determine if player is entering a portal
    let enteringPortal = null;
    let exitPortal = null;
    let enteringFromWhich = null;

    // Check if player is in front of the portal (not behind it)
    const blueInFront = PortalUtils.isInFrontOfPortal(playerPosition, bluePortalData);
    const orangeInFront = PortalUtils.isInFrontOfPortal(playerPosition, orangePortalData);

    // Debug logging
    console.log(`🔍 Blue: dist=${distToBlue.toFixed(2)}, inFront=${blueInFront}, lastPortal=${this.lastTeleportPortal}`);
    console.log(`🔍 Orange: dist=${distToOrange.toFixed(2)}, inFront=${orangeInFront}, lastPortal=${this.lastTeleportPortal}`);

    // Only teleport if:
    // 1. Close enough to portal
    // 2. Didn't just teleport from this portal
    if (distToBlue < this.teleportThreshold && this.lastTeleportPortal !== 'blue') {
      enteringPortal = bluePortalData;
      exitPortal = orangePortalData;
      enteringFromWhich = 'blue';
      console.log('✅ TELEPORTING via blue portal!');
    } else if (distToOrange < this.teleportThreshold && this.lastTeleportPortal !== 'orange') {
      enteringPortal = orangePortalData;
      exitPortal = bluePortalData;
      enteringFromWhich = 'orange';
      console.log('✅ TELEPORTING via orange portal!');
    }

    // No teleportation needed
    if (!enteringPortal) {
      // If player is far from both portals, reset the lock
      if (distToBlue > this.teleportThreshold * 2 && distToOrange > this.teleportThreshold * 2) {
        this.lastTeleportPortal = null;
      }
      return null;
    }

    // Execute teleportation
    console.log(`🌀 Teleporting through ${enteringFromWhich} portal!`);

    const result = this._executeTeleport(
      playerPosition,
      playerRotation,
      playerVelocity,
      enteringPortal,
      exitPortal
    );

    // Track which portal we just used (to prevent immediate re-entry)
    this.lastTeleportPortal = enteringFromWhich;

    // Start cooldown (very short - just to prevent same-frame issues)
    this.teleportCooldown = this.cooldownDuration;

    console.log(`⏱️ Cooldown: ${this.cooldownDuration}s`);
    console.log(`🔒 Can't re-enter: ${this.lastTeleportPortal}`);

    return result;
  }

  /**
   * Execute the actual teleportation transform
   * Graphics concept: Coordinate system transformation, momentum preservation
   * @private
   */
  _executeTeleport(playerPosition, playerRotation, playerVelocity, sourcePortal, destPortal) {
    // Transform position through portal
    const newPosition = PortalUtils.transformPositionThroughPortal(
      playerPosition,
      sourcePortal,
      destPortal
    );

    // Transform rotation through portal
    const newRotation = PortalUtils.transformRotationThroughPortal(
      playerRotation,
      sourcePortal,
      destPortal
    );

    // Transform velocity through portal (momentum preservation)
    const newVelocity = PortalUtils.transformVectorThroughPortal(
      playerVelocity,
      sourcePortal,
      destPortal
    );

    // Push player out of exit portal to prevent immediate re-entry
    const pushOffset = destPortal.normal.clone().multiplyScalar(1.5);
    newPosition.add(pushOffset);

    // Boost velocity in exit direction
    const velocityBoost = destPortal.normal.clone().multiplyScalar(0.3);
    newVelocity.add(velocityBoost);

    return {
      position: newPosition,
      rotation: newRotation,
      velocity: newVelocity,
      exitNormal: destPortal.normal.clone()
    };
  }

  /**
   * Force reset teleport state (useful when portals are moved/cleared)
   */
  reset() {
    this.lastTeleportPortal = null;
    this.teleportCooldown = 0;
    this.teleporting = false;
    console.log('🔄 Teleport system reset');
  }

  /**
   * Check if player is near any portal (for effects/sounds)
   * @param {THREE.Vector3} playerPosition
   * @param {Object} bluePortalData
   * @param {Object} orangePortalData
   * @returns {string|null} - 'blue', 'orange', or null
   */
  getNearbyPortal(playerPosition, bluePortalData, orangePortalData) {
    const distToBlue = playerPosition.distanceTo(bluePortalData.position);
    const distToOrange = playerPosition.distanceTo(orangePortalData.position);

    const proximityThreshold = this.teleportThreshold * 1.5;

    if (distToBlue < proximityThreshold) return 'blue';
    if (distToOrange < proximityThreshold) return 'orange';
    return null;
  }
}