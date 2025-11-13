import { GAME_STATES, GAME_MODES, SHIP_TYPES, PLAYER, TEXT, TIMING, SCORING } from '../config/GameConstants.js';
import { LightInterceptor, Interceptor, Bomber } from '../entities/player/index.js';
import {
    AudioManager,
    BulletManager,
    EnemyManager,
    ParticleSystem,
    CollisionSystem,
    WaveManager,
    InputManager,
    Renderer
} from '../systems/index.js';

/**
 * Game orchestrator managing all systems and state transitions.
 */
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();

        this.audioManager = new AudioManager();
        this.inputManager = new InputManager(canvas);
        this.renderer = new Renderer(canvas, this.ctx);
        this.bulletManager = new BulletManager(this.audioManager);
        this.particleSystem = new ParticleSystem(this.audioManager);
        this.collisionSystem = new CollisionSystem(this.particleSystem);
        
        this.enemyManager = null;
        this.waveManager = null;
        this.player = null;

        this.currentState = GAME_STATES.LOADING;
        this.gameMode = GAME_MODES.NORMAL;
        this.difficulty = 'easy';
        this.score = 0;
        this.playerLives = PLAYER.DEFAULT_LIVES;

        this.selectedOption = 0;
        this.selectedModeOption = 0;
        this.selectedShipType = 0;
        this.selectedShipClass = SHIP_TYPES.LIGHT_INTERCEPTOR;
        this.selectedDifficulty = 0;
        this.selectedPauseOption = 0;
        this.gameOverOption = 0;

        this.loadingStartTime = Date.now();
        this.loadingDuration = TIMING.LOADING_DURATION;
        this.menuFadeIn = 0;
        this.introSkipped = false;
        this.introText = TEXT.INTRO;

        this.playerDeathTimer = 0;
        this.playerDeathDelay = TIMING.PLAYER_DEATH_DELAY_FRAMES;

        this.lastTime = 0;
        this.boundGameLoop = (timestamp) => this.gameLoop(timestamp);
        requestAnimationFrame(this.boundGameLoop);

        window.addEventListener('resize', () => this.handleResize());
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.handleResize(window.innerWidth, window.innerHeight);
    }

    startGame() {
        this.playerLives = this.gameMode === GAME_MODES.DEREK ? PLAYER.DEREK_LIVES : PLAYER.DEFAULT_LIVES;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height - 50;

        switch (this.selectedShipClass) {
            case SHIP_TYPES.LIGHT_INTERCEPTOR:
                this.player = new LightInterceptor(centerX, centerY, this.gameMode, this.audioManager);
                break;
            case SHIP_TYPES.INTERCEPTOR:
                this.player = new Interceptor(centerX, centerY, this.gameMode, this.audioManager);
                break;
            case SHIP_TYPES.BOMBER:
                this.player = new Bomber(centerX, centerY, this.gameMode, this.audioManager);
                break;
            default:
                this.player = new LightInterceptor(centerX, centerY, this.gameMode, this.audioManager);
        }

        if (this.gameMode === GAME_MODES.DEREK) {
            this.player.health = PLAYER.DEREK_HEALTH;
            this.player.maxHealth = PLAYER.DEREK_HEALTH;
            this.player.shields = 0;
            this.player.maxShields = 0;
        }

        this.bulletManager.setGameMode(this.gameMode);
        this.enemyManager = new EnemyManager(this.difficulty, this.audioManager, this.bulletManager, this.player);
        this.waveManager = new WaveManager(this.enemyManager, this.canvas);

        this.player.injectDependencies(this.bulletManager, this.enemyManager);

        this.score = 0;
        this.playerDeathTimer = 0;

        this.waveManager.start();
        this.currentState = GAME_STATES.PLAYING;
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.boundGameLoop);
    }

    update(deltaTime) {
        this.renderer.updateStars();

        if (this.currentState === GAME_STATES.LOADING) {
            this.updateLoading();
            return;
        }

        if (this.currentState === GAME_STATES.MENU) {
            this.menuFadeIn = Math.min(1, this.menuFadeIn + 0.02);
        }

        if (this.currentState !== GAME_STATES.PLAYING) {
            this.handleMenuInput();
            return;
        }

        this.updateGameplay(deltaTime);
    }

    updateLoading() {
        const elapsed = Date.now() - this.loadingStartTime;
        
        if (elapsed >= this.loadingDuration && !this.introSkipped) {
            this.currentState = GAME_STATES.MENU;
            this.menuFadeIn = 0;
        }

        const keys = this.inputManager.getKeys();
        if (Object.keys(keys).some(key => keys[key]) && !this.introSkipped) {
            this.introSkipped = true;
            this.currentState = GAME_STATES.MENU;
            this.menuFadeIn = 0;
            this.inputManager.reset();
        }
    }

    updateGameplay(deltaTime) {
        if (this.playerDeathTimer > 0) {
            this.playerDeathTimer--;
            if (this.playerDeathTimer <= 0) {
                this.currentState = GAME_STATES.GAME_OVER;
            }
            this.particleSystem.update();
            return;
        }

        if (this.player && this.player.active) {
            const keys = this.inputManager.getKeys();
            const mousePressed = this.inputManager.isMousePressed();
            this.player.update(keys, this.canvas, deltaTime, mousePressed);

            if (keys['Escape']) {
                this.currentState = GAME_STATES.PAUSED;
                this.inputManager.reset();
                return;
            }
        }

        this.waveManager.update();

        if (this.waveManager.isBossDefeated() && this.enemyManager.isWaveComplete()) {
            this.currentState = GAME_STATES.VICTORY;
            this.score += SCORING.VICTORY_BONUS;
            return;
        }

        this.bulletManager.update(this.canvas);
        this.enemyManager.update(this.canvas);
        this.particleSystem.update();

        if (this.player && this.player.active) {
            const result = this.collisionSystem.checkCollisions(
                this.player,
                this.enemyManager.getEnemies(),
                this.bulletManager.getBullets(),
                this.gameMode
            );

            this.score += result.score;

            if (result.playerHit) {
                this.playerLives = this.player.health;
                if (this.playerLives <= 0) {
                    this.playerDeathTimer = this.playerDeathDelay;
                }
            }
        }
    }

    handleMenuInput() {
        const keys = this.inputManager.getKeysPressed();

        if (this.currentState === GAME_STATES.MENU) {
            if (keys['ArrowDown']) {
                this.selectedOption = (this.selectedOption + 1) % 2;
                this.inputManager.clearPressed();
            } else if (keys['ArrowUp']) {
                this.selectedOption = (this.selectedOption - 1 + 2) % 2;
                this.inputManager.clearPressed();
            } else if (keys['Enter']) {
                if (this.selectedOption === 0) {
                    this.currentState = GAME_STATES.MODE_SELECT;
                } else {
                    window.location.href = 'instructions.html';
                }
                this.inputManager.clearPressed();
            }
        }
        else if (this.currentState === GAME_STATES.MODE_SELECT) {
            if (keys['ArrowDown']) {
                this.selectedModeOption = (this.selectedModeOption + 1) % 3;
                this.inputManager.clearPressed();
            } else if (keys['ArrowUp']) {
                this.selectedModeOption = (this.selectedModeOption - 1 + 3) % 3;
                this.inputManager.clearPressed();
            } else if (keys['Enter']) {
                if (this.selectedModeOption === 0) {
                    this.gameMode = GAME_MODES.NORMAL;
                } else if (this.selectedModeOption === 1) {
                    this.gameMode = GAME_MODES.CHEAT;
                } else {
                    this.gameMode = GAME_MODES.DEREK;
                }
                this.currentState = GAME_STATES.SHIP_SELECT;
                this.inputManager.clearPressed();
            } else if (keys['Escape']) {
                this.currentState = GAME_STATES.MENU;
                this.inputManager.clearPressed();
            }
        }
        else if (this.currentState === GAME_STATES.SHIP_SELECT) {
            if (keys['ArrowDown']) {
                this.selectedShipType = (this.selectedShipType + 1) % 3;
                this.updateSelectedShipClass();
                this.inputManager.clearPressed();
            } else if (keys['ArrowUp']) {
                this.selectedShipType = (this.selectedShipType - 1 + 3) % 3;
                this.updateSelectedShipClass();
                this.inputManager.clearPressed();
            } else if (keys['Enter']) {
                this.currentState = GAME_STATES.DIFFICULTY_SELECT;
                this.inputManager.clearPressed();
            } else if (keys['Escape']) {
                this.currentState = GAME_STATES.MODE_SELECT;
                this.inputManager.clearPressed();
            }
        }
        else if (this.currentState === GAME_STATES.DIFFICULTY_SELECT) {
            if (keys['ArrowDown']) {
                this.selectedDifficulty = (this.selectedDifficulty + 1) % 2;
                this.difficulty = this.selectedDifficulty === 0 ? 'easy' : 'hard';
                this.inputManager.clearPressed();
            } else if (keys['ArrowUp']) {
                this.selectedDifficulty = (this.selectedDifficulty - 1 + 2) % 2;
                this.difficulty = this.selectedDifficulty === 0 ? 'easy' : 'hard';
                this.inputManager.clearPressed();
            } else if (keys['Enter']) {
                this.startGame();
                this.inputManager.clearPressed();
            } else if (keys['Escape']) {
                this.currentState = GAME_STATES.SHIP_SELECT;
                this.inputManager.clearPressed();
            }
        }
        else if (this.currentState === GAME_STATES.PAUSED) {
            if (keys['ArrowDown']) {
                this.selectedPauseOption = (this.selectedPauseOption + 1) % 3;
                this.inputManager.clearPressed();
            } else if (keys['ArrowUp']) {
                this.selectedPauseOption = (this.selectedPauseOption - 1 + 3) % 3;
                this.inputManager.clearPressed();
            } else if (keys['Enter']) {
                if (this.selectedPauseOption === 0) {
                    this.currentState = GAME_STATES.PLAYING;
                } else if (this.selectedPauseOption === 1) {
                    this.resetGame();
                    this.currentState = GAME_STATES.PLAYING;
                } else {
                    this.resetToMenu();
                }
                this.inputManager.clearPressed();
            } else if (keys['Escape']) {
                this.currentState = GAME_STATES.PLAYING;
                this.inputManager.clearPressed();
            }
        }
        else if (this.currentState === GAME_STATES.GAME_OVER || this.currentState === GAME_STATES.VICTORY) {
            if (keys['ArrowDown']) {
                this.gameOverOption = (this.gameOverOption + 1) % 2;
                this.inputManager.clearPressed();
            } else if (keys['ArrowUp']) {
                this.gameOverOption = (this.gameOverOption - 1 + 2) % 2;
                this.inputManager.clearPressed();
            } else if (keys['Enter']) {
                if (this.gameOverOption === 0) {
                    this.startGame();
                } else {
                    this.resetToMenu();
                }
                this.inputManager.clearPressed();
            }
        }
    }

    updateSelectedShipClass() {
        switch (this.selectedShipType) {
            case 0:
                this.selectedShipClass = SHIP_TYPES.LIGHT_INTERCEPTOR;
                break;
            case 1:
                this.selectedShipClass = SHIP_TYPES.INTERCEPTOR;
                break;
            case 2:
                this.selectedShipClass = SHIP_TYPES.BOMBER;
                break;
        }
    }

    resetToMenu() {
        this.currentState = GAME_STATES.MENU;
        this.selectedOption = 0;
        this.selectedModeOption = 0;
        this.selectedShipType = 0;
        this.selectedShipClass = SHIP_TYPES.LIGHT_INTERCEPTOR;
        this.selectedDifficulty = 0;
        this.selectedPauseOption = 0;
        this.gameOverOption = 0;
        this.player = null;
        this.enemyManager = null;
        this.waveManager = null;
        this.bulletManager.clear();
    }

    resetGame() {
        this.bulletManager.clear();
        this.particleSystem.particles = [];
        this.startGame();
    }

    render() {
        this.renderer.clear();
        this.renderer.renderStars();

        if (this.currentState === GAME_STATES.LOADING) {
            const elapsed = Date.now() - this.loadingStartTime;
            this.renderer.renderLoading(elapsed, 0, this.menuFadeIn, this.introText);
        } else if (this.currentState === GAME_STATES.MENU) {
            this.renderer.renderMenu(this.selectedOption, this.menuFadeIn);
        } else if (this.currentState === GAME_STATES.MODE_SELECT) {
            this.renderer.renderModeSelect(this.selectedModeOption, TEXT.MODE_DESCRIPTIONS);
        } else if (this.currentState === GAME_STATES.SHIP_SELECT) {
            this.renderer.renderShipSelect(this.selectedShipType);
        } else if (this.currentState === GAME_STATES.DIFFICULTY_SELECT) {
            this.renderer.renderDifficultySelect(this.selectedDifficulty);
        } else if (this.currentState === GAME_STATES.PLAYING) {
            this.renderGameplay();
        } else if (this.currentState === GAME_STATES.GAME_OVER) {
            this.renderGameplay();
            this.renderer.renderGameOver(this.score, this.gameOverOption);
        } else if (this.currentState === GAME_STATES.VICTORY) {
            this.renderGameplay();
            this.renderer.renderVictory(this.score, this.gameOverOption);
        } else if (this.currentState === GAME_STATES.PAUSED) {
            this.renderGameplay();
            this.renderer.renderPauseMenu(this.selectedPauseOption);
        }
    }

    renderGameplay() {
        if (this.player) this.player.render(this.ctx);
        this.bulletManager.render(this.ctx);
        if (this.enemyManager) this.enemyManager.render(this.ctx);
        this.particleSystem.render(this.ctx);
        
        const waveInfo = this.waveManager ? this.waveManager.getCurrentWaveInfo() : { 
            waveNumber: 1, totalWaves: 4, isBoss: false, countdown: 0, isComplete: false 
        };
        this.renderer.renderHUD(this.score, this.playerLives, waveInfo);
    }
}
