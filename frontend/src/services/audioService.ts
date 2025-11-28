/**
 * Audio Service
 * 
 * Reusable service for loading and playing sound effects throughout the app.
 * Handles sound caching, concurrent playback, and resource cleanup.
 * 
 * Volume Configuration:
 * - Default volume is set to 0.6 (60% of maximum)
 * - This provides subtle, non-intrusive audio feedback
 * - Volume was reduced by 40% from the original 1.0 for better user experience
 */

import { Audio } from 'expo-av';

type SoundCache = {
  [soundId: string]: {
    sound: Audio.Sound;
    isLoaded: boolean;
    assetPath: any;
  };
};

class AudioService {
  private soundCache: SoundCache = {};

  /**
   * Load a sound file from assets
   * @param soundId - Unique identifier for the sound
   * @param assetPath - Path to the audio file (e.g., require('../assets/click.mp3'))
   * @returns Promise that resolves when sound is loaded
   */
  async loadSound(soundId: string, assetPath: any): Promise<void> {
    try {
      // Check if already loaded
      if (this.soundCache[soundId]?.isLoaded) {
        console.log(`Sound ${soundId} already loaded`);
        return;
      }

      // Configure audio mode to allow simultaneous playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      // Create and load the sound
      // Volume set to 0.6 (60%) for subtle feedback
      const { sound } = await Audio.Sound.createAsync(
        assetPath,
        { shouldPlay: false, isLooping: false, volume: 0.6 }
      );

      // Cache the sound and asset path
      this.soundCache[soundId] = {
        sound,
        isLoaded: true,
        assetPath,
      };

      console.log(`Sound ${soundId} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load sound ${soundId}:`, error);
      throw error;
    }
  }

  /**
   * Play a previously loaded sound
   * @param soundId - Identifier of the sound to play
   * @returns Promise that resolves when playback starts
   */
  async playSound(soundId: string): Promise<void> {
    try {
      const cachedSound = this.soundCache[soundId];

      if (!cachedSound || !cachedSound.isLoaded) {
        console.warn(`Sound ${soundId} not loaded`);
        return;
      }

      // Create a new sound instance for overlapping playback
      // This allows rapid button presses to play multiple sounds simultaneously
      // Volume set to 0.6 (60%) for subtle feedback
      const { sound: newSound } = await Audio.Sound.createAsync(
        cachedSound.assetPath,
        { shouldPlay: true, isLooping: false, volume: 0.6 }
      );

      // Unload after playing to free memory
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSound.unloadAsync();
        }
      });
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Unload a specific sound to free memory
   * @param soundId - Identifier of the sound to unload
   */
  async unloadSound(soundId: string): Promise<void> {
    try {
      const cachedSound = this.soundCache[soundId];

      if (cachedSound && cachedSound.isLoaded) {
        await cachedSound.sound.unloadAsync();
        delete this.soundCache[soundId];
        console.log(`Sound ${soundId} unloaded`);
      }
    } catch (error) {
      console.error(`Failed to unload sound ${soundId}:`, error);
    }
  }

  /**
   * Unload all sounds
   */
  async unloadAll(): Promise<void> {
    try {
      const unloadPromises = Object.keys(this.soundCache).map((soundId) =>
        this.unloadSound(soundId)
      );
      await Promise.all(unloadPromises);
      console.log('All sounds unloaded');
    } catch (error) {
      console.error('Failed to unload all sounds:', error);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
