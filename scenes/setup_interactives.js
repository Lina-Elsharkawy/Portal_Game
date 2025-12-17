// import { FloorButton, Door } from '../physics/interactables.js';
// import * as THREE from 'three';

// export function setupInteractives(scene) {
//     const interactives = [];

//     // Example: door in the scene
//     const doorMesh = new THREE.Mesh(
//         new THREE.BoxGeometry(2, 5, 0.2),
//         new THREE.MeshStandardMaterial({ color: 0x555555 })
//     );
//     doorMesh.position.set(0, 2.5, -15);
//     doorMesh.castShadow = true;
//     scene.add(doorMesh);
//     const door = new Door(doorMesh);
//     interactives.push(door);

//     // Button linked to door
//     const buttonMesh = new THREE.Mesh(
//         new THREE.BoxGeometry(1, 0.2, 1),
//         new THREE.MeshStandardMaterial({ color: 0xff0000 })
//     );
//     buttonMesh.position.set(5, 0.1, -15);
//     scene.add(buttonMesh);
//     const button = new FloorButton(buttonMesh, door);
//     interactives.push(button);

//     return interactives;
// }
