import * as THREE from 'three';

export function createMetalFloorMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/metal_floor.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return new THREE.MeshStandardMaterial({
         map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0
    });

} 

export function createLabFloorMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/lab_floor.jpg');
    const normal = new THREE.TextureLoader().load('./textures/lab_floor_normal.jpg');

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
     normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(4, 4);
    return new THREE.MeshStandardMaterial({  map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0, normalMap: normal });
}

export function createFloorMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/floor.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // repeat texture on large surfaces
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}

export function createConcreteWallMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/concrete_wall.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}

export function createMetalWallMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/metal_wall.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}

export function createLabWallMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/lab_wall.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}

export function createCeiling1Material() {
    const texture = new THREE.TextureLoader().load('./textures/ceiling.jpg');
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}

export function createCeiling2Material() {
    const texture = new THREE.TextureLoader().load('./textures/ceiling2.jpg');
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}

export function createTechPanelMaterial() {
    const texture = new THREE.TextureLoader().load('./textures/tech_panel.jpg');
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, metalness: 0.2 , envMapIntensity: 1.0});
}