/**
 * Centralized keyboard and mouse input handling.
 */
export class InputManager {
    constructor(canvas) {
        this.keys = {};
        this.mousePressed = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas = canvas;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.mousePressed = true;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.mousePressed = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    isMousePressed() {
        return this.mousePressed;
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    getKeys() {
        return this.keys;
    }

    reset() {
        this.keys = {};
        this.mousePressed = false;
    }

    destroy() {}
}
