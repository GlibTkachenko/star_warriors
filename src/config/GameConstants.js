/**
 * Central game configuration.
 */

export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    MODE_SELECT: 'modeSelect',
    SHIP_SELECT: 'shipSelect',
    DIFFICULTY_SELECT: 'difficultySelect',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory',
    PAUSED: 'paused'
};

export const GAME_MODES = {
    NORMAL: 'normal',
    CHEAT: 'cheat',
    DEREK: 'derek'
};

export const DIFFICULTIES = {
    EASY: 'easy',
    HARD: 'hard'
};

export const SHIP_TYPES = {
    LIGHT_INTERCEPTOR: 'LightInterceptor',
    INTERCEPTOR: 'Interceptor',
    BOMBER: 'Bomber'
};

// Timing Constants (at 60 FPS)
export const TIMING = {
    LOADING_DURATION: 12000, // ms
    LOADING_BLUE_TEXT_DURATION: 3000, // ms
    LOADING_CRAWL_DURATION: 6000, // ms
    LOADING_FADE_DURATION: 3000, // ms
    WAVE_DELAY_FRAMES: 180, // 3 seconds
    WAVE_COUNTDOWN_SECONDS: 3,
    PLAYER_DEATH_DELAY_FRAMES: 90, // 1.5 seconds
    TARGET_FPS: 60
};

// Player Constants
export const PLAYER = {
    DEFAULT_LIVES: 3,
    DEREK_LIVES: 7,
    DEREK_HEALTH: 7,
    
    LIGHT_INTERCEPTOR: {
        WIDTH: 15,
        HEIGHT: 15,
        SPEED: 6,
        HEALTH: 1,
        MAX_AMMO: 10,
        AMMO_RECHARGE_DELAY: 90,
        OVERHEAT_THRESHOLD: 1,
        RECHARGE_TIME: 90,
        ROCKETS: 1,
        MAX_ROCKETS: 1,
        ROCKET_COOLDOWN_FRAMES: 0,
        ROCKET_RECHARGE_TIME: 180,
        DECOYS: 3,
        MAX_DECOYS: 3,
        SHIELDS: 0,
        MAX_SHIELDS: 0
    },
    
    INTERCEPTOR: {
        WIDTH: 25,
        HEIGHT: 25,
        SPEED: 4,
        HEALTH: 3,
        MAX_AMMO: 7,
        AMMO_RECHARGE_DELAY: 120,
        OVERHEAT_THRESHOLD: 1,
        RECHARGE_TIME: 120,
        ROCKETS: 3,
        MAX_ROCKETS: 3,
        ROCKET_COOLDOWN_FRAMES: 60,
        ROCKET_RECHARGE_TIME: 180,
        DECOYS: 5,
        MAX_DECOYS: 5,
        SHIELDS: 2,
        MAX_SHIELDS: 2
    },
    
    BOMBER: {
        WIDTH: 35,
        HEIGHT: 35,
        SPEED: 2,
        HEALTH: 5,
        MAX_AMMO: 7,
        AMMO_RECHARGE_DELAY: 180,
        OVERHEAT_THRESHOLD: 1,
        RECHARGE_TIME: 180,
        ROCKETS: 10,
        MAX_ROCKETS: 10,
        ROCKET_COOLDOWN_FRAMES: 30,
        ROCKET_RECHARGE_TIME: 360,
        DECOYS: 7,
        MAX_DECOYS: 7,
        SHIELDS: 4,
        MAX_SHIELDS: 4
    }
};

// Enemy Constants
export const ENEMY = {
    MIN_DISTANCE_TO_ALLIES: 80,
    FORMATION_UPDATE_INTERVAL: 30,
    DODGE_SPEED: 4,
    DODGE_DISTANCE_THRESHOLD: 150,
    DODGE_INTELLIGENCE_THRESHOLD: 0.7,
    
    LIGHT_INTERCEPTOR: {
        WIDTH: 15,
        HEIGHT: 15,
        SPEED: 3,
        HEALTH: 1,
        DAMAGE: 1,
        BASE_SHOOT_INTERVAL: 80,
        HARD_SHOOT_INTERVAL: 40,
        INTELLIGENCE_MIN: 0.7,
        INTELLIGENCE_MAX: 1.0,
        SPECIAL_CHANCE_EASY: 0.05,
        SPECIAL_CHANCE_HARD: 0.2
    },
    
    INTERCEPTOR: {
        WIDTH: 25,
        HEIGHT: 25,
        SPEED: 2,
        HEALTH: 2,
        SHIELDS: 1,
        MAX_SHIELDS: 1,
        DAMAGE: 1,
        BASE_SHOOT_INTERVAL: 100,
        HARD_SHOOT_INTERVAL: 60,
        INTELLIGENCE_MIN: 0.5,
        INTELLIGENCE_MAX: 0.9,
        SPECIAL_CHANCE_EASY: 0.03,
        SPECIAL_CHANCE_HARD: 0.15
    },
    
    BOMBER: {
        WIDTH: 35,
        HEIGHT: 35,
        SPEED: 1.5,
        HEALTH: 4,
        SHIELDS: 0,
        DAMAGE: 2,
        BASE_SHOOT_INTERVAL: 120,
        HARD_SHOOT_INTERVAL: 70,
        BASE_BOMB_COOLDOWN_MIN: 360,
        BASE_BOMB_COOLDOWN_RANGE: 300,
        HARD_BOMB_COOLDOWN_MIN: 180,
        HARD_BOMB_COOLDOWN_RANGE: 120,
        INTELLIGENCE_MIN: 0.4,
        INTELLIGENCE_MAX: 0.7,
        SPECIAL_CHANCE_EASY: 0.08,
        SPECIAL_CHANCE_HARD: 0.25
    },
    
    BOSS: {
        WIDTH: 80,
        HEIGHT: 80,
        SPEED: 1,
        HEALTH: 200,
        MAX_HEALTH: 200,
        TARGET_Y: 100,
        BASE_SHOOT_INTERVAL: 45,
        HARD_SHOOT_INTERVAL: 20,
        BASE_SPECIAL_ATTACK_TIMER: 300,
        HARD_SPECIAL_ATTACK_TIMER: 150,
        MISSILE_SPREAD_PATTERN_COUNT: 12
    }
};

