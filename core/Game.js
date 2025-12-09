// core/Game.js

import { createRenderer } from './renderer.js';
import { createCamera, setupControls, updateCameraMovement } from './cameraController.js';
import { LevelOne } from '../scenes/LevelOne.js'; // Will create this next!
import * as THREE from 'three';

export class Game {
    constructor() {
        this.renderer = createRenderer();
        this.camera = createCamera();
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        // Initialize Level/Scene Logic
        this.level = new LevelOne(this.scene);
        
        // Setup the controls logic (View Transformation)
        setupControls(this.camera, this.renderer.domElement);
        
        this.setupWindowResize();
        this.animate();
    }

    setupWindowResize() {
        // Window Resizing Logic (Viewport/Projection Update)
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        const deltaTime = this.clock.getDelta();

        // 1. Update View Transformation (Camera Movement)
        updateCameraMovement(this.camera, deltaTime);
        
        // 2. Physics/Game Logic updates would go here
        // e.g., this.level.update(deltaTime);

        // 3. Scan Conversion / Render
        this.renderer.render(this.scene, this.camera);
    }
}