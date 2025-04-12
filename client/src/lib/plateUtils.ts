import type { PlateCustomization } from '@shared/schema';

// Utility functions for plate customization

// Validate a UK number plate format
export function validateUKNumberPlate(text: string): boolean {
  // Current UK format is: two letters, two numbers, then three letters
  // e.g., AB12 CDE
  // There are other valid formats as well
  const ukPlateRegex = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$/;
  
  // For show plates (non road legal), we allow more flexibility
  const showPlateRegex = /^[A-Z0-9\s-]{1,8}$/;
  
  return ukPlateRegex.test(text) || showPlateRegex.test(text);
}

// Function to calculate plate price based on customization
export function calculatePlatePrice(
  customization: PlateCustomization, 
  basePriceFront: number, 
  basePriceRear: number,
  bothPlatesDiscount: number,
  sizeAdditionalPrice: number,
  styleAdditionalPrice: number
): number {
  let price = 0;
  
  // Base price based on plate type
  if (customization.plateType === 'both') {
    price = basePriceFront + basePriceRear - bothPlatesDiscount;
  } else if (customization.plateType === 'front') {
    price = basePriceFront;
  } else {
    price = basePriceRear;
  }
  
  // Add additional costs for size and style
  price += sizeAdditionalPrice;
  price += styleAdditionalPrice;
  
  return price;
}

// Function to generate a plate SVG representation
export function generatePlateSVG(customization: PlateCustomization, badgeURL: string, isRearPlate: boolean): string {
  const bgColor = isRearPlate ? '#FECC00' : '#FFFFFF';
  const borderColor = customization.borderColor || '#000000';
  
  // This is a simplified SVG template - in a real app, this would be more complex
  return `
    <svg width="520" height="111" viewBox="0 0 520 111" xmlns="http://www.w3.org/2000/svg">
      <!-- Plate background -->
      <rect width="520" height="111" rx="5" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" />
      
      <!-- Badge area if badge is selected -->
      ${badgeURL ? `
        <rect x="10" y="10" width="70" height="91" rx="3" fill="#1E3A8A" />
        <image href="${badgeURL}" x="15" y="15" width="60" height="60" />
        <text x="45" y="95" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="16">GB</text>
      ` : ''}
      
      <!-- Registration text -->
      <text 
        x="${badgeURL ? '280' : '260'}" 
        y="65" 
        text-anchor="middle" 
        fill="${customization.textColor || '#000000'}" 
        font-family="Arial" 
        font-weight="bold" 
        font-size="60"
        stroke="#333333"
        stroke-width="1"
      >
        ${customization.registrationText || 'YOUR REG'}
      </text>
      
      <!-- Car brand if selected -->
      ${customization.carBrand ? `
        <text 
          x="260" 
          y="105" 
          text-anchor="middle" 
          fill="#555555" 
          font-family="Arial" 
          font-style="italic"
          font-size="12"
        >
          ${customization.carBrand}
        </text>
      ` : ''}
    </svg>
  `;
}
