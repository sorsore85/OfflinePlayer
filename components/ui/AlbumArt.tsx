// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

// Local fallback palette – no external import needed
const COLORS = [
  '#FC3C44', '#5E5CE6', '#30D158', '#FFD60A',
  '#BF5AF2', '#FF9F0A', '#64D2FF', '#FF6B70',
  '#1e1e2e', '#2a2a3c', '#3b3b52',
];

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
