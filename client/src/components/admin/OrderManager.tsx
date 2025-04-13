import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { EyeIcon, SearchIcon, DownloadIcon } from 'lucide-react';
import type { Order, PlateCustomization, PlateSize, TextStyle, Color, Badge as BadgeType, CarBrand } from '@shared/schema';

const OrderManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order & { plateDetails: PlateCustomization } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  
  // Query for orders and reference data
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'], 
  });
  
  // Fetch plate sizes for name lookups
  const { data: plateSizes } = useQuery<PlateSize[]>({
    queryKey: ['/api/plate-sizes'],
  });
  
  // Fetch text styles for name lookups
  const { data: textStyles } = useQuery<TextStyle[]>({
    queryKey: ['/api/text-styles'],
  });
  
  // Fetch badges for name lookups
  const { data: badges } = useQuery<BadgeType[]>({
    queryKey: ['/api/badges'],
  });
  
  // Fetch colors for name lookups
  const { data: colors } = useQuery<Color[]>({
    queryKey: ['/api/colors'],
  });
  
  // Fetch car brands for name lookups
  const { data: carBrands } = useQuery<CarBrand[]>({
    queryKey: ['/api/car-brands'],
  });
  
  // Fetch colors for name lookups
  const { data: colors } = useQuery<Color[]>({
    queryKey: ['/api/colors'],
  });
  
  // Filtered orders based on status and search query
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    if (orders) {
      let filtered = [...orders];
      
      // Filter by status
      if (filterStatus !== 'all') {
        filtered = filtered.filter(order => order.orderStatus === filterStatus);
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(order => 
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.id.toString().includes(query)
        );
      }
      
      setFilteredOrders(filtered);
    }
  }, [orders, filterStatus, searchQuery]);
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) => 
      apiRequest('PUT', `/api/orders/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: "Success", description: "Order status updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update order status", 
        variant: "destructive" 
      });
    }
  });
  
  // Update order payment status mutation
  const updateOrderPaymentStatusMutation = useMutation({
    mutationFn: (data: { id: number; paymentStatus: string }) => 
      apiRequest('PUT', `/api/orders/${data.id}`, { paymentStatus: data.paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: "Success", description: "Payment status updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update payment status", 
        variant: "destructive" 
      });
    }
  });
  
  // Handler for viewing order details
  const handleViewOrder = (order: Order) => {
    // Cast the order to include PlateCustomization to satisfy TS
    setSelectedOrder(order as Order & { plateDetails: PlateCustomization });
    setIsViewModalOpen(true);
  };
  
  // Handler for updating order status
  const handleStatusChange = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };
  
  // Function to render status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Handler for updating payment status
  const handlePaymentStatusChange = (id: number, paymentStatus: string) => {
    updateOrderPaymentStatusMutation.mutate({ id, paymentStatus });
  };
  
  // Function to format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };
  
  // Function to handle invoice download
  const handleDownloadInvoice = (order: Order & { plateDetails: PlateCustomization }) => {
    try {
      // Create invoice content
      const invoiceContent = `
INVOICE
======================================
Order #${order.id}
Date: ${formatDate(order.createdAt)}
--------------------------------------

CUSTOMER INFORMATION:
${order.customerName}
${order.customerEmail}
${order.customerPhone}
${order.shippingAddress}

ORDER DETAILS:
Registration: ${order.plateDetails.registrationText}
Type: ${order.plateDetails.plateType === 'both' 
        ? 'Front & Rear' 
        : order.plateDetails.plateType === 'front' 
          ? 'Front Only' 
          : 'Rear Only'}
Road Legal: ${order.plateDetails.isRoadLegal ? 'Yes' : 'No (Show Plate)'}
Size: ${getPlateSizeName(order.plateDetails.plateSize)}
Style: ${getTextStyleName(order.plateDetails.textStyle)}
${order.plateDetails.badge ? `Badge: ${getBadgeName(order.plateDetails.badge)}` : ''}
${order.plateDetails.textColor ? `Text Color: ${getColorName(order.plateDetails.textColor)}` : ''}
${order.plateDetails.borderColor ? `Border: ${getColorName(order.plateDetails.borderColor)}` : ''}
${order.plateDetails.carBrand ? `Car Brand: ${getCarBrandName(order.plateDetails.carBrand)}` : ''}

PAYMENT INFORMATION:
Method: ${order.paymentMethod}
Status: ${order.paymentStatus}
TOTAL: £${Number(order.totalPrice).toFixed(2)}

Thank you for your order!
      `;
      
      // Create blob and download link
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-order-${order.id}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully."
      });
    } catch (error) {
      console.error('Invoice download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate invoice. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper functions to get human-readable names from IDs
  const getPlateSizeName = (id: string | number) => {
    if (!plateSizes) return id;
    const plateSize = plateSizes.find(size => size.id.toString() === id.toString());
    return plateSize ? plateSize.name : id;
  };
  
  const getTextStyleName = (id: string | number) => {
    if (!textStyles) return id;
    const textStyle = textStyles.find(style => style.id.toString() === id.toString());
    return textStyle ? textStyle.name : id;
  };
  
  const getBadgeName = (id: string | number) => {
    if (!badges) return id;
    const badge = badges.find(b => b.id.toString() === id.toString());
    return badge ? badge.name : id;
  };
  
  const getColorName = (id: string | number) => {
    if (!colors) return id;
    const color = colors.find(c => c.id.toString() === id.toString());
    return color ? color.name : id;
  };
  
  const getCarBrandName = (id: string | number) => {
    if (!carBrands) return id;
    const brand = carBrands.find(b => b.id.toString() === id.toString());
    return brand ? brand.name : id;
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Order Management</h2>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <Label htmlFor="statusFilter" className="mb-1 block">Status</Label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger id="statusFilter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="relative w-full md:w-auto">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email or order ID"
            className="pl-10 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading orders...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No orders found</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>£{Number(order.totalPrice).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOrder(order)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2">Customer Information</h3>
                <Card>
                  <CardContent className="p-4">
                    <p><span className="font-semibold">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-semibold">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="font-semibold">Phone:</span> {selectedOrder.customerPhone}</p>
                    <p><span className="font-semibold">Address:</span> {selectedOrder.shippingAddress}</p>
                  </CardContent>
                </Card>
                
                <h3 className="font-bold mt-4 mb-2">Order Status</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label htmlFor="orderStatus">Order Status</Label>
                        <Select
                          defaultValue={selectedOrder.orderStatus}
                          onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                        >
                          <SelectTrigger id="orderStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="paymentStatus">Payment Status</Label>
                        <Select
                          defaultValue={selectedOrder.paymentStatus}
                          onValueChange={(value) => handlePaymentStatusChange(selectedOrder.id, value)}
                        >
                          <SelectTrigger id="paymentStatus">
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Order Details</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <p><span className="font-semibold">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                      <p><span className="font-semibold">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                      <p><span className="font-semibold">Total Amount:</span> £{Number(selectedOrder.totalPrice).toFixed(2)}</p>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => handleDownloadInvoice(selectedOrder)}
                        >
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          Download Invoice
                        </Button>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mt-4 mb-2">Plate Details</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      {selectedOrder.plateDetails ? (
                        <>
                          <p><span className="font-semibold">Registration:</span> {selectedOrder.plateDetails.registrationText}</p>
                          <p><span className="font-semibold">Type:</span> {
                            selectedOrder.plateDetails.plateType === 'both' 
                              ? 'Front & Rear' 
                              : selectedOrder.plateDetails.plateType === 'front' 
                                ? 'Front Only' 
                                : 'Rear Only'
                          }</p>
                          <p><span className="font-semibold">Road Legal:</span> {
                            selectedOrder.plateDetails.isRoadLegal ? 'Yes' : 'No (Show Plate)'
                          }</p>
                          <p><span className="font-semibold">Size:</span> {getPlateSizeName(selectedOrder.plateDetails.plateSize)}</p>
                          <p><span className="font-semibold">Style:</span> {getTextStyleName(selectedOrder.plateDetails.textStyle)}</p>
                          
                          {selectedOrder.plateDetails.badge && (
                            <p><span className="font-semibold">Badge:</span> {
                              selectedOrder.plateDetails.badge === 'gb' ? 'GB' : getBadgeName(selectedOrder.plateDetails.badge)
                            }</p>
                          )}
                          
                          {selectedOrder.plateDetails.textColor && (
                            <p><span className="font-semibold">Text Color:</span> {getColorName(selectedOrder.plateDetails.textColor)}</p>
                          )}
                          
                          {selectedOrder.plateDetails.borderColor && (
                            <p><span className="font-semibold">Border Color:</span> {getColorName(selectedOrder.plateDetails.borderColor)}</p>
                          )}
                          
                          {selectedOrder.plateDetails.carBrand && (
                            <p><span className="font-semibold">Car Brand:</span> {getCarBrandName(selectedOrder.plateDetails.carBrand)}</p>
                          )}
                          
                          {/* Document information */}
                          {selectedOrder.plateDetails.isRoadLegal && selectedOrder.documentFileId && (
                            <div className="mt-2 border-t pt-2">
                              <p className="font-semibold">Uploaded Document:</p>
                              <div className="bg-green-50 p-2 mt-1 rounded-md text-sm flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Document ID: {selectedOrder.documentFileId}</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => window.open(`/api/uploads/${selectedOrder.documentFileId}`, '_blank')}
                              >
                                View Document
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No plate details available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrderManager;
