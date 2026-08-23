// Powered by OnSpace.AI
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Track } from '@/types/music';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    try {
      await Audio.setAudioModeAsync({
        // iOS: keep playing when screen is locked / silent switch on
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        // Android: stay active, don't duck for short notifications
        shouldDuckAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (e) {
      console.log('[Audio] init error:', e);
    }
  }

  setStatusCallback(callback: (status: AVPlaybackStatus) => void) {
    this.onPlaybackStatusUpdate = callback;
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  async load(track: Track): Promise<boolean> {
    try {
      await this.unload();
      if (!track.uri) return true; // mock track

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: false,
          // 500 ms granularity gives smooth seek-bar movement without heavy CPU use
          progressUpdateIntervalMillis: 500,
          // Start at full volume
          volume: 1.0,
          isMuted: false,
          // Allow Android to use high-quality audio pipeline
          androidImplementation: 'MediaPlayer',
        },
        this.onPlaybackStatusUpdate ?? undefined
      );

      this.sound = sound;
      return true;
    } catch (e) {
      console.log('[Audio] load error:', e);
      return false;
    }
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (e) {
      console.log('[Audio] play error:', e);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (e) {
      console.log('[Audio] pause error:', e);
    }
  }

  async seekTo(positionSeconds: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(Math.round(positionSeconds * 1000));
      }
    } catch (e) {
      console.log('[Audio] seek error:', e);
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (e) {
      console.log('[Audio] volume error:', e);
    }
  }

  async setRate(rate: number, pitchCorrectionQuality?: Audio.PitchCorrectionQuality) {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(
          rate,
          true,
          pitchCorrectionQuality ?? Audio.PitchCorrectionQuality.High
        );
      }
    } catch (e) {
      console.log('[Audio] rate error:', e);
    }
  }

  async unload() {
    try {
      if (this.sound) {
        this.sound.setOnPlaybackStatusUpdate(null);
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (e) {
      console.log('[Audio] unload error:', e);
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
    } catch (_) {}
    return null;
  }
}

export const audioService = new AudioService();
