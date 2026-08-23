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

    // Fetch up to 500 audio files, newest first
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    if (!media.assets.length) return MOCK_TRACKS;

    // Enrich with full asset info (URI, size, etc.) in parallel batches of 20
    const enriched: Track[] = [];
    const BATCH = 20;
    for (let i = 0; i < media.assets.length; i += BATCH) {
      const batch = media.assets.slice(i, i + BATCH);
      const infos = await Promise.all(
        batch.map((a) =>
          MediaLibrary.getAssetInfoAsync(a).catch(() => null)
        )
      );
      for (let j = 0; j < batch.length; j++) {
        const asset = batch[j];
        const info = infos[j];
        const uri = info?.localUri ?? info?.uri ?? asset.uri;
        const filename = asset.filename;
        const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
        enriched.push({
          id: asset.id,
          title: baseName,
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: Math.round(asset.duration),
          uri,
          artwork: null,
          dateAdded: asset.creationTime,
          filename,
          size: (info as any)?.fileSize ?? 0,
        });
      }
    }

    return enriched;
  } catch (e) {
    console.log('[MediaLibrary] error:', e);
    return MOCK_TRACKS;
  }
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
