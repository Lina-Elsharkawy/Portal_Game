import * as THREE from 'three';

export function createMetalFloorMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/metal_floor.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return new THREE.MeshStandardMaterial({
        map: texture
    });

} 

export function createLabFloorMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/lab_floor.jpg');
    const normal = new THREE.TextureLoader().load('./textures/lab_floor_normal.jpg');

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
     normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(4, 4);
    return new THREE.MeshStandardMaterial({ map: texture,
        normalMap: normal,
        roughness: 0.6 });
}

export function createFloorMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/floor.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // repeat texture on large surfaces
    return new THREE.MeshStandardMaterial({ map: texture });
}

export function createConcreteWallMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/concrete_wall.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture });
}

export function createMetalWallMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/metal_wall.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture });
}

export function createLabWallMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/lab_wall.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture });
}

export function createCeiling1Material() {
    const texture = new THREE.TextureLoader().load('./textures/ceiling.jpg');
    return new THREE.MeshStandardMaterial({ map: texture });
}

export function createCeiling2Material() {
    const texture = new THREE.TextureLoader().load('./textures/ceiling2.jpg');
    return new THREE.MeshStandardMaterial({ map: texture });
}

export function createTechPanelMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/tech_panel.jpg');
    return new THREE.MeshStandardMaterial({ map: texture });
}