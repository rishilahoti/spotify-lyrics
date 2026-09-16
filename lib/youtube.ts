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
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        return {
          videoId: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
          embedUrl: `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`,
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

  /**
   * Get embed URL for a video ID
   */
  getEmbedUrl(videoId: string, autoplay: boolean = true): string {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      enablejsapi: '1',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }
}

// Export singleton instance
export const youtubeClient = new YouTubeClient();
