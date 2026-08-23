// Powered by OnSpace.AI
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  StatusBar,
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
import { formatDuration } from '@/services/mediaLibraryService';

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
    volume,
    queue,
    currentIndex,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleFavorite,
    isFavorite,
    playTrack,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
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
  const favorited = isFavorite(currentTrack.id);

  const repeatIcon = repeat === 'one' ? 'repeat-one' : 'repeat';
  const repeatActive = repeat !== 'off';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.xl),
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Top row ── */}
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
          hitSlop={12}
        >
          <MaterialIcons name="keyboard-arrow-down" size={32} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
          {queue.length > 0 && (
            <Text style={styles.queueCount}>{currentIndex + 1} / {queue.length}</Text>
          )}
        </View>

        <Pressable
          onPress={() => setShowQueue(true)}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
          hitSlop={12}
        >
          <MaterialIcons name="queue-music" size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* ── Artwork ── */}
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
                backgroundColor: accentColor + '1A',
                borderColor: accentColor + '44',
                borderRadius: Radius.xl,
              },
            ]}
          >
            <Image
              source={require('@/assets/images/player-hero.png')}
              style={{ width: '90%', height: '90%', borderRadius: Radius.lg }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}
        {/* Subtle glow beneath artwork */}
        <View style={[styles.artworkGlow, { backgroundColor: accentColor }]} />
      </View>

      {/* ── Track info + favorite ── */}
      <View style={styles.trackInfoRow}>
        <View style={styles.trackTextGroup}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
            {currentTrack.album && currentTrack.album !== 'Unknown Album'
              ? ` • ${currentTrack.album}`
              : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(currentTrack.id)}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
          hitSlop={8}
        >
          <MaterialIcons
            name={favorited ? 'favorite' : 'favorite-border'}
            size={26}
            color={favorited ? Colors.primary : Colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* ── Seek bar ── */}
      <View style={styles.seekWrapper}>
        <SeekBar
          position={position}
          duration={duration}
          onSeek={seekTo}
          accentColor={accentColor}
        />
      </View>

      {/* ── Main controls ── */}
      <View style={styles.controls}>
        <Pressable
          onPress={toggleShuffle}
          style={({ pressed }) => [styles.sideBtn, pressed && { opacity: 0.5 }]}
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
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.5 }]}
          hitSlop={8}
        >
          <MaterialIcons name="skip-previous" size={40} color={Colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={togglePlayPause}
          style={({ pressed }) => [
            styles.playPauseBtn,
            { backgroundColor: accentColor, shadowColor: accentColor },
            pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
          ]}
        >
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={46}
            color={Colors.textPrimary}
          />
        </Pressable>

        <Pressable
          onPress={playNext}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.5 }]}
          hitSlop={8}
        >
          <MaterialIcons name="skip-next" size={40} color={Colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={cycleRepeat}
          style={({ pressed }) => [styles.sideBtn, pressed && { opacity: 0.5 }]}
          hitSlop={8}
        >
          <MaterialIcons
            name={repeatIcon}
            size={24}
            color={repeatActive ? accentColor : Colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* ── Volume slider ── */}
      <VolumeSlider volume={volume} onChange={setVolume} accentColor={accentColor} />

      {/* ── Queue Modal ── */}
      <Modal
        visible={showQueue}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQueue(false)}
      >
        <QueueSheet
          queue={queue}
          currentIndex={currentIndex}
          accentColor={accentColor}
          onClose={() => setShowQueue(false)}
          onSelectTrack={(t) => {
            playTrack(t, queue);
            setShowQueue(false);
          }}
        />
      </Modal>
    </View>
  );
}

// ─── Volume Slider ─────────────────────────────────────────────────────────
import { PanResponder, LayoutChangeEvent } from 'react-native';
import { useRef } from 'react';

