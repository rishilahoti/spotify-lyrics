'use client';

import { useRef } from 'react';

interface VideoOverlayProps {
  videoUrl: string | null;
  isVisible: boolean;
  children: React.ReactNode;
}

export default function VideoOverlay({ videoUrl, isVisible, children }: VideoOverlayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!videoUrl) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* YouTube Video Background */}
      <div className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isVisible}>
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-full min-w-full w-[177.77777778vh] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
          title="Music Video"
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Lyrics Overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
