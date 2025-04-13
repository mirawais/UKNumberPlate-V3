import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import PaymentSummary from './PaymentSummary';
import SiteCustomizer from './SiteCustomizer';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import type { Order } from '@shared/schema';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<string>('orders');
  
  const { data: pendingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders/status/pending'],
  });
  
  const { data: totalSales } = useQuery<{total: number}>({
    queryKey: ['/api/orders/total-sales'],
  });
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-500 mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold">{pendingOrders?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-500 mb-1">Total Sales</h3>
            <p className="text-3xl font-bold">£{totalSales?.total?.toFixed(2) || '0.00'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-500 mb-1">Active Products</h3>
            <p className="text-3xl font-bold">6</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="payments">Payment Settings</TabsTrigger>
          <TabsTrigger value="products">Product Configuration</TabsTrigger>
          <TabsTrigger value="site">Site Customization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <OrderManager />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <PaymentSummary />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ProductManager />
        </TabsContent>
        
        <TabsContent value="site" className="mt-6">
          <SiteCustomizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
