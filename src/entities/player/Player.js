import { GameObject } from '../../core/GameObject.js';
import { PLAYER } from '../../config/GameConstants.js';
import { clamp } from '../../utils/MathUtils.js';

/**
 * Base class for all player ships.
 */
export class Player extends GameObject {
    constructor(x, y, gameMode, audioManager, stats) {
        super(x, y, stats.WIDTH, stats.HEIGHT);
        
        this.gameMode = gameMode;
        this.audioManager = audioManager;
        this.stats = stats;
        
        this.speed = stats.SPEED;
        this.drag = 0.97;
        this.rotation = -Math.PI / 2;
        this.rotationSpeed = 0.07;
        
        this.maxHealth = gameMode === 'derek' ? PLAYER.DEREK_HEALTH : stats.HEALTH;
        this.health = this.maxHealth;
        this.shields = gameMode === 'derek' ? 0 : stats.SHIELDS;
        this.maxShields = gameMode === 'derek' ? 0 : stats.MAX_SHIELDS;
        
        this.maxAmmo = stats.MAX_AMMO;
        this.currentAmmo = this.maxAmmo;
        this.isOverheated = false;
        this.shootCooldown = 0;
        this.baseShootCooldown = 10;
        this.rechargeTimer = 0;
        this.rechargeInterval = 30;
        
        this.rockets = stats.ROCKETS;
        this.maxRockets = stats.MAX_ROCKETS;
        this.rocketCooldown = 0;
        this.rocketRechargeTimer = 0;
        
        this.maxDecoys = stats.DECOYS;
        this.currentDecoys = this.maxDecoys;
        this.decoyCooldownTimer = 0;
        this.decoyRefreshTimers = new Array(this.maxDecoys).fill(0);
        
        this.lastRepairTime = Date.now();
        this.repairInterval = 3000;
        
        this.shieldRechargeTime = 600;
        this.shieldRechargeTimer = 0;
    }

    takeDamage(damage) {
        if (this.gameMode === 'cheat') {
            return false;
        }
        
        if (this.shields > 0) {
            this.shields--;
            return false;
        }
        
        this.health = Math.max(0, this.health - damage);
        this.lastRepairTime = Date.now();
        return true;
    }

    update(keys, canvas, deltaTime) {
        if (!this.active) return;

        this.updateRepair();
        this.updateMovement(keys, canvas);
        this.updateRotation(keys);
        this.updateShooting(keys);
        this.updateAmmoRecharge();
        this.updateShieldRecharge();
        this.updateDecoys(keys);
    }

    updateRepair() {
        if (this.health < this.maxHealth && this.health > 0) {
            const currentTime = Date.now();
            if (currentTime - this.lastRepairTime >= this.repairInterval) {
                this.health = Math.min(this.maxHealth, this.health + 1);
                this.lastRepairTime = currentTime;
            }
        }
    }

    updateMovement(keys, canvas) {
        if (keys['ArrowLeft'] || keys['a']) {
            this.velocity.x = -this.speed;
        } else if (keys['ArrowRight'] || keys['d']) {
            this.velocity.x = this.speed;
        }
        
        if (keys['ArrowUp'] || keys['w']) {
            this.velocity.y = -this.speed;
        } else if (keys['ArrowDown'] || keys['s']) {
            this.velocity.y = this.speed;
        }

        if (!((keys['ArrowLeft'] || keys['a']) || (keys['ArrowRight'] || keys['d']))) {
            this.velocity.x *= this.drag;
        }
        if (!((keys['ArrowUp'] || keys['w']) || (keys['ArrowDown'] || keys['s']))) {
            this.velocity.y *= this.drag;
        }

        if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;

        this.x = clamp(this.x + this.velocity.x, 0, canvas.width - this.width);
        this.y = clamp(this.y + this.velocity.y, 0, canvas.height - this.height);
    }

    updateRotation(keys) {
        if (keys['q'] || keys['Q']) {
            this.rotation -= this.rotationSpeed;
            if (this.rotation < -Math.PI * 2) {
                this.rotation += Math.PI * 2;
            }
        }
        if (keys['e'] || keys['E']) {
            this.rotation += this.rotationSpeed;
            if (this.rotation > Math.PI * 2) {
                this.rotation -= Math.PI * 2;
            }
        }
    }

    updateShooting(keys) {
        if (this.shootCooldown > 0) this.shootCooldown--;
        
        if (keys[' '] && this.shootCooldown <= 0 && !this.isOverheated) {
            if (this.gameMode === 'cheat' || this.currentAmmo > 0) {
                this.shoot();
            }
        }
    }

    shoot() {
        console.warn('shoot() must be implemented with bulletManager');
    }

    updateAmmoRecharge() {
        if (this.currentAmmo < this.maxAmmo && !this.isOverheated) {
            this.rechargeTimer++;
            if (this.rechargeTimer >= this.rechargeInterval) {
                this.currentAmmo++;
                this.rechargeTimer = 0;
            }
        }
    }

