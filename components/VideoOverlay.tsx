'use client';

import { useEffect, useRef } from 'react';

interface VideoOverlayProps {
  videoUrl: string | null;
  isVisible: boolean;
  children: React.ReactNode;
}

export default function VideoOverlay({ videoUrl, isVisible, children }: VideoOverlayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!isVisible || !videoUrl) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77777778vh] h-[56.25vw] min-w-full min-h-full"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
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
