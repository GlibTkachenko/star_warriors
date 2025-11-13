import { GameObject } from '../core/GameObject.js';
import { WEAPONS } from '../config/GameConstants.js';

/**
 * Standard projectile that travels in a straight line.
 */
export class Bullet extends GameObject {
    constructor(x, y, fromEnemy = false, angle = 0, speed = WEAPONS.BULLET.SPEED, gameMode = 'normal') {
        super(x, y, WEAPONS.BULLET.WIDTH, WEAPONS.BULLET.HEIGHT);
        
        this.fromEnemy = fromEnemy;
        this.angle = angle;
        this.speed = speed;
        
        this.velocity = {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
        };
        
        // Derek mode massively increases damage
        if (!fromEnemy && gameMode === 'derek') {
            this.damage = 100;
        } else {
            this.damage = WEAPONS.BULLET.DAMAGE;
        }
    }

    update(canvas) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI/2);
        
        ctx.fillStyle = this.fromEnemy ? '#F00' : '#0995FF';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();
    }
}