    updateShieldRecharge() {
        if (this.shields < this.maxShields) {
            this.shieldRechargeTimer++;
            if (this.shieldRechargeTimer >= this.shieldRechargeTime) {
                this.shields++;
                this.shieldRechargeTimer = 0;
            }
        }
    }

    updateDecoys(keys) {
        if (this.decoyCooldownTimer > 0) {
            this.decoyCooldownTimer--;
        }

        for (let i = 0; i < this.maxDecoys; i++) {
            if (this.decoyRefreshTimers[i] > 0) {
                this.decoyRefreshTimers[i]--;
                if (this.decoyRefreshTimers[i] === 0) {
                    this.currentDecoys = Math.min(this.maxDecoys, this.currentDecoys + 1);
                }
            }
        }

        if ((keys['b'] || keys['B']) && this.decoyCooldownTimer <= 0 && this.currentDecoys > 0) {
            this.deployDecoy();
        }
    }

    deployDecoy() {
        console.warn('deployDecoy() must be implemented with bulletManager');
    }

    render(ctx) {
        if (!this.active) return;

        this.renderShip(ctx);
        this.renderShield(ctx);
        this.renderHealthBar(ctx);
        this.renderAmmoIndicator(ctx);
        this.renderDecoyIndicator(ctx);
    }

    renderShip(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.isOverheated ? '#F00' : (this.gameMode === 'cheat' ? '#0FF' : '#0F0');
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-20, -15);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-20, 15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    renderShield(ctx) {
        if (this.shields > 0) {
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + (this.shields / this.maxShields) * 0.4})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.width/2 + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    renderHealthBar(ctx) {
        const healthBarWidth = 50;
        const healthBarHeight = 5;
        
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x, this.y - 25, healthBarWidth, healthBarHeight);
        ctx.fillStyle = '#0F0';
        ctx.fillRect(this.x, this.y - 25, (this.health / this.maxHealth) * healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.health}/${this.maxHealth}`, this.x + healthBarWidth/2, this.y - 22);
    }

    renderAmmoIndicator(ctx) {
        if (this.gameMode === 'cheat') return;

        const ammoWidth = 5;
        const ammoSpacing = 3;
        const ammoY = this.y + this.height + 10;
        
        for (let i = 0; i < this.maxAmmo; i++) {
            ctx.fillStyle = i < this.currentAmmo ? '#0F0' : '#444';
            ctx.fillRect(
                this.x + i * (ammoWidth + ammoSpacing),
                ammoY,
                ammoWidth,
                10
            );
        }
    }

    renderDecoyIndicator(ctx) {
        const decoyIndicatorY = this.y + this.height + 55;
        const indicatorWidth = 8;
        const indicatorSpacing = 4;
        const startX = this.x;

        if (this.gameMode === 'cheat') {
            ctx.fillStyle = '#0FF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Decoys: ∞', startX, decoyIndicatorY);
            return;
        }

        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Decoys:', startX, decoyIndicatorY);

        for (let i = 0; i < this.maxDecoys; i++) {
            if (this.decoyRefreshTimers[i] === 0) {
                ctx.fillStyle = '#88F';
                ctx.fillRect(
                    startX + 50 + i * (indicatorWidth + indicatorSpacing),
                    decoyIndicatorY - 8,
                    indicatorWidth,
                    8
                );
            } else {
                ctx.strokeStyle = '#668';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    startX + 50 + i * (indicatorWidth + indicatorSpacing),
                    decoyIndicatorY - 8,
                    indicatorWidth,
                    8
                );
                const progress = 1 - (this.decoyRefreshTimers[i] / 180);
                ctx.fillStyle = 'rgba(136, 136, 255, 0.5)';
                ctx.fillRect(
                    startX + 50 + i * (indicatorWidth + indicatorSpacing),
                    decoyIndicatorY - 8,
                    indicatorWidth * progress,
                    8
                );
            }
        }

        if (this.decoyCooldownTimer > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.font = '10px Arial';
            ctx.fillText(
                `CD: ${(this.decoyCooldownTimer / 60).toFixed(1)}s`,
                startX + 50 + this.maxDecoys * (indicatorWidth + indicatorSpacing) + 5,
                decoyIndicatorY
            );
        }
    }

    setGameMode(gameMode) {
        this.gameMode = gameMode;
        if (gameMode === 'cheat') {
            this.isOverheated = false;
            this.currentAmmo = this.maxAmmo;
        } else if (gameMode === 'derek') {
            // Derek mode uses health instead of shields
            this.shields = 0;
            this.maxShields = 0;
        }
    }

    injectDependencies(bulletManager, enemyManager) {
        this.bulletManager = bulletManager;
        this.enemyManager = enemyManager;
    }
}
