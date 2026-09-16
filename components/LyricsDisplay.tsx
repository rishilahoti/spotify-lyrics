'use client';

import { useEffect, useRef } from 'react';
import { LyricsLine } from '@/lib/spotify';

interface LyricsDisplayProps {
  lyrics: LyricsLine[];
  activeLineIndex: number;
  textColor: string;
  activeTextColor?: string;
  passedTextColor?: string;
}

export default function LyricsDisplay({
  lyrics,
  activeLineIndex,
  textColor,
  activeTextColor = textColor,
  passedTextColor,
}: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const lineRect = activeLine.getBoundingClientRect();
      
      const lineTop = lineRect.top - containerRect.top + container.scrollTop;
      const lineCenter = lineTop - container.clientHeight / 2 + lineRect.height / 2;
      
      container.scrollTo({
        top: lineCenter,
        behavior: 'smooth',
      });
    }
  }, [activeLineIndex]);

  if (lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-white/60 text-lg">No lyrics available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-4 py-8 px-4 overflow-y-auto h-full scroll-smooth lyrics-scrollbar"
    >
      {lyrics.map((line, index) => {
        const isActive = index === activeLineIndex;
        const isPassed = activeLineIndex !== -1 && index < activeLineIndex;
        const isEmpty = !line.words || line.words.trim() === '' || line.words === '♪';

        // Determine text color based on state
        let currentTextColor = textColor;
        if (isActive) {
          currentTextColor = activeTextColor;
        } else if (isPassed && passedTextColor) {
          currentTextColor = passedTextColor;
        }

        return (
          <div
            key={`${line.startTimeMs}-${index}`}
            ref={isActive ? activeLineRef : null}
            className={`transition-all duration-300 text-center ${
              isEmpty ? 'h-4' : ''
            } ${
              isActive
                ? 'scale-110 font-bold opacity-100'
                : isPassed
                ? 'opacity-60 scale-100'
                : 'opacity-40 scale-100'
            }`}
            style={{
              color: currentTextColor,
              fontSize: isActive ? '1.5rem' : '1.25rem',
              lineHeight: '1.8',
            }}
          >
            {isEmpty ? (
              <div className="w-8 h-0.5 mx-auto bg-current opacity-30" />
            ) : (
              <div dir="auto">{line.words}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
