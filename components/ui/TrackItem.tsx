// Powered by OnSpace.AI
import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import AlbumArt from './AlbumArt';
import { Track } from '@/types/music';
import { formatDuration } from '@/services/mediaLibraryService';
import { usePlayer } from '@/hooks/usePlayer';

interface TrackItemProps {
  track: Track;
  isPlaying?: boolean;
  isActive?: boolean;
  onPress: () => void;
  showArtist?: boolean;
}

const TrackItem = memo(({
  track,
  isPlaying,
  isActive,
  onPress,
  showArtist = true,
}: TrackItemProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const { toggleFavorite, isFavorite } = usePlayer();
  const favorited = isFavorite(track.id);

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={() => setShowOptions(true)}
        style={({ pressed }) => [
          styles.container,
          isActive && styles.containerActive,
          pressed && styles.containerPressed,
        ]}
        android_ripple={{ color: Colors.overlayLight }}
      >
        <AlbumArt artwork={track.artwork} trackId={track.id} size={48} borderRadius={8} />

        <View style={styles.info}>
          <Text
            style={[styles.title, isActive && styles.titleActive]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
          {showArtist && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {track.artist}
              {track.album && track.album !== 'Unknown Album'
                ? ` — ${track.album}`
                : ''}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          {isPlaying ? (
            <MaterialIcons name="equalizer" size={18} color={Colors.primary} />
          ) : (
            <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
          )}
          <Pressable
            onPress={() => setShowOptions(true)}
            style={({ pressed }) => [styles.moreBtn, pressed && { opacity: 0.5 }]}
            hitSlop={6}
          >
            <MaterialIcons name="more-vert" size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>
      </Pressable>

      {/* Options bottom sheet */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.optionSheet}>
            {/* Track info header */}
            <View style={styles.sheetHeader}>
              <AlbumArt artwork={track.artwork} trackId={track.id} size={44} borderRadius={8} />
              <View style={styles.sheetInfo}>
                <Text style={styles.sheetTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.sheetArtist} numberOfLines={1}>{track.artist}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Options */}
            <OptionRow
              icon={favorited ? 'favorite' : 'favorite-border'}
              label={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
              iconColor={favorited ? Colors.primary : Colors.textSecondary}
              onPress={() => {
                toggleFavorite(track.id);
                setShowOptions(false);
              }}
            />
            <OptionRow
              icon="play-arrow"
              label="Play Now"
              onPress={() => {
                onPress();
                setShowOptions(false);
              }}
            />
            <OptionRow
              icon="info-outline"
              label={`${formatDuration(track.duration)} • ${track.filename}`}
              onPress={() => setShowOptions(false)}
              subtle
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
});

function OptionRow({
  icon,
  label,
  onPress,
  iconColor,
  subtle,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  iconColor?: string;
  subtle?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
    >
      <MaterialIcons
        name={icon as any}
        size={22}
        color={iconColor ?? (subtle ? Colors.textTertiary : Colors.textSecondary)}
      />
      <Text style={[styles.optionLabel, subtle && styles.optionLabelSubtle]}>{label}</Text>
    </Pressable>
  );
}

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
    includeFontPadding: false,
  },
  titleActive: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  duration: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  moreBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  optionSheet: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingBottom: 32,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sheetInfo: {
    flex: 1,
    gap: 3,
  },
  sheetTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  sheetArtist: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  optionRowPressed: {
    backgroundColor: Colors.bgElevated,
  },
  optionLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    flex: 1,
    includeFontPadding: false,
  },
  optionLabelSubtle: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
});

export default TrackItem;
