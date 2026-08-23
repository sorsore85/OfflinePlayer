// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Track, PlayerState, RepeatMode } from '@/types/music';
import { audioService } from '@/services/audioService';
import { MOCK_TRACKS } from '@/constants/mockData';

interface PlayerContextType extends PlayerState {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    status: 'idle',
    position: 0,
    duration: 0,
    shuffle: false,
    repeat: 'off',
    volume: 1,
  });

  const shuffledQueueRef = useRef<Track[]>([]);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mockPositionRef = useRef(0);

  useEffect(() => {
    audioService.initialize();
    audioService.setStatusCallback((status) => {
      if (status.isLoaded) {
        setState((prev) => ({
          ...prev,
          position: (status.positionMillis || 0) / 1000,
          duration: (status.durationMillis || prev.duration * 1000) / 1000,
          isPlaying: status.isPlaying,
          status: status.isPlaying ? 'playing' : 'paused',
        }));

        if (status.didJustFinish) {
          handleTrackEnd();
        }
      }
    });
    return () => {
      audioService.unload();
      clearMockInterval();
    };
  }, []);

  const clearMockInterval = () => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  };

  const startMockPlayback = useCallback((duration: number, startPosition = 0) => {
    clearMockInterval();
    mockPositionRef.current = startPosition;
    mockIntervalRef.current = setInterval(() => {
      mockPositionRef.current += 0.5;
      if (mockPositionRef.current >= duration) {
        clearMockInterval();
        handleTrackEnd();
        return;
      }
      setState((prev) => ({
        ...prev,
        position: mockPositionRef.current,
        isPlaying: true,
        status: 'playing',
      }));
    }, 500);
  }, []);

  const handleTrackEnd = useCallback(() => {
    setState((prev) => {
      const { repeat, currentIndex, queue } = prev;
      if (repeat === 'one') {
        return prev;
      }
      const nextIndex = currentIndex + 1;
      if (nextIndex < queue.length) {
        return prev;
      } else if (repeat === 'all') {
        return prev;
      }
      return { ...prev, isPlaying: false, status: 'stopped', position: 0 };
    });
  }, []);

  const playTrack = useCallback(async (track: Track, queue?: Track[]) => {
    clearMockInterval();
    const newQueue = queue || tracks;
    const index = newQueue.findIndex((t) => t.id === track.id);

    setState((prev) => ({
      ...prev,
      currentTrack: track,
      queue: newQueue,
      currentIndex: index,
      isPlaying: false,
      status: 'loading',
      position: 0,
      duration: track.duration,
    }));

    const loaded = await audioService.load(track);
    if (loaded) {
      if (track.uri) {
        await audioService.play();
      } else {
        // Mock playback
        mockPositionRef.current = 0;
        setState((prev) => ({
          ...prev,
          isPlaying: true,
          status: 'playing',
          position: 0,
          duration: track.duration,
        }));
        startMockPlayback(track.duration, 0);
      }
    }
  }, [tracks, startMockPlayback]);

  const togglePlayPause = useCallback(async () => {
    setState((prev) => {
      if (!prev.currentTrack) return prev;
      const newPlaying = !prev.isPlaying;

      if (prev.currentTrack.uri) {
        if (newPlaying) audioService.play();
        else audioService.pause();
      } else {
        if (newPlaying) {
          startMockPlayback(prev.duration, prev.position);
        } else {
          clearMockInterval();
        }
      }

      return { ...prev, isPlaying: newPlaying, status: newPlaying ? 'playing' : 'paused' };
    });
  }, [startMockPlayback]);

  const playNext = useCallback(async () => {
    setState((prev) => {
      const { queue, currentIndex, shuffle, repeat } = prev;
      let nextIndex: number;

      if (shuffle && shuffledQueueRef.current.length > 0) {
        const shuffled = shuffledQueueRef.current;
        const curShuffleIdx = shuffled.findIndex((t) => t.id === prev.currentTrack?.id);
        nextIndex = (curShuffleIdx + 1) % shuffled.length;
        const nextTrack = shuffled[nextIndex];
        playTrack(nextTrack, queue);
        return prev;
      }

      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0;
        else return prev;
      }

      playTrack(queue[nextIndex], queue);
      return prev;
    });
  }, [playTrack]);

  const playPrevious = useCallback(async () => {
    setState((prev) => {
      const { queue, currentIndex, position } = prev;
      if (position > 3) {
        seekTo(0);
        return prev;
      }
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) return prev;
      playTrack(queue[prevIndex], queue);
      return prev;
    });
  }, [playTrack]);

  const seekTo = useCallback(async (position: number) => {
    mockPositionRef.current = position;
    setState((prev) => ({ ...prev, position }));
    if (state.currentTrack?.uri) {
      await audioService.seekTo(position);
    }
  }, [state.currentTrack]);

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const newShuffle = !prev.shuffle;
      if (newShuffle) {
        const shuffled = [...prev.queue].sort(() => Math.random() - 0.5);
        shuffledQueueRef.current = shuffled;
      } else {
        shuffledQueueRef.current = [];
      }
      return { ...prev, shuffle: newShuffle };
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIdx = modes.indexOf(prev.repeat);
      return { ...prev, repeat: modes[(currentIdx + 1) % modes.length] };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
    audioService.setVolume(volume);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        tracks,
        setTracks,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        toggleShuffle,
        cycleRepeat,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
