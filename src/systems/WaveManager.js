import { WAVES } from '../config/GameConstants.js';

/**
 * Manages enemy wave progression and boss fights.
 */
export class WaveManager {
    constructor(enemyManager, canvas) {
        this.enemyManager = enemyManager;
        this.canvas = canvas;
        
        this.currentWave = 0;
        this.waves = WAVES;
        this.waveComplete = false;
        this.waveDelay = 180;
        this.waveTimer = 0;
        this.waveCountdown = 3;
        this.lastWaveTime = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
    }

    spawnWave(waveIndex) {
        if (waveIndex >= this.waves.length) return false;

        const wave = this.waves[waveIndex];
        
        if (wave.isBoss) {
            this.enemyManager.spawnEnemy('boss', this.canvas.width / 2 - 40, -80);
            this.bossSpawned = true;
            
            if (wave.enemies) {
                wave.enemies.forEach(enemyType => {
                    for (let i = 0; i < enemyType.count; i++) {
                        const x = Math.random() * (this.canvas.width - 40);
                        this.enemyManager.spawnEnemy(enemyType.type, x, -30 - i * 50);
                    }
                });
            }
        } else {
            wave.enemies.forEach(enemyType => {
                for (let i = 0; i < enemyType.count; i++) {
                    const x = Math.random() * (this.canvas.width - 40);
                    this.enemyManager.spawnEnemy(enemyType.type, x, -30 - i * 50);
                }
            });
        }
        
        return true;
    }

    update() {
        if (this.enemyManager.isWaveComplete() && !this.waveComplete) {
            this.waveComplete = true;
            this.waveTimer = this.waveDelay;
            this.waveCountdown = 3;
            this.lastWaveTime = Date.now();
            
            // Check for boss defeat
            const enemies = this.enemyManager.getEnemies();
            const hadBoss = enemies.some(e => e.constructor.name === 'Boss');
            if (this.bossSpawned && !hadBoss) {
                this.bossDefeated = true;
            }
        }

        if (this.waveComplete) {
            this.waveTimer--;
            
            const currentTime = Date.now();
            if (currentTime - this.lastWaveTime >= 1000) {
                this.waveCountdown = Math.max(0, this.waveCountdown - 1);
                this.lastWaveTime = currentTime;
            }

            if (this.waveTimer <= 0) {
                this.currentWave++;
                if (this.currentWave < this.waves.length) {
                    this.waveComplete = false;
                    this.spawnWave(this.currentWave);
                }
            }
        }
    }

    start() {
        this.currentWave = 0;
        this.waveComplete = false;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.spawnWave(this.currentWave);
    }

    reset() {
        this.currentWave = 0;
        this.waveComplete = false;
        this.waveTimer = 0;
        this.waveCountdown = 3;
        this.bossSpawned = false;
        this.bossDefeated = false;
    }

    isBossDefeated() {
        return this.bossDefeated;
    }

    isGameComplete() {
        return this.currentWave >= this.waves.length && this.enemyManager.isWaveComplete();
    }

    getCurrentWaveInfo() {
        return {
            waveNumber: this.currentWave + 1,
            totalWaves: this.waves.length,
            isBoss: this.currentWave < this.waves.length && this.waves[this.currentWave].isBoss,
            countdown: this.waveCountdown,
            isComplete: this.waveComplete
        };
    }
}
