import * as THREE from 'three';
import { createLabFloorMaterial, createCeiling1Material } from '../textures/materials_TextureMapping.js';

export function createFloor(floorSize, materialFunction = createLabFloorMaterial) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), materialFunction());
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    return floor;
}

export function createCeiling(floorSize, wallHeight, materialFunction = createCeiling1Material) {
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), materialFunction());
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    ceiling.receiveShadow = true;
    return ceiling;
}
