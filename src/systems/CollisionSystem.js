import { checkCollision } from '../utils/MathUtils.js';
import { SCORING } from '../config/GameConstants.js';

/**
 * Handles all collision detection and response.
 */
export class CollisionSystem {
    constructor(particleSystem) {
        this.particleSystem = particleSystem;
    }

    checkCollisions(player, enemies, bullets, gameMode) {
        if (!player || !player.active) return { score: 0, playerHit: false };

        let scoreGained = 0;
        let playerHit = false;

        bullets.forEach(bullet => {
            if (!bullet || bullet.fromEnemy || !bullet.active) return;

            enemies.forEach(enemy => {
                if (!enemy || !enemy.active) return;
                
                if (checkCollision(bullet, enemy)) {
                    bullet.active = false;
                    
                    // Derek mode: one-hit kill
                    if (gameMode === 'derek') {
                        if (enemy.shields) enemy.shields = 0;
                        enemy.health = 0;
                        enemy.active = false;
                        scoreGained += SCORING.ENEMY_KILL;
                        if (this.particleSystem) {
                            this.particleSystem.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        }
                    } else {
                        const destroyed = enemy.takeDamage ? enemy.takeDamage(bullet.damage || 1) : false;
                        if (destroyed || enemy.health <= 0) {
                            enemy.active = false;
                            scoreGained += SCORING.ENEMY_KILL;
                            if (this.particleSystem) {
                                this.particleSystem.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                            }
                        }
                    }
                }
            });
        });

        bullets.forEach(bullet => {
            if (!bullet || !bullet.fromEnemy || !bullet.active) return;

            if (checkCollision(bullet, player)) {
                bullet.active = false;
                if (gameMode !== 'cheat') {
                    const damaged = player.takeDamage(bullet.damage || 1);
                    if (player.health <= 0) {
                        playerHit = true;
                        if (this.particleSystem) {
                            this.particleSystem.createExplosion(
                                player.x + player.width/2, 
                                player.y + player.height/2,
                                true
                            );
                        }
                        player.active = false;
                    }
                }
            }
        });

        enemies.forEach(enemy => {
            if (!enemy || !enemy.active) return;
            
            if (checkCollision(player, enemy)) {
                if (gameMode !== 'cheat') {
                    playerHit = true;
                    if (this.particleSystem) {
                        this.particleSystem.createExplosion(
                            player.x + player.width/2, 
                            player.y + player.height/2,
                            true
                        );
                    }
                    player.active = false;
                }
            }
        });

        return { score: scoreGained, playerHit };
    }
}
