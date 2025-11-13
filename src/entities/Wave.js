/**
 * Container for enemy wave information.
 */
export class Wave {
    constructor(enemies) {
        this.enemies = enemies;
        this.isComplete = false;
    }

    isWaveComplete() {
        return this.enemies.every(enemy => !enemy.active);
    }
}
