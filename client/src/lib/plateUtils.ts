// Utility functions for UK number plate rendering based on official specifications

// Convert millimeters to pixels with default ratio of 3.78 (adjustable)
export const mmToPixels = (mm: number, ratio: number = 3.78): number => {
  return mm * ratio;
};

// UK plate specifications in millimeters
export const UK_PLATE_SPECS = {
  // Character dimensions
  CHARACTER_HEIGHT: 79, // mm
  CHARACTER_WIDTH: 50, // mm - except for "1" and "I"
  CHARACTER_WIDTH_NARROW: 38, // mm - for "1" and "I"
  
  // Spacing
  CHARACTER_SPACING: 11, // mm - between characters
  GROUP_SPACING: 33, // mm - between groups (e.g., "AB12" and "CDE")
  
  // Margins
  MARGIN: 14, // mm - minimum margin from edge to characters
  
  // Badge size (approximate)
  BADGE_WIDTH: 40, // mm
  BADGE_HEIGHT: 80, // mm (typically about 70-80% of plate height)
};

// Determine if a character is narrow (1 or I)
export const isNarrowCharacter = (char: string): boolean => {
  return char === '1' || char === 'I';
};

// Calculate the width of a single character
export const getCharacterWidth = (char: string): number => {
  return isNarrowCharacter(char) ? UK_PLATE_SPECS.CHARACTER_WIDTH_NARROW : UK_PLATE_SPECS.CHARACTER_WIDTH;
};

// Calculate the total width needed for a registration text
export const calculateTextWidth = (text: string): number => {
  if (!text) return 0;
  
  const cleaned = text.replace(/\s+/g, ' ').trim().toUpperCase();
  
  // Special case for empty or very short text
  if (cleaned.length <= 1) {
    return getCharacterWidth(cleaned);
  }
  
  // Check if the text has a space - indicating it's in the standard UK format with two groups
  const hasSpace = cleaned.includes(' ');
  
  // If no space, just calculate the width of all characters with spacing
  if (!hasSpace) {
    let width = 0;
    for (let i = 0; i < cleaned.length; i++) {
      width += getCharacterWidth(cleaned[i]);
      
      // Add character spacing if not the last character
      if (i < cleaned.length - 1) {
        width += UK_PLATE_SPECS.CHARACTER_SPACING;
      }
    }
    return width;
  }
  
  // Handle standard UK format with two groups
  const groups = cleaned.split(' ');
  
  let width = 0;
  
  // Calculate width for each group
  groups.forEach((group, groupIndex) => {
    for (let i = 0; i < group.length; i++) {
      width += getCharacterWidth(group[i]);
      
      // Add character spacing if not the last character
      if (i < group.length - 1) {
        width += UK_PLATE_SPECS.CHARACTER_SPACING;
      }
    }
    
    // Add group spacing after the first group
    if (groupIndex < groups.length - 1) {
      width += UK_PLATE_SPECS.GROUP_SPACING;
    }
  });
  
  return width;
};

// Determine if text needs to be split into two lines based on plate dimensions
export const shouldSplitText = (text: string, plateWidthMm: number): boolean => {
  // Calculate available width after margins
  const availableWidth = plateWidthMm - (UK_PLATE_SPECS.MARGIN * 2);
  
  // If there's a badge, account for its width plus some spacing
  const badgeAdjustment = UK_PLATE_SPECS.BADGE_WIDTH + 10; // Badge width plus some spacing
  
  // Calculate if the text fits in the available width
  const textWidth = calculateTextWidth(text);
  
  return textWidth > (availableWidth - badgeAdjustment);
};

// Split text into two lines for display on smaller plates
export const splitTextForDisplay = (text: string): string[] => {
  if (!text) return [''];
  
  const cleaned = text.replace(/\s+/g, ' ').trim().toUpperCase();
  
  // If there's a space, split on the space
  if (cleaned.includes(' ')) {
    return cleaned.split(' ');
  }
  
  // If no space, split in the middle
  const midpoint = Math.ceil(cleaned.length / 2);
  return [cleaned.substring(0, midpoint), cleaned.substring(midpoint)];
};

// Calculate font size based on plate dimensions and character height
export const calculateFontSize = (plateHeightPx: number): number => {
  // Based on UK specs with 79mm character height on standard plate
  // Approximately 70% of plate height for standard plates
  return Math.floor(plateHeightPx * 0.70);
};

// Get plate dimensions from plate size ID and handle motorcycle plates
export interface PlateDimensions {
  width: number;
  height: number;
}

export const getPlateDimensions = (plateSize: string, plateSizes: any[]): PlateDimensions => {
  if (!plateSizes || plateSizes.length === 0) {
    // Default to standard dimensions if no sizes available
    return { width: 520, height: 111 };
  }
  
  const size = plateSizes.find(s => s.id.toString() === plateSize);
  
  if (!size) {
    return { width: 520, height: 111 }; // Default to standard
  }
  
  // Parse dimensions string like "520mm x 111mm"
  try {
    const dimensions = size.dimensions.replace(/mm/g, '').split('x').map((d: string) => parseInt(d.trim(), 10));
    return {
      width: dimensions[0] || 520,
      height: dimensions[1] || 111
    };
  } catch (e) {
    console.error("Error parsing plate dimensions:", e);
    return { width: 520, height: 111 }; // Fallback to standard
  }
};