// Powered by OnSpace.AI
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import AlbumArt from '@/components/ui/AlbumArt';
import { usePlayer } from '@/hooks/usePlayer';
import { Track } from '@/types/music';
import { formatDuration, formatFileSize } from '@/services/mediaLibraryService';

type SortMode = 'name' | 'size' | 'date';

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const { tracks, currentTrack, isPlaying, playTrack } = usePlayer();
  const [sortMode, setSortMode] = useState<SortMode>('name');

  const sortedTracks = useMemo(() => {
    const sorted = [...tracks];
    switch (sortMode) {
      case 'name':
        return sorted.sort((a, b) => a.filename.localeCompare(b.filename));
      case 'size':
        return sorted.sort((a, b) => b.size - a.size);
      case 'date':
        return sorted.sort((a, b) => b.dateAdded - a.dateAdded);
      default:
        return sorted;
    }
  }, [tracks, sortMode]);

  const handlePlay = useCallback(
    (track: Track) => {
      playTrack(track, sortedTracks);
    },
    [sortedTracks, playTrack]
  );

  const renderFile = useCallback(
    ({ item }: { item: Track }) => {
      const isActive = currentTrack?.id === item.id;
      const isTrackPlaying = isActive && isPlaying;
      const date = new Date(item.dateAdded);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.fileItem,
            isActive && styles.fileItemActive,
            pressed && styles.fileItemPressed,
          ]}
          onPress={() => handlePlay(item)}
        >
          <View style={styles.fileIcon}>
            <MaterialIcons
              name="audio-file"
              size={28}
              color={isActive ? Colors.primary : Colors.textTertiary}
            />
            {isTrackPlaying && (
              <View style={styles.playOverlay}>
                <MaterialIcons name="equalizer" size={14} color={Colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.fileInfo}>
            <Text
              style={[styles.fileName, isActive && styles.fileNameActive]}
              numberOfLines={1}
            >
              {item.filename}
            </Text>
            <View style={styles.fileMeta}>
              <Text style={styles.fileMetaText}>{formatDuration(item.duration)}</Text>
              <View style={styles.dot} />
              <Text style={styles.fileMetaText}>{formatFileSize(item.size)}</Text>
              <View style={styles.dot} />
              <Text style={styles.fileMetaText}>{dateStr}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.6 }]}
            onPress={() => handlePlay(item)}
            hitSlop={8}
          >
            <MaterialIcons
              name={isTrackPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={32}
              color={isActive ? Colors.primary : Colors.textTertiary}
            />
          </Pressable>
        </Pressable>
      );
    },
    [currentTrack, isPlaying, handlePlay]
  );

  const keyExtractor = useCallback((item: Track) => item.id, []);
  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Files</Text>
          <Text style={styles.headerSubtitle}>{tracks.length} audio files</Text>
        </View>
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by</Text>
        <View style={styles.sortButtons}>
          {(['name', 'size', 'date'] as SortMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setSortMode(mode)}
              style={[
                styles.sortBtn,
                sortMode === mode && styles.sortBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  sortMode === mode && styles.sortBtnTextActive,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Storage Info */}
      <View style={styles.storageBar}>
        <MaterialIcons name="folder-open" size={16} color={Colors.primary} />
        <Text style={styles.storageText}>
          {tracks.reduce((a, t) => a + t.size, 0) > 0
            ? `${(tracks.reduce((a, t) => a + t.size, 0) / (1024 * 1024)).toFixed(1)} MB total`
            : 'Tap a file to play'}
        </Text>
      </View>

      {/* File List */}
      <FlatList
        data={sortedTracks}
        keyExtractor={keyExtractor}
        renderItem={renderFile}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sortLabel: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  sortBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  sortBtnTextActive: {
    color: Colors.primary,
  },
  storageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  storageText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  fileItemActive: {
    backgroundColor: Colors.bgCard,
  },
  fileItemPressed: {
    backgroundColor: Colors.bgElevated,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileName: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  fileNameActive: {
    color: Colors.primary,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  fileMetaText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary,
  },
  playBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },
});
