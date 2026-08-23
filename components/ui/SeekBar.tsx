// Powered by OnSpace.AI
import React, { memo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { formatDuration } from '@/services/mediaLibraryService';

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
  accentColor?: string;
}

const SeekBar = memo(({ position, duration, onSeek, accentColor }: SeekBarProps) => {
  const [width, setWidth] = useState(300);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPos, setSeekPos] = useState(0);
  const widthRef = useRef(300);

  const fill = accentColor ?? Colors.primary;

  const getProgress = (px: number) =>
    Math.max(0, Math.min(1, px / widthRef.current));

  const displayPos = isSeeking ? seekPos : position;
  const progress = duration > 0 ? Math.max(0, Math.min(1, displayPos / duration)) : 0;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    widthRef.current = w;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsSeeking(true);
        const p = getProgress(evt.nativeEvent.locationX);
        setSeekPos(p * duration);
      },
      onPanResponderMove: (evt) => {
        const p = getProgress(evt.nativeEvent.locationX);
        setSeekPos(p * duration);
      },
      onPanResponderRelease: (evt) => {
        const p = getProgress(evt.nativeEvent.locationX);
        const newPos = p * duration;
        setSeekPos(newPos);
        setIsSeeking(false);
        onSeek(newPos);
      },
      onPanResponderTerminate: () => {
        setIsSeeking(false);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Interactive track area */}
      <View
        style={styles.trackHitArea}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Background rail */}
        <View style={styles.rail} />
        {/* Filled portion */}
        <View
          style={[
            styles.filled,
            { width: `${progress * 100}%`, backgroundColor: fill },
          ]}
        />
        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${progress * 100}%`,
              backgroundColor: isSeeking ? fill : Colors.textPrimary,
              width: isSeeking ? 18 : 13,
              height: isSeeking ? 18 : 13,
              borderRadius: isSeeking ? 9 : 6.5,
              marginLeft: isSeeking ? -9 : -6.5,
              marginTop: isSeeking ? -9 : -6.5,
            },
          ]}
        />
      </View>

      {/* Time labels */}
      <View style={styles.times}>
        <Text style={styles.timeText}>{formatDuration(displayPos)}</Text>
        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
});

SeekBar.displayName = 'SeekBar';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  trackHitArea: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 0,
    position: 'relative',
  },
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  filled: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: Radius.full,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});

export default SeekBar;
