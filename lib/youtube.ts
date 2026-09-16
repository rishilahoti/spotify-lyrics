import axios from 'axios';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
}

class YouTubeClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
  }

  /**
   * Search for a music video by track name and artist
   */
  async searchMusicVideo(trackName: string, artistName: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return null;
    }

    try {
      const query = `${artistName} ${trackName} official music video`;
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: 1,
          key: this.apiKey,
          videoCategoryId: '10', // Music category
          videoEmbeddable: 'true',
          videoSyndicated: 'true',
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        return {
          videoId: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
          embedUrl: this.getEmbedUrl(video.id.videoId),
        };
      }

      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error searching YouTube:', error.message);
      } else {
        console.error('Error searching YouTube:', error);
      }
      // Return null instead of throwing to gracefully handle API errors
      return null;
    }
  }

  /** Find an embeddable, muted 2D/lofi-style decorative background video. */
  async searchLofiBackground(): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return null;
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: 'lofi 2d animated aesthetic background',
          type: 'video',
          maxResults: 12,
          key: this.apiKey,
          videoEmbeddable: 'true',
          videoSyndicated: 'true',
        },
      });
      const videos = response.data.items ?? [];
      if (videos.length === 0) return null;

      const video = videos[Math.floor(Math.random() * videos.length)];
      return {
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        embedUrl: this.getEmbedUrl(video.id.videoId),
      };
    } catch (error) {
      console.error('Error searching for lofi background:', error);
      return null;
    }
  }

  /**
   * Get embed URL for a video ID
   */
  getEmbedUrl(videoId: string): string {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      controls: '0',
      disablekb: '1',
      playsinline: '1',
      modestbranding: '1',
      rel: '0',
      enablejsapi: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      fs: '0',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }
}

// Export singleton instance
export const youtubeClient = new YouTubeClient();
