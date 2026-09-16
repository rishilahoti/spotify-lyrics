'use client';

import { useState, useEffect } from 'react';
import LyricsView from '@/components/LyricsView';
import SpotifyWebPlayer from '@/components/SpotifyWebPlayer';
import { spotifyClient } from '@/lib/spotify';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | undefined>();
  // Note: currentTimeMs is reserved for future playback position sync
  const [currentTimeMs] = useState<number | undefined>();

  // Check for access token in URL (OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (error) {
      console.error('Spotify authentication error:', error);
      queueMicrotask(() => setAuthError(`Spotify sign-in failed: ${error}`));
      return;
    }

    if (code) {
      if (!spotifyClient.validateState(state)) {
        queueMicrotask(() => setAuthError('Spotify sign-in could not be verified. Please try again.'));
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      // Exchange code for token
      spotifyClient
        .getAccessToken(code)
        .then(() => {
          setIsAuthenticated(true);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('Failed to get access token:', err);
          setAuthError('Could not complete Spotify sign-in. Check the redirect URI and try again.');
        });
    } else {
      // Check if we have a stored token
      const hasToken = spotifyClient.loadStoredToken();
      if (hasToken) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 0);
      }
    }
  }, []);

  // Poll for currently playing track
  useEffect(() => {
    if (!isAuthenticated) return;

    const pollTrack = async () => {
      try {
        const track = await spotifyClient.getCurrentlyPlaying();
        if (track) {
          setTrackId(track.id);
          // Note: In a real implementation, you'd get current playback position from Spotify API
          // For now, we'll use a mock or let the user control it
        }
      } catch (error) {
        console.error('Error polling track:', error);
      }
    };

    pollTrack();
    const interval = setInterval(pollTrack, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = () => {
    try {
      const authUrl = spotifyClient.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to start Spotify sign-in.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Spotify Lyrics</h1>
          <p className="text-white/60 mb-8">
            Connect your Spotify account to view synchronized lyrics
          </p>
          {authError && <p className="mb-4 max-w-md text-sm text-red-300">{authError}</p>}
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full font-semibold transition-colors"
          >
            Connect with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LyricsView trackId={trackId} currentTimeMs={currentTimeMs} />
      <SpotifyWebPlayer onTrackChange={setTrackId} />
    </>
  );
}
