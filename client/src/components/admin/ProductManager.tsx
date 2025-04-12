import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import type { 
  PlateSize, TextStyle, Badge, Color, CarBrand, Pricing, PaymentMethod
} from '@shared/schema';

const ProductManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Queries for all product configurations
  const { data: plateSizes } = useQuery<PlateSize[]>({ queryKey: ['/api/plate-sizes'] });
  const { data: textStyles } = useQuery<TextStyle[]>({ queryKey: ['/api/text-styles'] });
  const { data: badges } = useQuery<Badge[]>({ queryKey: ['/api/badges'] });
  const { data: colors } = useQuery<Color[]>({ queryKey: ['/api/colors'] });
  const { data: carBrands } = useQuery<CarBrand[]>({ queryKey: ['/api/car-brands'] });
  const { data: pricing } = useQuery<Pricing>({ queryKey: ['/api/pricing'] });
  const { data: paymentMethods } = useQuery<PaymentMethod[]>({ queryKey: ['/api/payment-methods'] });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [modalData, setModalData] = useState<any>({});
  const [modalAction, setModalAction] = useState<'create' | 'edit'>('create');
  
  // Create/Update mutations for Plate Sizes
  const createPlateSizeMutation = useMutation({
    mutationFn: (data: Omit<PlateSize, 'id'>) => apiRequest('POST', '/api/plate-sizes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plate-sizes'] });
      toast({ title: "Success", description: "Plate size created successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create plate size", 
        variant: "destructive" 
      });
    }
  });
  
  const updatePlateSizeMutation = useMutation({
    mutationFn: (data: PlateSize) => apiRequest('PUT', `/api/plate-sizes/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plate-sizes'] });
      toast({ title: "Success", description: "Plate size updated successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update plate size", 
        variant: "destructive" 
      });
    }
  });
  
  // Create/Update mutations for Text Styles
  const createTextStyleMutation = useMutation({
    mutationFn: (data: Omit<TextStyle, 'id'>) => apiRequest('POST', '/api/text-styles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/text-styles'] });
      toast({ title: "Success", description: "Text style created successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create text style", 
        variant: "destructive" 
      });
    }
  });
  
  const updateTextStyleMutation = useMutation({
    mutationFn: (data: TextStyle) => apiRequest('PUT', `/api/text-styles/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/text-styles'] });
      toast({ title: "Success", description: "Text style updated successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update text style", 
        variant: "destructive" 
      });
    }
  });
  
  // Create/Update mutations for Badges
  const createBadgeMutation = useMutation({
    mutationFn: (data: Omit<Badge, 'id'>) => apiRequest('POST', '/api/badges', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/badges'] });
      toast({ title: "Success", description: "Badge created successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create badge", 
        variant: "destructive" 
      });
    }
  });
  
  const updateBadgeMutation = useMutation({
    mutationFn: (data: Badge) => apiRequest('PUT', `/api/badges/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/badges'] });
      toast({ title: "Success", description: "Badge updated successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update badge", 
        variant: "destructive" 
      });
    }
  });
  
  // Create/Update mutations for Colors
  const createColorMutation = useMutation({
    mutationFn: (data: Omit<Color, 'id'>) => apiRequest('POST', '/api/colors', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });
      toast({ title: "Success", description: "Color created successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create color", 
        variant: "destructive" 
      });
    }
  });
  
  const updateColorMutation = useMutation({
    mutationFn: (data: Color) => apiRequest('PUT', `/api/colors/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });
      toast({ title: "Success", description: "Color updated successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update color", 
        variant: "destructive" 
      });
    }
  });
  
  // Create/Update mutations for Car Brands
  const createCarBrandMutation = useMutation({
    mutationFn: (data: Omit<CarBrand, 'id'>) => apiRequest('POST', '/api/car-brands', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-brands'] });
      toast({ title: "Success", description: "Car brand created successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create car brand", 
        variant: "destructive" 
      });
    }
  });
  
  const updateCarBrandMutation = useMutation({
    mutationFn: (data: CarBrand) => apiRequest('PUT', `/api/car-brands/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-brands'] });
      toast({ title: "Success", description: "Car brand updated successfully" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update car brand", 
        variant: "destructive" 
      });
    }
  });
  
  // Delete mutations
  const deletePlateSizeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/plate-sizes/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plate-sizes'] });
      toast({ title: "Success", description: "Plate size deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete plate size", 
        variant: "destructive" 
      });
    }
  });
  
  const deleteTextStyleMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/text-styles/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/text-styles'] });
      toast({ title: "Success", description: "Text style deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete text style", 
        variant: "destructive" 
      });
    }
  });
  
  const deleteBadgeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/badges/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/badges'] });
      toast({ title: "Success", description: "Badge deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete badge", 
        variant: "destructive" 
      });
    }
  });
  
  const deleteColorMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/colors/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });
      toast({ title: "Success", description: "Color deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete color", 
        variant: "destructive" 
      });
    }
  });
  
  const deleteCarBrandMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/car-brands/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-brands'] });
      toast({ title: "Success", description: "Car brand deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete car brand", 
        variant: "destructive" 
      });
    }
  });
  
  // Update pricing mutation
  const updatePricingMutation = useMutation({
    mutationFn: (data: Pricing) => apiRequest('PUT', `/api/pricing/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing'] });
      toast({ title: "Success", description: "Pricing updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update pricing", 
        variant: "destructive" 
      });
    }
  });
  
  // Handler for opening the modal
  const handleOpenModal = (type: string, action: 'create' | 'edit', data?: any) => {
    setModalType(type);
    setModalAction(action);
    setModalData(data || {});
    setIsModalOpen(true);
  };
  
  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalType === 'plateSize') {
      if (modalAction === 'create') {
        createPlateSizeMutation.mutate({
          name: modalData.name,
          dimensions: modalData.dimensions,
          additionalPrice: modalData.additionalPrice,
          isActive: modalData.isActive !== false // Default to true
        });
      } else {
        updatePlateSizeMutation.mutate({
          id: modalData.id,
          name: modalData.name,
          dimensions: modalData.dimensions,
          additionalPrice: modalData.additionalPrice,
          isActive: modalData.isActive
        });
      }
    } else if (modalType === 'textStyle') {
      if (modalAction === 'create') {
        createTextStyleMutation.mutate({
          name: modalData.name,
          description: modalData.description,
          imagePath: modalData.imagePath,
          additionalPrice: modalData.additionalPrice,
          isActive: modalData.isActive !== false // Default to true
        });
      } else {
        updateTextStyleMutation.mutate({
          id: modalData.id,
          name: modalData.name,
          description: modalData.description,
          imagePath: modalData.imagePath,
          additionalPrice: modalData.additionalPrice,
          isActive: modalData.isActive
        });
      }
    } else if (modalType === 'badge') {
      if (modalAction === 'create') {
        createBadgeMutation.mutate({
          name: modalData.name,
          imagePath: modalData.imagePath,
          isActive: modalData.isActive !== false // Default to true
        });
      } else {
        updateBadgeMutation.mutate({
          id: modalData.id,
          name: modalData.name,
          imagePath: modalData.imagePath,
          isActive: modalData.isActive
        });
      }
    } else if (modalType === 'color') {
      if (modalAction === 'create') {
        createColorMutation.mutate({
          name: modalData.name,
          hexCode: modalData.hexCode,
          isActive: modalData.isActive !== false // Default to true
        });
      } else {
        updateColorMutation.mutate({
          id: modalData.id,
          name: modalData.name,
          hexCode: modalData.hexCode,
          isActive: modalData.isActive
        });
      }
    } else if (modalType === 'carBrand') {
      if (modalAction === 'create') {
        createCarBrandMutation.mutate({
          name: modalData.name,
          isActive: modalData.isActive !== false // Default to true
        });
      } else {
        updateCarBrandMutation.mutate({
          id: modalData.id,
          name: modalData.name,
          isActive: modalData.isActive
        });
      }
    }
  };
  
  // Handler for deleting an item
  const handleDelete = (type: string, id: number) => {
    if (type === 'plateSize') {
      deletePlateSizeMutation.mutate(id);
    } else if (type === 'textStyle') {
      deleteTextStyleMutation.mutate(id);
    } else if (type === 'badge') {
      deleteBadgeMutation.mutate(id);
    } else if (type === 'color') {
      deleteColorMutation.mutate(id);
    } else if (type === 'carBrand') {
      deleteCarBrandMutation.mutate(id);
    }
  };
  
  // Handler for updating pricing
  const handlePricingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pricing) {
      updatePricingMutation.mutate({
        ...pricing,
        frontPlatePrice: modalData.frontPlatePrice || pricing.frontPlatePrice,
        rearPlatePrice: modalData.rearPlatePrice || pricing.rearPlatePrice,
        bothPlatesDiscount: modalData.bothPlatesDiscount || pricing.bothPlatesDiscount,
        taxRate: modalData.taxRate || pricing.taxRate
      });
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Product Configuration</h2>
      
      <Tabs defaultValue="pricing">
        <TabsList>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="plateSizes">Plate Sizes</TabsTrigger>
          <TabsTrigger value="textStyles">Text Styles</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="carBrands">Car Brands</TabsTrigger>
          <TabsTrigger value="paymentMethods">Payment Methods</TabsTrigger>
        </TabsList>
        
        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Base Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {pricing && (
                <form onSubmit={handlePricingUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frontPlatePrice">Front Plate Price (£)</Label>
                      <Input 
                        id="frontPlatePrice" 
                        type="number" 
                        step="0.01" 
                        defaultValue={pricing.frontPlatePrice.toString()} 
                        onChange={(e) => setModalData({...modalData, frontPlatePrice: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rearPlatePrice">Rear Plate Price (£)</Label>
                      <Input 
                        id="rearPlatePrice" 
                        type="number" 
                        step="0.01" 
                        defaultValue={pricing.rearPlatePrice.toString()} 
                        onChange={(e) => setModalData({...modalData, rearPlatePrice: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bothPlatesDiscount">Both Plates Discount (£)</Label>
                      <Input 
                        id="bothPlatesDiscount" 
                        type="number" 
                        step="0.01" 
                        defaultValue={pricing.bothPlatesDiscount.toString()} 
                        onChange={(e) => setModalData({...modalData, bothPlatesDiscount: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input 
                        id="taxRate" 
                        type="number" 
                        step="0.01" 
                        defaultValue={pricing.taxRate.toString()} 
                        onChange={(e) => setModalData({...modalData, taxRate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4">Update Pricing</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Plate Sizes Tab */}
        <TabsContent value="plateSizes">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenModal('plateSize', 'create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Add Plate Size
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Additional Price (£)</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plateSizes?.map((size) => (
                <TableRow key={size.id}>
                  <TableCell>{size.name}</TableCell>
                  <TableCell>{size.dimensions}</TableCell>
                  <TableCell>£{Number(size.additionalPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={size.isActive} 
                      onCheckedChange={() => {
                        updatePlateSizeMutation.mutate({
                          ...size,
                          isActive: !size.isActive
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal('plateSize', 'edit', size)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete('plateSize', size.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Text Styles Tab */}
        <TabsContent value="textStyles">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenModal('textStyle', 'create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Add Text Style
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Additional Price (£)</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {textStyles?.map((style) => (
                <TableRow key={style.id}>
                  <TableCell>{style.name}</TableCell>
                  <TableCell>{style.description}</TableCell>
                  <TableCell>
                    {style.imagePath && (
                      <div className="h-10 w-16 relative">
                        <img 
                          src={style.imagePath} 
                          alt={style.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>£{Number(style.additionalPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={style.isActive} 
                      onCheckedChange={() => {
                        updateTextStyleMutation.mutate({
                          ...style,
                          isActive: !style.isActive
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal('textStyle', 'edit', style)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete('textStyle', style.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Badges Tab */}
        <TabsContent value="badges">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenModal('badge', 'create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Add Badge
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges?.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell>{badge.name}</TableCell>
                  <TableCell>
                    {badge.imagePath && (
                      <div className="h-10 w-16 relative">
                        <img 
                          src={badge.imagePath} 
                          alt={badge.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={badge.isActive} 
                      onCheckedChange={() => {
                        updateBadgeMutation.mutate({
                          ...badge,
                          isActive: !badge.isActive
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal('badge', 'edit', badge)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete('badge', badge.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Colors Tab */}
        <TabsContent value="colors">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenModal('color', 'create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Add Color
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Hex Code</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colors?.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>{color.name}</TableCell>
                  <TableCell>
                    <div 
                      className="h-6 w-6 rounded-full" 
                      style={{ backgroundColor: color.hexCode }}
                    />
                  </TableCell>
                  <TableCell>{color.hexCode}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={color.isActive} 
                      onCheckedChange={() => {
                        updateColorMutation.mutate({
                          ...color,
                          isActive: !color.isActive
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal('color', 'edit', color)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete('color', color.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Car Brands Tab */}
        <TabsContent value="carBrands">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => handleOpenModal('carBrand', 'create')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" /> Add Car Brand
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carBrands?.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={brand.isActive} 
                      onCheckedChange={() => {
                        updateCarBrandMutation.mutate({
                          ...brand,
                          isActive: !brand.isActive
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal('carBrand', 'edit', brand)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete('carBrand', brand.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="paymentMethods">
          <div className="flex justify-end mb-4">
            <Button disabled className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" /> Add Payment Method
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods?.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>{method.name}</TableCell>
                  <TableCell>
                    <Switch checked={method.isActive} disabled />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            Payment methods are managed through integrations. Currently only Stripe is supported.
          </p>
        </TabsContent>
      </Tabs>
      
      {/* Modal for Adding/Editing Items */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'create' ? 'Add' : 'Edit'} {modalType.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType === 'plateSize' && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={modalData.name || ''} 
                    onChange={(e) => setModalData({...modalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input 
                    id="dimensions" 
                    value={modalData.dimensions || ''} 
                    onChange={(e) => setModalData({...modalData, dimensions: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="additionalPrice">Additional Price (£)</Label>
                  <Input 
                    id="additionalPrice" 
                    type="number" 
                    step="0.01"
                    value={modalData.additionalPrice || '0'} 
                    onChange={(e) => setModalData({...modalData, additionalPrice: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="isActive"
                    checked={modalData.isActive !== false} // Default to true
                    onCheckedChange={(checked) => setModalData({...modalData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </>
            )}
            
            {modalType === 'textStyle' && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={modalData.name || ''} 
                    onChange={(e) => setModalData({...modalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    value={modalData.description || ''} 
                    onChange={(e) => setModalData({...modalData, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="imagePath">Image URL</Label>
                  <Input 
                    id="imagePath" 
                    value={modalData.imagePath || ''} 
                    onChange={(e) => setModalData({...modalData, imagePath: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="additionalPrice">Additional Price (£)</Label>
                  <Input 
                    id="additionalPrice" 
                    type="number" 
                    step="0.01"
                    value={modalData.additionalPrice || '0'} 
                    onChange={(e) => setModalData({...modalData, additionalPrice: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="isActive"
                    checked={modalData.isActive !== false} // Default to true
                    onCheckedChange={(checked) => setModalData({...modalData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </>
            )}
            
            {modalType === 'badge' && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={modalData.name || ''} 
                    onChange={(e) => setModalData({...modalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="imagePath">Image URL</Label>
                  <Input 
                    id="imagePath" 
                    value={modalData.imagePath || ''} 
                    onChange={(e) => setModalData({...modalData, imagePath: e.target.value})}
                    placeholder="https://example.com/badge.png"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="isActive"
                    checked={modalData.isActive !== false} // Default to true
                    onCheckedChange={(checked) => setModalData({...modalData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                {modalData.imagePath && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="h-20 w-20 mt-2 border rounded flex items-center justify-center">
                      <img 
                        src={modalData.imagePath} 
                        alt="Badge Preview" 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80?text=Error'}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            
            {modalType === 'color' && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={modalData.name || ''} 
                    onChange={(e) => setModalData({...modalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hexCode">Hex Color Code</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="hexCode" 
                      value={modalData.hexCode || '#000000'} 
                      onChange={(e) => setModalData({...modalData, hexCode: e.target.value})}
                      placeholder="#000000"
                      required
                    />
                    <input 
                      type="color"
                      value={modalData.hexCode || '#000000'}
                      onChange={(e) => setModalData({...modalData, hexCode: e.target.value})}
                      className="h-10 w-16 p-1 rounded-md border"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="isActive"
                    checked={modalData.isActive !== false} // Default to true
                    onCheckedChange={(checked) => setModalData({...modalData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </>
            )}
            
            {modalType === 'carBrand' && (
              <>
                <div>
                  <Label htmlFor="name">Brand Name</Label>
                  <Input 
                    id="name" 
                    value={modalData.name || ''} 
                    onChange={(e) => setModalData({...modalData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="isActive"
                    checked={modalData.isActive !== false} // Default to true
                    onCheckedChange={(checked) => setModalData({...modalData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
