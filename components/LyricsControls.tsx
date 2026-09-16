'use client';

import ColorPicker from './ColorPicker';

interface LyricsControlsProps {
  isDarkMode: boolean;
  isVideoMode: boolean;
  isLofiMode: boolean;
  customColor: string;
  onDarkModeToggle: () => void;
  onVideoToggle: () => void;
  onLofiToggle: () => void;
  onCustomColorChange: (color: string) => void;
}

export default function LyricsControls({
  isDarkMode,
  isVideoMode,
  isLofiMode,
  customColor,
  onDarkModeToggle,
  onVideoToggle,
  onLofiToggle,
  onCustomColorChange,
}: LyricsControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      {/* Dark Mode Toggle */}
      <button
        onClick={onDarkModeToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isDarkMode
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        aria-label="Toggle dark mode"
        title="Dark Mode"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isDarkMode ? (
            // Sun icon (light mode)
            <>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </>
          ) : (
            // Moon icon (dark mode)
            <>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </>
          )}
        </svg>
      </button>

      {/* Video Toggle */}
      <button
        onClick={onVideoToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isVideoMode
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        aria-label="Toggle video mode"
        title="Music Video"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </button>

      {/* Random muted lofi/animated background */}
      <button
        onClick={onLofiToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isLofiMode
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        aria-label="Toggle lofi animated background"
        title="Lofi Animated Background"
      >
        ✦
      </button>

      {/* Custom Color Picker */}
      <ColorPicker color={customColor} onChange={onCustomColorChange} />
    </div>
  );
}
