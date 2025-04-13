import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Steps, Step } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/confirmation',
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      
      // Redirect to confirmation page
      setLocation('/confirmation');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        disabled={!stripe || isProcessing} 
        className="w-full" 
        type="submit"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get the order total from local storage
  const orderAmount = localStorage.getItem('orderAmount');
  const orderDetails = localStorage.getItem('orderDetails');
  const [orderId, setOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!orderAmount || !orderDetails) {
      toast({
        title: "No order information",
        description: "Please customize your number plate first",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    // First create the order in our database
    const parsedDetails = JSON.parse(orderDetails);
    const orderData = {
      customerName: parsedDetails.customerName || 'Guest Customer',
      customerEmail: parsedDetails.customerEmail || 'guest@example.com',
      customerPhone: parsedDetails.customerPhone || 'Not provided',
      shippingAddress: parsedDetails.shippingAddress || 'Not provided',
      plateDetails: {
        registrationText: parsedDetails.registrationText,
        plateSize: parsedDetails.plateSize,
        textStyle: parsedDetails.textStyle,
        textColor: parsedDetails.textColor,
        badge: parsedDetails.badge,
        borderColor: parsedDetails.borderColor,
        carBrand: parsedDetails.carBrand,
        isRoadLegal: parsedDetails.isRoadLegal,
        plateType: parsedDetails.plateType
      },
      // Include document file ID if it exists (for road legal plates)
      documentFileId: parsedDetails.documentFileId || null,
      totalPrice: parseFloat(orderAmount),
      paymentMethod: 'stripe',
      orderStatus: 'pending_payment'
    };

    // Create order record first
    setIsLoading(true);
    apiRequest('POST', '/api/orders', orderData)
      .then(res => res.json())
      .then(data => {
        // Store the order ID for reference after payment completes
        if (data && data.id) {
          setOrderId(data.id.toString());
          localStorage.setItem('orderId', data.id.toString());
          
          // After order is created, create the payment intent
          const amount = parseFloat(orderAmount);
          return apiRequest("POST", "/api/create-payment-intent", { 
            amount,
            orderId: data.id
          });
        } else {
          throw new Error('No order ID returned from server');
        }
      })
      .then(res => res.json())
      .then(data => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error setting up payment:", error);
        toast({
          title: "Payment setup failed",
          description: "We couldn't set up the payment. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [orderAmount, orderDetails, setLocation, toast]);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Complete Your Order</h1>
      
      <Steps value={currentStep} onValueChange={setCurrentStep} className="mb-8">
        <Step label="Order Details" index={0} />
        <Step label="Shipping" index={1} />
        <Step label="Payment" index={2} />
      </Steps>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : clientSecret ? (
        <div className="border rounded-md p-6 bg-white shadow-sm">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </div>
      ) : (
        <div className="text-center p-6 border rounded-md">
          <p className="text-lg text-red-600">
            Unable to initialize payment. Please try again later.
          </p>
          <Button onClick={() => setLocation('/')} className="mt-4">
            Return to Homepage
          </Button>
        </div>
      )}
    </div>
  );
}