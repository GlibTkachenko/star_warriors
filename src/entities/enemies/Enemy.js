import { GameObject } from '../../core/GameObject.js';
import { ENEMY, VISUAL, WEAPONS } from '../../config/GameConstants.js';
import { clamp, calculatePredictiveAngle, normalizeAngle } from '../../utils/MathUtils.js';

/**
 * Base class for all enemy ships.
 */
export class Enemy extends GameObject {
    constructor(x, y, difficulty, audioManager, bulletManager, player) {
        super(x, y, 20, 20);
        
        this.difficulty = difficulty;
        this.audioManager = audioManager;
        this.bulletManager = bulletManager;
        this.player = player;
        
        this.speed = 2;
        this.dodgeSpeed = ENEMY.DODGE_SPEED;
        this.targetY = Math.random() * 100 + 100;
        this.movementDirection = Math.random() < 0.5 ? -1 : 1;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = Math.random() * 30 + 30;
        
        this.intelligence = Math.random();
        this.rotation = Math.PI / 2;
        this.rotationSmoothing = VISUAL.ROTATION_SMOOTHING;
        this.shootTimer = 0;
        this.specialChance = 0;
        
        this.health = 1;
    }

    update(canvas) {
        if (!this.active) return;

        this.updateMovement(canvas);
        this.updateRotation();
        this.dodgeBullets();

        if (this.y > canvas.height) {
            this.active = false;
        }
    }

    updateMovement(canvas) {
        if (this.y < this.targetY) {
            this.y += this.speed;
        } else {
            this.lastDirectionChange++;
            if (this.lastDirectionChange > this.directionChangeInterval) {
                this.movementDirection *= -1;
                this.lastDirectionChange = 0;
                this.directionChangeInterval = Math.random() * 30 + 30;
            }
            this.x += this.speed * this.movementDirection;
        }

        this.x = clamp(this.x, 0, canvas.width - this.width);
        if (this.x <= 0 || this.x >= canvas.width - this.width) {
            this.movementDirection *= -1;
        }
    }

    updateRotation() {
        if (!this.player || !this.player.active) return;

        const targetAngle = Math.atan2(
            this.player.y + this.player.height / 2 - (this.y + this.height / 2),
            this.player.x + this.player.width / 2 - (this.x + this.width / 2)
        );
        
        let angleDiff = normalizeAngle(targetAngle - this.rotation);
        const maxRotationStep = VISUAL.MAX_ROTATION_STEP;
        this.rotation += Math.max(-maxRotationStep, Math.min(maxRotationStep, angleDiff * this.rotationSmoothing));
        this.rotation = (this.rotation + Math.PI * 2) % (Math.PI * 2);
    }

    dodgeBullets() {
        if (this.intelligence < ENEMY.DODGE_INTELLIGENCE_THRESHOLD) return;
        if (!this.bulletManager) return;

        const bullets = this.bulletManager.getBullets();
        for (let bullet of bullets) {
            if (bullet.fromEnemy) continue;
            
            const dx = bullet.x - this.x;
            const dy = bullet.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ENEMY.DODGE_DISTANCE_THRESHOLD) {
                const approaching = (bullet.velocity.y > 0 && bullet.y < this.y) ||
                                  (bullet.velocity.y < 0 && bullet.y > this.y);
                
                if (approaching) {
                    this.x -= Math.sign(bullet.velocity.x) * this.dodgeSpeed;
                }
            }
        }
    }

    shoot() {
        if (!this.player || !this.player.active || !this.bulletManager) return;

        const bulletSpawnDist = 20;
        const spawnX = this.x + this.width / 2 + Math.cos(this.rotation) * bulletSpawnDist;
        const spawnY = this.y + this.height / 2 + Math.sin(this.rotation) * bulletSpawnDist;

        if (this.specialChance !== undefined && Math.random() < this.specialChance) {
            this.bulletManager.createHomingRocket(spawnX, spawnY, this.player, true);
            return;
        }

        let targetAngle;
        const bulletSpeed = WEAPONS.BULLET.SPEED;

        // Use predictive aiming on hard difficulty
        if (this.difficulty === 'hard' && this.player.velocity && 
            (this.player.velocity.x !== 0 || this.player.velocity.y !== 0)) {
            
            const predictedAngle = calculatePredictiveAngle(
                { x: spawnX, y: spawnY },
                this.player,
                bulletSpeed
            );
            
            targetAngle = predictedAngle || Math.atan2(
                this.player.y + this.player.height / 2 - spawnY,
                this.player.x + this.player.width / 2 - spawnX
            );
        } else {
            targetAngle = Math.atan2(
                this.player.y + this.player.height / 2 - spawnY,
                this.player.x + this.player.width / 2 - spawnX
            );
        }

        this.bulletManager.createBullet(spawnX, spawnY, true, targetAngle, bulletSpeed);

        if (this.audioManager) {
            this.audioManager.playSound('BLASTER_SHOT');
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = '#F00';
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
}
