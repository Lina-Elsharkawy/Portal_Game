import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class PlayerController {
    constructor(camera, domElement) {
        this.player = new THREE.Object3D();
        this.camera = camera;
        
        // Camera head height
        this.camera.position.set(0, 1.6, 0);
        this.player.add(this.camera);
        
        // Physics
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 8; // Slightly faster for better feel
        this.jumpStrength = 10;
        this.gravity = -30; // Stronger gravity for snappy jumps
        this.onGround = false;
        
        // Floor Detection
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 2);
        this.floorMeshes = []; // We will fill this from Main

        // Gun setup
        this.gunLoaded = false;
        this.loadGun();
    }

    setFloorMeshes(meshes) {
        this.floorMeshes = meshes;
    }

    loadGun() {
        const loader = new GLTFLoader();
        loader.load('/models/laser_gun.glb', gltf => {
            this.gun = gltf.scene;
            this.gun.scale.set(0.05, 0.05, 0.05);
            this.gun.position.set(0.2, -0.3, -1.2);
            this.gun.rotation.y = Math.PI / 2;
            this.gun.traverse(child => {
                if (child.isMesh) {
                    child.material.metalness = 1.0;
                    child.material.roughness = 0.2;
                    child.castShadow = true;
                }
            });
            this.camera.add(this.gun);
            this.gunLoaded = true;
        }, undefined, error => { console.error('GLTF failed:', error); });
    }

    getObject() { return this.player; }

    moveForward(distance) { this.player.translateZ(-distance); }
    moveRight(distance) { this.player.translateX(distance); }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
        }
    }

    update(delta) {
        // 1. Apply Gravity
        this.velocity.y += this.gravity * delta;

        // 2. Calculate potential movement
        const moveY = this.velocity.y * delta;

        // 3. Robust Ground Detection
        // Raycast from player center (Y+1) downwards
        const rayOrigin = this.player.position.clone();
        rayOrigin.y += 1.0; 
        
        this.raycaster.ray.origin.copy(rayOrigin);

        // Ray length = Distance to feet (1.0) + Lookahead for falling
        // If we are falling fast, we look further down to catch the floor early
        const lookAhead = Math.max(0, -moveY) + 0.2; 
        this.raycaster.far = 1.0 + lookAhead;

        const intersections = this.raycaster.intersectObjects(this.floorMeshes, false);
        
        this.onGround = false;

        if (intersections.length > 0) {
            const hit = intersections[0];
            
            // If we hit the floor AND we are moving down (or standing still)
            if (this.velocity.y <= 0) {
                // Snap to floor position immediately
                // hit.point.y is the top of the floor mesh
                this.player.position.y = hit.point.y; 
                this.velocity.y = Math.max(0, this.velocity.y);
                this.onGround = true;
                return; // Stop processing falling logic
            }
        }

        // 4. If no floor hit, apply the movement
        this.player.position.y += moveY;

        // Fallback: Safety net if you fall below the world
        if (this.player.position.y < -50) {
            // Respawn logic handled in main, but we can stop velocity here
            this.velocity.y = 0;
        }
    }
}
