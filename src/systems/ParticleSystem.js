import { Particle } from '../entities/Particle.js';
import { PARTICLES } from '../config/GameConstants.js';

/**
 * Manages explosion and visual effect particles.
 */
export class ParticleSystem {
    constructor(audioManager) {
        this.particles = [];
        this.audioManager = audioManager;
    }

    createExplosion(x, y, isPlayerExplosion = false) {
        const count = isPlayerExplosion ? 
            PARTICLES.PLAYER_EXPLOSION_COUNT : PARTICLES.EXPLOSION_COUNT;
        
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 6;
            const vy = (Math.random() - 0.5) * 6;
            const size = PARTICLES.PARTICLE_SIZE_MIN + Math.random() * (PARTICLES.PARTICLE_SIZE_MAX - PARTICLES.PARTICLE_SIZE_MIN);
            
            this.particles.push(new Particle(x, y, vx, vy, size));
        }
        
        if (this.audioManager) {
            this.audioManager.playSound('EXPLOSION');
        }
    }

    update() {
        this.particles = this.particles.filter(particle => {
            if (!particle) return false;
            
            try {
                particle.update();
                return particle.isActive();
            } catch (e) {
                console.error('Particle update error:', e);
                return false;
            }
        });
    }

    render(ctx) {
        this.particles.forEach(particle => {
            if (particle && particle.active) {
                try {
                    particle.render(ctx);
                } catch (e) {
                    console.error('Particle render error:', e);
                }
            }
        });
    }

    clear() {
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }
}
