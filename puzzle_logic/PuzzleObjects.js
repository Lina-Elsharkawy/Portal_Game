import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createTechPanelMaterial } from '../textures/materials_TextureMapping.js';

export class DraggableCube {
    constructor(scene, position) {
        // Use custom GLB model
        const loader = new GLTFLoader();
        loader.load('./portal_cube.glb', (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.position.copy(position);
            // Check size and scale if needed (Companion cubes are usually decent size)
            this.mesh.scale.set(0.3, 0.3, 0.3);
            this.mesh.castShadow = true;
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.userData.draggable = true; // Mark children for raycaster
                    child.userData.rootParent = this.mesh; // Reference to root
                }
            });

            // Allow physics to work by giving it a user data flag or just keeping reference
            this.mesh.userData.draggable = true;

            scene.add(this.mesh);
        }, undefined, (err) => {
            console.error("Failed to load portal_cube.glb, reverting to box", err);
            // Fallback to Box if model fails
            this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
            this.mesh.position.copy(position);
            scene.add(this.mesh);
        });

        // Placeholder mesh while loading (or if logic depends on 'this.mesh' immediately)
        // We create a dummy Object3D first to avoid errors before load completes? 
        // Better: logic handles 'if (this.mesh)' checks.
        // But for pickup(), we need 'this.mesh'.
        // Let's create a temporary invisible mesh holder.
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ visible: false }));
        this.mesh.position.copy(position);
        this.isHeld = false;
        scene.add(this.mesh);
    }

    pickup(parent) {
        if (!this.mesh) return;
        this.isHeld = true;
        this.originalParent = this.mesh.parent;
        // Attach to camera/parent
        parent.add(this.mesh);
        // Fix Clipping: Hold it further away so it's clearly in front of the gun
        this.mesh.position.set(0.5, -0.3, -2.5);
        this.mesh.rotation.set(0, 0, 0);
    }

    drop(scene) {
        this.isHeld = false;
        // Re-attach to scene with world coordinates
        const worldPos = new THREE.Vector3();
        this.mesh.getWorldPosition(worldPos);

        scene.attach(this.mesh);
        this.mesh.position.copy(worldPos);

        // Simple "snap to floor" physics for now
        if (this.mesh.position.y > 1) {
            this.mesh.position.y = 1;
        }
    }
}

export class FloorButton {
    constructor(scene, position, doorToControl) {
        this.door = doorToControl;
        this.isPressed = false;

        // Load Model
        const loader = new GLTFLoader();
        loader.load('./models/portal_2_-_cube_button.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.position.copy(position);
            this.model.scale.set(0.05, 0.05, 0.05); // Adjust scale based on need
            scene.add(this.model);
        });

        // Trigger Zone (Invisible)
        this.triggerZone = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 0.5),
            new THREE.MeshBasicMaterial({ visible: false, wireframe: true, color: 0xff0000 })
        );
        this.triggerZone.position.copy(position);
        scene.add(this.triggerZone);
    }

    update(cubeMesh) {
        if (!this.model) return;

        // Check distance to cube
        const distance = this.triggerZone.position.distanceTo(cubeMesh.position);

        if (distance < 3) { // Threshold
            if (!this.isPressed) {
                this.isPressed = true;
                this.door.open();
                console.log("Button Pressed!");
            }
        } else {
            if (this.isPressed) {
                this.isPressed = false;
                this.door.close();
                console.log("Button Released!");
            }
        }
    }
}

export class Door {
    constructor(scene, position) {
        this.isOpen = false;

        // Procedural Door using Tech Panel Material
        // Size: Width=12, Height=10, Depth=1 (blocking corridor of width 10)
        this.model = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 1),
            createTechPanelMaterial()
        );

        this.model.position.copy(position);

        // Corridor aligns with X. Door needs to be perpendicular to X (so default Box is fine? No, rotate Y)
        // Wait, default Box(10,10,1) is flat on Z. If corridor is along X, door should be in YZ plane.
        this.model.rotation.y = Math.PI / 2;

        this.model.castShadow = true;
        this.model.receiveShadow = true;
        scene.add(this.model);

        this.closedY = position.y + 5; // Box geometry origin is center. If pos is floor (y=0), center should be y=5.
        // Adjust initial position
        this.model.position.y = this.closedY;

        this.openY = this.closedY + 9; // Slide up 9 units
    }

    open() {
        this.targetY = this.openY;
    }

    close() {
        this.targetY = this.closedY;
    }

    update(deltaTime) {
        if (!this.model || this.targetY === undefined) return;

        // Simple Lerp animation
        this.model.position.y += (this.targetY - this.model.position.y) * 5 * deltaTime;
    }
}
