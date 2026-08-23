// Powered by OnSpace.AI
import React, { memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { usePlayer } from '@/hooks/usePlayer';
import AlbumArt from './AlbumArt';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const MiniPlayer = memo(() => {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    position,
    duration,
  } = usePlayer();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx * 0.25);
      },
      onPanResponderRelease: (_, g) => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        if (g.dx < -50) playNext();
        else if (g.dx > 50) playPrevious();
      },
    })
  ).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  }, [scaleAnim]);

  if (!currentTrack) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateX }, { scale: scaleAnim }] }]}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={() => router.push('/player' as Href)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        {/* Thin progress bar at very top */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.content}>
          {/* Album art */}
          <AlbumArt
            artwork={currentTrack.artwork}
            trackId={currentTrack.id}
            size={44}
            borderRadius={8}
          />

          {/* Track info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable
              onPress={(e) => { e.stopPropagation(); togglePlayPause(); }}
              style={({ pressed }) => [styles.controlBtn, pressed && { opacity: 0.5 }]}
              hitSlop={10}
            >
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={30}
                color={Colors.textPrimary}
              />
            </Pressable>
            <Pressable
              onPress={(e) => { e.stopPropagation(); playNext(); }}
              style={({ pressed }) => [styles.controlBtn, pressed && { opacity: 0.5 }]}
              hitSlop={10}
            >
              <MaterialIcons name="skip-next" size={26} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

MiniPlayer.displayName = 'MiniPlayer';

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: 6,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 2,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.md,
    backgroundColor: Colors.bgElevated,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  artist: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  controlBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MiniPlayer;
