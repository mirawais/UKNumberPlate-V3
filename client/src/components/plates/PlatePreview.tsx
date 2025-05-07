import { useMemo, useEffect, useState } from 'react';
import type { PlateCustomization, Color, Badge, CarBrand, PlateSize } from '@shared/schema';
import { 
  mmToPixels, 
  shouldSplitText, 
  splitTextForDisplay, 
  getPlateDimensions,
  UK_PLATE_SPECS
} from '@/lib/plateUtils';

interface PlatePreviewProps {
  customization: PlateCustomization;
  colors: Color[];
  badges: Badge[];
  carBrands: CarBrand[];
  plateSizes?: PlateSize[];
}

const PlatePreview = ({ customization, colors, badges, carBrands, plateSizes = [] }: PlatePreviewProps) => {
  // Get color objects from IDs
  const textColor = useMemo(() => {
    return colors.find(color => color.id.toString() === customization.textColor);
  }, [colors, customization.textColor]);

  const borderColor = useMemo(() => {
    return colors.find(color => color.id.toString() === customization.borderColor);
  }, [colors, customization.borderColor]);

  // Get badge from ID
  const badge = useMemo(() => {
    return customization.badge ? badges.find(b => b.id.toString() === customization.badge) : undefined;
  }, [badges, customization.badge]);

  // Get car brand from ID
  const carBrand = useMemo(() => {
    return customization.carBrand ? carBrands.find(b => b.id.toString() === customization.carBrand) : undefined;
  }, [carBrands, customization.carBrand]);

  // Get specific plate size information
  const plateSize = useMemo(() => {
    return plateSizes.find(size => size.id.toString() === customization.plateSize);
  }, [plateSizes, customization.plateSize]);

  // Get plate dimensions
  const dimensions = useMemo(() => {
    return getPlateDimensions(customization.plateSize || '1', plateSizes);
  }, [customization.plateSize, plateSizes]);

  // Determine if text should be split into two lines
  const isSplitText = useMemo(() => {
    return shouldSplitText(customization.registrationText || '', dimensions.width);
  }, [customization.registrationText, dimensions.width]);

  // Split text for display if needed
  const displayLines = useMemo(() => {
    return isSplitText 
      ? splitTextForDisplay(customization.registrationText || 'YOUR REG')
      : [customization.registrationText || 'YOUR REG'];
  }, [customization.registrationText, isSplitText]);

  // Calculate pixel ratio based on container width
  const [pixelRatio, setPixelRatio] = useState(3.78); // Default: 1mm ≈ 3.78px
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Update pixel ratio when container resizes
  useEffect(() => {
    if (!containerRef) return;

    const updatePixelRatio = () => {
      const containerWidth = containerRef.offsetWidth;
      const standardPlateWidthMm = 520;
      
      // Adjust ratio to fit container while maintaining proportions
      const newRatio = containerWidth / standardPlateWidthMm;
      setPixelRatio(newRatio);
    };

    updatePixelRatio();

    const resizeObserver = new ResizeObserver(updatePixelRatio);
    resizeObserver.observe(containerRef);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Show both plates, front only, or rear only
  const showFrontPlate = customization.plateOption !== 'rear';
  const showRearPlate = customization.plateOption !== 'front';

  // Convert mm dimensions to pixels
  const plateWidthPx = mmToPixels(dimensions.width, pixelRatio);
  const plateHeightPx = mmToPixels(dimensions.height, pixelRatio);
  
  // Calculate margins in pixels
  const marginFactor = dimensions.width < 280 ? 4.0 : // Motorbike
                      dimensions.width < 300 ? 3.5 : // 4x4
                      dimensions.width < 400 ? 2.5 : // Small
                      2.0; // Standard
  const marginPx = mmToPixels(UK_PLATE_SPECS.MARGIN_MM * marginFactor, pixelRatio);
  
  // Badge width is 1/8 of plate width for larger plates, more for smaller
  const badgeWidthPx = plateWidthPx * (dimensions.width < 300 ? 0.2 : 0.125);
  
  // Calculate available width for text (accounting for badge)
  const availableWidthPx = badge 
    ? plateWidthPx - (marginPx * 2) - badgeWidthPx 
    : plateWidthPx - (marginPx * 2);
  
  // Set maximum font size based on plate height
  const maxFontSize = plateHeightPx * UK_PLATE_SPECS.CHAR_HEIGHT_RATIO;
  const minFontSize = maxFontSize * 0.5; // Minimum font size (half of max)
  
  // Calculate estimated text width at maximum font size
  const textWidthEstimate = customization.registrationText.length * (maxFontSize * 0.7); // 0.7 is approximate width/height ratio
  
  // Special handling for different plate sizes
  // Use different font scaling strategy based on plate size
  let fontScaleFactor = 1.0;
  let useFixedSize = false;
  
  // Identify special small plate types
  const isMotorbike = plateSize?.name === "Motorbike" || dimensions.width <= 230;
  const is4x4 = plateSize?.name === "4 x 4" || dimensions.width <= 280;
  
  // Apply aggressive scaling for small plates
  if (isMotorbike) {
    fontScaleFactor = 0.25; // Very small for Motorbike
    useFixedSize = true;
  } else if (is4x4) {
    fontScaleFactor = 0.35; // Small for 4x4
    useFixedSize = true;
  } else if (dimensions.width <= 350) {
    fontScaleFactor = 0.5; // Medium scaling for other small plates
  }
  
  // Determine font size with additional safety factor for small plates
  let fontSize;
  if (useFixedSize) {
    fontSize = maxFontSize * fontScaleFactor;
  } else {
    // For larger plates, shrink to fit if needed
    fontSize = textWidthEstimate > availableWidthPx
      ? Math.max(minFontSize, maxFontSize * fontScaleFactor * (availableWidthPx / textWidthEstimate))
      : maxFontSize * fontScaleFactor;
  }
    
  // Function to get dynamic text styling based on plate dimensions
  const getTextStyles = (index: number) => {
    // Base text styling
    let styles = {
      fontFamily: 'UKNumberPlate',
      color: textColor ? textColor.hexCode : 'black',
      fontSize: `${fontSize}px`,
      lineHeight: '1',
      padding: 0,
      margin: 0
    };

    // For motorbike plates, add special styling
    if (isMotorbike) {
      return {
        ...styles,
        fontSize: `${fontSize}px`,
        lineHeight: '1',
        whiteSpace: 'nowrap' as const
      };
    }
    
    // For 4x4 plates, slightly larger
    if (is4x4) {
      return {
        ...styles,
        fontSize: `${fontSize}px`,
        lineHeight: '1.1',
        whiteSpace: 'nowrap' as const
      };
    }

    // For split text, add line height adjustments
    if (isSplitText) {
      return {
        ...styles,
        lineHeight: index === 0 ? '0.9' : '1.1',
        marginTop: index === 0 ? `${plateHeightPx * 0.08}px` : '0',
        marginBottom: index === 0 ? `${plateHeightPx * 0.04}px` : '0'
      };
    }
    
    return styles;
  };

  // Reusable badge component
  const BadgeComponent = () => (
    badge ? (
      <div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-800"
        style={{
          left: `${marginPx / 2}px`,
          height: isMotorbike ? `${plateHeightPx * 0.7}px` : `${plateHeightPx * 0.8}px`,
          width: `${badgeWidthPx}px`
        }}
      >
        <div className="relative w-full h-full flex flex-col">
          <div className="h-2/3 w-full bg-blue-800 overflow-hidden">
            <img src={badge.imagePath} className="w-full h-full object-cover" alt={badge.name} />
          </div>
          <div className="h-1/3 w-full bg-blue-800 flex items-center justify-center">
            <span className="text-white" style={{ fontSize: `${plateHeightPx * 0.12}px` }}>
              {badge.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    ) : null
  );

  // Reusable car brand component
  const CarBrandComponent = () => (
    carBrand ? (
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3"
        style={{ fontSize: `${plateHeightPx * 0.12}px` }}
      >
        <p className="text-gray-700">{carBrand.name}</p>
      </div>
    ) : null
  );

  // Determine the container style for text based on plate size
  const getTextContainerStyle = () => {
    const baseStyle = {
      paddingLeft: badge ? `${badgeWidthPx + marginPx/2}px` : `${marginPx}px`,
      paddingRight: `${marginPx}px`
    };
    
    // For small plates like Motorbike, use absolute positioning
    if (isMotorbike) {
      return {
        ...baseStyle,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '100%'
      };
    }
    
    // For slightly larger plates like 4x4
    if (is4x4) {
      return {
        ...baseStyle,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '100%'
      };
    }
    
    return baseStyle;
  };

  return (
    <div className="relative w-full max-w-2xl" ref={setContainerRef}>
      {/* Front Plate */}
      {showFrontPlate && (
        <div 
          className="relative mx-auto mb-4 bg-white"
          style={{ 
            border: '2px solid black',
            width: `${plateWidthPx}px`,
            height: `${plateHeightPx}px`,
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <BadgeComponent />
          
          <div 
            className={`flex ${isSplitText ? 'flex-col' : ''} justify-center items-center h-full`}
            style={getTextContainerStyle()}
          >
            {displayLines.map((line, index) => (
              <p 
                key={index}
                className="plate-text text-center"
                style={getTextStyles(index)}
              >
                {line}
              </p>
            ))}
          </div>
          
          <CarBrandComponent />
        </div>
      )}

      {/* Rear Plate */}
      {showRearPlate && (
        <div 
          className="relative mx-auto bg-[#FECC00]"
          style={{ 
            border: '2px solid black',
            width: `${plateWidthPx}px`,
            height: `${plateHeightPx}px`,
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <BadgeComponent />
          
          <div 
            className={`flex ${isSplitText ? 'flex-col' : ''} justify-center items-center h-full`}
            style={getTextContainerStyle()}
          >
            {displayLines.map((line, index) => (
              <p 
                key={index}
                className="plate-text text-center"
                style={getTextStyles(index)}
              >
                {line}
              </p>
            ))}
          </div>
          
          <CarBrandComponent />
        </div>
      )}
    </div>
  );
};

export default PlatePreview;