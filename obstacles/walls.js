import * as THREE from 'three';
import { createLabWallMaterial } from '../textures/materials_TextureMapping.js';

export function createWalls(floorSize, wallHeight) {
    const walls = [];
    const halfSize = floorSize / 2;

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(floorSize, wallHeight, 1), createLabWallMaterial());
    backWall.position.set(0, wallHeight / 2, -halfSize);
    backWall.receiveShadow = true;
    walls.push(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(floorSize, wallHeight, 1), createLabWallMaterial());
    frontWall.position.set(0, wallHeight / 2, halfSize);
    frontWall.receiveShadow = true;
    walls.push(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, floorSize), createLabWallMaterial());
    leftWall.position.set(-halfSize, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    walls.push(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, floorSize), createLabWallMaterial());
    rightWall.position.set(halfSize, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    walls.push(rightWall);

    return walls;
}
