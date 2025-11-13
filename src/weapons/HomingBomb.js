import { Bullet } from './Bullet.js';
import { WEAPONS } from '../config/GameConstants.js';
import { normalizeAngle } from '../utils/MathUtils.js';

/**
 * Heavy explosive that tracks targets.
 */
export class HomingBomb extends Bullet {
    constructor(x, y, angle, target, fromEnemy = false, audioManager = null) {
        super(x, y, fromEnemy, angle, WEAPONS.HOMING_BOMB.SPEED);
        
        this.target = target;
        this.width = WEAPONS.HOMING_BOMB.RADIUS * 2;
        this.height = WEAPONS.HOMING_BOMB.RADIUS * 2;
        this.turnRate = WEAPONS.HOMING_BOMB.TURN_RATE;
        this.damage = WEAPONS.HOMING_BOMB.DAMAGE;
        this.lifetime = WEAPONS.HOMING_BOMB.LIFETIME_FRAMES;
        this.currentLife = this.lifetime;

        if (audioManager) {
            audioManager.playSound('ROCKET_LAUNCH');
        }
    }

    update(canvas, particleManager) {
        this.currentLife--;
        if (this.currentLife <= 0) {
            this.active = false;
            if (particleManager) {
                particleManager.createExplosion(this.x, this.y);
            }
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
        
        ctx.fillStyle = this.fromEnemy ? '#F00' : '#0F0';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.fromEnemy ? '#A00' : '#0A0';
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.width/2);
        ctx.lineTo(-this.width, -this.width);
        ctx.lineTo(-this.width/2, -this.width/2);
        ctx.moveTo(-this.width/2, this.width/2);
        ctx.lineTo(-this.width, this.width);
        ctx.lineTo(-this.width/2, this.width/2);
        ctx.fill();
        
        ctx.restore();
    }
}
