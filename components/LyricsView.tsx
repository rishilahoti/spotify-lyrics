'use client';

import { useState, useEffect, useRef } from 'react';
import { useSpotifyTrack } from '@/hooks/useSpotifyTrack';
import { useLyrics } from '@/hooks/useLyrics';
import { youtubeClient } from '@/lib/youtube';
import { getContrastColor } from '@/lib/colorExtractor';
import LyricsDisplay from './LyricsDisplay';
import LyricsControls from './LyricsControls';
import VideoOverlay from './VideoOverlay';

type BackgroundMode = 'album' | 'dark' | 'custom';
type VideoType = 'music' | 'lofi';

interface LyricsViewProps {
  trackId?: string;
  currentTimeMs?: number;
}

export default function LyricsView({ trackId, currentTimeMs }: LyricsViewProps) {
  const { track, colors, isLoading: trackLoading } = useSpotifyTrack(trackId);
  const { lyrics, activeLineIndex, isLoading: lyricsLoading, error: lyricsError } = useLyrics(track?.id || null, currentTimeMs);

  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('album');
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [customColor, setCustomColor] = useState('#353535');
  const [musicVideoUrl, setMusicVideoUrl] = useState<string | null>(null);
  const [lofiVideoUrl, setLofiVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const requestedMusicTrackRef = useRef<string | null>(null);

  // Fetch video when video mode is enabled and track is available
  useEffect(() => {
    if (videoType !== 'music' || !track || requestedMusicTrackRef.current === track.id) {
      return;
    }

    let cancelled = false;
    requestedMusicTrackRef.current = track.id;
    youtubeClient
      .searchMusicVideo(track.name, track.artists[0]?.name || '')
      .then((video) => {
        if (!cancelled) {
          setMusicVideoUrl(video?.embedUrl ?? null);
          setVideoError(video ? null : 'No embeddable music video was found for this track.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMusicVideoUrl(null);
          setVideoError('Could not load a music video. Check the YouTube API key configuration.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [videoType, track]);

  useEffect(() => {
    if (videoType !== 'lofi' || lofiVideoUrl) return;

    let cancelled = false;
    youtubeClient.searchLofiBackground().then((video) => {
      if (!cancelled) {
        setLofiVideoUrl(video?.embedUrl ?? null);
        setVideoError(video ? null : 'Could not find an embeddable lofi background video.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [videoType, lofiVideoUrl]);

  // Determine background color based on mode
  const getBackgroundColor = (): string => {
    switch (backgroundMode) {
      case 'dark':
        return '#000000';
      case 'custom':
        return customColor;
      case 'album':
      default:
        return colors?.primary || '#353535';
    }
  };

  // Determine text color based on background
  const getTextColor = (): string => {
    if (backgroundMode === 'dark') {
      return '#FFFFFF';
    }
    const bgColor = getBackgroundColor();
    return getContrastColor(bgColor);
  };

  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();

  const handleDarkModeToggle = () => {
    if (backgroundMode === 'dark') {
      setBackgroundMode('album');
    } else {
      setBackgroundMode('dark');
      setIsVideoVisible(false);
    }
  };

  const showVideo = (type: VideoType) => {
    if (videoType === type && isVideoVisible) {
      setIsVideoVisible(false);
    } else {
      setVideoError(null);
      setVideoType(type);
      setIsVideoVisible(true);
      setBackgroundMode('album');
    }
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setBackgroundMode('custom');
    setIsVideoVisible(false);
  };

  const activeVideoUrl = videoType === 'music' ? musicVideoUrl : lofiVideoUrl;

  if (trackLoading || !track) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-lg mb-4">Loading track...</p>
          <p className="text-sm text-white/60">
            {!track && 'No track currently playing. Please start playing a song on Spotify.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden transition-colors duration-500"
      style={{ backgroundColor }}
    >
      <VideoOverlay videoUrl={activeVideoUrl} isVisible={isVideoVisible}>
        {/* Header with Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-lg font-semibold truncate">{track.name}</h2>
              <p className="text-white/80 text-sm truncate">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
            <LyricsControls
              isDarkMode={backgroundMode === 'dark'}
              isVideoMode={videoType === 'music' && isVideoVisible}
              isLofiMode={videoType === 'lofi' && isVideoVisible}
              customColor={customColor}
              onDarkModeToggle={handleDarkModeToggle}
              onVideoToggle={() => showVideo('music')}
              onLofiToggle={() => showVideo('lofi')}
              onCustomColorChange={handleCustomColorChange}
            />
          </div>
        </div>

        {/* Lyrics Display */}
        <div className="absolute inset-0 pt-24 pb-8">
          {lyricsLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-white/60 text-lg">Loading lyrics...</p>
            </div>
          ) : lyricsError ? (
            <div className="flex items-center justify-center h-full px-6">
              <p className="max-w-lg text-center text-white/70 text-lg">{lyricsError}</p>
            </div>
          ) : (
            <LyricsDisplay
              lyrics={lyrics}
              activeLineIndex={activeLineIndex}
              textColor={textColor}
              activeTextColor={textColor}
              passedTextColor={textColor}
            />
          )}
        </div>

        {videoError && isVideoVisible && (
          <p className="absolute bottom-20 left-1/2 z-20 max-w-md -translate-x-1/2 rounded bg-black/60 px-3 py-2 text-center text-sm text-white/80">
            {videoError}
          </p>
        )}
      </VideoOverlay>
    </div>
  );
}
