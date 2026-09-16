'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
}

export default function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors"
        style={{ backgroundColor: color }}
        aria-label="Pick custom color"
        title="Pick custom color"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white drop-shadow-lg"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="13.5" cy="13.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.8-.1 2.6-.3" />
          <path d="M22 12c0-5.5-4.5-10-10-10" />
          <path d="M20 6l-4 4" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          
          {/* Color Picker Panel */}
          <div className="absolute top-12 right-0 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-medium">Custom Color</span>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close color picker"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 0 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z" />
                </svg>
              </button>
            </div>
            
            <HexColorPicker
              color={color}
              onChange={onChange}
              style={{ width: '200px', height: '150px' }}
            />
            
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm font-mono focus:outline-none focus:border-white/40"
                placeholder="#000000"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
