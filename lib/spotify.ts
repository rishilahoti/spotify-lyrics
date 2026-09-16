import axios from 'axios';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface LyricsLine {
  startTimeMs: string;
  words: string;
  syllables: Array<{ startTimeMs: string; endTimeMs: string }>;
}

export interface LyricsData {
  lyrics: {
    syncType: string;
    lines: LyricsLine[];
    provider: string;
    providerDisplayName: string;
    providerLyricsId: string;
    providerLyricsUrl: string;
    providerUrl: string;
    isDenseTypeface: boolean;
    alternatives: unknown[];
    language: string;
    isRtlLanguage: boolean;
    fullscreenAction: string;
  };
  colors: {
    background: number;
    text: number;
    highlightText: number;
  };
  hasVocalRemoval: boolean;
}

class SpotifyClient {
  private clientId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    this.redirectUri = 
      process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  }

  /**
   * Generate Spotify OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post('/api/auth/token', {
        code,
        redirectUri: this.redirectUri,
      });

      const accessToken = response.data.access_token;
      if (!accessToken) {
        throw new Error('Access token not received from Spotify API');
      }

      this.accessToken = accessToken;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
      }
      
      return accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Set access token directly (for testing or manual token management)
   */
  setAccessToken(token: string, expiresIn?: number): void {
    this.accessToken = token;
    if (expiresIn) {
      this.tokenExpiry = Date.now() + expiresIn * 1000;
    } else if (typeof window !== 'undefined') {
      // Try to get expiry from localStorage
      const storedExpiry = localStorage.getItem('spotify_token_expiry');
      if (storedExpiry) {
        this.tokenExpiry = parseInt(storedExpiry, 10);
      }
    }
  }

  /**
   * Load token from localStorage if available
   */
  loadStoredToken(): boolean {
    if (typeof window === 'undefined') return false;
    
    const storedToken = localStorage.getItem('spotify_access_token');
    const storedExpiry = localStorage.getItem('spotify_token_expiry');
    
    if (storedToken && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      if (Date.now() < expiry) {
        this.accessToken = storedToken;
        this.tokenExpiry = expiry;
        return true;
      } else {
        // Token expired, clear it
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
    }
    
    return false;
  }

  /**
   * Check if token is valid and refresh if needed
   */
  private async ensureValidToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Token expired or not set - user needs to re-authenticate
    throw new Error('Access token expired. Please re-authenticate.');
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.item) {
        return response.data.item as SpotifyTrack;
      }
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 204) {
        // No track currently playing
        return null;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting currently playing track:', message);
      throw error;
    }
  }

  /**
   * Get track by ID
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data as SpotifyTrack;
    } catch (error) {
      console.error('Error getting track:', error);
      throw error;
    }
  }

  /**
   * Get lyrics for a track
   */
  async getLyrics(trackId: string): Promise<LyricsData | null> {
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}/lyrics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data as LyricsData;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Lyrics not available
        return null;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting lyrics:', message);
      throw error;
    }
  }

  /**
   * Get album cover image URL
   */
  getAlbumCoverUrl(track: SpotifyTrack, size: 'small' | 'medium' | 'large' = 'large'): string | null {
    if (!track.album.images || track.album.images.length === 0) {
      return null;
    }

    const sizeMap = {
      small: 0,
      medium: 1,
      large: track.album.images.length - 1,
    };

    const imageIndex = Math.min(sizeMap[size], track.album.images.length - 1);
    return track.album.images[imageIndex]?.url || null;
  }
}

// Export singleton instance
export const spotifyClient = new SpotifyClient();
