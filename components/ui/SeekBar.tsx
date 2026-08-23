// Powered by OnSpace.AI
import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { formatDuration } from '@/services/mediaLibraryService';

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
}

const SeekBar = memo(({ position, duration, onSeek }: SeekBarProps) => {
  const [width, setWidth] = useState(300);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const progress = duration > 0 ? (isSeeking ? seekPosition : position) / duration : 0;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsSeeking(true);
      const x = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / width));
      setSeekPosition(ratio * duration);
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / width));
      setSeekPosition(ratio * duration);
    },
    onPanResponderRelease: (evt) => {
      const x = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / width));
      const newPosition = ratio * duration;
      setIsSeeking(false);
      onSeek(newPosition);
    },
  });

  const displayPosition = isSeeking ? seekPosition : position;

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: `${clampedProgress * 100}%` }]} />
        <View
          style={[
            styles.thumb,
            { left: `${clampedProgress * 100}%` },
            isSeeking && styles.thumbActive,
          ]}
        />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatDuration(displayPosition)}</Text>
        <Text style={styles.time}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
});

SeekBar.displayName = 'SeekBar';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.sm,
  },
  track: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  trackBg: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  trackFill: {
    position: 'absolute',
    left: 6,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.textPrimary,
    marginLeft: -7,
    top: '50%',
    marginTop: -7,
  },
  thumbActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    marginTop: -9,
    backgroundColor: Colors.primary,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  time: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
});

export default SeekBar;
