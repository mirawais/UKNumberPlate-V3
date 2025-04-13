import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ProductManager from './ProductManager';
import OrdersManager from './OrdersManager';
import SiteCustomizer from './SiteCustomizer';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your number plate products, orders, and site settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="site">Site Customization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardContent className="pt-6">
              <ProductManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              <OrdersManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="site">
          <Card>
            <CardContent className="pt-6">
              <SiteCustomizer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}