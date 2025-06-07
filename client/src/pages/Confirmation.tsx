import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

export default function Confirmation() {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing' | null>(null);
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  
  useEffect(() => {
    // Try to get order details from localStorage
    const storedOrderDetails = localStorage.getItem('orderDetails');
    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails));
      } catch (error) {
        console.error('Failed to parse order details', error);
      }
    } else {
      toast({
        title: "No order information",
        description: "We couldn't find your order details.",
        variant: "destructive",
      });
    }
    
    // Check for payment_intent and payment_intent_client_secret in URL
    const params = new URLSearchParams(search);
    const paymentIntent = params.get('payment_intent');
    const urlPaymentStatus = params.get('redirect_status');
    const orderId = localStorage.getItem('orderId');
    
    if (paymentIntent && urlPaymentStatus) {
      // Determine initial status based on URL params
      if (urlPaymentStatus === 'succeeded') {
        setPaymentStatus('success');
      } else if (urlPaymentStatus === 'processing') {
        setPaymentStatus('processing');
      } else {
        setPaymentStatus('failed');
      }
      
      // Call the server to update order status
      if (orderId) {
        apiRequest('POST', '/api/payment-complete', {
          orderId,
          paymentIntentId: paymentIntent
        })
        .then(res => res.json())
        .then(data => {
          // Show appropriate toast based on Stripe status
          if (data.paymentStatus === 'succeeded') {
            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully."
            });
          } else if (data.paymentStatus === 'processing') {
            toast({
              title: "Payment Processing",
              description: "Your payment is being processed. We'll update you once completed."
            });
          } else {
            toast({
              title: "Payment Status",
              description: `Your payment is in ${data.paymentStatus} state.`
            });
          }
        })
        .catch(error => {
          console.error('Failed to update order status', error);
          toast({
            title: "Error Updating Order",
            description: "There was an issue updating your order status.",
            variant: "destructive"
          });
        });
      }
    } else if (orderId) {
      // If we have an order ID but no payment intent in URL,
      // check the order status directly from our API
      apiRequest('GET', `/api/order-payment-status/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.paymentStatus === 'succeeded') {
            setPaymentStatus('success');
          } else if (data.paymentStatus === 'processing') {
            setPaymentStatus('processing');
          } else if (['requires_payment_method', 'requires_action', 'canceled'].includes(data.paymentStatus)) {
            setPaymentStatus('failed');
          }
        })
        .catch(error => {
          console.error('Failed to get order payment status', error);
        });
    }
    
    // Clear order data from localStorage after we're done with the requests
    const clearLocalStorage = () => {
      localStorage.removeItem('orderDetails');
      localStorage.removeItem('orderAmount');
      localStorage.removeItem('orderId');
    };
    
    // Set a slight delay to ensure we've processed everything
    const timeoutId = setTimeout(clearLocalStorage, 2000);
    
    // Clean up timeout
    return () => clearTimeout(timeoutId);
  }, [search, toast]);

  // Render content based on payment status
  let statusIcon = <Check className="h-8 w-8 text-green-600" />;
  let statusColor = "bg-green-100";
  let statusTitle = "Order Confirmed!";
  let statusMessage = "Thank you for your order. We've received your payment and will begin processing your custom number plate right away.";
  
  if (paymentStatus === 'processing') {
    statusIcon = <AlertCircle className="h-8 w-8 text-yellow-600" />;
    statusColor = "bg-yellow-100";
    statusTitle = "Payment Processing";
    statusMessage = "Thank you for your order. Your payment is currently being processed. We'll begin making your plates once the payment is confirmed.";
  } else if (paymentStatus === 'failed') {
    statusIcon = <AlertCircle className="h-8 w-8 text-red-600" />;
    statusColor = "bg-red-100";
    statusTitle = "Payment Failed";
    statusMessage = "There was an issue processing your payment. Please try again or contact our customer service team for assistance.";
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="p-8 text-center space-y-6">
        <div className={`mx-auto ${statusColor} p-4 rounded-full w-16 h-16 flex items-center justify-center`}>
          {statusIcon}
        </div>
        
        <h1 className="text-3xl font-bold">{statusTitle}</h1>
        
        <p className="text-lg text-gray-600">
          {statusMessage}
        </p>
        
        {orderDetails && (
          <div className="border rounded-md p-4 my-8 text-left bg-gray-50">
            <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Registration:</span> {orderDetails.registrationText}</p>
              <p><span className="font-medium">Plate Type:</span> {orderDetails.plateType === 'both' 
                ? 'Front & Rear Set' 
                : `${orderDetails.plateType.charAt(0).toUpperCase()}${orderDetails.plateType.slice(1)} Only`}</p>
              <p><span className="font-medium">Size:</span> {orderDetails.plateSize}</p>
              <p><span className="font-medium">Style:</span> {orderDetails.textStyle}</p>
              <p><span className="font-medium">Road Legal:</span> {orderDetails.isRoadLegal ? 'Yes' : 'No - Show Plates Only'}</p>
              {orderDetails.customerName && <p><span className="font-medium">Customer:</span> {orderDetails.customerName}</p>}
              {orderDetails.customerEmail && <p><span className="font-medium">Email:</span> {orderDetails.customerEmail}</p>}
              {orderDetails.shippingAddress && <p><span className="font-medium">Shipping to:</span> {orderDetails.shippingAddress}</p>}
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          {paymentStatus !== 'failed' 
            ? "You will receive an email confirmation shortly. If you have any questions about your order, please contact our customer service team."
            : "If you continue to experience payment issues, please try a different payment method or contact our support team for assistance."}
        </p>
        
        <div className="pt-4 flex justify-center gap-4">
          <Button onClick={() => setLocation('/')}>
            Return to Homepage
          </Button>
          
          {paymentStatus === 'failed' && (
            <Button 
              variant="outline" 
              onClick={() => setLocation('/checkout')}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Try Payment Again
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}