'use client';

import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { spotifyClient } from '@/lib/spotify';

interface SpotifyWebPlayerProps {
  onTrackChange: (trackId: string) => void;
}

export default function SpotifyWebPlayer({ onTrackChange }: SpotifyWebPlayerProps) {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [status, setStatus] = useState('Connecting Spotify player…');

  useEffect(() => {
    let disposed = false;

    const transferPlayback = async (deviceId: string) => {
      try {
        const token = await spotifyClient.getValidAccessToken();
        await axios.put(
          'https://api.spotify.com/v1/me/player',
          { device_ids: [deviceId], play: true },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!disposed) setStatus('Playing in this browser');
      } catch {
        if (!disposed) setStatus('Player is ready. Start a song, then use the controls below.');
      }
    };

    const createPlayer = () => {
      if (disposed || !window.Spotify || playerRef.current) return;

      const player = new window.Spotify.Player({
        name: 'Spotify Lyrics Web Player',
        getOAuthToken: (callback) => {
          spotifyClient.getValidAccessToken().then(callback).catch(() => {
            if (!disposed) setStatus('Your Spotify session expired. Please reconnect.');
          });
        },
        volume: 0.7,
      });

      player.addListener('ready', ({ device_id }) => {
        if (disposed) return;
        setIsReady(true);
        setStatus('Spotify player ready');
        void transferPlayback(device_id);
      });
      player.addListener('not_ready', () => {
        if (!disposed) {
          setIsReady(false);
          setStatus('Spotify player disconnected');
        }
      });
      player.addListener('initialization_error', () => setStatus('Could not start the Spotify player.'));
      player.addListener('authentication_error', () => setStatus('Reconnect Spotify to grant playback permission.'));
      player.addListener('account_error', () => setStatus('Spotify Premium is required for browser playback.'));
      player.addListener('player_state_changed', (state) => {
        if (!state || disposed) return;
        setIsPaused(state.paused);
        onTrackChange(state.track_window.current_track.id);
      });

      playerRef.current = player;
      void player.connect();
    };

    const existingScript = document.getElementById('spotify-web-playback-sdk');
    if (window.Spotify) {
      createPlayer();
    } else if (existingScript) {
      existingScript.addEventListener('load', createPlayer, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = 'spotify-web-playback-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.addEventListener('load', createPlayer, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      disposed = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [onTrackChange]);

  const runPlayerAction = (action: () => Promise<void>) => {
    void action().catch(() => setStatus('Playback command failed. Reconnect Spotify and try again.'));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-white/10 bg-black/90 px-4 py-3 text-white backdrop-blur">
      <p className="min-w-0 truncate text-sm text-white/75">{status}</p>
      <div className="flex shrink-0 items-center gap-2">
        <button disabled={!isReady} onClick={() => runPlayerAction(() => playerRef.current!.previousTrack())} className="rounded-full px-3 py-1 disabled:opacity-40" aria-label="Previous track">◀</button>
        <button disabled={!isReady} onClick={() => runPlayerAction(() => playerRef.current!.togglePlay())} className="rounded-full bg-green-500 px-4 py-2 font-semibold text-black disabled:opacity-40" aria-label={isPaused ? 'Play' : 'Pause'}>{isPaused ? 'Play' : 'Pause'}</button>
        <button disabled={!isReady} onClick={() => runPlayerAction(() => playerRef.current!.nextTrack())} className="rounded-full px-3 py-1 disabled:opacity-40" aria-label="Next track">▶</button>
      </div>
    </div>
  );
}
