'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { spotifyClient, LyricsLine } from '@/lib/spotify';

interface UseLyricsReturn {
  lyrics: LyricsLine[];
  activeLineIndex: number;
  isLoading: boolean;
  error: string | null;
  refreshLyrics: () => Promise<void>;
  setCurrentTime: (timeMs: number) => void;
}

export function useLyrics(trackId: string | null, currentTimeMs?: number): UseLyricsReturn {
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lyricsRef = useRef<LyricsLine[]>([]);

  const fetchLyrics = useCallback(async () => {
    if (!trackId) {
      lyricsRef.current = [];
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await spotifyClient.getLyrics(trackId);
      if (data) {
        lyricsRef.current = data.lyrics.lines || [];
      } else {
        lyricsRef.current = [];
        setError('Lyrics need a licensed provider. Spotify\'s public Web API does not provide lyrics.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lyrics';
      setError(message);
      console.error('Error fetching lyrics:', err);
      lyricsRef.current = [];
    } finally {
      setIsLoading(false);
    }
  }, [trackId]);

  // Update active line based on current time
  useEffect(() => {
    if (currentTimeMs === undefined || lyricsRef.current.length === 0) {
      setActiveLineIndex(-1);
      return;
    }

    // Find the current line based on startTimeMs
    let newActiveIndex = -1;
    for (let i = 0; i < lyricsRef.current.length; i++) {
      const line = lyricsRef.current[i];
      const startTime = parseInt(line.startTimeMs, 10);

      if (currentTimeMs >= startTime) {
        // Check if there's a next line to see if we should move to it
        if (i < lyricsRef.current.length - 1) {
          const nextLine = lyricsRef.current[i + 1];
          const nextStartTime = parseInt(nextLine.startTimeMs, 10);
          if (currentTimeMs < nextStartTime) {
            newActiveIndex = i;
            break;
          }
        } else {
          // Last line
          newActiveIndex = i;
        }
      }
    }

    setActiveLineIndex(newActiveIndex);
  }, [currentTimeMs]);

  useEffect(() => {
    fetchLyrics();
  }, [fetchLyrics]);

  const setCurrentTime = useCallback((_timeMs: number) => {
    // This is handled by the useEffect above
    // But we expose it for external control if needed
    void _timeMs;
  }, []);

  return {
    lyrics: lyricsRef.current,
    activeLineIndex,
    isLoading,
    error,
    refreshLyrics: fetchLyrics,
    setCurrentTime,
  };
}
