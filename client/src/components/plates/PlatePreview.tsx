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
  
  // Dynamic margin adjustment based on plate dimensions
  // Increase margins for smaller plates to prevent text overflow
  let marginMultiplier = 1.0; // Default multiplier
  
  // For smaller plates like Motorbike and 4x4, increase the margin
  if (dimensions.width <= 280) {
    // For very small plates like Motorbike (229mm x 178mm)
    marginMultiplier = 2.5;
  } else if (dimensions.width <= 350) {
    // For medium-small plates like 4x4 (279mm x 203mm)
    marginMultiplier = 2.0;
  }
  
  // Scale other elements proportionally but keep text size fixed
  const marginPx = mmToPixels(UK_PLATE_SPECS.MARGIN * marginMultiplier, pixelRatio);
  const badgeWidthPx = mmToPixels(UK_PLATE_SPECS.BADGE_WIDTH, pixelRatio);

  // Calculate available width for text to prevent overflow
  const availableWidthPx = plateWidthPx - (marginPx * 2) - (badge ? badgeWidthPx : 0);
  
  // Calculate optimal font size to ensure text fits within plate boundaries
  // Standard is 298.62px (79mm) but we'll scale down if needed to prevent overflow
  const minFontSize = 150; // Minimum readable size
  const maxFontSize = characterHeightPx; // Maximum size (standard 79mm height)
  
  // Calculate estimated text width at maximum font size
  const textWidthEstimate = customization.registrationText.length * (maxFontSize * 0.7); // 0.7 is approximate width/height ratio
  
  // More aggressive font scaling for smaller plates
  let fontScaleFactor = 1.0;
  if (dimensions.width <= 280) {
    // For very small plates like Motorbike (229mm x 178mm)
    fontScaleFactor = 0.6; // Scale down font more dramatically 
  } else if (dimensions.width <= 350) {
    // For medium-small plates like 4x4 (279mm x 203mm)
    fontScaleFactor = 0.75; // Scale down font less dramatically
  }
  
  // If text would overflow, scale down proportionally, but not below minimum
  const fontSize = textWidthEstimate > availableWidthPx 
    ? Math.max(minFontSize, maxFontSize * fontScaleFactor * (availableWidthPx / textWidthEstimate))
    : maxFontSize * fontScaleFactor;
    
  // Function to get dynamic text styling based on plate dimensions
  const getTextStyles = (index: number) => {
    // Calculate dynamic vertical spacing based on plate size
    let verticalSpacing = 0.05; // Default top margin factor
    let bottomSpacing = 0.02; // Default bottom margin factor
    let lineHeightFactor = 0.48; // Default line height factor
    
    // Increase vertical spacing for smaller plates
    if (dimensions.height < 180) {
      verticalSpacing = 0.15; // More spacing for very small plates
      bottomSpacing = 0.04;
      lineHeightFactor = 0.42; // Reduced line height for better fit
    } else if (dimensions.height < 220) {
      verticalSpacing = 0.1; // Medium spacing for medium-small plates
      bottomSpacing = 0.03;
      lineHeightFactor = 0.44; // Slightly reduced line height
    }
    
    return {
      fontFamily: 'UKNumberPlate',
      color: textColor ? textColor.hexCode : 'black',
      fontSize: `${fontSize}px`,
      lineHeight: isSplitText ? `${plateHeightPx * lineHeightFactor}px` : `${plateHeightPx}px`,
      marginTop: isSplitText && index === 0 ? `${plateHeightPx * verticalSpacing}px` : '0',
      marginBottom: isSplitText && index === 0 ? `${plateHeightPx * bottomSpacing}px` : '0'
    };
  };

  // Reusable badge component
  const BadgeComponent = () => (
    badge ? (
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

  // Reusable text component
  const PlateTextComponent = () => (
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
          style={getTextStyles(index)}
        >
          {line}
        </p>
      ))}
    </div>
  );

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
          <BadgeComponent />
          <PlateTextComponent />
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
            maxWidth: '100%'
          }}
        >
          <BadgeComponent />
          <PlateTextComponent />
          <CarBrandComponent />
        </div>
      )}
    </div>
  );
};

export default PlatePreview;