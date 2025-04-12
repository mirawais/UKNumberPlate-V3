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
  
  // Create/Update mutations
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
          isActive: modalData.isActive || true
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
    }
    // Add similar handlers for other types...
  };
  
  // Handler for deleting an item
  const handleDelete = (type: string, id: number) => {
    if (type === 'plateSize') {
      deletePlateSizeMutation.mutate(id);
    }
    // Add similar handlers for other types...
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
        
        {/* Add similar tabs for other configuration types... */}
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
            
            {/* Add similar form fields for other types... */}
            
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
