import { Bullet } from './Bullet.js';
import { WEAPONS } from '../config/GameConstants.js';

/**
 * Slow projectile with gravity effect.
 */
export class Bomb extends Bullet {
    constructor(x, y) {
        super(x, y, true, Math.PI / 2, WEAPONS.BOMB.SPEED);
        
        this.width = WEAPONS.BOMB.RADIUS * 2;
        this.height = WEAPONS.BOMB.RADIUS * 2;
        this.damage = WEAPONS.BOMB.DAMAGE;
        this.gravity = 0.05;
        this.type = 'bomb';
    }

    update(canvas) {
        this.velocity.y += this.gravity;
        this.y += this.velocity.y;
        this.x += this.velocity.x;

        if (this.y > canvas.height || this.x < -this.width || this.x > canvas.width) {
            this.active = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = '#F00';
        ctx.beginPath();
        ctx.arc(this.width/2, this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
