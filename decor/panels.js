import * as THREE from 'three';
import { createTechPanelMaterial } from '../textures/materials_TextureMapping.js';

export function createTechPanel(scene) {
    const geometry = new THREE.BoxGeometry(1, 0.1, 1);
    const material = createTechPanelMaterial();
    const panel = new THREE.Mesh(geometry, material);
    panel.castShadow = false;
    panel.receiveShadow = false;
    scene.add(panel);
    return panel;
}
