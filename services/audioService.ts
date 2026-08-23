// Powered by OnSpace.AI
import { Audio } from 'expo-av';
import { Track } from '@/types/music';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdate: ((status: any) => void) | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (e) {
      console.log('Audio init error:', e);
    }
  }

  setStatusCallback(callback: (status: any) => void) {
    this.onPlaybackStatusUpdate = callback;
  }

  async load(track: Track): Promise<boolean> {
    try {
      await this.unload();

      if (!track.uri) {
        // Mock track - simulate playback
        return true;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: false, progressUpdateIntervalMillis: 500 },
        this.onPlaybackStatusUpdate ?? undefined
      );

      this.sound = sound;
      return true;
    } catch (e) {
      console.log('Load error:', e);
      return false;
    }
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (e) {
      console.log('Play error:', e);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (e) {
      console.log('Pause error:', e);
    }
  }

  async seekTo(positionSeconds: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionSeconds * 1000);
      }
    } catch (e) {
      console.log('Seek error:', e);
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (e) {
      console.log('Volume error:', e);
    }
  }

  async unload() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (e) {
      console.log('Unload error:', e);
    }
  }

  async getStatus() {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
    } catch (e) {}
    return null;
  }
}

export const audioService = new AudioService();
