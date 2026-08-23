// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, ACCENT_COLORS } from '@/constants/theme';

// Need to import ACCENT_COLORS from mockData
import { ACCENT_COLORS as COLORS } from '@/constants/mockData';

interface AlbumArtProps {
  artwork?: string | null;
  trackId?: string;
  size?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

const AlbumArt = memo(({ artwork, trackId, size = 50, style, borderRadius }: AlbumArtProps) => {
  const colorIndex = trackId
    ? parseInt(trackId, 10) % COLORS.length
    : 0;
  const accentColor = COLORS[isNaN(colorIndex) ? 0 : colorIndex];

  const radius = borderRadius ?? Radius.md;

  if (artwork) {
    return (
      <View style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }, style]}>
        <Image
          source={{ uri: artwork }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: accentColor + '33',
          borderColor: accentColor + '55',
        },
        style,
      ]}
    >
      <MaterialIcons name="music-note" size={size * 0.42} color={accentColor} />
    </View>
  );
});

AlbumArt.displayName = 'AlbumArt';

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default AlbumArt;
