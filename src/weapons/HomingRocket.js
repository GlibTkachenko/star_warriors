import { Bullet } from './Bullet.js';
import { WEAPONS } from '../config/GameConstants.js';
import { normalizeAngle } from '../utils/MathUtils.js';

/**
 * Projectile that tracks and follows a target.
 */
export class HomingRocket extends Bullet {
    constructor(x, y, target, fromEnemy = false, audioManager = null) {
        super(x, y, fromEnemy, 0, WEAPONS.HOMING_ROCKET.SPEED);
        
        this.target = target;
        this.width = WEAPONS.HOMING_ROCKET.WIDTH;
        this.height = WEAPONS.HOMING_ROCKET.HEIGHT;
        this.turnRate = WEAPONS.HOMING_ROCKET.TURN_RATE;
        this.damage = WEAPONS.HOMING_ROCKET.DAMAGE;
        this.lifetime = WEAPONS.HOMING_ROCKET.LIFETIME_FRAMES;
        this.currentLife = this.lifetime;

        if (audioManager) {
            audioManager.playSound('ROCKET_LAUNCH');
        }
    }

    update(canvas) {
        this.currentLife--;
        if (this.currentLife <= 0) {
            this.active = false;
            return;
        }

        if (!this.target || !this.target.active) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        } else {
            const dx = this.target.x + this.target.width/2 - this.x;
            const dy = this.target.y + this.target.height/2 - this.y;
            const targetAngle = Math.atan2(dy, dx);
            
            let angleDiff = normalizeAngle(targetAngle - this.angle);
            this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnRate);
            
            // Trigger enemy dodge behavior
            if (!this.fromEnemy && this.target.dodgeProjectile) {
                this.target.dodgeProjectile(this);
            }

            this.velocity.x = Math.cos(this.angle) * this.speed;
            this.velocity.y = Math.sin(this.angle) * this.speed;
            
            this.x += this.velocity.x;
            this.y += this.velocity.y;
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
        
        ctx.fillStyle = this.fromEnemy ? '#FF0' : '#F90';
        ctx.beginPath();
        ctx.moveTo(this.height/2, 0);
        ctx.lineTo(-this.height/2, -this.width/2);
        ctx.lineTo(-this.height/2, this.width/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = this.fromEnemy ? 'rgba(255, 255, 0, 0.5)' : 'rgba(255, 100, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-this.height/2, -this.width/4);
        ctx.lineTo(-this.height, 0);
        ctx.lineTo(-this.height/2, this.width/4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}
