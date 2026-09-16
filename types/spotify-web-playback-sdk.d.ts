interface SpotifyWebPlaybackTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
}

interface SpotifyWebPlaybackState {
  paused: boolean;
  track_window: { current_track: SpotifyWebPlaybackTrack };
}

interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  addListener(event: string, callback: (data: never) => void): boolean;
  addListener(event: 'ready', callback: (data: { device_id: string }) => void): boolean;
  addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): boolean;
  addListener(event: 'player_state_changed', callback: (state: SpotifyWebPlaybackState | null) => void): boolean;
}

interface SpotifyNamespace {
  Player: new (options: {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume: number;
  }) => SpotifyPlayer;
}

interface Window {
  Spotify?: SpotifyNamespace;
}
