import * as THREE from 'three';
import {
    createLabFloorMaterial,
    createLabWallMaterial,
    createCeiling1Material
} from '../textures/materials_TextureMapping.js';
import { FloorButton, Door } from '../physics/interactables.js';


export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const walls = []; // array to hold all wall meshes for collisions

    // --- Floor ---
    const floorSize = 40; // bigger floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), createLabFloorMaterial());
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // --- Walls ---
    const wallHeight = 10;
    const halfSize = floorSize / 2;

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(floorSize, wallHeight, 1), createLabWallMaterial());
    backWall.position.set(0, wallHeight / 2, -halfSize);
    scene.add(backWall);
    walls.push(backWall);

    // Front wall
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(floorSize, wallHeight, 1), createLabWallMaterial());
    frontWall.position.set(0, wallHeight / 2, halfSize);
    scene.add(frontWall);
    walls.push(frontWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, floorSize), createLabWallMaterial());
    leftWall.position.set(-halfSize, wallHeight / 2, 0);
    scene.add(leftWall);
    walls.push(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, floorSize), createLabWallMaterial());
    rightWall.position.set(halfSize, wallHeight / 2, 0);
    scene.add(rightWall);
    walls.push(rightWall);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), createCeiling1Material());
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    scene.add(ceiling);
    walls.push(ceiling); // include ceiling in collisions if desired

    // --- Lights ---
    const ambient = new THREE.AmbientLight(0x666666);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xffffff, 2);
    spot.position.set(halfSize, wallHeight + 5, halfSize);
    spot.castShadow = true;
    scene.add(spot);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-10, 15, 10);
    scene.add(dirLight);

    return { scene, walls }; // return both scene and walls
}
