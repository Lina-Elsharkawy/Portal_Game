// import * as THREE from 'three';

// export class MovingPlatform {
//     /**
//      * @param {THREE.Vector3} startPosition - initial position
//      * @param {THREE.Vector3} endPosition - final position
//      * @param {number} speed - units per second
//      * @param {THREE.Vector3} size - platform dimensions
//      */
//     constructor(startPosition, endPosition, speed = 2, size = new THREE.Vector3(4, 0.5, 4)) {
//         this.start = startPosition.clone();
//         this.end = endPosition.clone();
//         this.speed = speed;
//         this.direction = 1; // 1 = moving to end, -1 = moving to start

//         // Create platform mesh
//         const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
//         const material = new THREE.MeshStandardMaterial({ color: 0x5555ff, metalness: 0.3, roughness: 0.6 });
//         this.mesh = new THREE.Mesh(geometry, material);
//         this.mesh.position.copy(this.start);
//         this.mesh.castShadow = true;
//         this.mesh.receiveShadow = true;

//         // Internal tracking
//         this.currentPosition = this.start.clone();
//         this.previousPosition = this.start.clone();
//     }

//     update(delta) {
//         const current = this.pathPoints[this.currentIndex];
//         const next = this.pathPoints[this.nextIndex];

//         // move toward next point
//         this.direction.subVectors(next, current).normalize();
//         const moveStep = this.direction.clone().multiplyScalar(this.speed * delta);

//         this.mesh.position.add(moveStep);

//         // Check if reached next point
//         if (this.mesh.position.distanceTo(next) < 0.05) {
//             this.currentIndex = this.nextIndex;
//             this.nextIndex = (this.nextIndex + 1) % this.pathPoints.length;
//             this.mesh.position.copy(next); // snap to exact position
//         }

//         this.previousPosition.copy(this.mesh.position);
//     }

//     carryPlayer(player) {
//         const platformTopY = this.mesh.position.y + this.mesh.scale.y / 2;

//         // Check if player's feet are on top of platform
//         if (
//             Math.abs(player.position.y - platformTopY) < 0.1 &&
//             player.position.x > this.mesh.position.x - 1 &&
//             player.position.x < this.mesh.position.x + 1 &&
//             player.position.z > this.mesh.position.z - 1 &&
//             player.position.z < this.mesh.position.z + 1
//         ) {
//             // Move player along with platform's movement
//             const movementDelta = new THREE.Vector3().subVectors(this.mesh.position, this.previousPosition);
//             player.position.add(movementDelta);
//         }
//     }
// }
