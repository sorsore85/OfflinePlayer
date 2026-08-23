// Powered by OnSpace.AI
import * as MediaLibrary from 'expo-media-library';
import { Track } from '@/types/music';
import { MOCK_TRACKS } from '@/constants/mockData';

export async function requestMediaPermission(): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function loadDeviceTracks(): Promise<Track[]> {
  try {
    const permission = await requestMediaPermission();
    if (!permission) return MOCK_TRACKS;

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500,
      sortBy: [MediaLibrary.SortBy.default],
    });

    if (!media.assets.length) return MOCK_TRACKS;

    const tracks: Track[] = media.assets.map((asset) => ({
      id: asset.id,
      title: asset.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: asset.duration,
      uri: asset.uri,
      artwork: null,
      dateAdded: asset.creationTime,
      filename: asset.filename,
      size: 0,
    }));

    return tracks;
  } catch (e) {
    console.log('MediaLibrary error:', e);
    return MOCK_TRACKS;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
