import { Enemy } from './Enemy.js';
import { ENEMY } from '../../config/GameConstants.js';

/**
 * Fast enemy with low health.
 */
export class EnemyLightInterceptor extends Enemy {
    constructor(x, y, difficulty, audioManager, bulletManager, player) {
        super(x, y, difficulty, audioManager, bulletManager, player);
        
        const stats = ENEMY.LIGHT_INTERCEPTOR;
        this.width = stats.WIDTH;
        this.height = stats.HEIGHT;
        this.speed = stats.SPEED;
        this.health = stats.HEALTH;
        this.damage = stats.DAMAGE;
        this.intelligence = stats.INTELLIGENCE_MIN + Math.random() * (stats.INTELLIGENCE_MAX - stats.INTELLIGENCE_MIN);
        
        this.shootTimer = Math.random() * 60;
        this.baseShootInterval = stats.BASE_SHOOT_INTERVAL;
        this.hardModeShootInterval = stats.HARD_SHOOT_INTERVAL;
        
        this.specialChance = difficulty === 'hard' ? stats.SPECIAL_CHANCE_HARD : stats.SPECIAL_CHANCE_EASY;
    }

    update(canvas) {
        super.update(canvas);
        if (!this.active) return;

        const shootInterval = this.difficulty === 'hard' ? 
            this.hardModeShootInterval : this.baseShootInterval;
        
        this.shootTimer++;
        if (this.shootTimer >= shootInterval && this.player && this.player.active) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = '#F55';
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = "#0F0";
        ctx.fillRect(-this.width/2, -this.height/2 - 5, this.width * (this.health / 1), 2);
        
        ctx.restore();
    }
}

/**
 * Medium enemy with shields.
 */
export class EnemyInterceptor extends Enemy {
    constructor(x, y, difficulty, audioManager, bulletManager, player) {
        super(x, y, difficulty, audioManager, bulletManager, player);
        
        const stats = ENEMY.INTERCEPTOR;
        this.width = stats.WIDTH;
        this.height = stats.HEIGHT;
        this.speed = stats.SPEED;
        this.health = stats.HEALTH;
        this.shields = stats.SHIELDS;
        this.maxShields = stats.MAX_SHIELDS;
        this.damage = stats.DAMAGE;
        this.intelligence = stats.INTELLIGENCE_MIN + Math.random() * (stats.INTELLIGENCE_MAX - stats.INTELLIGENCE_MIN);
        
        this.shootTimer = Math.random() * 120;
        this.baseShootInterval = stats.BASE_SHOOT_INTERVAL;
        this.hardModeShootInterval = stats.HARD_SHOOT_INTERVAL;
        
        this.specialChance = difficulty === 'hard' ? stats.SPECIAL_CHANCE_HARD : stats.SPECIAL_CHANCE_EASY;
    }

    update(canvas) {
        super.update(canvas);
        if (!this.active) return;

        const shootInterval = this.difficulty === 'hard' ? 
            this.hardModeShootInterval : this.baseShootInterval;
        
        this.shootTimer++;
        if (this.shootTimer >= shootInterval && this.player && this.player.active) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    takeDamage(damage) {
        if (this.shields > 0) {
            this.shields--;
            return false;
        }
        this.health -= damage;
        return this.health <= 0;
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
        
        if (this.shields > 0) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.width/2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.fillStyle = "#0F0";
        ctx.fillRect(-this.width/2, -this.height/2 - 5, this.width * (this.health / 2), 2);
        
        ctx.restore();
    }
}

/**
 * Heavy, slow enemy that drops bombs.
 */
export class EnemyBomber extends Enemy {
    constructor(x, y, difficulty, audioManager, bulletManager, player) {
        super(x, y, difficulty, audioManager, bulletManager, player);
        
        const stats = ENEMY.BOMBER;
        this.width = stats.WIDTH;
        this.height = stats.HEIGHT;
        this.speed = stats.SPEED;
        this.health = stats.HEALTH;
        this.shields = stats.SHIELDS;
        this.damage = stats.DAMAGE;
        this.intelligence = stats.INTELLIGENCE_MIN + Math.random() * (stats.INTELLIGENCE_MAX - stats.INTELLIGENCE_MIN);
        
        this.shootTimer = Math.random() * 180;
        this.baseShootInterval = stats.BASE_SHOOT_INTERVAL;
        this.hardModeShootInterval = stats.HARD_SHOOT_INTERVAL;
        
        this.baseBombCooldown = stats.BASE_BOMB_COOLDOWN_MIN + Math.random() * stats.BASE_BOMB_COOLDOWN_RANGE;
        this.hardModeBombCooldown = stats.HARD_BOMB_COOLDOWN_MIN + Math.random() * stats.HARD_BOMB_COOLDOWN_RANGE;
        this.bombCooldown = difficulty === 'hard' ? this.hardModeBombCooldown : this.baseBombCooldown;
        this.bombTimer = this.bombCooldown;
        this.hasBombs = true;
        
        this.specialChance = difficulty === 'hard' ? stats.SPECIAL_CHANCE_HARD : stats.SPECIAL_CHANCE_EASY;
    }

    update(canvas) {
        super.update(canvas);
        if (!this.active) return;

        const shootInterval = this.difficulty === 'hard' ? 
            this.hardModeShootInterval : this.baseShootInterval;
        
        this.shootTimer++;
        if (this.shootTimer >= shootInterval && this.player && this.player.active) {
            this.shoot();
            this.shootTimer = 0;
        }

        if (this.hasBombs && this.player && this.player.active) {
            this.bombTimer--;
            if (this.bombTimer <= 0) {
                this.dropBomb();
                this.bombCooldown = this.difficulty === 'hard' ?
                    (ENEMY.BOMBER.HARD_BOMB_COOLDOWN_MIN + Math.random() * ENEMY.BOMBER.HARD_BOMB_COOLDOWN_RANGE) :
                    (ENEMY.BOMBER.BASE_BOMB_COOLDOWN_MIN + Math.random() * ENEMY.BOMBER.BASE_BOMB_COOLDOWN_RANGE);
                this.bombTimer = this.bombCooldown;
            }
        }
    }

    dropBomb() {
        if (!this.active || !this.bulletManager) return;

        // Calculate angle toward player
        const angle = Math.atan2(
            this.player.y - this.y,
            this.player.x - this.x
        );

        this.bulletManager.createHomingBomb(
            this.x + this.width / 2,
            this.y + this.height / 2,
            angle,
            this.player,
            true,
            this.audioManager
        );
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = '#A00';
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#700';
        ctx.beginPath();
        ctx.arc(this.width/4, 0, this.width/6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#0F0";
        ctx.fillRect(-this.width/2, -this.height/2 - 5, this.width * (this.health / 4), 2);
        
        ctx.restore();
    }
}
