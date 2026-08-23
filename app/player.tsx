// Powered by OnSpace.AI
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { ACCENT_COLORS } from '@/constants/mockData';
import { usePlayer } from '@/hooks/usePlayer';
import AlbumArt from '@/components/ui/AlbumArt';
import SeekBar from '@/components/ui/SeekBar';
import { RepeatMode } from '@/types/music';

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    shuffle,
    repeat,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  if (!currentTrack) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.emptyState}>
          <MaterialIcons name="music-note" size={80} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Nothing playing</Text>
        </View>
      </View>
    );
  }

  const colorIdx = parseInt(currentTrack.id, 10) % ACCENT_COLORS.length;
  const accentColor = ACCENT_COLORS[isNaN(colorIdx) ? 0 : colorIdx];

  const repeatIcon = repeat === 'one' ? 'repeat-one' : 'repeat';
  const repeatActive = repeat !== 'off';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Handle / Close */}
      <View style={styles.handleRow}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          hitSlop={12}
        >
          <MaterialIcons name="keyboard-arrow-down" size={32} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          hitSlop={12}
        >
          <MaterialIcons name="more-horiz" size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {currentTrack.artwork ? (
          <Image
            source={{ uri: currentTrack.artwork }}
            style={[styles.artwork, { borderRadius: Radius.xl }]}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View
            style={[
              styles.artwork,
              styles.artworkPlaceholder,
              {
                backgroundColor: accentColor + '22',
                borderColor: accentColor + '44',
                borderRadius: Radius.xl,
              },
            ]}
          >
            <Image
              source={require('@/assets/images/player-hero.png')}
              style={{ width: '85%', height: '85%', borderRadius: Radius.lg }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}
        {/* Glow */}
        <View
          style={[
            styles.artworkGlow,
            { backgroundColor: accentColor },
          ]}
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackTextGroup}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.heartBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons name="favorite-border" size={26} color={Colors.textTertiary} />
        </Pressable>
      </View>

      {/* Seek Bar */}
      <View style={styles.seekContainer}>
        <SeekBar position={position} duration={duration} onSeek={seekTo} />
      </View>

      {/* Main Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={toggleShuffle}
          style={({ pressed }) => [styles.sideBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons
            name="shuffle"
            size={24}
            color={shuffle ? accentColor : Colors.textTertiary}
          />
        </Pressable>

        <Pressable
          onPress={playPrevious}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons name="skip-previous" size={38} color={Colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={togglePlayPause}
          style={({ pressed }) => [
            styles.playPauseBtn,
            { backgroundColor: Colors.primary, shadowColor: accentColor },
            pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
          ]}
        >
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={44}
            color={Colors.textPrimary}
          />
        </Pressable>

        <Pressable
          onPress={playNext}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons name="skip-next" size={38} color={Colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={cycleRepeat}
          style={({ pressed }) => [styles.sideBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons
            name={repeatIcon}
            size={24}
            color={repeatActive ? accentColor : Colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* Extra Controls */}
      <View style={styles.extraControls}>
        <Pressable
          style={({ pressed }) => [styles.extraBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons name="volume-up" size={22} color={Colors.textTertiary} />
        </Pressable>
        <View style={styles.albumBadge}>
          <Text style={styles.albumBadgeText} numberOfLines={1}>
            {currentTrack.album}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.extraBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <MaterialIcons name="queue-music" size={22} color={Colors.textTertiary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 340,
    ...Shadow.card,
    elevation: 16,
  },
  artworkPlaceholder: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artworkGlow: {
    position: 'absolute',
    bottom: -20,
    width: '70%',
    height: 40,
    borderRadius: 20,
    opacity: 0.25,
    filter: [{ blur: 20 }] as any,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  trackTextGroup: {
    flex: 1,
    gap: 4,
    paddingRight: Spacing.md,
  },
  trackTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  trackArtist: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  heartBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekContainer: {
    marginBottom: Spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  sideBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  extraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumBadge: {
    flex: 1,
    alignItems: 'center',
  },
  albumBadgeText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  emptyText: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
});
