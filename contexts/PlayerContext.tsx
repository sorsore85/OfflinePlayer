// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Track, PlayerState, RepeatMode } from '@/types/music';
import { audioService } from '@/services/audioService';
import { MOCK_TRACKS } from '@/constants/mockData';

interface PlayerContextType extends PlayerState {
  tracks: Track[];
  favorites: Set<string>;
  setTracks: (tracks: Track[]) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracksState] = useState<Track[]>(MOCK_TRACKS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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

  // refs to avoid stale closures inside audio callback
  const stateRef = useRef(state);
  stateRef.current = state;
  const shuffledQueueRef = useRef<Track[]>([]);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mockPositionRef = useRef(0);

  // ─── Audio init & status wiring ──────────────────────────────────────────
  useEffect(() => {
    audioService.initialize();
    audioService.setStatusCallback((status) => {
      if (!status.isLoaded) return;
      setState((prev) => ({
        ...prev,
        position: (status.positionMillis ?? 0) / 1000,
        duration: ((status.durationMillis ?? 0) || prev.duration * 1000) / 1000,
        isPlaying: status.isPlaying,
        status: status.isPlaying ? 'playing' : 'paused',
      }));
      if (status.didJustFinish) triggerTrackEnd();
    });
    return () => {
      audioService.unload();
      clearMockTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Mock playback helpers ────────────────────────────────────────────────
  const clearMockTimer = () => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  };

  const startMockPlayback = useCallback((duration: number, startPos = 0) => {
    clearMockTimer();
    mockPositionRef.current = startPos;
    mockIntervalRef.current = setInterval(() => {
      mockPositionRef.current += 0.5;
      if (mockPositionRef.current >= duration) {
        clearMockTimer();
        triggerTrackEnd();
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

  const triggerTrackEnd = useCallback(() => {
    const { repeat, currentIndex, queue, shuffle } = stateRef.current;
    if (repeat === 'one') {
      // restart same track
      const cur = stateRef.current.currentTrack;
      if (cur) playTrackInternal(cur, queue, currentIndex);
      return;
    }
    let nextIndex: number;
    if (shuffle && shuffledQueueRef.current.length > 0) {
      const cur = stateRef.current.currentTrack;
      const shuffled = shuffledQueueRef.current;
      const idx = shuffled.findIndex((t) => t.id === cur?.id);
      const nextShuffleIdx = (idx + 1) % shuffled.length;
      if (idx === shuffled.length - 1 && repeat === 'off') {
        setState((prev) => ({ ...prev, isPlaying: false, status: 'stopped', position: 0 }));
        return;
      }
      playTrackInternal(shuffled[nextShuffleIdx], queue, nextShuffleIdx);
      return;
    }
    nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeat === 'all') nextIndex = 0;
      else {
        setState((prev) => ({ ...prev, isPlaying: false, status: 'stopped', position: 0 }));
        return;
      }
    }
    playTrackInternal(queue[nextIndex], queue, nextIndex);
  }, []);

  // ─── Core playback ────────────────────────────────────────────────────────
  const playTrackInternal = useCallback(
    async (track: Track, queue: Track[], index: number) => {
      clearMockTimer();
      setState((prev) => ({
        ...prev,
        currentTrack: track,
        queue,
        currentIndex: index,
        isPlaying: false,
        status: 'loading',
        position: 0,
        duration: track.duration,
      }));

      const loaded = await audioService.load(track);
      if (!loaded) {
        setState((prev) => ({ ...prev, status: 'error' }));
        return;
      }

      if (track.uri) {
        await audioService.play();
      } else {
        // demo data – simulate
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
    },
    [startMockPlayback]
  );

  const playTrack = useCallback(
    (track: Track, queue?: Track[]) => {
      const q = queue ?? tracks;
      const index = q.findIndex((t) => t.id === track.id);
      playTrackInternal(track, q, index >= 0 ? index : 0);
    },
    [tracks, playTrackInternal]
  );

  const togglePlayPause = useCallback(() => {
    setState((prev) => {
      if (!prev.currentTrack) return prev;
      const next = !prev.isPlaying;
      if (prev.currentTrack.uri) {
        next ? audioService.play() : audioService.pause();
      } else {
        next
          ? startMockPlayback(prev.duration, prev.position)
          : clearMockTimer();
      }
      return { ...prev, isPlaying: next, status: next ? 'playing' : 'paused' };
    });
  }, [startMockPlayback]);

  const playNext = useCallback(() => {
    const { queue, currentIndex, shuffle, repeat } = stateRef.current;
    if (shuffle && shuffledQueueRef.current.length > 0) {
      const shuffled = shuffledQueueRef.current;
      const cur = stateRef.current.currentTrack;
      const idx = shuffled.findIndex((t) => t.id === cur?.id);
      const nextIdx = (idx + 1) % shuffled.length;
      playTrackInternal(shuffled[nextIdx], queue, nextIdx);
      return;
    }
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeat === 'all') nextIndex = 0;
      else return;
    }
    playTrackInternal(queue[nextIndex], queue, nextIndex);
  }, [playTrackInternal]);

  const playPrevious = useCallback(() => {
    const { queue, currentIndex, position } = stateRef.current;
    if (position > 3) {
      // restart current
      seekTo(0);
      return;
    }
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) return;
    playTrackInternal(queue[prevIndex], queue, prevIndex);
  }, [playTrackInternal]);

  const seekTo = useCallback((position: number) => {
    mockPositionRef.current = position;
    setState((prev) => ({ ...prev, position }));
    if (stateRef.current.currentTrack?.uri) {
      audioService.seekTo(position);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const newShuffle = !prev.shuffle;
      if (newShuffle) {
        shuffledQueueRef.current = [...prev.queue].sort(() => Math.random() - 0.5);
      } else {
        shuffledQueueRef.current = [];
      }
      return { ...prev, shuffle: newShuffle };
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const next = modes[(modes.indexOf(prev.repeat) + 1) % modes.length];
      return { ...prev, repeat: next };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    const v = Math.max(0, Math.min(1, volume));
    setState((prev) => ({ ...prev, volume: v }));
    audioService.setVolume(v);
  }, []);

  const setTracks = useCallback((t: Track[]) => {
    setTracksState(t);
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (trackId: string) => favorites.has(trackId),
    [favorites]
  );

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        tracks,
        favorites,
        setTracks,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        toggleShuffle,
        cycleRepeat,
        setVolume,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
