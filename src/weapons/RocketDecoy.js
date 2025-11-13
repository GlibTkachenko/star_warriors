import { Bullet } from './Bullet.js';
import { WEAPONS } from '../config/GameConstants.js';

/**
 * Attracts enemy homing projectiles.
 */
export class RocketDecoy extends Bullet {
    constructor(x, y, angle) {
        super(x, y, false, angle, WEAPONS.DECOY.SPEED);
        
        this.width = WEAPONS.DECOY.WIDTH;
        this.height = WEAPONS.DECOY.HEIGHT;
        this.lifetime = WEAPONS.DECOY.LIFETIME_FRAMES;
        this.currentLife = this.lifetime;
        this.attractRadius = 150;
    }

    update(canvas, bullets) {
        this.currentLife--;
        if (this.currentLife <= 0) {
            this.active = false;
            return;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (bullets) {
            bullets.forEach(bullet => {
                if (bullet.fromEnemy && bullet.target && (bullet.constructor.name === 'HomingRocket' || bullet.constructor.name === 'HomingBomb')) {
                    const dx = this.x - bullet.x;
                    const dy = this.y - bullet.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < this.attractRadius) {
                        bullet.target = this;
                    }
                }
            });
        }

        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = '#88F';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        const pulseAlpha = 0.3 + 0.3 * Math.sin(this.currentLife / 10);
        ctx.strokeStyle = `rgba(136, 136, 255, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2 + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}
