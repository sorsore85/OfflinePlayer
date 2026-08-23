// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import AlbumArt from './AlbumArt';
import { Track } from '@/types/music';
import { formatDuration } from '@/services/mediaLibraryService';

interface TrackItemProps {
  track: Track;
  isPlaying?: boolean;
  isActive?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  showArtist?: boolean;
}

const TrackItem = memo(({
  track,
  isPlaying,
  isActive,
  onPress,
  onLongPress,
  showArtist = true,
}: TrackItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.containerActive,
        pressed && styles.containerPressed,
      ]}
    >
      <AlbumArt
        artwork={track.artwork}
        trackId={track.id}
        size={48}
        borderRadius={8}
      />

      <View style={styles.info}>
        <Text
          style={[styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        {showArtist && (
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
            {track.album && track.album !== 'Unknown Album' ? ` — ${track.album}` : ''}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        {isPlaying ? (
          <View style={styles.playingIndicator}>
            <MaterialIcons name="equalizer" size={18} color={Colors.primary} />
          </View>
        ) : (
          <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
        )}
      </View>
    </Pressable>
  );
});

TrackItem.displayName = 'TrackItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  containerActive: {
    backgroundColor: Colors.bgCard,
  },
  containerPressed: {
    backgroundColor: Colors.bgElevated,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  titleActive: {
    color: Colors.primary,
  },
  artist: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 40,
  },
  duration: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  playingIndicator: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TrackItem;
