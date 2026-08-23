// Powered by OnSpace.AI
import { useState, useEffect } from 'react';
import { Track } from '@/types/music';
import { loadDeviceTracks } from '@/services/mediaLibraryService';
import { MOCK_TRACKS } from '@/constants/mockData';

export function useMediaLibrary() {
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadDeviceTracks();
      setTracks(result);
      const isReal = result !== MOCK_TRACKS && result.length > 0 && result[0].uri !== '';
      setHasPermission(isReal);
    } catch (e) {
      setError('Could not load music library');
      setTracks(MOCK_TRACKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { tracks, loading, hasPermission, error, reload: load };
}
