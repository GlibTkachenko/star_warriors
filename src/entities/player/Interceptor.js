import { Player } from './Player.js';
import { PLAYER } from '../../config/GameConstants.js';

/**
 * Balanced ship with multiple rockets and shields.
 */
export class Interceptor extends Player {
    constructor(x, y, gameMode, audioManager) {
        super(x, y, gameMode, audioManager, PLAYER.INTERCEPTOR);
        
        this.baseShootCooldown = 12;
        this.rocketLaunchDelay = PLAYER.INTERCEPTOR.ROCKET_COOLDOWN_FRAMES;
        this.rocketRechargeTime = PLAYER.INTERCEPTOR.ROCKET_RECHARGE_TIME;
        this.rocketRechargeTimer = 0;
    }

    update(keys, canvas, deltaTime, mousePressed) {
        super.update(keys, canvas, deltaTime);

        if (this.rocketCooldown > 0) {
            this.rocketCooldown--;
        }

        if (mousePressed && !this.isOverheated && this.rocketCooldown <= 0) {
            if (this.gameMode === 'cheat' || this.rockets > 0) {
                this.fireRocket();
                if (this.gameMode !== 'cheat') {
                    this.rockets--;
                }
                this.rocketCooldown = this.rocketLaunchDelay;
            }
        }

        if (this.gameMode !== 'cheat' && this.rockets < this.maxRockets) {
            this.rocketRechargeTimer++;
            if (this.rocketRechargeTimer >= this.rocketRechargeTime) {
                this.rockets++;
                this.rocketRechargeTimer = 0;
            }
        } else if (this.gameMode === 'cheat') {
            this.rockets = this.maxRockets;
        }
    }

    fireRocket() {
        if (!this.enemyManager || !this.bulletManager) return;

        const closestEnemy = this.enemyManager.getClosestEnemy(this.x, this.y);
        if (closestEnemy) {
            this.bulletManager.createHomingRocket(
                this.x + this.width/2,
                this.y + this.height/2,
                closestEnemy,
                false
            );
        }
    }

    shoot() {
        if (!this.bulletManager) return;

        const bulletSpawnDist = 30;
        const bulletX = this.x + this.width/2 + Math.cos(this.rotation) * bulletSpawnDist;
        const bulletY = this.y + this.height/2 + Math.sin(this.rotation) * bulletSpawnDist;
        
        this.bulletManager.createBullet(bulletX, bulletY, false, this.rotation);
        
        if (this.audioManager) {
            this.audioManager.playSound('BLASTER_SHOT');
        }

        this.shootCooldown = this.baseShootCooldown;
        
        if (this.gameMode !== 'cheat') {
            this.currentAmmo--;
            if (this.currentAmmo <= 0) {
                this.isOverheated = true;
                setTimeout(() => {
                    this.isOverheated = false;
                    this.currentAmmo = this.maxAmmo;
                }, 2000);
            }
        }
    }

    deployDecoy() {
        if (this.decoys > 0 && this.world.frameCount - this.lastDecoyTime >= 60) {
            const decoy = new RocketDecoy(this.x, this.y);
            this.world.addEntity(decoy);
            this.decoys--;
            this.lastDecoyTime = this.world.frameCount;
            this.decoyRechargeStartTime = this.world.frameCount;
        }
    }

    /**
     * Render - add rocket indicator
     */
    render(ctx) {
        super.render(ctx);

        if (this.gameMode === 'normal' && this.gameMode !== 'cheat') {
            const rocketY = this.y + this.height + 40;
            
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Rockets:', this.x, rocketY);
            for (let i = 0; i < this.maxRockets; i++) {
                ctx.fillStyle = i < this.rockets ? '#F90' : '#444';
                ctx.fillRect(
                    this.x + 60 + i * 12,
                    rocketY - 8,
                    8,
                    8
                );
            }
        }
    }
}
