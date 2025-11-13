/**
 * Base class for all game entities.
 */
export class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.velocity = { x: 0, y: 0 };
    }

    update(deltaTime) {}

    render(ctx) {}

    isActive() {
        return this.active;
    }

    destroy() {
        this.active = false;
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    move() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
