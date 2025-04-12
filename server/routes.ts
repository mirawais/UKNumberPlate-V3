import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { auth, requireAuth, requireAdmin } from "./auth";
import Stripe from "stripe";
import { type SessionData } from "express-session";
import bodyParser from "body-parser";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// This is your Stripe webhook secret for testing your endpoint locally.
// In production, you should set this as an environment variable
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", auth.login);
  app.post("/api/auth/logout", auth.logout);
  app.get("/api/auth/check-admin", requireAdmin, (req, res) => {
    res.json({ isAdmin: true, username: req.user?.username });
  });

  // Plate Sizes
  app.get("/api/plate-sizes", async (req, res) => {
    try {
      const plateSizes = await storage.getPlateSizes();
      res.json(plateSizes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get plate sizes" });
    }
  });

  app.post("/api/plate-sizes", requireAdmin, async (req, res) => {
    try {
      const plateSize = await storage.createPlateSize(req.body);
      res.status(201).json(plateSize);
    } catch (error) {
      res.status(500).json({ message: "Failed to create plate size" });
    }
  });

  app.put("/api/plate-sizes/:id", requireAdmin, async (req, res) => {
    try {
      const plateSize = await storage.updatePlateSize(parseInt(req.params.id), req.body);
      if (!plateSize) {
        return res.status(404).json({ message: "Plate size not found" });
      }
      res.json(plateSize);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plate size" });
    }
  });

  app.delete("/api/plate-sizes/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deletePlateSize(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Plate size not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plate size" });
    }
  });

  // Text Styles
  app.get("/api/text-styles", async (req, res) => {
    try {
      const textStyles = await storage.getTextStyles();
      res.json(textStyles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get text styles" });
    }
  });

  app.post("/api/text-styles", requireAdmin, async (req, res) => {
    try {
      const textStyle = await storage.createTextStyle(req.body);
      res.status(201).json(textStyle);
    } catch (error) {
      res.status(500).json({ message: "Failed to create text style" });
    }
  });

  app.put("/api/text-styles/:id", requireAdmin, async (req, res) => {
    try {
      const textStyle = await storage.updateTextStyle(parseInt(req.params.id), req.body);
      if (!textStyle) {
        return res.status(404).json({ message: "Text style not found" });
      }
      res.json(textStyle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update text style" });
    }
  });

  app.delete("/api/text-styles/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTextStyle(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Text style not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete text style" });
    }
  });

  // Badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get badges" });
    }
  });

  app.post("/api/badges", requireAdmin, async (req, res) => {
    try {
      const badge = await storage.createBadge(req.body);
      res.status(201).json(badge);
    } catch (error) {
      res.status(500).json({ message: "Failed to create badge" });
    }
  });

  app.put("/api/badges/:id", requireAdmin, async (req, res) => {
    try {
      const badge = await storage.updateBadge(parseInt(req.params.id), req.body);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      res.json(badge);
    } catch (error) {
      res.status(500).json({ message: "Failed to update badge" });
    }
  });

  app.delete("/api/badges/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteBadge(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Badge not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete badge" });
    }
  });

  // Colors
  app.get("/api/colors", async (req, res) => {
    try {
      const colors = await storage.getColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to get colors" });
    }
  });

  app.post("/api/colors", requireAdmin, async (req, res) => {
    try {
      const color = await storage.createColor(req.body);
      res.status(201).json(color);
    } catch (error) {
      res.status(500).json({ message: "Failed to create color" });
    }
  });

  app.put("/api/colors/:id", requireAdmin, async (req, res) => {
    try {
      const color = await storage.updateColor(parseInt(req.params.id), req.body);
      if (!color) {
        return res.status(404).json({ message: "Color not found" });
      }
      res.json(color);
    } catch (error) {
      res.status(500).json({ message: "Failed to update color" });
    }
  });

  app.delete("/api/colors/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteColor(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Color not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete color" });
    }
  });

  // Car Brands
  app.get("/api/car-brands", async (req, res) => {
    try {
      const carBrands = await storage.getCarBrands();
      res.json(carBrands);
    } catch (error) {
      res.status(500).json({ message: "Failed to get car brands" });
    }
  });

  app.post("/api/car-brands", requireAdmin, async (req, res) => {
    try {
      const carBrand = await storage.createCarBrand(req.body);
      res.status(201).json(carBrand);
    } catch (error) {
      res.status(500).json({ message: "Failed to create car brand" });
    }
  });

  app.put("/api/car-brands/:id", requireAdmin, async (req, res) => {
    try {
      const carBrand = await storage.updateCarBrand(parseInt(req.params.id), req.body);
      if (!carBrand) {
        return res.status(404).json({ message: "Car brand not found" });
      }
      res.json(carBrand);
    } catch (error) {
      res.status(500).json({ message: "Failed to update car brand" });
    }
  });

  app.delete("/api/car-brands/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCarBrand(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Car brand not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete car brand" });
    }
  });

  // Pricing
  app.get("/api/pricing", async (req, res) => {
    try {
      const pricing = await storage.getPricing();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pricing" });
    }
  });

  app.put("/api/pricing/:id", requireAdmin, async (req, res) => {
    try {
      const pricing = await storage.updatePricing(parseInt(req.params.id), req.body);
      if (!pricing) {
        return res.status(404).json({ message: "Pricing not found" });
      }
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to update pricing" });
    }
  });

  // Payment Methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment methods" });
    }
  });

  app.post("/api/payment-methods", requireAdmin, async (req, res) => {
    try {
      const paymentMethod = await storage.createPaymentMethod(req.body);
      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  app.put("/api/payment-methods/:id", requireAdmin, async (req, res) => {
    try {
      const paymentMethod = await storage.updatePaymentMethod(parseInt(req.params.id), req.body);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      res.json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deletePaymentMethod(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  // Orders
  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get("/api/orders/pending", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrdersByStatus("pending");
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending orders" });
    }
  });

  app.get("/api/orders/stats/total", requireAdmin, async (req, res) => {
    try {
      const total = await storage.getTotalSales();
      res.json({ total });
    } catch (error) {
      res.status(500).json({ message: "Failed to get total sales" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(parseInt(req.params.id), status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Cart
  app.get("/api/cart/count", (req, res) => {
    // Get the cart count from the session or return 0
    const count = (req as any).session?.cart?.length || 0;
    res.json({ count });
  });
  
  // Order Management APIs
  
  // Create a new order
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.customerName || !orderData.customerEmail || 
          !orderData.plateDetails || !orderData.totalPrice) {
        return res.status(400).json({ 
          message: "Missing required order information" 
        });
      }
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating order", 
        error: error.message 
      });
    }
  });
  
  // Get all orders (admin only)
  app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching orders", 
        error: error.message 
      });
    }
  });
  
  // Get total sales (admin only)
  app.get('/api/orders/total-sales', requireAdmin, async (req, res) => {
    try {
      const total = await storage.getTotalSales();
      res.json({ total });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error calculating total sales", 
        error: error.message 
      });
    }
  });
  
  // Get orders by status (admin only)
  app.get('/api/orders/status/:status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.params;
      const orders = await storage.getOrdersByStatus(status);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching orders by status", 
        error: error.message 
      });
    }
  });
  
  // Get a single order by ID
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching order", 
        error: error.message 
      });
    }
  });
  
  // Update order status (admin only)
  app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(parseInt(id), status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating order status", 
        error: error.message 
      });
    }
  });
  
  // Update order (admin only)
  app.put('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No updates provided" });
      }
      
      const order = await storage.updateOrder(parseInt(id), updates);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating order", 
        error: error.message 
      });
    }
  });
  
  // Stripe payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }
      
      // Prepare metadata
      const metadata: { [key: string]: string | number | null } = {
        integration_check: "accept_a_payment"
      };
      
      // Add orderId to metadata if available
      if (orderId) {
        metadata.orderId = String(orderId);
      }
      
      // Create a payment intent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "gbp",
        payment_method_types: ["card"],
        metadata,
      });
      
      // If we have an order ID, update the order with the payment intent ID
      if (orderId) {
        try {
          const order = await storage.getOrder(parseInt(orderId));
          if (order) {
            // This isn't a full update, just an additional tracking field
            // We don't want to call updateOrderStatus as that would change the order status
            await storage.updateOrder(parseInt(orderId), {
              stripePaymentIntentId: paymentIntent.id
            });
          }
        } catch (orderError) {
          console.error("Failed to update order with payment intent ID:", orderError);
          // Continue despite this error - payment can still succeed
        }
      }
      
      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });
  
  // Stripe payment webhook to update order status
  app.post("/api/payment-complete", async (req, res) => {
    try {
      const { orderId, paymentIntentId } = req.body;
      
      if (!orderId || !paymentIntentId) {
        return res.status(400).json({ message: "Order ID and Payment Intent ID are required" });
      }
      
      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Get current order
      const existingOrder = await storage.getOrder(parseInt(orderId));
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Update order with payment status and payment intent ID
      let orderStatus = existingOrder.orderStatus;
      let paymentStatus = existingOrder.paymentStatus;
      
      // Update based on Stripe payment status
      if (paymentIntent.status === 'succeeded') {
        orderStatus = "processing"; // Order is now being processed
        paymentStatus = "paid";
      } else if (paymentIntent.status === 'processing') {
        orderStatus = "pending";
        paymentStatus = "processing";
      } else if (paymentIntent.status === 'requires_payment_method' || 
                 paymentIntent.status === 'requires_action') {
        orderStatus = "pending_payment";
        paymentStatus = "pending";
      } else if (paymentIntent.status === 'canceled') {
        orderStatus = "cancelled";
        paymentStatus = "failed";
      }
      
      // Update the order with new status and payment ID
      const order = await storage.updateOrder(parseInt(orderId), {
        orderStatus,
        paymentStatus,
        stripePaymentIntentId: paymentIntentId
      });
      
      return res.json({ 
        success: true, 
        order,
        paymentStatus: paymentIntent.status
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating order status", 
        error: error.message 
      });
    }
  });
  
  // Get Stripe configuration status (admin only)
  app.get("/api/stripe/config-status", requireAdmin, async (req, res) => {
    try {
      // Verify that Stripe is properly configured
      const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY;
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      // Check keys without exposing their full values
      const publicKeyStatus = stripePublicKey ? 
        { status: 'valid', prefix: stripePublicKey.substring(0, 7) } :
        { status: 'missing' };
        
      const secretKeyStatus = stripeSecretKey ? 
        { status: 'valid', prefix: stripeSecretKey.substring(0, 7) } :
        { status: 'missing' };
      
      // Test that we can connect to Stripe
      let connectionTest = 'pending';
      try {
        const balance = await stripe.balance.retrieve();
        connectionTest = balance ? 'success' : 'failed';
      } catch (error) {
        connectionTest = 'failed';
      }
      
      res.json({
        publicKeyStatus,
        secretKeyStatus,
        connectionTest,
        status: connectionTest === 'success' && 
                publicKeyStatus.status === 'valid' && 
                secretKeyStatus.status === 'valid' ? 
                'fully_configured' : 'configuration_issues'
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error checking Stripe configuration", 
        error: error.message 
      });
    }
  });
  
  // Get payment status of an order
  app.get("/api/order-payment-status/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      
      const order = await storage.getOrder(parseInt(orderId));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // If we have a payment intent ID, check the actual status from Stripe
      if (order.stripePaymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
          return res.json({
            orderStatus: order.orderStatus,
            paymentStatus: paymentIntent.status,
            orderId: order.id
          });
        } catch (stripeError) {
          // If we can't reach Stripe, just return the stored status
          console.error("Error fetching payment from Stripe:", stripeError);
        }
      }
      
      // Default response with stored status
      return res.json({
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        orderId: order.id
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error getting order payment status", 
        error: error.message 
      });
    }
  });
  
  // Stripe webhook handler for automatic payment status updates
  app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    // If no endpointSecret is configured, respond with a success but log the issue
    if (!endpointSecret) {
      console.warn('Warning: Stripe webhook secret not configured. Skipping signature verification.');
      // Process the event anyway but remember this is insecure
      try {
        const event = req.body;
        await handleStripeEvent(event);
        res.json({received: true});
      } catch (err: any) {
        console.error('Error handling webhook event:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
      return;
    }
    
    // Regular secure flow with signature verification
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }
    
    let event;
    
    try {
      const body = req.body;
      // Get raw body for signature verification
      event = stripe.webhooks.constructEvent(
        body, 
        sig, 
        endpointSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    try {
      await handleStripeEvent(event);
      res.json({received: true});
    } catch (err: any) {
      console.error('Error handling webhook event:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });
  
  // Helper function to handle Stripe webhook events
  async function handleStripeEvent(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        
        // Try to get the order ID from metadata
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          // Update order status to 'processing' and payment status to 'paid'
          await storage.updateOrder(parseInt(orderId), {
            orderStatus: 'processing',
            paymentStatus: 'paid',
            stripePaymentIntentId: paymentIntent.id
          });
          console.log(`Order ${orderId} updated to processing/paid status`);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log('Payment failed:', failedPaymentIntent.id);
        
        // Try to get the order ID from metadata
        const failedOrderId = failedPaymentIntent.metadata?.orderId;
        if (failedOrderId) {
          // Update order status to indicate payment failure
          await storage.updateOrder(parseInt(failedOrderId), {
            orderStatus: 'pending_payment',
            paymentStatus: 'failed',
            stripePaymentIntentId: failedPaymentIntent.id
          });
          console.log(`Order ${failedOrderId} marked as payment failed`);
        }
        break;
        
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  const httpServer = createServer(app);

  return httpServer;
}
