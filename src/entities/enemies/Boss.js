import { Enemy } from './Enemy.js';
import { ENEMY, WEAPONS } from '../../config/GameConstants.js';
import { calculatePredictiveAngle, clamp } from '../../utils/MathUtils.js';

/**
 * Final boss enemy with multiple attack patterns.
 */
export class Boss extends Enemy {
    constructor(x, y, difficulty, audioManager, bulletManager, player) {
        super(x, y, difficulty, audioManager, bulletManager, player);
        
        const stats = ENEMY.BOSS;
        this.width = stats.WIDTH;
        this.height = stats.HEIGHT;
        this.speed = stats.SPEED;
        this.health = stats.HEALTH;
        this.maxHealth = stats.MAX_HEALTH;
        this.targetY = stats.TARGET_Y;
        
        this.shootTimer = 0;
        this.baseShootInterval = stats.BASE_SHOOT_INTERVAL;
        this.hardModeShootInterval = stats.HARD_SHOOT_INTERVAL;
        
        this.specialAttackTimer = difficulty === 'hard' ? 
            stats.HARD_SPECIAL_ATTACK_TIMER : stats.BASE_SPECIAL_ATTACK_TIMER;
        
        this.gunPositions = [
            { x: -30, y: 20, angle: 0 },
            { x: 30, y: 20, angle: 0 }
        ];
        this.currentGun = 0;
        this.gunSwitchInterval = 10;
        this.gunCounter = 0;
        
        this.attackState = 'normal';
    }

    update(canvas) {
        if (!this.active) return;

        if (this.y < this.targetY) {
            this.y += this.speed;
        } else {
            this.lastDirectionChange++;
            if (this.lastDirectionChange > this.directionChangeInterval) {
                this.movementDirection *= -1;
                this.lastDirectionChange = 0;
                this.directionChangeInterval = Math.random() * 60 + 90;
            }
            this.x += this.speed * this.movementDirection * 1.5;
        }

        this.x = clamp(this.x, 0, canvas.width - this.width);
        if (this.x <= 0 || this.x >= canvas.width - this.width) {
            this.movementDirection *= -1;
        }

        this.updateRotation();
        
        const shootInterval = this.difficulty === 'hard' ? 
            this.hardModeShootInterval : this.baseShootInterval;
        this.shootTimer++;
        if (this.shootTimer >= shootInterval && this.player && this.player.active) {
            this.shoot();
            this.shootTimer = 0;
        }

        this.specialAttackTimer--;
        if (this.specialAttackTimer <= 0 && this.player && this.player.active) {
            this.specialAttack();
            this.specialAttackTimer = this.difficulty === 'hard' ? 
                ENEMY.BOSS.HARD_SPECIAL_ATTACK_TIMER : ENEMY.BOSS.BASE_SPECIAL_ATTACK_TIMER;
        }

        this.gunCounter++;
        if (this.gunCounter >= this.gunSwitchInterval) {
            this.currentGun = (this.currentGun + 1) % this.gunPositions.length;
            this.gunCounter = 0;
        }

        this.updateAttackState();
        this.dodgeBullets();

        if (this.y > canvas.height + this.height) {
            this.active = false;
        }
    }

    updateAttackState() {
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.3) {
            this.attackState = 'desperate';
            this.speed = 1.5;
            this.hardModeShootInterval = 15;
        } else if (healthPercent < 0.6) {
            this.attackState = 'damaged';
            this.speed = 1.2;
        } else {
            this.attackState = 'normal';
            this.speed = 1.0;
        }
    }

    shoot() {
        if (!this.player || !this.player.active || !this.bulletManager) return;

        const gunPos = this.gunPositions[this.currentGun];
        const cosR = Math.cos(this.rotation);
        const sinR = Math.sin(this.rotation);

        const rotatedGunX = gunPos.x * cosR - gunPos.y * sinR;
        const rotatedGunY = gunPos.x * sinR + gunPos.y * cosR;

        const spawnX = this.x + this.width / 2 + rotatedGunX;
        const spawnY = this.y + this.height / 2 + rotatedGunY;

        const bulletSpeed = 25;
        let targetAngle;

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

        targetAngle += gunPos.angle;

        this.bulletManager.createBullet(spawnX, spawnY, true, targetAngle, bulletSpeed);

        if (this.audioManager) {
            this.audioManager.playSound('BLASTER_SHOT');
        }
    }

    specialAttack() {
        if (!this.player || !this.player.active || !this.bulletManager) return;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const bulletSpeed = 18;

        let centerAngle;
        // Use predictive aiming on hard difficulty
        if (this.difficulty === 'hard' && this.player.velocity && 
            (this.player.velocity.x !== 0 || this.player.velocity.y !== 0)) {
            
            const predictedAngle = calculatePredictiveAngle(
                { x: centerX, y: centerY },
                this.player,
                bulletSpeed
            );
            
            centerAngle = predictedAngle || Math.atan2(
                this.player.y + this.player.height / 2 - centerY,
                this.player.x + this.player.width / 2 - centerX
            );
        } else {
            centerAngle = Math.atan2(
                this.player.y + this.player.height / 2 - centerY,
                this.player.x + this.player.width / 2 - centerX
            );
        }

        // Health-based attack intensity
        const bulletCount = this.attackState === 'desperate' ? 12 : 
                          (this.attackState === 'damaged' ? 8 : 5);
        const spreadAngle = this.attackState === 'desperate' ? Math.PI / 2 : 
                          (this.attackState === 'damaged' ? Math.PI / 3 : Math.PI / 4);
        const angleStep = bulletCount > 1 ? spreadAngle / (bulletCount - 1) : 0;
        const startAngle = centerAngle - spreadAngle / 2;

        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + i * angleStep;
            this.bulletManager.createBullet(centerX, centerY, true, angle, bulletSpeed);
        }

        if (this.audioManager) {
            this.audioManager.playSound('ROCKET_LAUNCH');
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateAttackState();
        return this.health <= 0;
    }

    
    // Render boss with health bar
    render(ctx) {
        // Render ship
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = '#800';
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // Boss details
        ctx.fillStyle = '#A00';
        ctx.fillRect(-this.width/4, -this.height/4, this.width/2, this.height/2);
        
        ctx.restore();

        // Health bar
        const barWidth = this.width * 0.8;
        const barHeight = 8;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - barHeight - 5;
        const healthPercent = Math.max(0, this.health / this.maxHealth);

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        if (this.attackState === 'desperate') {
            ctx.fillStyle = '#FF0000';
        } else if (this.attackState === 'damaged') {
            ctx.fillStyle = '#FFA500';
        } else {
            ctx.fillStyle = '#00FF00';
        }
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}
