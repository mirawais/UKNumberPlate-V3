import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MoreHorizontal, Search, FileText, Download, Trash2, Eye } from 'lucide-react';

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  plateDetails: any;
  totalPrice: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: Date;
  updatedAt: Date;
  stripePaymentIntentId: string | null;
  documentFileId: string | null;
  notes: string | null;
}

// Status badge styling helper
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    "pending": "bg-yellow-100 text-yellow-800",
    "processing": "bg-blue-100 text-blue-800",
    "completed": "bg-green-100 text-green-800",
    "shipped": "bg-purple-100 text-purple-800",
    "cancelled": "bg-red-100 text-red-800",
    "paid": "bg-green-100 text-green-800",
    "failed": "bg-red-100 text-red-800",
    "refunded": "bg-gray-100 text-gray-800",
  };
  
  return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
};

// Format date helper
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format currency helper
const formatCurrency = (amount: string | number) => {
  return `£${parseFloat(amount.toString()).toFixed(2)}`;
};

export default function OrdersManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Fetch orders
  const { data: orders, isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  
  // Fetch total sales
  const { data: salesData } = useQuery<{ total: string }>({
    queryKey: ['/api/orders/total-sales'],
  });

  // Fetch reference data for name lookups
  const { data: plateSizes } = useQuery({
    queryKey: ['/api/plate-sizes'],
  });
  
  const { data: textStyles } = useQuery({
    queryKey: ['/api/text-styles'],
  });
  
  const { data: badges } = useQuery({
    queryKey: ['/api/badges'],
  });

  const { data: colors } = useQuery({
    queryKey: ['/api/colors'],
  });

  const { data: carBrands } = useQuery({
    queryKey: ['/api/car-brands'],
  });

  // Helper functions to get names by ID
  const getPlateSizeName = (id: number) => {
    return plateSizes?.find((size: any) => size.id === id)?.name || `Size #${id}`;
  };

  const getTextStyleName = (id: number) => {
    return textStyles?.find((style: any) => style.id === id)?.name || `Style #${id}`;
  };

  const getBadgeName = (id: number) => {
    return badges?.find((badge: any) => badge.id === id)?.name || `Badge #${id}`;
  };

  const getColorName = (id: number) => {
    return colors?.find((color: any) => color.id === id)?.name || `Color #${id}`;
  };

  const getCarBrandName = (id: number) => {
    return carBrands?.find((brand: any) => brand.id === id)?.name || `Brand #${id}`;
  };
  
  // Filtered orders based on status and search
  const filteredOrders = orders?.filter(order => {
    // Filter by tab/status
    if (selectedTab !== 'all' && order.orderStatus.toLowerCase() !== selectedTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.id.toString().includes(query)
      );
    }
    
    return true;
  }) || [];
  
  // Order status update mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PUT', `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Order Updated',
        description: 'Order status has been updated successfully',
      });
      setStatusDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle order status change
  const handleStatusChange = (status: string) => {
    if (!selectedOrder) return;
    
    updateOrderStatusMutation.mutate({
      id: selectedOrder.id,
      status,
    });
  };

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: number) => 
      apiRequest('DELETE', `/api/orders/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/total-sales'] });
      toast({
        title: "Order Deleted",
        description: "Order has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete order.",
        variant: "destructive"
      });
    }
  });

  // Handle order deletion
  const handleDeleteOrder = (orderId: number) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteOrderMutation.mutate(orderId);
    }
  };
  
  // Parse plateDetails for selected order
  const parsedPlateDetails = useMemo(() => {
    if (!selectedOrder || !selectedOrder.plateDetails) return null;
    
    try {
      if (typeof selectedOrder.plateDetails === 'string') {
        return JSON.parse(selectedOrder.plateDetails);
      }
      return selectedOrder.plateDetails;
    } catch (error) {
      console.error('Error parsing plate details:', error);
      return null;
    }
  }, [selectedOrder]);
  
  // Order counts by status
  const orderCounts = orders?.reduce((acc: Record<string, number>, order) => {
    const status = order.orderStatus.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  if (loadingOrders) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-muted-foreground">
            Track and manage customer orders
          </p>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold">{orderCounts?.pending || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Processing Orders</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold">{orderCounts?.processing || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold">{formatCurrency(salesData?.total || 0)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Search */}
      <div className="flex justify-between items-center space-x-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email or order ID..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tabs for order status */}
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Orders Table */}
      <Table>
        <TableCaption>A list of your recent orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                          title="View Order"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Order #{order?.id}</DialogTitle>
                        <DialogDescription>
                          Placed on {order && formatDate(order.createdAt)}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">Customer Information</h3>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <Label className="text-muted-foreground">Name</Label>
                                  <div>{selectedOrder.customerName}</div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Email</Label>
                                  <div>{selectedOrder.customerEmail}</div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Phone</Label>
                                  <div>{selectedOrder.customerPhone}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">Shipping Information</h3>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <Label className="text-muted-foreground">Shipping Method</Label>
                                  <div className="font-medium">
                                    {parsedPlateDetails?.shippingMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                                    {parsedPlateDetails?.shippingMethod === 'delivery' && parsedPlateDetails?.deliveryFee && 
                                      ` (+£${parseFloat(parsedPlateDetails.deliveryFee).toFixed(2)})`
                                    }
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Label className="text-muted-foreground">Address</Label>
                                <div className="whitespace-pre-line">
                                  {selectedOrder.shippingAddress}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">Payment Information</h3>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <Label className="text-muted-foreground">Method</Label>
                                  <div>{selectedOrder.paymentMethod}</div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Status</Label>
                                  <div>
                                    <Badge className={`${getStatusColor(selectedOrder.paymentStatus)}`}>
                                      {selectedOrder.paymentStatus}
                                    </Badge>
                                  </div>
                                </div>
                                {selectedOrder.stripePaymentIntentId && (
                                  <div className="col-span-2">
                                    <Label className="text-muted-foreground">Stripe Payment ID</Label>
                                    <div className="text-sm font-mono">
                                      {selectedOrder.stripePaymentIntentId}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {selectedOrder.documentFileId && (
                              <div>
                                <h3 className="font-semibold text-lg">Documents</h3>
                                <div className="mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/api/uploads/${selectedOrder.documentFileId}`, '_blank')}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Document
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">Order Details</h3>
                              <div className="mt-2 space-y-2">
                                <div className="border rounded-md p-3">
                                  <div className="font-medium text-lg mb-2">
                                    {parsedPlateDetails?.registrationText || parsedPlateDetails?.plateText || parsedPlateDetails?.registrationNumber || "Custom Plate"}
                                  </div>
                                  
                                  <div className="bg-muted/30 p-2 rounded-md mb-3">
                                    <div className="text-sm font-medium mb-1">Plate Category:</div>
                                    <div className="text-sm">
                                      {parsedPlateDetails?.isRoadLegal || parsedPlateDetails?.plateType === 'road-legal' ? 'Road Legal Plate' : 'Show Plate'}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/30 p-2 rounded-md">
                                      <div className="text-sm font-medium mb-1">Plate Details:</div>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        <div>Size: {typeof parsedPlateDetails?.plateSize === 'number' ? getPlateSizeName(parsedPlateDetails.plateSize) : parsedPlateDetails?.plateSize || parsedPlateDetails?.size || "Standard"}</div>
                                        <div>Style: {typeof parsedPlateDetails?.textStyle === 'number' ? getTextStyleName(parsedPlateDetails.textStyle) : parsedPlateDetails?.textStyle || parsedPlateDetails?.style || "Standard"}</div>
                                        <div>Material: {parsedPlateDetails?.material || "Standard"}</div>
                                        <div>Layout: {parsedPlateDetails?.layout || "Standard"}</div>
                                        {parsedPlateDetails?.plateType && (
                                          <div>Position: {parsedPlateDetails.plateType}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-muted/30 p-2 rounded-md">
                                      <div className="text-sm font-medium mb-1">Customization:</div>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        {parsedPlateDetails?.badge && parsedPlateDetails.badge !== "none" && (
                                          <div>Badge: {typeof parsedPlateDetails.badge === 'number' ? getBadgeName(parsedPlateDetails.badge) : parsedPlateDetails.badge === 'gb' ? 'GB' : parsedPlateDetails.badge}</div>
                                        )}
                                        {parsedPlateDetails?.borderColor && parsedPlateDetails.borderColor !== "none" && (
                                          <div>Border Color: {typeof parsedPlateDetails.borderColor === 'number' ? getColorName(parsedPlateDetails.borderColor) : parsedPlateDetails.borderColor}</div>
                                        )}
                                        {parsedPlateDetails?.border && parsedPlateDetails.border !== "none" && (
                                          <div>Border Style: {parsedPlateDetails.border}</div>
                                        )}
                                        {parsedPlateDetails?.textColor && parsedPlateDetails.textColor !== "none" && (
                                          <div>Text Color: {typeof parsedPlateDetails.textColor === 'number' ? getColorName(parsedPlateDetails.textColor) : parsedPlateDetails.textColor}</div>
                                        )}
                                        {parsedPlateDetails?.backgroundType && parsedPlateDetails.backgroundType !== "none" && (
                                          <div>Background: {parsedPlateDetails.backgroundType}</div>
                                        )}
                                        {parsedPlateDetails?.carBrand && parsedPlateDetails.carBrand !== "none" && (
                                          <div>Car Brand: {typeof parsedPlateDetails.carBrand === 'number' ? getCarBrandName(parsedPlateDetails.carBrand) : parsedPlateDetails.carBrand}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {parsedPlateDetails?.specialInstructions && (
                                    <div className="mt-3 bg-muted/30 p-2 rounded-md">
                                      <div className="text-sm font-medium mb-1">Special Instructions:</div>
                                      <div className="text-sm text-muted-foreground">
                                        {parsedPlateDetails.specialInstructions}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">Order Summary</h3>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Shipping</span>
                                  <span>{selectedOrder.deliveryFee ? `£${parseFloat(selectedOrder.deliveryFee).toFixed(2)}` : '£0.00'}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">Order Status</h3>
                              <div className="mt-2 space-y-3">
                                <div className="flex justify-between items-center">
                                  <Badge className={`${getStatusColor(selectedOrder.orderStatus)}`}>
                                    {selectedOrder.orderStatus}
                                  </Badge>
                                  <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button size="sm">Change Status</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Update Order Status</DialogTitle>
                                        <DialogDescription>
                                          Change the status for order #{selectedOrder.id}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <Select
                                        onValueChange={handleStatusChange}
                                        defaultValue={selectedOrder.orderStatus.toLowerCase()}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="processing">Processing</SelectItem>
                                          <SelectItem value="shipped">Shipped</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setStatusDialogOpen(false)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          type="submit"
                                          onClick={() => handleStatusChange(
                                            document.querySelector<HTMLSelectElement>('.select-value')?.value || 
                                            selectedOrder.orderStatus.toLowerCase()
                                          )}
                                          disabled={updateOrderStatusMutation.isPending}
                                        >
                                          {updateOrderStatusMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          )}
                                          Save Changes
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                                {selectedOrder.notes && (
                                  <div>
                                    <Label className="text-muted-foreground">Notes</Label>
                                    <div className="text-sm mt-1">{selectedOrder.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Generate a simple invoice with order details
                            const invoiceContent = `
                              NUMBER PLATE ORDER INVOICE
                              --------------------------
                              
                              Invoice #: INV-${selectedOrder.id}
                              Date: ${new Date(selectedOrder.orderDate).toLocaleDateString()}
                              Order #: ${selectedOrder.id}
                              Status: ${selectedOrder.orderStatus}
                              
                              CUSTOMER INFORMATION
                              -------------------
                              Name: ${selectedOrder.customerName}
                              Email: ${selectedOrder.customerEmail}
                              
                              ORDER DETAILS
                              ------------
                              Registration: ${parsedPlateDetails?.registrationText || parsedPlateDetails?.plateText || parsedPlateDetails?.registrationNumber || "Custom Plate"}
                              Plate Type: ${parsedPlateDetails?.isRoadLegal || parsedPlateDetails?.plateType === 'road-legal' ? 'Road Legal Plate' : 'Show Plate'}
                              Plate Position: ${parsedPlateDetails?.plateType || "Both"}
                              
                              PAYMENT DETAILS
                              --------------
                              Amount: ${formatCurrency(selectedOrder.totalPrice)}
                              
                              Thank you for your order!
                            `;
                            
                            // Create a Blob and download it
                            const blob = new Blob([invoiceContent], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `invoice-order-${selectedOrder.id}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Cancel Order</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel the order and cannot be undone. This action does not
                                issue a refund automatically.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, go back</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  handleStatusChange('cancelled');
                                  setStatusDialogOpen(false);
                                }}
                              >
                                Yes, cancel order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    title="Delete Order"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}