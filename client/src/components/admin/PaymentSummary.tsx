import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StripeConfigStatus {
  publicKeyStatus: {
    status: 'valid' | 'missing';
    prefix?: string;
  };
  secretKeyStatus: {
    status: 'valid' | 'missing';
    prefix?: string;
  };
  connectionTest: 'success' | 'failed' | 'pending';
  status: 'fully_configured' | 'configuration_issues';
}

const PaymentSummary = () => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Query for payment/revenue data
  const { data: salesTotal, isLoading: isSalesTotalLoading } = useQuery<{ total: number }>({
    queryKey: ['/api/orders/total-sales'],
  });
  
  // Query for Stripe configuration status
  const { 
    data: stripeStatus, 
    isLoading: isStripeStatusLoading,
    isError: isStripeStatusError,
    refetch: refetchStripeStatus
  } = useQuery<StripeConfigStatus>({
    queryKey: ['/api/stripe/config-status'],
    // Only retry once since this is admin-protected
    retry: 1
  });
  
  const handleTestConnection = () => {
    refetchStripeStatus();
    toast({
      title: "Stripe Connection Test",
      description: "Testing connection to Stripe API..."
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Payment Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Summary</CardTitle>
            <CardDescription>Overview of sales and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {isSalesTotalLoading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Sales:</span>
                  <span className="text-2xl font-bold">£{salesTotal?.total ? salesTotal.total.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Stripe Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
            <CardDescription>Stripe payment gateway status</CardDescription>
          </CardHeader>
          <CardContent>
            {isStripeStatusLoading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : isStripeStatusError ? (
              <div className="text-center py-3">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500">Could not connect to Stripe</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={handleTestConnection}
                >
                  Test Connection
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {stripeStatus?.status === 'fully_configured' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {stripeStatus?.status === 'fully_configured' 
                      ? 'Stripe is properly configured' 
                      : 'Stripe configuration issues detected'}
                  </span>
                </div>
                
                {showDetails && (
                  <div className="pt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Public Key:</span>
                      <span className={stripeStatus?.publicKeyStatus.status === 'valid' ? 'text-green-600' : 'text-red-600'}>
                        {stripeStatus?.publicKeyStatus.status === 'valid' 
                          ? `Valid (${stripeStatus?.publicKeyStatus.prefix}...)` 
                          : 'Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secret Key:</span>
                      <span className={stripeStatus?.secretKeyStatus.status === 'valid' ? 'text-green-600' : 'text-red-600'}>
                        {stripeStatus?.secretKeyStatus.status === 'valid' 
                          ? `Valid (${stripeStatus?.secretKeyStatus.prefix}...)` 
                          : 'Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection Test:</span>
                      <span className={stripeStatus?.connectionTest === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {stripeStatus?.connectionTest === 'success' ? 'Successful' : 'Failed'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTestConnection}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSummary;