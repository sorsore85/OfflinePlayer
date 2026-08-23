// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayer } from '@/hooks/usePlayer';
import AlbumArt from './AlbumArt';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const MiniPlayer = memo(() => {
  const router = useRouter();
  const { currentTrack, isPlaying, togglePlayPause, playNext, position, duration } = usePlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push('/player')}
    >
      {/* Progress bar at top */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <AlbumArt
          artwork={currentTrack.artwork}
          trackId={currentTrack.id}
          size={42}
          borderRadius={6}
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={({ pressed }) => [styles.controlBtn, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={28}
              color={Colors.textPrimary}
            />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              playNext();
            }}
            style={({ pressed }) => [styles.controlBtn, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <MaterialIcons name="skip-next" size={26} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

MiniPlayer.displayName = 'MiniPlayer';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.card,
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
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
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
  },
  artist: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controlBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MiniPlayer;