function VolumeSlider({
  volume,
  onChange,
  accentColor,
}: {
  volume: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const widthRef = useRef(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [localVol, setLocalVol] = useState(volume);

  const displayed = isSeeking ? localVol : volume;
  const clamp = (x: number) => Math.max(0, Math.min(1, x));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setIsSeeking(true);
        const v = clamp(e.nativeEvent.locationX / widthRef.current);
        setLocalVol(v);
      },
      onPanResponderMove: (e) => {
        const v = clamp(e.nativeEvent.locationX / widthRef.current);
        setLocalVol(v);
      },
      onPanResponderRelease: (e) => {
        const v = clamp(e.nativeEvent.locationX / widthRef.current);
        setLocalVol(v);
        setIsSeeking(false);
        onChange(v);
      },
      onPanResponderTerminate: () => setIsSeeking(false),
    })
  ).current;

  return (
    <View style={volStyles.row}>
      <MaterialIcons name="volume-down" size={20} color={Colors.textTertiary} />
      <View
        style={volStyles.track}
        onLayout={(e: LayoutChangeEvent) => {
          widthRef.current = e.nativeEvent.layout.width || 1;
        }}
        {...panResponder.panHandlers}
      >
        <View style={volStyles.rail} />
        <View
          style={[
            volStyles.fill,
            { width: `${displayed * 100}%`, backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            volStyles.thumb,
            {
              left: `${displayed * 100}%`,
              backgroundColor: isSeeking ? accentColor : Colors.textPrimary,
            },
          ]}
        />
      </View>
      <MaterialIcons name="volume-up" size={20} color={Colors.textTertiary} />
    </View>
  );
}

const volStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  track: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: Radius.full,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    marginLeft: -6.5,
    marginTop: -6.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});

// ─── Queue Sheet ──────────────────────────────────────────────────────────
import { Track } from '@/types/music';

function QueueSheet({
  queue,
  currentIndex,
  accentColor,
  onClose,
  onSelectTrack,
}: {
  queue: Track[];
  currentIndex: number;
  accentColor: string;
  onClose: () => void;
  onSelectTrack: (t: Track) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[qStyles.container, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.base }]}>
      <StatusBar barStyle="light-content" />
      <View style={qStyles.header}>
        <Text style={qStyles.title}>Up Next</Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [qStyles.closeBtn, pressed && { opacity: 0.5 }]}
          hitSlop={12}
        >
          <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {queue.map((track, idx) => {
          const isActive = idx === currentIndex;
          return (
            <Pressable
              key={track.id}
              onPress={() => onSelectTrack(track)}
              style={({ pressed }) => [
                qStyles.item,
                isActive && qStyles.itemActive,
                pressed && qStyles.itemPressed,
              ]}
            >
              <Text style={qStyles.index}>{idx + 1}</Text>
              <View style={qStyles.info}>
                <Text
                  style={[qStyles.itemTitle, isActive && { color: accentColor }]}
                  numberOfLines={1}
                >
                  {track.title}
                </Text>
                <Text style={qStyles.itemArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
              <Text style={qStyles.dur}>{formatDuration(track.duration)}</Text>
              {isActive && (
                <MaterialIcons name="equalizer" size={18} color={accentColor} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const qStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  itemActive: {
    backgroundColor: Colors.bgCard,
  },
  itemPressed: {
    backgroundColor: Colors.bgElevated,
  },
  index: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    width: 22,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  itemArtist: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  dur: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  nowPlayingLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    includeFontPadding: false,
  },
  queueCount: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    includeFontPadding: false,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 320,
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
    bottom: -16,
    width: '60%',
    height: 36,
    borderRadius: 18,
    opacity: 0.2,
    filter: [{ blur: 18 }] as any,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  trackTextGroup: {
    flex: 1,
    gap: 4,
    paddingRight: Spacing.sm,
  },
  trackTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  trackArtist: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  seekWrapper: {
    marginBottom: Spacing.md,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sideBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
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
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
