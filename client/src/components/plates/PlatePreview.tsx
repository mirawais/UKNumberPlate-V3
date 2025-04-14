import { useMemo } from 'react';
import type { PlateCustomization, Color, Badge, CarBrand } from '@shared/schema';

interface PlatePreviewProps {
  customization: PlateCustomization;
  colors: Color[];
  badges: Badge[];
  carBrands: CarBrand[];
}

const PlatePreview = ({ customization, colors, badges, carBrands }: PlatePreviewProps) => {
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

  return (
    <div className="relative w-full max-w-2xl">
      {/* Front Plate */}
      {showFrontPlate && (
        <div 
          className={`relative mx-auto mb-4 bg-white border-2 rounded-lg p-2 w-full max-w-2xl aspect-[520/111] plate-3d`}
          style={{ 
            borderColor: borderColor ? borderColor.hexCode : 'black',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'perspective(500px) rotateX(2deg)'
          }}
        >
          {/* Badge */}
          {badge && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 h-[80%] aspect-[2/3] bg-blue-800 rounded">
              <div className="relative w-full h-full flex flex-col">
                <div className="h-2/3 w-full bg-blue-800 overflow-hidden rounded-t">
                  <img src={badge.imagePath} className="w-full h-full object-cover" alt={badge.name} />
                </div>
                <div className="h-1/3 w-full bg-blue-800 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {badge.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Plate Text */}
          <div className="flex justify-center items-center h-full">
            <p 
              className="font-bold text-7xl tracking-wider plate-text"
              style={{ 
                fontFamily: 'UKNumberPlate',
                color: textColor ? textColor.hexCode : 'black',
                WebkitTextStroke: '1px #333',
                filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))'
              }}
            >
              {customization.registrationText || 'YOUR REG'}
            </p>
          </div>

          {/* Car Brand */}
          {carBrand && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3">
              <p className="italic text-sm text-gray-700">{carBrand.name}</p>
            </div>
          )}
        </div>
      )}

      {/* Rear Plate */}
      {showRearPlate && (
        <div 
          className={`relative mx-auto bg-[#FECC00] border-2 rounded-lg p-2 w-full max-w-2xl aspect-[520/111] plate-3d`} 
          style={{ 
            borderColor: borderColor ? borderColor.hexCode : 'black',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'perspective(500px) rotateX(2deg)'
          }}
        >
          {/* Badge */}
          {badge && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 h-[80%] aspect-[2/3] bg-blue-800 rounded">
              <div className="relative w-full h-full flex flex-col">
                <div className="h-2/3 w-full bg-blue-800 overflow-hidden rounded-t">
                  <img src={badge.imagePath} className="w-full h-full object-cover" alt={badge.name} />
                </div>
                <div className="h-1/3 w-full bg-blue-800 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {badge.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Plate Text */}
          <div className="flex justify-center items-center h-full">
            <p 
              className="font-bold text-7xl tracking-wider plate-text"
              style={{ 
                fontFamily: 'UKNumberPlate',
                color: textColor ? textColor.hexCode : 'black',
                WebkitTextStroke: '1px #333',
                filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))'
              }}
            >
              {customization.registrationText || 'YOUR REG'}
            </p>
          </div>

          {/* Car Brand */}
          {carBrand && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3">
              <p className="italic text-sm text-gray-700">{carBrand.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatePreview;