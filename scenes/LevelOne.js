// scenes/LevelOne.js

import * as THREE from 'three';

export class LevelOne {
    constructor(scene) {
        this.scene = scene;
        this.buildEnvironment();
    }

    buildEnvironment() {
        // --- 1. LIGHTING SETUP (L) ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(5, 10, 5);
        pointLight.castShadow = true; 
        this.scene.add(pointLight);

        // --- 2. MODEL TRANSFORMATION (M) ---
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Cube
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(boxGeometry, boxMaterial);
        cube.position.set(0, 0.5, -5); 
        cube.castShadow = true;
        this.scene.add(cube);
    }
    
    // You can add an update method here for complex level logic
    update(deltaTime) {
        // Logic for moving platforms or doors
    }
}