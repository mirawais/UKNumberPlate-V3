import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Pricing } from '@shared/schema';

const PricingSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Load current pricing settings
  const { data: pricing, isLoading } = useQuery<Pricing>({ 
    queryKey: ['/api/pricing']
  });
  
  // Create state for form values
  const [values, setValues] = useState<{
    frontPlatePrice: string;
    rearPlatePrice: string;
    bothPlatesDiscount: string;
    taxRate: string;
    deliveryFee: string;
  }>({
    frontPlatePrice: '',
    rearPlatePrice: '',
    bothPlatesDiscount: '',
    taxRate: '',
    deliveryFee: '',
  });
  
  // Update state when data is loaded
  useEffect(() => {
    if (pricing) {
      setValues({
        frontPlatePrice: pricing.frontPlatePrice,
        rearPlatePrice: pricing.rearPlatePrice,
        bothPlatesDiscount: pricing.bothPlatesDiscount || '0',
        taxRate: pricing.taxRate || '20',
        deliveryFee: pricing.deliveryFee || '4.99',
      });
    }
  }, [pricing]);
  
  // Mutation for updating pricing
  const updatePricingMutation = useMutation({
    mutationFn: (data: Partial<Pricing>) => 
      apiRequest('PATCH', `/api/pricing/${pricing?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing'] });
      toast({
        title: 'Success',
        description: 'Pricing settings updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update pricing settings',
        variant: 'destructive',
      });
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to the correct format
    const pricingData = {
      ...values,
    };
    
    updatePricingMutation.mutate(pricingData);
  };
  
  if (isLoading) {
    return <div>Loading pricing settings...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Settings</CardTitle>
        <CardDescription>Manage your product and shipping pricing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frontPlatePrice">Front Plate Price (£)</Label>
              <Input
                id="frontPlatePrice"
                name="frontPlatePrice"
                value={values.frontPlatePrice}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rearPlatePrice">Rear Plate Price (£)</Label>
              <Input
                id="rearPlatePrice"
                name="rearPlatePrice"
                value={values.rearPlatePrice}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bothPlatesDiscount">Both Plates Discount (£)</Label>
              <Input
                id="bothPlatesDiscount"
                name="bothPlatesDiscount"
                value={values.bothPlatesDiscount}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                value={values.taxRate}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee (£)</Label>
              <Input
                id="deliveryFee"
                name="deliveryFee"
                value={values.deliveryFee}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updatePricingMutation.isPending}
              className="bg-primary hover:bg-red-700 text-white"
            >
              {updatePricingMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PricingSettings;