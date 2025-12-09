import * as THREE from 'three';

// Global variables for movement state
const moveState = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

export function createCamera() {
    // 1. PROJECTION TRANSFORMATION
    // fov: Field of View (vertical)
    // aspect: Aspect Ratio
    // near/far: CLIPPING PLANES (Concepts from your notes!)
    // Anything closer than 0.1 or further than 1000 is clipped/removed.
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, // Near Plane (Clipping)
        1000 // Far Plane (Clipping)
    );

    // Initial View Position
    camera.position.y = 1.6; // Average human height (First Person view)
    
    return camera;
}

export function setupControls(camera, domElement) {
    // 2. VIEW TRANSFORMATION (Input Handling)
    // We are changing the basis vectors of the camera based on input.
    
    // Pointer Lock for FPS Mouse Look
    domElement.addEventListener('click', () => {
        domElement.requestPointerLock();
    });

    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === domElement) {
            // Modify camera rotation (Yaw and Pitch)
            camera.rotation.y -= event.movementX * 0.002;
            camera.rotation.x -= event.movementY * 0.002;
            
            // Clamp vertical look (don't break your neck)
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        }
    });

    // WASD Event Listeners
    document.addEventListener('keydown', (event) => onKeyChange(event, true));
    document.addEventListener('keyup', (event) => onKeyChange(event, false));
}

function onKeyChange(event, isPressed) {
    switch (event.code) {
        case 'KeyW': moveState.forward = isPressed; break;
        case 'KeyS': moveState.backward = isPressed; break;
        case 'KeyA': moveState.left = isPressed; break;
        case 'KeyD': moveState.right = isPressed; break;
    }
}

// Call this inside your Render Loop
export function updateCameraMovement(camera, deltaTime) {
    // Deceleration (friction)
    velocity.x -= velocity.x * 10.0 * deltaTime;
    velocity.z -= velocity.z * 10.0 * deltaTime;

    // Calculate direction based on where camera is facing
    // This is applying the View Transformation logic
    direction.z = Number(moveState.forward) - Number(moveState.backward);
    direction.x = Number(moveState.right) - Number(moveState.left);
    direction.normalize(); // Ensure consistent speed in all directions

    if (moveState.forward || moveState.backward) velocity.z -= direction.z * 400.0 * deltaTime;
    if (moveState.left || moveState.right) velocity.x -= direction.x * 400.0 * deltaTime;

    // Apply movement relative to camera direction
    camera.translateX(-velocity.x * deltaTime);
    camera.translateZ(-velocity.z * deltaTime);
}