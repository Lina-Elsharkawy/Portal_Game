import * as THREE from 'three';

export class PhysicsObject {
    constructor(mesh, mass = 1) {
        this.mesh = mesh;
        this.mass = mass;
        this.velocity = new THREE.Vector3();
    }

    applyForce(force, delta) {
        // F = m * a -> a = F / m
        const acceleration = force.clone().divideScalar(this.mass);
        this.velocity.add(acceleration.multiplyScalar(delta));
    }

    update(delta) {
        // Simple Euler integration
        this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Optional: apply damping
        this.velocity.multiplyScalar(0.9);
    }

    getBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.mesh);
        return box;
    }
}