// Weapon/Bullet Constants
export const WEAPONS = {
    BULLET: {
        WIDTH: 4,
        HEIGHT: 10,
        SPEED: 20,
        DAMAGE: 1
    },
    
    HOMING_ROCKET: {
        WIDTH: 6,
        HEIGHT: 15,
        SPEED: 15,
        TURN_RATE: 0.1,
        DAMAGE: 3,
        LIFETIME_FRAMES: 600
    },
    
    BOMB: {
        RADIUS: 8,
        SPEED: 5,
        DAMAGE: 5,
        LIFETIME_FRAMES: 300
    },
    
    HOMING_BOMB: {
        RADIUS: 10,
        SPEED: 8,
        TURN_RATE: 0.05,
        DAMAGE: 10,
        LIFETIME_FRAMES: 600
    },
    
    DECOY: {
        WIDTH: 6,
        HEIGHT: 15,
        SPEED: 15,
        TURN_RATE: 0.1,
        LIFETIME_FRAMES: 300
    }
};

export const PARTICLES = {
    EXPLOSION_COUNT: 20,
    PLAYER_EXPLOSION_COUNT: 40,
    PARTICLE_SIZE_MIN: 1,
    PARTICLE_SIZE_MAX: 4,
    PARTICLE_VELOCITY_MIN: -3,
    PARTICLE_VELOCITY_MAX: 3,
    PARTICLE_LIFETIME_FRAMES: 60
};

export const VISUAL = {
    STARFIELD_COUNT: 200,
    STAR_SPEED_MIN: 0.5,
    STAR_SPEED_MAX: 2.5,
    STAR_SIZE_MAX: 2,
    MENU_FADE_SPEED: 0.02,
    ROTATION_SPEED: 0.08,
    ROTATION_SMOOTHING: 0.05,
    MAX_ROTATION_STEP: 0.1
};

export const SCORING = {
    ENEMY_KILL: 100,
    VICTORY_BONUS: 10000
};

export const WAVES = [
    // Wave 1: 5 enemies total
    {
        enemies: [
            { type: 'light', count: 3 },
            { type: 'interceptor', count: 2 }
        ]
    },
    // Wave 2: 10 enemies total
    {
        enemies: [
            { type: 'light', count: 4 },
            { type: 'interceptor', count: 4 },
            { type: 'bomber', count: 2 }
        ]
    },
    // Wave 3: 15 enemies total
    {
        enemies: [
            { type: 'light', count: 6 },
            { type: 'interceptor', count: 5 },
            { type: 'bomber', count: 4 }
        ]
    },
    // Wave 4: Boss fight with underlings
    {
        isBoss: true,
        enemies: [
            { type: 'light', count: 2 },
            { type: 'interceptor', count: 1 }
        ]
    }
];

export const TEXT = {
    INTRO: {
        BLUE: "A long time ago, in a galaxy far, far away...",
        YELLOW: "STAR WARRIORS",
        CONTEXT: [
            "Not Star Wars, any coincidences are coincidences",
            "despite master Yoda saying there are no coincidences.",
            "This is purely a game for fun, not production,",
            "any bugs are problems of javascript,",
            "if something doesn't work, pray 3 times and it should work.",
            "enjoy the game!"
        ]
    },
    MENU: {
        OPTIONS: ['Start Game', 'How to Play'],
        MODE_OPTIONS: ['Normal Mode', 'Cheat Mode', 'Derek Mode'],
        SHIP_TYPES: ['Light Interceptor', 'Interceptor', 'Bomber'],
        DIFFICULTY_OPTIONS: ['Easy', 'Hard'],
        PAUSE_OPTIONS: ['Resume', 'Restart', 'Main Menu']
    },
    MODE_DESCRIPTIONS: {
        'normal': 'Standard gameplay with limited ammo and health',
        'cheat': 'Unlimited ammo and invincibility',
        'derek': 'The Great warrior Derek, the best pilot in the galaxy. (increased hp and damage)'
    },
    SHIP_STATS: {
        LIGHT_INTERCEPTOR: [
            'Speed: ■■■■■',
            'Size: ■',
            'Fire Rate: ■■■■■',
            'Ammo: 10 shots',
            'Special: Homing Rocket (1), Decoys (3)'
        ],
        INTERCEPTOR: [
            'Speed: ■■■',
            'Size: ■■■',
            'Fire Rate: ■■■',
            'Ammo: 7 shots',
            'Special: Homing Rockets (3), Shields (2)'
        ],
        BOMBER: [
            'Speed: ■',
            'Size: ■■■■■',
            'Fire Rate: ■■',
            'Ammo: 7 shots',
            'Special: Double Bombs (10), Shields (4)'
        ]
    }
};
