import { VISUAL, TEXT, TIMING } from '../config/GameConstants.js';

/**
 * Handles all rendering for the game.
 */
export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.stars = [];
        this.createStarfield();
    }

    createStarfield() {
        this.stars = [];
        for (let i = 0; i < VISUAL.STARFIELD_COUNT; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: VISUAL.STAR_SPEED_MIN + Math.random() * (VISUAL.STAR_SPEED_MAX - VISUAL.STAR_SPEED_MIN),
                size: Math.random() * VISUAL.STAR_SIZE_MAX
            });
        }
    }

    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }

    renderStars() {
        this.ctx.fillStyle = '#FFF';
        this.stars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderLoading(elapsed, textPosition, menuFadeIn, introText) {
        if (elapsed < 3000) {
            let alpha = Math.min(1, elapsed / 500);
            if (elapsed > 2500) {
                alpha = (3000 - elapsed) / 500;
            }
            
            this.ctx.fillStyle = `rgba(0, 123, 255, ${alpha})`;
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(introText.BLUE, this.canvas.width / 2, this.canvas.height / 2);
        } else if (elapsed < 9000) {
            const textCrawlElapsed = elapsed - 3000;
            const textAlpha = Math.min(1, textCrawlElapsed / 500);
            
            const startY = this.canvas.height;
            const endY = -200;
            const totalDistance = startY - endY;
            const progress = textCrawlElapsed / 6000;
            const currentY = startY - (totalDistance * progress);
            
            this.ctx.fillStyle = `rgba(255, 232, 31, ${textAlpha})`;
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(introText.YELLOW, this.canvas.width / 2, currentY);
            
            this.ctx.font = '16px Arial';
            introText.CONTEXT.forEach((line, index) => {
                this.ctx.fillText(line, this.canvas.width / 2, currentY + 50 + index * 25);
            });
        }
        
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Press any key to skip", this.canvas.width / 2, this.canvas.height - 30);
    }

    renderMenu(selectedOption, fadeAlpha) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${fadeAlpha})`;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('STAR WARRIORS', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.font = '24px Arial';
        TEXT.MENU.OPTIONS.forEach((option, index) => {
            this.ctx.fillStyle = index === selectedOption ? 
                                `rgba(0, 255, 0, ${fadeAlpha})` : 
                                `rgba(255, 255, 255, ${fadeAlpha})`;
            this.ctx.fillText(
                option,
                this.canvas.width / 2,
                this.canvas.height / 2 + index * 40
            );
        });
    }

    renderModeSelect(selectedMode, modeDescriptions) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT MODE', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.font = '24px Arial';
        TEXT.MENU.MODE_OPTIONS.forEach((option, index) => {
            this.ctx.fillStyle = index === selectedMode ? '#0F0' : '#FFF';
            this.ctx.fillText(
                option,
                this.canvas.width / 2,
                this.canvas.height / 2 + index * 40
            );
        });

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#888';
        const currentMode = TEXT.MENU.MODE_OPTIONS[selectedMode].toLowerCase().split(' ')[0];
        const description = modeDescriptions[currentMode];
        if (description) {
            this.ctx.fillText(
                description,
                this.canvas.width / 2,
                this.canvas.height / 2 + (TEXT.MENU.MODE_OPTIONS.length + 1) * 40
            );
        }
        
        this.ctx.fillText(
            'Press ESC to go back',
            this.canvas.width / 2,
            this.canvas.height - 50
        );
    }

    renderShipSelect(selectedShip) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT YOUR SHIP', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.font = '24px Arial';
        TEXT.MENU.SHIP_TYPES.forEach((ship, index) => {
            this.ctx.fillStyle = index === selectedShip ? '#0F0' : '#FFF';
            this.ctx.fillText(
                ship,
                this.canvas.width / 2,
                this.canvas.height / 2 + index * 40
            );
        });
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#888';
        const statsKey = TEXT.MENU.SHIP_TYPES[selectedShip].toUpperCase().replace(/ /g, '_');
        const stats = TEXT.SHIP_STATS[statsKey];
        
        if (stats) {
            stats.forEach((stat, i) => {
                this.ctx.fillText(
                    stat,
                    this.canvas.width / 2,
                    this.canvas.height / 2 + (TEXT.MENU.SHIP_TYPES.length + 1) * 40 + i * 20
                );
            });
        }
        
        this.ctx.fillText(
            'Press ESC to go back',
            this.canvas.width / 2,
            this.canvas.height - 50
        );
    }

    /**
     * Render difficulty select
     */
    renderDifficultySelect(selectedDifficulty) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT DIFFICULTY', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.font = '24px Arial';
        TEXT.MENU.DIFFICULTY_OPTIONS.forEach((diff, index) => {
            this.ctx.fillStyle = index === selectedDifficulty ? '#0F0' : '#FFF';
            this.ctx.fillText(
                diff,
                this.canvas.width / 2,
                this.canvas.height / 2 + index * 40
            );
        });
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(
            'Press ESC to go back',
            this.canvas.width / 2,
            this.canvas.height - 50
        );
    }

    renderGameOver(score, selectedOption) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#F00';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        const options = ['Restart', 'Main Menu'];
        this.ctx.font = '20px Arial';
        options.forEach((option, index) => {
            this.ctx.fillStyle = index === selectedOption ? '#0F0' : '#FFF';
            this.ctx.fillText(
                option,
                this.canvas.width / 2,
                this.canvas.height / 2 + 60 + index * 40
            );
        });
    }

    renderVictory(score, selectedOption) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        const options = ['Play Again', 'Main Menu'];
        this.ctx.font = '20px Arial';
        options.forEach((option, index) => {
            this.ctx.fillStyle = index === selectedOption ? '#0F0' : '#FFF';
            this.ctx.fillText(
                option,
                this.canvas.width / 2,
                this.canvas.height / 2 + 60 + index * 40
            );
        });
    }

    renderPauseMenu(selectedOption) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.font = '24px Arial';
        TEXT.MENU.PAUSE_OPTIONS.forEach((option, index) => {
            this.ctx.fillStyle = index === selectedOption ? '#0F0' : '#FFF';
            this.ctx.fillText(
                option,
                this.canvas.width / 2,
                this.canvas.height / 2 + index * 40
            );
        });
    }

    renderHUD(score, playerLives, waveInfo) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${score}`, 20, 30);
        
        this.ctx.fillText(`Lives: ${playerLives}`, 20, 60);
        
        this.ctx.textAlign = 'right';
        if (waveInfo.isBoss) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillText('BOSS FIGHT!', this.canvas.width - 20, 30);
        } else {
            this.ctx.fillText(
                `Wave ${waveInfo.waveNumber}/${waveInfo.totalWaves}`,
                this.canvas.width - 20,
                30
            );
        }

        // Wave countdown
        if (waveInfo.isComplete && waveInfo.countdown > 0) {
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillText(
                `Next wave in ${waveInfo.countdown}...`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 40
            );
        }
    }

    handleResize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.createStarfield();
    }
}
