import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Banknote, CreditCard, Truck, Wallet } from 'lucide-react';

interface CheckoutFormProps {
  step: 'details' | 'shipping' | 'payment';
  onSubmit: (data: any) => void;
  initialValues: any;
  onBack?: () => void;
  onSelectPaymentMethod?: (method: string) => void;
  deliveryFee?: string;
}

const detailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number should be at least 10 digits'),
});

const shippingSchema = z.object({
  shippingMethod: z.enum(['delivery', 'pickup']),
  address1: z.string().min(1, 'Address is required').optional().or(z.literal('')),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required').optional().or(z.literal('')),
  postcode: z.string().min(5, 'Postcode is required').optional().or(z.literal('')),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(['stripe'])
});

const CheckoutForm = ({ 
  step, 
  onSubmit, 
  initialValues, 
  onBack,
  onSelectPaymentMethod,
  deliveryFee = "4.99"
}: CheckoutFormProps) => {
  let schema;
  
  switch(step) {
    case 'details':
      schema = detailsSchema;
      break;
    case 'shipping':
      schema = shippingSchema;
      break;
    case 'payment':
      schema = paymentSchema;
      break;
    default:
      schema = detailsSchema;
  }
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues
  });
  
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };
  
  const handleSelectPayment = (method: string) => {
    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(method);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {step === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        {step === 'shipping' && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <FormField
              control={form.control}
              name="shippingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Method</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <FormLabel htmlFor="delivery" className="flex-1 cursor-pointer">
                          <div className="font-medium">Delivery (+£{deliveryFee})</div>
                          <div className="text-sm text-gray-500">Your plates will be delivered to your address</div>
                        </FormLabel>
                      </div>
                      
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <FormLabel htmlFor="pickup" className="flex-1 cursor-pointer">
                          <div className="font-medium">Pickup (Free)</div>
                          <div className="text-sm text-gray-500">Collect your plates from our store</div>
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch("shippingMethod") === "delivery" && (
              <>
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {step === 'payment' && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <h3 className="font-bold mb-2">Payment Method</h3>
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary"
                onClick={() => handleSelectPayment('stripe')}
              >
                <CardContent className="p-4 flex items-center">
                  <CreditCard className="h-8 w-8 mr-4" />
                  <div>
                    <h4 className="font-bold">Credit/Debit Card</h4>
                    <p className="text-sm text-gray-500">Secure payment with Stripe</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-4">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>
          )}
          
          {step !== 'payment' && (
            <Button type="submit" className="bg-primary hover:bg-red-700 text-white">
              {step === 'details' ? 'Continue to Shipping' : 'Continue to Payment'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CheckoutForm;