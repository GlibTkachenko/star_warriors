import { PARTICLES } from '../config/GameConstants.js';

/**
 * Visual effect for explosions.
 */
export class Particle {
    constructor(x, y, vx, vy, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.alpha = 1.0;
        this.lifetime = PARTICLES.PARTICLE_LIFETIME_FRAMES;
        this.currentLife = this.lifetime;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.currentLife--;
        this.alpha = this.currentLife / this.lifetime;
        
        if (this.currentLife <= 0) {
            this.active = false;
        }
    }

    render(ctx) {
        ctx.fillStyle = `rgba(255, 100, 0, ${this.alpha})`;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }

    isActive() {
        return this.active;
    }
}
