// Powered by OnSpace.AI
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { TrackItem } from '@/components';
import { usePlayer } from '@/hooks/usePlayer';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { Track } from '@/types/music';

type Section = 'all' | 'recent';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { tracks: mediaLibraryTracks, loading, hasPermission } = useMediaLibrary();
  const { currentTrack, isPlaying, playTrack, setTracks, tracks } = usePlayer();
  const [activeSection, setActiveSection] = useState<Section>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (mediaLibraryTracks.length > 0) {
      setTracks(mediaLibraryTracks);
    }
  }, [mediaLibraryTracks]);

  const sortedByRecent = useMemo(
    () => [...tracks].sort((a, b) => b.dateAdded - a.dateAdded),
    [tracks]
  );

  const sortedAlpha = useMemo(
    () => [...tracks].sort((a, b) => a.title.localeCompare(b.title)),
    [tracks]
  );

  const displayTracks = useMemo(() => {
    const base = activeSection === 'recent' ? sortedByRecent : sortedAlpha;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [activeSection, sortedByRecent, sortedAlpha, searchQuery]);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      playTrack(track, displayTracks);
    },
    [displayTracks, playTrack]
  );

  const renderTrack = useCallback(
    ({ item }: { item: Track }) => (
      <TrackItem
        track={item}
        isActive={currentTrack?.id === item.id}
        isPlaying={currentTrack?.id === item.id && isPlaying}
        onPress={() => handlePlayTrack(item)}
      />
    ),
    [currentTrack, isPlaying, handlePlayTrack]
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
        {showSearch ? (
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs, artists..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            <Pressable
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              hitSlop={8}
            >
              <Text style={styles.cancelBtn}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>Library</Text>
            <Pressable
              onPress={() => setShowSearch(true)}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
              hitSlop={8}
            >
              <MaterialIcons name="search" size={24} color={Colors.textPrimary} />
            </Pressable>
          </>
        )}
      </View>

      {/* Section Tabs */}
      <View style={styles.sectionBar}>
        {(['all', 'recent'] as Section[]).map((section) => (
          <Pressable
            key={section}
            onPress={() => setActiveSection(section)}
            style={[
              styles.sectionTab,
              activeSection === section && styles.sectionTabActive,
            ]}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === section && styles.sectionTabTextActive,
              ]}
            >
              {section === 'all' ? 'All Songs' : 'Recently Added'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Track count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          {displayTracks.length} {displayTracks.length === 1 ? 'song' : 'songs'}
        </Text>
        {!hasPermission && (
          <View style={styles.mockBadge}>
            <Text style={styles.mockBadgeText}>DEMO DATA</Text>
          </View>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading music library...</Text>
        </View>
      ) : displayTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="music-off" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No songs found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try a different search term' : 'No music files on this device'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayTracks}
          keyExtractor={keyExtractor}
          renderItem={renderTrack}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          maxToRenderPerBatch={20}
          windowSize={10}
          initialNumToRender={15}
        />
      )}
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
    minHeight: 56,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  cancelBtn: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  sectionBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: 3,
    gap: 2,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.lg,
  },
  sectionTabActive: {
    backgroundColor: Colors.primary,
  },
  sectionTabText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
  },
  sectionTabTextActive: {
    color: Colors.textPrimary,
  },
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  countText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  mockBadge: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mockBadgeText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: Typography.semibold,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 76,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  loadingText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
