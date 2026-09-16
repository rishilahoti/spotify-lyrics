# Spotify Lyrics Enhanced Features

A Next.js application that displays Spotify lyrics with three customizable display modes:
1. **Dark Mode** - Pitch black background with white lyrics
2. **Music Video Mode** - YouTube video plays behind lyrics with overlay
3. **Custom Color Mode** - User-selected background color

## Features

- 🎵 Real-time Spotify track synchronization
- 🎨 Automatic color extraction from album covers
- 🌙 Dark mode toggle
- 🎬 Music video integration with YouTube
- 🎨 Custom color picker
- 📱 Responsive design
- ✨ Smooth transitions and animations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy the Client ID and Client Secret
4. Add `http://127.0.0.1:3000` to the Redirect URIs

### 4. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

## Usage

1. Click "Connect with Spotify" to authenticate
2. Start playing a song on Spotify
3. The lyrics will automatically sync with the currently playing track
4. Use the control buttons to toggle between:
   - **Dark Mode**: Black background with white text
   - **Video Mode**: YouTube music video with lyrics overlay
   - **Color Picker**: Custom background color selection

## Project Structure

```
├── app/
│   ├── api/auth/token/     # Spotify OAuth token exchange
│   ├── page.tsx             # Main page
│   └── globals.css          # Global styles
├── components/
│   ├── LyricsView.tsx       # Main lyrics container
│   ├── LyricsDisplay.tsx    # Lyrics text rendering
│   ├── LyricsControls.tsx   # Toggle buttons
│   ├── ColorPicker.tsx      # Color selection component
│   └── VideoOverlay.tsx     # Video player overlay
├── hooks/
│   ├── useSpotifyTrack.ts   # Track data hook
│   └── useLyrics.ts         # Lyrics state hook
└── lib/
    ├── spotify.ts           # Spotify API client
    ├── youtube.ts           # YouTube API client
    └── colorExtractor.ts    # Color extraction utility
```

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vibrant.js** - Color extraction from images
- **React Colorful** - Color picker component
- **Axios** - HTTP client
- **Spotify Web API** - Track and lyrics data
- **YouTube Data API** - Music video search

## License

MIT
