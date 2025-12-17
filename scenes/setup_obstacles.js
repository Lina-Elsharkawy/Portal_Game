// import * as THREE from 'three';
// import { MovingPlatform } from '../obstacles/movingPlatform.js';

// export function setupObstacles(scene) {
//     const obstacles = [];

//     // Example: moving platform
//     const platformMesh = new THREE.Mesh(
//         new THREE.BoxGeometry(4, 0.5, 4),
//         new THREE.MeshStandardMaterial({ color: 0x5555ff, metalness: 0.3, roughness: 0.6 })
//     );
//     platformMesh.position.set(0, 1, 0);
//     platformMesh.castShadow = true;
//     platformMesh.receiveShadow = true;
//     scene.add(platformMesh);

//     const pathPoints = [
//         new THREE.Vector3(-5, 1, 0),
//         new THREE.Vector3(5, 1, 0),
//     ];

//     const movingPlatform = new MovingPlatform(platformMesh, pathPoints, 2);
//     obstacles.push(movingPlatform);

//     return obstacles;
// }
