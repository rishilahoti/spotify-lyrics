'use client';

import { useState, useEffect, useCallback } from 'react';
import { spotifyClient, SpotifyTrack } from '@/lib/spotify';
import { extractColorsFromImage, ExtractedColors } from '@/lib/colorExtractor';

interface UseSpotifyTrackReturn {
  track: SpotifyTrack | null;
  albumCoverUrl: string | null;
  colors: ExtractedColors | null;
  isLoading: boolean;
  error: string | null;
  refreshTrack: () => Promise<void>;
}

export function useSpotifyTrack(trackId?: string): UseSpotifyTrackReturn {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [albumCoverUrl, setAlbumCoverUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColors | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let trackData: SpotifyTrack | null = null;

      if (trackId) {
        trackData = await spotifyClient.getTrack(trackId);
      } else {
        trackData = await spotifyClient.getCurrentlyPlaying();
      }

      if (trackData) {
        setTrack(trackData);
        const coverUrl = spotifyClient.getAlbumCoverUrl(trackData, 'large');
        setAlbumCoverUrl(coverUrl);

        // Extract colors from album cover
        if (coverUrl) {
          try {
            const extractedColors = await extractColorsFromImage(coverUrl);
            setColors(extractedColors);
          } catch (colorError) {
            console.error('Error extracting colors:', colorError);
            // Set default colors if extraction fails
            setColors({
              primary: '#353535',
              secondary: '#535353',
              text: '#FFFFFF',
            });
          }
        }
      } else {
        setTrack(null);
        setAlbumCoverUrl(null);
        setColors(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch track';
      setError(message);
      console.error('Error fetching track:', err);
    } finally {
      setIsLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  return {
    track,
    albumCoverUrl,
    colors,
    isLoading,
    error,
    refreshTrack: fetchTrack,
  };
}
