import { Interactable } from './interactable.js';

export class FloorButton extends Interactable {
    constructor(mesh, door) {
        super(mesh);
        this.door = door;
    }

    onTrigger() {
        this.door.open();
    }
}

export class Door {
    constructor(mesh) {
        this.mesh = mesh;
        this.opened = false;
    }

    open() {
        if (!this.opened) {
            this.opened = true;
            // animate door opening
            this.mesh.position.y += 5;
        }
    }
}
