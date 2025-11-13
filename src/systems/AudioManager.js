import { AUDIO_FILES, AUDIO_SETTINGS } from '../config/AudioConfig.js';

/**
 * Centralized audio loading and playback system.
 */
export class AudioManager {
    constructor() {
        this.sounds = {};
        this.loadSounds();
    }

    loadSounds() {
        Object.keys(AUDIO_FILES).forEach(key => {
            const audio = new Audio(AUDIO_FILES[key]);
            const settings = AUDIO_SETTINGS[key];
            
            if (settings) {
                audio.volume = settings.volume;
                if (settings.preservesPitch !== undefined) {
                    audio.preservesPitch = settings.preservesPitch;
                }
            }
            
            this.sounds[key] = audio;
        });
    }

    playSound(soundName, playbackRate = 1.0) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.playbackRate = playbackRate;
            sound.play().catch(err => {
                console.warn(`Failed to play sound ${soundName}:`, err);
            });
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }

    stopSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    setVolume(soundName, volume) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
        }
    }

    setGlobalVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
    }
}
