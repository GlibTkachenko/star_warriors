import { Player } from './Player.js';
import { PLAYER } from '../../config/GameConstants.js';

/**
 * Fast, nimble ship with limited special weapons.
 */
export class LightInterceptor extends Player {
    constructor(x, y, gameMode, audioManager) {
        super(x, y, gameMode, audioManager, PLAYER.LIGHT_INTERCEPTOR);
        
        this.baseShootCooldown = 7;
        this.rocketRechargeTime = PLAYER.LIGHT_INTERCEPTOR.ROCKET_RECHARGE_TIME;
        this.rocketRechargeTimer = 0;
    }

    update(keys, canvas, deltaTime, mousePressed) {
        super.update(keys, canvas, deltaTime);

        if (mousePressed) {
            if (this.gameMode === 'cheat' || this.rockets > 0) {
                this.fireRocket();
                if (this.gameMode !== 'cheat') {
                    this.rockets--;
                }
            }
        }

        if (this.gameMode !== 'cheat' && this.rockets < this.maxRockets && this.rocketRechargeTime > 0) {
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
        if (!this.bulletManager) return;
        if (this.gameMode === 'cheat' || (this.currentDecoys > 0 && this.decoyCooldownTimer <= 0)) {
            this.bulletManager.createRocketDecoy(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.rotation
            );

            if (this.gameMode !== 'cheat') {
                this.currentDecoys--;
                this.decoyCooldownTimer = 60;

                for (let i = 0; i < this.maxDecoys; i++) {
                    if (this.decoyRefreshTimers[i] === 0 && i >= this.currentDecoys) {
                        this.decoyRefreshTimers[i] = 180;
                        break;
                    }
                }
            }
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
            ctx.fillText('Rocket:', this.x, rocketY);
            ctx.fillStyle = this.rockets > 0 ? '#F90' : '#444';
            ctx.fillRect(
                this.x + 60,
                rocketY - 8,
                8,
                8
            );
        }
    }
}
