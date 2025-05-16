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
import { useSiteConfig } from '@/context/SiteConfigContext';
import type { 
  PlateSize, TextStyle, Badge, Color, CarBrand, 
  Pricing, PlateCustomization 
} from '@shared/schema';

const PlateCustomizer = () => {
  const { toast } = useToast();
  const { features } = useSiteConfig();
  
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
    plateOption: 'both', // Added to match PlatePreview component
    registrationText: 'YOUR REG',
    plateSize: '',
    textStyle: '',
    textColor: '',
    badge: 'gb',  // Default to GB badge
    borderColor: '',
    carBrand: '',
    isRoadLegal: true,
    documentFile: null,
    documentFileId: undefined
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
      setCustomization(prev => ({...prev, carBrand: "none"})); // Default to none
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
      plateOption: 'both',
      registrationText: 'YOUR REG',
      plateSize: plateSizes?.[0]?.id.toString() || '',
      textStyle: textStyles?.[0]?.id.toString() || '',
      textColor: colors?.[0]?.id.toString() || '',
      badge: 'gb',
      borderColor: colors?.[0]?.id.toString() || '',
      carBrand: 'none',
      isRoadLegal: true,
      documentFile: null,
      documentFileId: undefined
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
        <div className="w-full md:w-1/3 bg-red-50">
          <Tabs defaultValue={features.roadLegalPlates ? "road-legal" : "show-plates"}>
            <TabsList className="w-full grid grid-cols-2">
              {features.roadLegalPlates && (
                <TabsTrigger 
                  value="road-legal" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:bg-red-200 text-gray-800 rounded-t-md font-medium"
                >
                  Road Legal Plates
                </TabsTrigger>
              )}
              {features.showPlates && (
                <TabsTrigger 
                  value="show-plates"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:bg-red-200 text-gray-800 rounded-t-md font-medium"
                >
                  Show Plates
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="road-legal">
              <div className="p-4 bg-red-600 text-white">
                <h2 className="text-xl font-bold">Select your options</h2>
                <p className="text-sm">Build your number plate below by choosing from the options and clicking 'Buy Now' to add to basket.</p>
              </div>
              
              {/* Plate Type Selection */}
              <div className="p-4 border-b">
                <RadioGroup 
                  defaultValue="both" 
                  value={customization.plateType}
                  onValueChange={(value) => setCustomization({
                    ...customization, 
                    plateType: value as 'both' | 'front' | 'rear',
                    plateOption: value as 'both' | 'front' | 'rear' // Update plateOption to match plateType
                  })}
                  className="flex justify-between gap-2"
                >
                  <div className="relative w-1/3">
                    <RadioGroupItem value="both" id="both-plates" className="sr-only" />
                    <Label 
                      htmlFor="both-plates" 
                      className={`relative flex flex-col items-center justify-center h-16 w-full ${
                        customization.plateType === 'both' ? 'bg-red-600' : 'bg-red-400'
                      } text-white text-center rounded-md cursor-pointer transition-colors border-2 ${
                        customization.plateType === 'both' ? 'border-red-700' : 'border-red-400'
                      }`}
                    >
                      {customization.plateType === 'both' && (
                        <div className="absolute top-1 left-1 h-3 w-3 bg-white rounded-full border border-red-700"></div>
                      )}
                      <span className="text-xs font-bold">BOTH PLATES</span>
                    </Label>
                  </div>
                  
                  <div className="relative w-1/3">
                    <RadioGroupItem value="front" id="front-only" className="sr-only" />
                    <Label 
                      htmlFor="front-only" 
                      className={`relative flex flex-col items-center justify-center h-16 w-full ${
                        customization.plateType === 'front' ? 'bg-red-600' : 'bg-red-400'
                      } text-white text-center rounded-md cursor-pointer transition-colors border-2 ${
                        customization.plateType === 'front' ? 'border-red-700' : 'border-red-400'
                      }`}
                    >
                      {customization.plateType === 'front' && (
                        <div className="absolute top-1 left-1 h-3 w-3 bg-white rounded-full border border-red-700"></div>
                      )}
                      <span className="text-xs font-bold">FRONT ONLY</span>
                    </Label>
                  </div>
                  
                  <div className="relative w-1/3">
                    <RadioGroupItem value="rear" id="rear-only" className="sr-only" />
                    <Label 
                      htmlFor="rear-only" 
                      className={`relative flex flex-col items-center justify-center h-16 w-full ${
                        customization.plateType === 'rear' ? 'bg-red-600' : 'bg-red-400'
                      } text-white text-center rounded-md cursor-pointer transition-colors border-2 ${
                        customization.plateType === 'rear' ? 'border-red-700' : 'border-red-400'
                      }`}
                    >
                      {customization.plateType === 'rear' && (
                        <div className="absolute top-1 left-1 h-3 w-3 bg-white rounded-full border border-red-700"></div>
                      )}
                      <span className="text-xs font-bold">REAR ONLY</span>
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
                <div className="grid grid-cols-2 gap-2">
                  {plateSizes?.map((size) => (
                    <div 
                      key={size.id}
                      className={`relative cursor-pointer border-2 p-3 rounded-md text-center transition-all ${
                        customization.plateSize === size.id.toString() 
                          ? 'border-red-600 bg-red-50' 
                          : 'border-gray-200 hover:border-red-100'
                      }`}
                      onClick={() => setCustomization({...customization, plateSize: size.id.toString()})}
                    >
                      <div className="font-bold text-sm">{size.name}</div>
                      <div className="text-xs text-gray-500">{size.dimensions}</div>
                      <div className="text-xs mt-1 font-semibold">
                        {Number(size.additionalPrice) > 0 
                          ? `+£${Number(size.additionalPrice).toFixed(2)}` 
                          : 'Standard Price'}
                      </div>
                      {customization.plateSize === size.id.toString() && (
                        <div className="absolute top-1 right-1 h-3 w-3 bg-red-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Text Style Selection */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Text Style</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {textStyles?.map((style) => (
                    <div 
                      key={style.id}
                      className={`relative cursor-pointer border-2 rounded-md p-3 text-center transition-all ${
                        customization.textStyle === style.id.toString() 
                          ? 'border-red-600 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                      onClick={() => {
                        setCustomization({...customization, textStyle: style.id.toString()});
                        setSelectedTextStyle(style);
                      }}
                    >
                      <div className={`font-bold text-lg transition-all ${
                        customization.textStyle === style.id.toString() 
                          ? 'text-red-600 transform -translate-y-1 scale-105' 
                          : 'text-gray-700'
                      }`} style={customization.textStyle === style.id.toString() ? {
                        textShadow: '0px 2px 3px rgba(0, 0, 0, 0.2)'
                      } : {}}>
                        {style.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Number(style.additionalPrice) > 0 ? `+£${Number(style.additionalPrice).toFixed(2)}` : 'No Extra Cost'}
                      </div>
                      {customization.textStyle === style.id.toString() && (
                        <div className="absolute top-1 right-1 h-3 w-3 bg-red-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm w-full h-8 flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleTextStyleInfo}
                >
                  <InfoIcon className="h-4 w-4" />
                  View Text Style Details
                </Button>
              </div>
              
              {/* Badges & Colours - Conditionally shown based on feature toggles */}
              {(features.showBadges || features.showTextColors) && (
                <div className="p-4 border-b">
                  <h3 className="font-bold mb-2">Badges & Colours</h3>
                  
                  {/* Color Selection - Conditionally show text colors based on feature toggle */}
                  {features.showTextColors && (
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
                  )}
                  
                  {/* Badge Selection - Conditionally show badges based on feature toggle */}
                  {features.showBadges && (
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
                  )}
                </div>
              )}
              
              {/* Border Selection - Conditional based on feature flag */}
              {features.showBorders && (
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
              )}
              
              {/* Plate Surround (Car Brands) - Conditional based on feature flag */}
              {features.showCarBrands && (
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
                      <SelectItem value="none">None</SelectItem>
                      {carBrands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Document Upload (Required for road legal plates) - Conditional based on feature toggle */}
              {features.allowDocumentUpload && (
                <div className="p-4 border-b">
                  <h3 className="font-bold mb-2">Vehicle Document Upload</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Please upload a copy of your vehicle document for verification (required for road legal plates)
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          try {
                            // Upload the file to the server first
                            const formData = new FormData();
                            formData.append('file', files[0]);
                            
                            // Show loading state
                            toast({
                              title: "Uploading Document",
                              description: "Please wait while we upload your document...",
                            });
                            
                            // Make the upload request
                            const response = await fetch('/api/uploads', {
                              method: 'POST',
                              body: formData,
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to upload document');
                            }
                            
                            const uploadedFile = await response.json();
                            
                            // Store both the file object and the uploaded file ID
                            setCustomization({
                              ...customization,
                              documentFile: files[0],
                              documentFileId: uploadedFile.id
                            });
                            
                            toast({
                              title: "Document Uploaded",
                              description: `Successfully uploaded: ${files[0].name}`,
                            });
                          } catch (error) {
                            console.error('Error uploading document:', error);
                            toast({
                              title: "Upload Failed",
                              description: "There was a problem uploading your document. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    />
                    <label 
                      htmlFor="document-upload" 
                      className="cursor-pointer block"
                    >
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-primary">
                          Click to upload document
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF, JPG or PNG (max 5MB)
                        </span>
                      </div>
                    </label>
                    
                    {/* Display the uploaded file name */}
                    {customization.documentFile && (
                      <div className="mt-3 p-2 bg-green-50 text-green-700 rounded-md text-xs">
                        <div className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Uploaded: {customization.documentFile.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
              <div className="p-4 bg-red-600 text-white">
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
                    plateOption: value as 'both' | 'front' | 'rear',
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
              
              {/* Plate Size Selection */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Plate Size</h3>
                <div className="grid grid-cols-2 gap-2">
                  {plateSizes?.map((size) => (
                    <div 
                      key={size.id}
                      className={`relative cursor-pointer border-2 p-3 rounded-md text-center transition-all ${
                        customization.plateSize === size.id.toString() 
                          ? 'border-red-600 bg-red-50' 
                          : 'border-gray-200 hover:border-red-100'
                      }`}
                      onClick={() => setCustomization({...customization, plateSize: size.id.toString(), isRoadLegal: false})}
                    >
                      <div className="font-bold text-sm">{size.name}</div>
                      <div className="text-xs text-gray-500">{size.dimensions}</div>
                      <div className="text-xs mt-1 font-semibold">
                        {Number(size.additionalPrice) > 0 
                          ? `+£${Number(size.additionalPrice).toFixed(2)}` 
                          : 'Standard Price'}
                      </div>
                      {customization.plateSize === size.id.toString() && (
                        <div className="absolute top-1 right-1 h-3 w-3 bg-red-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Text Style Selection */}
              <div className="p-4 border-b">
                <h3 className="font-bold mb-2">Text Style</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {textStyles?.map((style) => (
                    <div 
                      key={style.id}
                      className={`relative cursor-pointer border-2 rounded-md p-3 text-center transition-all ${
                        customization.textStyle === style.id.toString() 
                          ? 'border-red-600 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                      onClick={() => {
                        setCustomization({...customization, textStyle: style.id.toString(), isRoadLegal: false});
                        setSelectedTextStyle(style);
                      }}
                    >
                      <div className={`font-bold text-lg transition-all ${
                        customization.textStyle === style.id.toString() 
                          ? 'text-red-600 transform -translate-y-1 scale-105' 
                          : 'text-gray-700'
                      }`} style={customization.textStyle === style.id.toString() ? {
                        textShadow: '0px 2px 3px rgba(0, 0, 0, 0.2)'
                      } : {}}>
                        {style.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Number(style.additionalPrice) > 0 ? `+£${Number(style.additionalPrice).toFixed(2)}` : 'No Extra Cost'}
                      </div>
                      {customization.textStyle === style.id.toString() && (
                        <div className="absolute top-1 right-1 h-3 w-3 bg-red-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm w-full h-8 flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleTextStyleInfo}
                >
                  <InfoIcon className="h-4 w-4" />
                  View Text Style Details
                </Button>
              </div>
              
              {/* Badges & Colours - Conditionally shown based on feature toggles */}
              {(features.showBadges || features.showTextColors) && (
                <div className="p-4 border-b">
                  <h3 className="font-bold mb-2">Badges & Colours</h3>
                  
                  {/* Color Selection - Conditionally show text colors based on feature toggle */}
                  {features.showTextColors && (
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
                            onClick={() => setCustomization({...customization, textColor: color.id.toString(), isRoadLegal: false})}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Badge Selection - Conditionally show badges based on feature toggle */}
                  {features.showBadges && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Badge:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {badges?.map((badge) => (
                          <button 
                            key={badge.id}
                            className={`h-16 w-full p-1 rounded ${
                              customization.badge === badge.id.toString() ? 'ring-2 ring-offset-2 ring-primary' : 'border border-gray-300'
                            } bg-gray-100 text-center text-xs`}
                            onClick={() => setCustomization({...customization, badge: badge.id.toString(), isRoadLegal: false})}
                          >
                            <img src={badge.imagePath} className="w-full h-full object-contain mx-auto" alt={badge.name} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Border Selection - Conditional based on feature flag */}
              {features.showBorders && (
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
                        onClick={() => setCustomization({...customization, borderColor: color.id.toString(), isRoadLegal: false})}
                      />
                    ))}
                    <button 
                      className={`h-8 w-full rounded ${
                        customization.borderColor === '' ? 'ring-2 ring-offset-2 ring-primary' : 'border border-gray-300'
                      } bg-transparent`}
                      title="None"
                      onClick={() => setCustomization({...customization, borderColor: '', isRoadLegal: false})}
                    />
                  </div>
                </div>
              )}
              
              {/* Plate Surround - Conditional based on feature flag */}
              {features.showCarBrands && (
                <div className="p-4 border-b">
                  <h3 className="font-bold mb-2">Plate Surround</h3>
                  <Select 
                    value={customization.carBrand} 
                    onValueChange={(value) => setCustomization({...customization, carBrand: value, isRoadLegal: false})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select car brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {carBrands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Reset Design Button */}
              <div className="p-4">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCustomization({
                      plateType: 'both',
                      plateOption: 'both',
                      registrationText: 'YOUR REG',
                      plateSize: plateSizes?.[0]?.id.toString() || '',
                      textStyle: textStyles?.[0]?.id.toString() || '',
                      textColor: colors?.[0]?.id.toString() || '',
                      badge: 'gb',
                      borderColor: colors?.[0]?.id.toString() || '',
                      carBrand: 'none',
                      isRoadLegal: false
                    });
                    
                    if (textStyles?.length) {
                      setSelectedTextStyle(textStyles[0]);
                    }
                    
                    toast({
                      title: "Design Reset",
                      description: "Your show plate design has been reset to default."
                    });
                  }}
                >
                  Reset Design
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview & Buy */}
        <div className="w-full md:w-2/3 p-6">
          <div className="flex flex-col items-center h-full">
            {/* Plate Preview */}
            <div className="w-full flex justify-center mb-4">
              <PlatePreview
                customization={customization}
                colors={colors || []}
                badges={badges || []}
                carBrands={carBrands || []}
                plateSizes={plateSizes || []}
              />
            </div>
            
            {/* Price and Buy Button - Positioned directly under the plate preview */}
            <div className="w-full flex flex-col items-center mb-8">
              <div className="mb-4 text-center">
                <p className="text-2xl font-semibold">
                  Price: <span id="total-price" className="font-bold">£{totalPrice.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500">Including VAT</p>
              </div>
              <Button 
                size="lg"
                className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-12 rounded-md transition-colors text-lg w-full md:w-auto"
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
