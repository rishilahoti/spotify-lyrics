'use client';

import { useState, useEffect } from 'react';
import { useSpotifyTrack } from '@/hooks/useSpotifyTrack';
import { useLyrics } from '@/hooks/useLyrics';
import { youtubeClient } from '@/lib/youtube';
import { getContrastColor } from '@/lib/colorExtractor';
import LyricsDisplay from './LyricsDisplay';
import LyricsControls from './LyricsControls';
import VideoOverlay from './VideoOverlay';

type BackgroundMode = 'album' | 'dark' | 'custom';

interface LyricsViewProps {
  trackId?: string;
  currentTimeMs?: number;
}

export default function LyricsView({ trackId, currentTimeMs }: LyricsViewProps) {
  const { track, albumCoverUrl, colors, isLoading: trackLoading } = useSpotifyTrack(trackId);
  const { lyrics, activeLineIndex, isLoading: lyricsLoading } = useLyrics(track?.id || null, currentTimeMs);

  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('album');
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [customColor, setCustomColor] = useState('#353535');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Fetch video when video mode is enabled and track is available
  useEffect(() => {
    if (isVideoMode && track && !videoUrl && !isLoadingVideo) {
      setIsLoadingVideo(true);
      youtubeClient
        .searchMusicVideo(track.name, track.artists[0]?.name || '')
        .then((video) => {
          if (video) {
            setVideoUrl(video.embedUrl);
          }
          setIsLoadingVideo(false);
        })
        .catch(() => {
          setIsLoadingVideo(false);
        });
    } else if (!isVideoMode) {
      setVideoUrl(null);
    }
  }, [isVideoMode, track, videoUrl, isLoadingVideo]);

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
      setIsVideoMode(false); // Disable video when switching to dark mode
    }
  };

  const handleVideoToggle = () => {
    setIsVideoMode(!isVideoMode);
    if (!isVideoMode) {
      setBackgroundMode('album'); // Reset to album mode when enabling video
    }
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setBackgroundMode('custom');
    setIsVideoMode(false); // Disable video when using custom color
  };

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
      <VideoOverlay videoUrl={videoUrl} isVisible={isVideoMode}>
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
              isVideoMode={isVideoMode}
              customColor={customColor}
              onDarkModeToggle={handleDarkModeToggle}
              onVideoToggle={handleVideoToggle}
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
      </VideoOverlay>
    </div>
  );
}
