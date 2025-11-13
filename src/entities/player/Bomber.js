import { Player } from './Player.js';
import { PLAYER } from '../../config/GameConstants.js';

/**
 * Heavy ship with dual bomb launchers and maximum shields.
 */
export class Bomber extends Player {
    constructor(x, y, gameMode, audioManager) {
        super(x, y, gameMode, audioManager, PLAYER.BOMBER);
        
        this.baseShootCooldown = 15;
        this.bombLaunches = PLAYER.BOMBER.ROCKETS;
        this.maxBombLaunches = PLAYER.BOMBER.MAX_ROCKETS;
        this.bombCooldown = 0;
        this.bombLaunchDelay = PLAYER.BOMBER.ROCKET_COOLDOWN_FRAMES;
        this.bombRechargeTime = PLAYER.BOMBER.ROCKET_RECHARGE_TIME;
        this.bombRechargeTimer = 0;
        this.targetingMode = 1;
    }

    update(keys, canvas, deltaTime, mousePressed) {
        super.update(keys, canvas, deltaTime);

        if (this.bombCooldown > 0) {
            this.bombCooldown--;
        }

        if (keys['1']) this.targetingMode = 1;
        if (keys['2']) this.targetingMode = 2;

        if (mousePressed && !this.isOverheated && this.bombCooldown <= 0) {
            if (this.gameMode === 'cheat' || this.bombLaunches > 0) {
                this.fireBombs();
                if (this.gameMode !== 'cheat') {
                    this.bombLaunches--;
                }
                this.bombCooldown = this.bombLaunchDelay;
            }
        }

        if (this.gameMode !== 'cheat' && this.bombLaunches < this.maxBombLaunches) {
            this.bombRechargeTimer++;
            if (this.bombRechargeTimer >= this.bombRechargeTime) {
                this.bombLaunches++;
                this.bombRechargeTimer = 0;
            }
        } else if (this.gameMode === 'cheat') {
            this.bombLaunches = this.maxBombLaunches;
        }
    }

    findTargets() {
        if (!this.enemyManager) return [];
        
        const enemies = this.enemyManager.getActiveEnemies();
        if (enemies.length === 0) return [];

        const sorted = enemies.sort((a, b) => {
            const distA = Math.hypot(a.x - this.x, a.y - this.y);
            const distB = Math.hypot(b.x - this.x, b.y - this.y);
            return distA - distB;
        });

        return sorted.slice(0, this.targetingMode);
    }

    fireBombs() {
        if (!this.bulletManager) return;

        const targets = this.findTargets();
        if (targets.length === 0) return;
        
        if (this.targetingMode === 1 && targets.length > 0) {
            const target = targets[0];
            const angle = Math.atan2(target.y - this.y, target.x - this.x);

            this.bulletManager.createHomingBomb(
                this.x + this.width/2,
                this.y + this.height/2,
                angle - 0.1,
                target,
                false
            );
            
            // Second bomb after delay
            setTimeout(() => {
                if (this.active && target.active) {
                    this.bulletManager.createHomingBomb(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        angle + 0.1,
                        target,
                        false
                    );
                }
            }, 200);
        } else if (this.targetingMode === 2 && targets.length >= 2) {
            // Split between two targets
            targets.slice(0, 2).forEach(target => {
                const angle = Math.atan2(target.y - this.y, target.x - this.x);
                this.bulletManager.createHomingBomb(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    angle,
                    target,
                    false
                );
            });
        } else {
            // Fallback to single target
            const target = targets[0];
            const angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.bulletManager.createHomingBomb(
                this.x + this.width/2,
                this.y + this.height/2,
                angle,
                target,
                false
            );
        }
    }

    /**
     * Fire a bullet
     */
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

    render(ctx) {
        super.render(ctx);

        // Show targeting mode
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Mode: ${this.targetingMode}`, this.x, this.y - 10);

        if (this.gameMode === 'normal' && this.gameMode !== 'cheat') {
            const bombWidth = 6;
            const bombSpacing = 2;
            const bombY = this.y + this.height + 40;
            
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.fillText('Launches:', this.x, bombY);
            for (let i = 0; i < this.maxBombLaunches; i++) {
                ctx.fillStyle = i < this.bombLaunches ? '#F00' : '#444';
                ctx.fillRect(
                    this.x + 80 + i * (bombWidth + bombSpacing),
                    bombY - 8,
                    bombWidth,
                    8
                );
            }
        }
    }
}
