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
}

const detailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number should be at least 10 digits'),
});

const shippingSchema = z.object({
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(5, 'Postcode is required'),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(['bank', 'paypal', 'stripe', 'cod'])
});

const CheckoutForm = ({ 
  step, 
  onSubmit, 
  initialValues, 
  onBack,
  onSelectPaymentMethod 
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
          </div>
        )}
        
        {step === 'payment' && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <h3 className="font-bold mb-2">Select Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary"
                onClick={() => handleSelectPayment('bank')}
              >
                <CardContent className="p-4 flex items-center">
                  <Banknote className="h-8 w-8 mr-4" />
                  <div>
                    <h4 className="font-bold">Bank Transfer</h4>
                    <p className="text-sm text-gray-500">Pay via direct bank transfer</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:border-primary"
                onClick={() => handleSelectPayment('paypal')}
              >
                <CardContent className="p-4 flex items-center">
                  <Wallet className="h-8 w-8 mr-4" />
                  <div>
                    <h4 className="font-bold">PayPal</h4>
                    <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:border-primary"
                onClick={() => handleSelectPayment('stripe')}
              >
                <CardContent className="p-4 flex items-center">
                  <CreditCard className="h-8 w-8 mr-4" />
                  <div>
                    <h4 className="font-bold">Credit/Debit Card</h4>
                    <p className="text-sm text-gray-500">Pay with Stripe secure payments</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:border-primary"
                onClick={() => handleSelectPayment('cod')}
              >
                <CardContent className="p-4 flex items-center">
                  <Truck className="h-8 w-8 mr-4" />
                  <div>
                    <h4 className="font-bold">Cash on Delivery</h4>
                    <p className="text-sm text-gray-500">Pay when you receive the plates</p>
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
