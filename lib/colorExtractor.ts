import { Vibrant } from 'node-vibrant/browser';

export interface ExtractedColors {
  primary: string;
  secondary: string;
  text: string; // Adaptive text color (white or black based on contrast)
}

/**
 * Extract dominant colors from an image URL using vibrant.js
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    // Get the most vibrant color as primary, or fallback to Vibrant
    const primaryColor = palette.Vibrant?.hex || palette.Muted?.hex || palette.DarkVibrant?.hex || '#353535';
    const secondaryColor = palette.Muted?.hex || palette.DarkMuted?.hex || palette.LightMuted?.hex || '#535353';

    // Calculate text color based on luminance of primary color
    const textColor = getContrastColor(primaryColor);

    return {
      primary: primaryColor,
      secondary: secondaryColor,
      text: textColor,
    };
  } catch (error) {
    console.error('Error extracting colors from image:', error);
    // Return default colors on error
    return {
      primary: '#353535',
      secondary: '#535353',
      text: '#FFFFFF',
    };
  }
}

/**
 * Calculate whether white or black text provides better contrast
 */
export function getContrastColor(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Extract colors from a local image file (File object)
 */
export async function extractColorsFromFile(file: File): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const imageUrl = e.target?.result as string;
        const colors = await extractColorsFromImage(imageUrl);
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
