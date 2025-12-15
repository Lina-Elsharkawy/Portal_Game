export class Interactable {
    constructor(mesh) {
        this.mesh = mesh;
        this.active = false;
    }

    // Call this when something interacts with it
    trigger() {
        this.active = true;
        this.onTrigger();
    }

    onTrigger() {
        // override in subclass
    }
}
