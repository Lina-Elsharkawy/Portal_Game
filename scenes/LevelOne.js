import * as THREE from 'three';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020); 

    // --- Floor ---
    const floorTexture = new THREE.TextureLoader().load('./textures/lab_floor.jpg');
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMaterial); // bigger floor
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // --- Walls ---
    const wallTexture = new THREE.TextureLoader().load('./textures/lab_wall.jpg');
    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 0.5), wallMaterial);
    backWall.position.set(0, 4, -10);
    scene.add(backWall);

    // Front wall
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 0.5), wallMaterial);
    frontWall.position.set(0, 4, 10);
    scene.add(frontWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8, 20), wallMaterial);
    leftWall.position.set(-10, 4, 0);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8, 20), wallMaterial);
    rightWall.position.set(10, 4, 0);
    scene.add(rightWall);

    // Ceiling
    const ceilingTexture = new THREE.TextureLoader().load('./textures/ceiling.jpg'); // can use same wall texture
    const ceilingMaterial = new THREE.MeshStandardMaterial({ map: ceilingTexture });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 8; // top of room
    scene.add(ceiling);

    // --- Lights ---
    const ambient = new THREE.AmbientLight(0x555555); 
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xffffff, 1);
    spot.position.set(10, 15, 10);
    spot.castShadow = true;
    scene.add(spot);

    return scene;
}
