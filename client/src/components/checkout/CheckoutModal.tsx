import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Steps, Step } from '@/components/ui/steps';
import { useToast } from '@/hooks/use-toast';
import CheckoutForm from './CheckoutForm';
import { apiRequest } from '@/lib/queryClient';
import type { PlateCustomization, Pricing } from '@shared/schema';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: PlateCustomization;
  totalPrice: number;
  plateType: 'both' | 'front' | 'rear';
}

type CheckoutStep = 'details' | 'shipping' | 'payment' | 'confirmation';

const CheckoutModal = ({ isOpen, onClose, customization, totalPrice, plateType }: CheckoutModalProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details');
  const [orderDetails, setOrderDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    paymentMethod: 'stripe',
    shippingMethod: 'pickup'
  });
  
  // Fetch pricing information to get the delivery fee
  const { data: pricing } = useQuery<Pricing>({ 
    queryKey: ['/api/pricing'] 
  });
  
  const handleDetailsSubmit = (data: { firstName: string; lastName: string; email: string; phone: string }) => {
    setOrderDetails(prev => ({ ...prev, ...data }));
    setCurrentStep('shipping');
  };
  
  const handleShippingSubmit = (data: { 
    address1: string; 
    address2: string; 
    city: string; 
    postcode: string;
    shippingMethod: 'delivery' | 'pickup';
  }) => {
    setOrderDetails(prev => ({ ...prev, ...data }));
    setCurrentStep('payment');
  };
  
  const handlePaymentMethodSelect = async (method: string) => {
    // Only accept Stripe as payment method
    if (method !== 'stripe') {
      toast({
        title: "Payment Method Unavailable",
        description: "Only card payments are accepted at this time.",
        variant: "destructive"
      });
      return;
    }
    
    setOrderDetails(prev => ({ ...prev, paymentMethod: method }));
    
    try {
      // Prepare order data
      const order = {
        customerName: `${orderDetails.firstName} ${orderDetails.lastName}`,
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.phone,
        shippingAddress: `${orderDetails.address1}, ${orderDetails.address2 ? orderDetails.address2 + ', ' : ''}${orderDetails.city}, ${orderDetails.postcode}`,
        plateDetails: customization,
        totalPrice,
        paymentMethod: 'stripe',
        orderStatus: 'pending_payment',
        // Include document file ID if it exists (for road legal plates)
        documentFileId: customization.documentFileId ? customization.documentFileId.toString() : null,
      };
      
      // Save order details to localStorage for the checkout page
      localStorage.setItem('orderDetails', JSON.stringify({
        ...customization,
        customerName: `${orderDetails.firstName} ${orderDetails.lastName}`,
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.phone,
        shippingAddress: `${orderDetails.address1}, ${orderDetails.address2 ? orderDetails.address2 + ', ' : ''}${orderDetails.city}, ${orderDetails.postcode}`,
        documentFileId: customization.documentFileId ? customization.documentFileId.toString() : null
      }));
      localStorage.setItem('orderAmount', totalPrice.toString());
      
      // Close modal and redirect to checkout page
      onClose();
      window.location.href = '/checkout';
      
    } catch (error) {
      toast({
        title: "Order Placement Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetCheckout = () => {
    setCurrentStep('details');
    setOrderDetails({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      postcode: '',
      paymentMethod: 'stripe',
      shippingMethod: 'pickup',
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Complete Your Order</DialogTitle>
        </DialogHeader>
        
        {/* Checkout Steps */}
        <div className="mb-8">
          <Steps 
            value={
              currentStep === 'details' ? 0 : 
              currentStep === 'shipping' ? 1 : 
              currentStep === 'payment' ? 2 : 3
            }
          >
            <Step label="Your Details" />
            <Step label="Shipping" />
            <Step label="Payment" />
            <Step label="Confirmation" />
          </Steps>
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-bold mb-3">Order Summary</h4>
          <div className="mb-3 flex">
            <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden mr-3 flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {plateType === 'both' ? 'Front & Rear' : plateType === 'front' ? 'Front Only' : 'Rear Only'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">UK Number Plate - "{customization.registrationText}"</p>
              <p className="text-sm text-gray-600">
                {plateType === 'both' ? 'Front & Rear' : plateType === 'front' ? 'Front Only' : 'Rear Only'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">£{totalPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500">incl. VAT</p>
            </div>
          </div>
        </div>
        
        {/* Step 1: Customer Details */}
        {currentStep === 'details' && (
          <CheckoutForm 
            step="details" 
            onSubmit={handleDetailsSubmit} 
            initialValues={orderDetails}
          />
        )}
        
        {/* Step 2: Shipping */}
        {currentStep === 'shipping' && (
          <CheckoutForm 
            step="shipping" 
            onSubmit={handleShippingSubmit} 
            initialValues={orderDetails}
            onBack={() => setCurrentStep('details')}
            deliveryFee={pricing?.deliveryFee || "4.99"}
          />
        )}
        
        {/* Step 3: Payment */}
        {currentStep === 'payment' && (
          <CheckoutForm 
            step="payment" 
            onSubmit={() => {}} 
            initialValues={orderDetails}
            onBack={() => setCurrentStep('shipping')}
            onSelectPaymentMethod={handlePaymentMethodSelect}
          />
        )}
        
        {/* Step 4: Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 mb-8">
              Thank you for your order. We've sent a confirmation email to {orderDetails.email}.
            </p>
            <button 
              className="bg-primary hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
              onClick={resetCheckout}
            >
              Close
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
