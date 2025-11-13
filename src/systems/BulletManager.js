import { Bullet, HomingRocket, Bomb, HomingBomb, RocketDecoy } from '../weapons/index.js';

/**
 * Factory and lifecycle manager for all projectiles.
 */
export class BulletManager {
    constructor(audioManager, gameMode = 'normal') {
        this.bullets = [];
        this.audioManager = audioManager;
        this.gameMode = gameMode;
    }

    createBullet(x, y, fromEnemy, angle, speed) {
        const bullet = new Bullet(x, y, fromEnemy, angle, speed, this.gameMode);
        this.bullets.push(bullet);
        return bullet;
    }

    createHomingRocket(x, y, target, fromEnemy) {
        const rocket = new HomingRocket(x, y, target, fromEnemy, this.audioManager);
        this.bullets.push(rocket);
        return rocket;
    }

    createBomb(x, y) {
        const bomb = new Bomb(x, y);
        this.bullets.push(bomb);
        return bomb;
    }

    createHomingBomb(x, y, angle, target, fromEnemy) {
        const bomb = new HomingBomb(x, y, angle, target, fromEnemy, this.audioManager);
        this.bullets.push(bomb);
        return bomb;
    }

    createRocketDecoy(x, y, angle) {
        const decoy = new RocketDecoy(x, y, angle);
        this.bullets.push(decoy);
        return decoy;
    }

    update(canvas) {
        this.bullets = this.bullets.filter(bullet => {
            if (!bullet) return false;
            
            try {
                // Decoys need bullet array to attract homing projectiles
                if (bullet.constructor.name === 'RocketDecoy') {
                    bullet.update(canvas, this.bullets);
                } else {
                    bullet.update(canvas);
                }
                return bullet.isActive();
            } catch (e) {
                console.error('Bullet update error:', e);
                return false;
            }
        });
    }

    render(ctx) {
        this.bullets.forEach(bullet => {
            if (bullet && bullet.active) {
                try {
                    bullet.render(ctx);
                } catch (e) {
                    console.error('Bullet render error:', e);
                }
            }
        });
    }

    getBullets() {
        return this.bullets;
    }

    /**
     * Clear all bullets
     */
    clear() {
        this.bullets = [];
    }

    /**
     * Set game mode (for Derek mode damage)
     */
    setGameMode(gameMode) {
        this.gameMode = gameMode;
    }
}
