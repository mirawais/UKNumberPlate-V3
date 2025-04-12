import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import PlatePreview from './PlatePreview';
import TextStyleModal from './TextStyleModal';
import CheckoutModal from '../checkout/CheckoutModal';
import { useToast } from '@/hooks/use-toast';
import { InfoIcon } from 'lucide-react';
import type { 
  PlateSize, TextStyle, Badge, Color, CarBrand, 
  Pricing, PlateCustomization 
} from '@shared/schema';

const PlateCustomizer = () => {
  const { toast } = useToast();
  
  // Queries for plate configuration options
  const { data: plateSizes } = useQuery<PlateSize[]>({ queryKey: ['/api/plate-sizes'] });
  const { data: textStyles } = useQuery<TextStyle[]>({ queryKey: ['/api/text-styles'] });
  const { data: badges } = useQuery<Badge[]>({ queryKey: ['/api/badges'] });
  const { data: colors } = useQuery<Color[]>({ queryKey: ['/api/colors'] });
  const { data: carBrands } = useQuery<CarBrand[]>({ queryKey: ['/api/car-brands'] });
  const { data: pricing } = useQuery<Pricing>({ queryKey: ['/api/pricing'] });
  
  // State for open/closed modals
  const [isTextStyleModalOpen, setIsTextStyleModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedTextStyle, setSelectedTextStyle] = useState<TextStyle | null>(null);
  
  // State for plate customization
  const [customization, setCustomization] = useState<PlateCustomization>({
    plateType: 'both',
    registrationText: 'YOUR REG',
    plateSize: '',
    textStyle: '',
    textColor: '',
    badge: 'gb',  // Default to GB badge
    borderColor: '',
    carBrand: '',
    isRoadLegal: true
  });
  
  // Calculate the total price based on selected options
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Set initial values once data is loaded
  useEffect(() => {
    if (plateSizes?.length && !customization.plateSize) {
      setCustomization(prev => ({...prev, plateSize: plateSizes[0].id.toString()}));
    }
    
    if (textStyles?.length && !customization.textStyle) {
      setCustomization(prev => ({...prev, textStyle: textStyles[0].id.toString()}));
      setSelectedTextStyle(textStyles[0]);
    }
    
    if (colors?.length && !customization.textColor) {
      setCustomization(prev => ({...prev, textColor: colors[0].id.toString()}));
    }
    
    if (colors?.length && !customization.borderColor) {
      setCustomization(prev => ({...prev, borderColor: colors[0].id.toString()}));
    }
    
    if (carBrands?.length) {
      setCustomization(prev => ({...prev, carBrand: ""})); // Default to none
    }
  }, [plateSizes, textStyles, colors, carBrands]);
  
  // Calculate price whenever customization or pricing changes
  useEffect(() => {
    if (!pricing) return;
    
    let price = 0;
    
    // Base price based on plate type
    if (customization.plateType === 'both') {
      price = Number(pricing.frontPlatePrice) + Number(pricing.rearPlatePrice);
      // Apply discount for both plates if applicable
      if (pricing.bothPlatesDiscount) {
        price -= Number(pricing.bothPlatesDiscount);
      }
    } else if (customization.plateType === 'front') {
      price = Number(pricing.frontPlatePrice);
    } else {
      price = Number(pricing.rearPlatePrice);
    }
    
    // Add price for plate size
    if (customization.plateSize && plateSizes) {
      const selectedSize = plateSizes.find(size => size.id.toString() === customization.plateSize);
      if (selectedSize) {
        price += Number(selectedSize.additionalPrice);
      }
    }
    
    // Add price for text style
    if (customization.textStyle && textStyles) {
      const selectedStyle = textStyles.find(style => style.id.toString() === customization.textStyle);
      if (selectedStyle) {
        price += Number(selectedStyle.additionalPrice);
      }
    }
    
    // Round to 2 decimal places
    setTotalPrice(Math.round(price * 100) / 100);
  }, [customization, pricing, plateSizes, textStyles]);
  
  // Handle text style info button click
  const handleTextStyleInfo = () => {
    setIsTextStyleModalOpen(true);
  };
  
  // Handle Buy Now button click
  const handleBuyNow = () => {
    // Validate reg text
    if (!customization.registrationText || customization.registrationText === '') {
      toast({
        title: "Missing Information",
        description: "Please enter your registration text.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckoutModalOpen(true);
  };
  
  // Handle Reset Design button click
  const handleResetDesign = () => {
    setCustomization({
      plateType: 'both',
      registrationText: 'YOUR REG',
      plateSize: plateSizes?.[0]?.id.toString() || '',
      textStyle: textStyles?.[0]?.id.toString() || '',
      textColor: colors?.[0]?.id.toString() || '',
      badge: 'gb',
      borderColor: colors?.[0]?.id.toString() || '',
      carBrand: '',
      isRoadLegal: true
    });
    
    if (textStyles?.length) {
      setSelectedTextStyle(textStyles[0]);
    }
    
    toast({
      title: "Design Reset",
      description: "Your plate design has been reset to default."
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left Panel - Customization Options */}
        <div className="w-full md:w-1/3 bg-gray-50">
          <Tabs defaultValue="road-legal">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger 
                value="road-legal" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-red-300"
              >
                Road Legal Plates
              </TabsTrigger>
              <TabsTrigger 
                value="show-plates"
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-red-300"
              >
                Show Plates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="road-legal">
              <div className="p-4 bg-primary text-white">
                <h2 className="text-xl font-bold">Select your options</h2>
                <p className="text-sm">Build your number plate below by choosing from the options and clicking 'Buy Now' to add to basket.</p>
              </div>
              
              {/* Plate Type Selection */}
              <div className="p-4 border-b">
                <RadioGroup 
                  defaultValue="both" 
                  value={customization.plateType}
                  onValueChange={(value) => setCustomization({...customization, plateType: value as 'both' | 'front' | 'rear'})}
                  className="flex justify-between gap-2"
                >
                  <div className="relative w-1/3">
                    <RadioGroupItem value="both" id="both-plates" className="sr-only" />
                    <Label 
                      htmlFor="both-plates" 
                      className={`relative flex flex-col items-center justify-center h-20 w-full ${
                        customization.plateType === 'both' ? 'bg-red-700' : 'bg-red-400'
                      } text-white text-center rounded cursor-pointer transition-colors`}
                    >
                      <span className="text-xs font-bold">BOTH PLATES</span>
                      {customization.plateType === 'both' && (
                        <span className="absolute top-0 right-2 text-xs">✓</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="relative w-1/3">
                    <RadioGroupItem value="front" id="front-only" className="sr-only" />
                    <Label 
                      htmlFor="front-only" 
                      className={`relative flex flex-col items-center justify-center h-20 w-full ${
                        customization.plateType === 'front' ? 'bg-red-700' : 'bg-red-400'
                      } text-white text-center rounded cursor-pointer transition-colors`}
                    >
                      <span className="text-xs font-bold">FRONT ONLY</span>
                      {customization.plateType === 'front' && (
                        <span className="absolute top-0 right-2 text-xs">✓</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="relative w-1/3">
                    <RadioGroupItem value="rear" id="rear-only" className="sr-only" />
                    <Label 
                      htmlFor="rear-only" 
                      className={`relative flex flex-col items-center justify-center h-20 w-full ${
                        customization.plateType === 'rear' ? 'bg-red-700' : 'bg-red-400'
                      } text-white text-center rounded cursor-pointer transition-colors`}
                    >
                      <span className="text-xs font-bold">REAR ONLY</span>
                      {customization.plateType === 'rear' && (
                        <span className="absolute top-0 right-2 text-xs">✓</span>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Registration Input */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Your Registration</h3>
                <Input 
                  id="registration-input" 
                  className="w-full p-3 uppercase" 
                  placeholder="Enter plate text"
                  maxLength={8}
                  value={customization.registrationText}
                  onChange={(e) => setCustomization({...customization, registrationText: e.target.value.toUpperCase()})}
                />
              </div>
              
              {/* Plate Size Selection */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Plate Size</h3>
                <Select 
                  value={customization.plateSize} 
                  onValueChange={(value) => setCustomization({...customization, plateSize: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plate size" />
                  </SelectTrigger>
                  <SelectContent>
                    {plateSizes?.map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name} ({size.dimensions}) {size.additionalPrice > 0 ? `- +£${size.additionalPrice}` : '- £0.00'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Text Style Selection */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Text Style</h3>
                <div className="relative">
                  <Select 
                    value={customization.textStyle} 
                    onValueChange={(value) => {
                      setCustomization({...customization, textStyle: value});
                      const style = textStyles?.find(s => s.id.toString() === value);
                      if (style) setSelectedTextStyle(style);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select text style" />
                    </SelectTrigger>
                    <SelectContent>
                      {textStyles?.map((style) => (
                        <SelectItem key={style.id} value={style.id.toString()}>
                          {style.name} {style.additionalPrice > 0 ? `- +£${style.additionalPrice}` : '- £0.00'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2"
                    onClick={handleTextStyleInfo}
                  >
                    <InfoIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              
              {/* Badges & Colours */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Badges & Colours</h3>
                
                {/* Color Selection */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Text Color:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {colors?.map((color) => (
                      <button 
                        key={color.id}
                        className={`h-8 w-full rounded ${
                          customization.textColor === color.id.toString() ? 'ring-2 ring-offset-2 ring-primary' : 'border border-gray-300'
                        }`}
                        style={{ backgroundColor: color.hexCode }}
                        title={color.name}
                        onClick={() => setCustomization({...customization, textColor: color.id.toString()})}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Badge Selection */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Badge:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {badges?.map((badge) => (
                      <button 
                        key={badge.id}
                        className={`h-16 w-full p-1 rounded ${
                          customization.badge === badge.id.toString() ? 'ring-2 ring-offset-2 ring-primary' : 'border border-gray-300'
                        } bg-gray-100 text-center text-xs`}
                        onClick={() => setCustomization({...customization, badge: badge.id.toString()})}
                      >
                        <img src={badge.imagePath} className="w-full h-full object-contain mx-auto" alt={badge.name} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Border Selection */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Border</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colors?.map((color) => (
                    <button 
                      key={color.id}
                      className={`h-8 w-full rounded ${
                        customization.borderColor === color.id.toString() ? 'ring-2 ring-offset-2 ring-primary' : 'border border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                      onClick={() => setCustomization({...customization, borderColor: color.id.toString()})}
                    />
                  ))}
                  <button 
                    className={`h-8 w-full rounded ${
                      customization.borderColor === '' ? 'ring-2 ring-offset-2 ring-primary' : 'border border-gray-300'
                    } bg-transparent`}
                    title="None"
                    onClick={() => setCustomization({...customization, borderColor: ''})}
                  />
                </div>
              </div>
              
              {/* Plate Surround */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Plate Surround</h3>
                <Select 
                  value={customization.carBrand} 
                  onValueChange={(value) => setCustomization({...customization, carBrand: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select car brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {carBrands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reset Design Button */}
              <div className="p-4">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleResetDesign}
                >
                  Reset Design
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="show-plates">
              {/* Show plates - same content but with isRoadLegal=false */}
              <div className="p-4 bg-primary text-white">
                <h2 className="text-xl font-bold">Select your options</h2>
                <p className="text-sm">
                  Build your show plate below by choosing from the options and clicking 'Buy Now' to add to basket. 
                  (Note: Show plates are not legal for road use)
                </p>
              </div>
              
              {/* Identical controls as Road Legal, but sets isRoadLegal to false */}
              {/* Plate Type Selection */}
              <div className="p-4 border-b">
                <RadioGroup 
                  defaultValue="both" 
                  value={customization.plateType}
                  onValueChange={(value) => setCustomization({
                    ...customization, 
                    plateType: value as 'both' | 'front' | 'rear',
                    isRoadLegal: false
                  })}
                  className="flex justify-between gap-2"
                >
                  <div className="relative w-1/3">
                    <RadioGroupItem value="both" id="show-both-plates" className="sr-only" />
                    <Label 
                      htmlFor="show-both-plates" 
                      className={`relative flex flex-col items-center justify-center h-20 w-full ${
                        customization.plateType === 'both' ? 'bg-red-700' : 'bg-red-400'
                      } text-white text-center rounded cursor-pointer transition-colors`}
                    >
                      <span className="text-xs font-bold">BOTH PLATES</span>
                      {customization.plateType === 'both' && (
                        <span className="absolute top-0 right-2 text-xs">✓</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="relative w-1/3">
                    <RadioGroupItem value="front" id="show-front-only" className="sr-only" />
                    <Label 
                      htmlFor="show-front-only" 
                      className={`relative flex flex-col items-center justify-center h-20 w-full ${
                        customization.plateType === 'front' ? 'bg-red-700' : 'bg-red-400'
                      } text-white text-center rounded cursor-pointer transition-colors`}
                    >
                      <span className="text-xs font-bold">FRONT ONLY</span>
                      {customization.plateType === 'front' && (
                        <span className="absolute top-0 right-2 text-xs">✓</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="relative w-1/3">
                    <RadioGroupItem value="rear" id="show-rear-only" className="sr-only" />
                    <Label 
                      htmlFor="show-rear-only" 
                      className={`relative flex flex-col items-center justify-center h-20 w-full ${
                        customization.plateType === 'rear' ? 'bg-red-700' : 'bg-red-400'
                      } text-white text-center rounded cursor-pointer transition-colors`}
                    >
                      <span className="text-xs font-bold">REAR ONLY</span>
                      {customization.plateType === 'rear' && (
                        <span className="absolute top-0 right-2 text-xs">✓</span>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Registration Input */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Your Registration</h3>
                <Input 
                  id="show-registration-input" 
                  className="w-full p-3 uppercase" 
                  placeholder="Enter plate text"
                  maxLength={8}
                  value={customization.registrationText}
                  onChange={(e) => setCustomization({
                    ...customization, 
                    registrationText: e.target.value.toUpperCase(),
                    isRoadLegal: false
                  })}
                />
              </div>
              
              {/* Rest of inputs identical but setting isRoadLegal to false */}
              {/* Copy the rest of the inputs from above, but change the IDs and set isRoadLegal to false in setCustomization */}
              {/* ... */}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview & Buy */}
        <div className="w-full md:w-2/3 p-6">
          <div className="flex flex-col items-center justify-between h-full">
            {/* Plate Preview */}
            <div className="w-full flex justify-center mb-8">
              <PlatePreview
                customization={customization}
                colors={colors || []}
                badges={badges || []}
                carBrands={carBrands || []}
              />
            </div>
            
            {/* Price and Buy Button */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center mt-auto">
              <div className="mb-4 md:mb-0">
                <p className="text-xl font-semibold">
                  Price: <span id="total-price" className="font-bold">£{totalPrice.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500">Including VAT</p>
              </div>
              <Button 
                size="lg"
                className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-md transition-colors text-lg"
                onClick={handleBuyNow}
              >
                BUY NOW
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Text Style Modal */}
      <TextStyleModal 
        isOpen={isTextStyleModalOpen}
        onClose={() => setIsTextStyleModalOpen(false)}
        textStyles={textStyles || []}
        selectedStyle={selectedTextStyle}
        onSelectStyle={(style) => {
          setCustomization({...customization, textStyle: style.id.toString()});
          setSelectedTextStyle(style);
          setIsTextStyleModalOpen(false);
        }}
      />
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        customization={customization}
        totalPrice={totalPrice}
        plateType={customization.plateType}
      />
    </div>
  );
};

export default PlateCustomizer;
