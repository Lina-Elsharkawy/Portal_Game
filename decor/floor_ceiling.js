import * as THREE from 'three';
import { createLabFloorMaterial, createCeiling1Material } from '../textures/materials_TextureMapping.js';

export function createFloor(floorSize) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), createLabFloorMaterial());
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    return floor;
}

export function createCeiling(floorSize, wallHeight) {
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), createCeiling1Material());
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    ceiling.receiveShadow = true;
    return ceiling;
}
