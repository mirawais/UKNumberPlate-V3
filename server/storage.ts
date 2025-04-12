import { 
  users, type User, type InsertUser, 
  plateSizes, type PlateSize, type InsertPlateSize,
  textStyles, type TextStyle, type InsertTextStyle,
  badges, type Badge, type InsertBadge,
  colors, type Color, type InsertColor,
  carBrands, type CarBrand, type InsertCarBrand,
  pricing, type Pricing, type InsertPricing,
  paymentMethods, type PaymentMethod, type InsertPaymentMethod,
  orders, type Order, type InsertOrder
} from "@shared/schema";
import { mockData } from "./mockData";
import bcrypt from "bcryptjs";

// Interface for all storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Plate Sizes
  getPlateSizes(): Promise<PlateSize[]>;
  getPlateSize(id: number): Promise<PlateSize | undefined>;
  createPlateSize(size: InsertPlateSize): Promise<PlateSize>;
  updatePlateSize(id: number, size: Partial<PlateSize>): Promise<PlateSize | undefined>;
  deletePlateSize(id: number): Promise<boolean>;
  
  // Text Styles
  getTextStyles(): Promise<TextStyle[]>;
  getTextStyle(id: number): Promise<TextStyle | undefined>;
  createTextStyle(style: InsertTextStyle): Promise<TextStyle>;
  updateTextStyle(id: number, style: Partial<TextStyle>): Promise<TextStyle | undefined>;
  deleteTextStyle(id: number): Promise<boolean>;
  
  // Badges
  getBadges(): Promise<Badge[]>;
  getBadge(id: number): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  updateBadge(id: number, badge: Partial<Badge>): Promise<Badge | undefined>;
  deleteBadge(id: number): Promise<boolean>;
  
  // Colors
  getColors(): Promise<Color[]>;
  getColor(id: number): Promise<Color | undefined>;
  createColor(color: InsertColor): Promise<Color>;
  updateColor(id: number, color: Partial<Color>): Promise<Color | undefined>;
  deleteColor(id: number): Promise<boolean>;
  
  // Car Brands
  getCarBrands(): Promise<CarBrand[]>;
  getCarBrand(id: number): Promise<CarBrand | undefined>;
  createCarBrand(brand: InsertCarBrand): Promise<CarBrand>;
  updateCarBrand(id: number, brand: Partial<CarBrand>): Promise<CarBrand | undefined>;
  deleteCarBrand(id: number): Promise<boolean>;
  
  // Pricing
  getPricing(): Promise<Pricing>;
  updatePricing(id: number, price: Partial<Pricing>): Promise<Pricing | undefined>;
  
  // Payment Methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getTotalSales(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plateSizesMap: Map<number, PlateSize>;
  private textStylesMap: Map<number, TextStyle>;
  private badgesMap: Map<number, Badge>;
  private colorsMap: Map<number, Color>;
  private carBrandsMap: Map<number, CarBrand>;
  private pricingMap: Map<number, Pricing>;
  private paymentMethodsMap: Map<number, PaymentMethod>;
  private ordersMap: Map<number, Order>;
  
  // Auto-increment IDs
  private userIdCounter: number;
  private plateSizeIdCounter: number;
  private textStyleIdCounter: number;
  private badgeIdCounter: number;
  private colorIdCounter: number;
  private carBrandIdCounter: number;
  private pricingIdCounter: number;
  private paymentMethodIdCounter: number;
  private orderIdCounter: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.plateSizesMap = new Map();
    this.textStylesMap = new Map();
    this.badgesMap = new Map();
    this.colorsMap = new Map();
    this.carBrandsMap = new Map();
    this.pricingMap = new Map();
    this.paymentMethodsMap = new Map();
    this.ordersMap = new Map();
    
    // Initialize counters
    this.userIdCounter = 1;
    this.plateSizeIdCounter = 1;
    this.textStyleIdCounter = 1;
    this.badgeIdCounter = 1;
    this.colorIdCounter = 1;
    this.carBrandIdCounter = 1;
    this.pricingIdCounter = 1;
    this.paymentMethodIdCounter = 1;
    this.orderIdCounter = 1;
    
    // Initialize with mock data
    this.initializeData();
  }

  private async initializeData() {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    this.createUser({
      username: "admin",
      password: adminPassword,
      isAdmin: true
    });
    
    // Initialize with mock data
    mockData.plateSizes.forEach(size => this.createPlateSize(size));
    mockData.textStyles.forEach(style => this.createTextStyle(style));
    mockData.badges.forEach(badge => this.createBadge(badge));
    mockData.colors.forEach(color => this.createColor(color));
    mockData.carBrands.forEach(brand => this.createCarBrand(brand));
    mockData.paymentMethods.forEach(method => this.createPaymentMethod(method));
    
    // Initial pricing
    this.pricingMap.set(1, {
      id: 1,
      frontPlatePrice: "15",
      rearPlatePrice: "15",
      bothPlatesDiscount: "5",
      taxRate: "20"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure isAdmin is always defined 
    const newUser: User = { 
      ...user, 
      id, 
      isAdmin: user.isAdmin === undefined ? false : user.isAdmin
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Plate Size methods
  async getPlateSizes(): Promise<PlateSize[]> {
    return Array.from(this.plateSizesMap.values());
  }

  async getPlateSize(id: number): Promise<PlateSize | undefined> {
    return this.plateSizesMap.get(id);
  }

  async createPlateSize(size: InsertPlateSize): Promise<PlateSize> {
    const id = this.plateSizeIdCounter++;
    const newSize: PlateSize = { 
      ...size, 
      id, 
      isActive: size.isActive === undefined ? true : size.isActive 
    };
    this.plateSizesMap.set(id, newSize);
    return newSize;
  }

  async updatePlateSize(id: number, size: Partial<PlateSize>): Promise<PlateSize | undefined> {
    const existingSize = this.plateSizesMap.get(id);
    if (!existingSize) return undefined;
    
    const updatedSize: PlateSize = { ...existingSize, ...size };
    this.plateSizesMap.set(id, updatedSize);
    return updatedSize;
  }

  async deletePlateSize(id: number): Promise<boolean> {
    return this.plateSizesMap.delete(id);
  }

  // Text Style methods
  async getTextStyles(): Promise<TextStyle[]> {
    return Array.from(this.textStylesMap.values());
  }

  async getTextStyle(id: number): Promise<TextStyle | undefined> {
    return this.textStylesMap.get(id);
  }

  async createTextStyle(style: InsertTextStyle): Promise<TextStyle> {
    const id = this.textStyleIdCounter++;
    const newStyle: TextStyle = { 
      ...style, 
      id,
      isActive: style.isActive === undefined ? true : style.isActive,
      imagePath: style.imagePath === undefined ? null : style.imagePath
    };
    this.textStylesMap.set(id, newStyle);
    return newStyle;
  }

  async updateTextStyle(id: number, style: Partial<TextStyle>): Promise<TextStyle | undefined> {
    const existingStyle = this.textStylesMap.get(id);
    if (!existingStyle) return undefined;
    
    const updatedStyle: TextStyle = { ...existingStyle, ...style };
    this.textStylesMap.set(id, updatedStyle);
    return updatedStyle;
  }

  async deleteTextStyle(id: number): Promise<boolean> {
    return this.textStylesMap.delete(id);
  }

  // Badge methods
  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badgesMap.values());
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badgesMap.get(id);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const newBadge: Badge = { 
      ...badge, 
      id,
      isActive: badge.isActive === undefined ? true : badge.isActive
    };
    this.badgesMap.set(id, newBadge);
    return newBadge;
  }

  async updateBadge(id: number, badge: Partial<Badge>): Promise<Badge | undefined> {
    const existingBadge = this.badgesMap.get(id);
    if (!existingBadge) return undefined;
    
    const updatedBadge: Badge = { ...existingBadge, ...badge };
    this.badgesMap.set(id, updatedBadge);
    return updatedBadge;
  }

  async deleteBadge(id: number): Promise<boolean> {
    return this.badgesMap.delete(id);
  }

  // Color methods
  async getColors(): Promise<Color[]> {
    return Array.from(this.colorsMap.values());
  }

  async getColor(id: number): Promise<Color | undefined> {
    return this.colorsMap.get(id);
  }

  async createColor(color: InsertColor): Promise<Color> {
    const id = this.colorIdCounter++;
    const newColor: Color = { 
      ...color, 
      id,
      isActive: color.isActive === undefined ? true : color.isActive
    };
    this.colorsMap.set(id, newColor);
    return newColor;
  }

  async updateColor(id: number, color: Partial<Color>): Promise<Color | undefined> {
    const existingColor = this.colorsMap.get(id);
    if (!existingColor) return undefined;
    
    const updatedColor: Color = { ...existingColor, ...color };
    this.colorsMap.set(id, updatedColor);
    return updatedColor;
  }

  async deleteColor(id: number): Promise<boolean> {
    return this.colorsMap.delete(id);
  }

  // Car Brand methods
  async getCarBrands(): Promise<CarBrand[]> {
    return Array.from(this.carBrandsMap.values());
  }

  async getCarBrand(id: number): Promise<CarBrand | undefined> {
    return this.carBrandsMap.get(id);
  }

  async createCarBrand(brand: InsertCarBrand): Promise<CarBrand> {
    const id = this.carBrandIdCounter++;
    const newBrand: CarBrand = { 
      ...brand, 
      id,
      isActive: brand.isActive === undefined ? true : brand.isActive
    };
    this.carBrandsMap.set(id, newBrand);
    return newBrand;
  }

  async updateCarBrand(id: number, brand: Partial<CarBrand>): Promise<CarBrand | undefined> {
    const existingBrand = this.carBrandsMap.get(id);
    if (!existingBrand) return undefined;
    
    const updatedBrand: CarBrand = { ...existingBrand, ...brand };
    this.carBrandsMap.set(id, updatedBrand);
    return updatedBrand;
  }

  async deleteCarBrand(id: number): Promise<boolean> {
    return this.carBrandsMap.delete(id);
  }

  // Pricing methods
  async getPricing(): Promise<Pricing> {
    return this.pricingMap.get(1) as Pricing;
  }

  async updatePricing(id: number, price: Partial<Pricing>): Promise<Pricing | undefined> {
    const existingPricing = this.pricingMap.get(id);
    if (!existingPricing) return undefined;
    
    const updatedPricing: Pricing = { ...existingPricing, ...price };
    this.pricingMap.set(id, updatedPricing);
    return updatedPricing;
  }

  // Payment Method methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethodsMap.values());
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethodsMap.get(id);
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.paymentMethodIdCounter++;
    const newMethod: PaymentMethod = { 
      ...method, 
      id,
      isActive: method.isActive === undefined ? true : method.isActive 
    };
    this.paymentMethodsMap.set(id, newMethod);
    return newMethod;
  }

  async updatePaymentMethod(id: number, method: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const existingMethod = this.paymentMethodsMap.get(id);
    if (!existingMethod) return undefined;
    
    const updatedMethod: PaymentMethod = { ...existingMethod, ...method };
    this.paymentMethodsMap.set(id, updatedMethod);
    return updatedMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethodsMap.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.ordersMap.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersMap.get(id);
  }
  
  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.ordersMap.values()).filter(
      (order) => order.orderStatus === status
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date(),
      stripePaymentIntentId: null,
      // Ensure these required fields have defaults if not provided
      paymentStatus: order.paymentStatus || 'pending',
      orderStatus: order.orderStatus || 'pending'
    };
    this.ordersMap.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.ordersMap.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder: Order = { ...existingOrder, orderStatus: status };
    this.ordersMap.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const existingOrder = this.ordersMap.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder: Order = { ...existingOrder, ...updates };
    this.ordersMap.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getTotalSales(): Promise<number> {
    return Array.from(this.ordersMap.values())
      .reduce((total, order) => total + Number(order.totalPrice), 0);
  }
}

export const storage = new MemStorage();
