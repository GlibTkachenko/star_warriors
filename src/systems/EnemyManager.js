import { EnemyLightInterceptor, EnemyInterceptor, EnemyBomber, Boss } from '../entities/enemies/index.js';

/**
 * Factory and lifecycle manager for all enemy ships.
 */
export class EnemyManager {
    constructor(difficulty, audioManager, bulletManager, player) {
        this.enemies = [];
        this.difficulty = difficulty;
        this.audioManager = audioManager;
        this.bulletManager = bulletManager;
        this.player = player;
    }

    spawnEnemy(type, x, y) {
        let enemy;
        
        switch (type) {
            case 'light':
                enemy = new EnemyLightInterceptor(x, y, this.difficulty, this.audioManager, this.bulletManager, this.player);
                break;
            case 'interceptor':
                enemy = new EnemyInterceptor(x, y, this.difficulty, this.audioManager, this.bulletManager, this.player);
                break;
            case 'bomber':
                enemy = new EnemyBomber(x, y, this.difficulty, this.audioManager, this.bulletManager, this.player);
                break;
            case 'boss':
                enemy = new Boss(x, y, this.difficulty, this.audioManager, this.bulletManager, this.player);
                break;
            default:
                console.warn(`Unknown enemy type: ${type}`);
                return null;
        }
        
        this.enemies.push(enemy);
        return enemy;
    }

    update(canvas) {
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy) return false;
            
            try {
                enemy.update(canvas);
                return enemy.active;
            } catch (e) {
                console.error('Enemy update error:', e);
                return false;
            }
        });
    }

    render(ctx) {
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active) {
                try {
                    enemy.render(ctx);
                } catch (e) {
                    console.error('Enemy render error:', e);
                }
            }
        });
    }

    getActiveEnemies() {
        return this.enemies.filter(e => e && e.active);
    }

    getClosestEnemy(x, y) {
        let closestEnemy = null;
        let closestDist = Infinity;
        
        for (const enemy of this.enemies) {
            if (!enemy || !enemy.active) continue;
            
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        }
        
        return closestEnemy;
    }

    isWaveComplete() {
        return this.enemies.length === 0;
    }

    clear() {
        this.enemies = [];
    }

    setPlayer(player) {
        this.player = player;
        // Update existing enemies with new player reference
        this.enemies.forEach(enemy => {
            enemy.player = player;
        });
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    getEnemies() {
        return this.enemies;
    }
}
