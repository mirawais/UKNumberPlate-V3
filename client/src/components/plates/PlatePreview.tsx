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
    return badges.find(badge => badge.id.toString() === customization.badge);
  }, [badges, customization.badge]);

  // Get car brand from ID
  const carBrand = useMemo(() => {
    return carBrands.find(brand => brand.id.toString() === customization.carBrand);
  }, [carBrands, customization.carBrand]);

  // Plate styling will depend on plate type and customization
  const showFrontPlate = customization.plateType === 'both' || customization.plateType === 'front';
  const showRearPlate = customization.plateType === 'both' || customization.plateType === 'rear';

  // Get the plate dimensions based on selected size
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
    
    // Set up resize observer to handle responsive scaling
    const resizeObserver = new ResizeObserver(updatePixelRatio);
    resizeObserver.observe(containerRef);

    return () => {
      if (containerRef) {
        resizeObserver.unobserve(containerRef);
      }
    };
  }, [containerRef]);

  // Fixed pixel per mm value (1mm = 3.78px) - exact conversion
  const FIXED_PX_RATIO = 3.78;
  
  // Calculate dimensions in pixels using fixed ratio for the container 
  const plateWidthPx = mmToPixels(dimensions.width, pixelRatio);
  const plateHeightPx = mmToPixels(dimensions.height, pixelRatio);
  
  // Character height must be FIXED at exactly 79mm = 298.62px (using exact 3.78px/mm)
  // This is a UK legal requirement that must be maintained regardless of plate size
  const characterHeightPx = 298.62;
  
  // Scale other elements proportionally but keep text size fixed
  const marginPx = mmToPixels(UK_PLATE_SPECS.MARGIN, pixelRatio);
  const badgeWidthPx = mmToPixels(UK_PLATE_SPECS.BADGE_WIDTH, pixelRatio);

  // Calculate available width for text to prevent overflow
  const availableWidthPx = plateWidthPx - (marginPx * 2) - (badge ? badgeWidthPx : 0);
  
  // Calculate optimal font size to ensure text fits within plate boundaries
  // Standard is 298.62px (79mm) but we'll scale down if needed to prevent overflow
  const minFontSize = 150; // Minimum readable size
  const maxFontSize = characterHeightPx; // Maximum size (standard 79mm height)
  
  // Calculate estimated text width at maximum font size
  const textWidthEstimate = customization.registrationText.length * (maxFontSize * 0.7); // 0.7 is approximate width/height ratio
  
  // If text would overflow, scale down proportionally, but not below minimum
  const fontSize = textWidthEstimate > availableWidthPx 
    ? Math.max(minFontSize, maxFontSize * (availableWidthPx / textWidthEstimate))
    : maxFontSize;

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
            maxWidth: '100%'
          }}
        >
          {/* Badge */}
          {badge && (
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-800"
              style={{
                left: `${marginPx / 2}px`,
                height: `${plateHeightPx * 0.8}px`,
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
          )}

          {/* Plate Text */}
          <div 
            className={`flex ${isSplitText ? 'flex-col' : ''} justify-center items-center h-full`}
            style={{
              paddingLeft: badge ? `${badgeWidthPx + marginPx}px` : `${marginPx}px`,
              paddingRight: `${marginPx}px`
            }}
          >
            {displayLines.map((line, index) => (
              <p 
                key={index}
                className="plate-text text-center"
                style={{ 
                  fontFamily: 'UKNumberPlate',
                  color: textColor ? textColor.hexCode : 'black',
                  fontSize: `${fontSize}px`,
                  lineHeight: isSplitText ? `${plateHeightPx * 0.48}px` : `${plateHeightPx}px`,
                  marginTop: isSplitText && index === 0 ? `${plateHeightPx * 0.05}px` : '0',
                  marginBottom: isSplitText && index === 0 ? `${plateHeightPx * 0.02}px` : '0'
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Car Brand */}
          {carBrand && (
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3"
              style={{ fontSize: `${plateHeightPx * 0.12}px` }}
            >
              <p className="text-gray-700">{carBrand.name}</p>
            </div>
          )}
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
            maxWidth: '100%'
          }}
        >
          {/* Badge */}
          {badge && (
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-800"
              style={{
                left: `${marginPx / 2}px`,
                height: `${plateHeightPx * 0.8}px`,
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
          )}

          {/* Plate Text */}
          <div 
            className={`flex ${isSplitText ? 'flex-col' : ''} justify-center items-center h-full`}
            style={{
              paddingLeft: badge ? `${badgeWidthPx + marginPx}px` : `${marginPx}px`,
              paddingRight: `${marginPx}px`
            }}
          >
            {displayLines.map((line, index) => (
              <p 
                key={index}
                className="plate-text text-center"
                style={{ 
                  fontFamily: 'UKNumberPlate',
                  color: textColor ? textColor.hexCode : 'black',
                  fontSize: `${fontSize}px`,
                  lineHeight: isSplitText ? `${plateHeightPx * 0.48}px` : `${plateHeightPx}px`,
                  marginTop: isSplitText && index === 0 ? `${plateHeightPx * 0.05}px` : '0',
                  marginBottom: isSplitText && index === 0 ? `${plateHeightPx * 0.02}px` : '0'
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Car Brand */}
          {carBrand && (
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3"
              style={{ fontSize: `${plateHeightPx * 0.12}px` }}
            >
              <p className="text-gray-700">{carBrand.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatePreview;