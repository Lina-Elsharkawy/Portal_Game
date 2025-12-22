import * as THREE from 'three';

export class CubeButtonRaycaster {
    constructor(maxDistance = 1000, offset = new THREE.Vector3(0, 0, 0)) {
        this.maxDistance = maxDistance;
        this.offset = offset; // relative to camera
        this.raycaster = new THREE.Raycaster();
        this.hitInfo = null;

        // Optional: debug line to see the ray
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3()
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        this.debugRay = new THREE.Line(geometry, material);
    }

    update(camera, interactableObjects) {
        if (!camera) return;

        // Ray origin (camera position + offset)
        const origin = this.offset.clone().applyMatrix4(camera.matrixWorld);

        // Ray direction (camera forward)
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction).normalize();

        // Cast the ray
        this.raycaster.set(origin, direction);
        this.raycaster.far = this.maxDistance;

        const intersects = this.raycaster.intersectObjects(interactableObjects, true);

        // Store hit info
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.hitInfo = {
                object: hit.object,
                point: hit.point.clone(),
                normal: hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
            };
        } else {
            this.hitInfo = null;
        }

        // Update debug line
        const end = this.hitInfo ? this.hitInfo.point : origin.clone().add(direction.clone().multiplyScalar(this.maxDistance));
        this.debugRay.geometry.setFromPoints([origin, end]);
    }
}
