
import { 
  plateSizes, textStyles, badges, colors, carBrands, pricing, paymentMethods,
  orders, uploadedFiles, navigationItems, contentBlocks, siteConfigs, users
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { mockData } from './mockData';
import bcrypt from 'bcrypt';
import type {
  PlateSize, InsertPlateSize, TextStyle, InsertTextStyle, Badge, InsertBadge,
  Color, InsertColor, CarBrand, InsertCarBrand, Pricing, InsertPricing,
  PaymentMethod, InsertPaymentMethod, Order, InsertOrder, UploadedFile, InsertUploadedFile,
  NavigationItem, InsertNavigationItem, ContentBlock, InsertContentBlock,
  SiteConfig, InsertSiteConfig, User
} from '@shared/schema';

export function createNeonStorage() {
  return {
    // Plate Sizes
    async getPlateSizes(): Promise<PlateSize[]> {
      return await db.select().from(plateSizes).where(eq(plateSizes.isActive, true));
    },

    async getPlateSize(id: number): Promise<PlateSize | undefined> {
      const result = await db.select().from(plateSizes).where(eq(plateSizes.id, id));
      return result[0];
    },

    async createPlateSize(size: InsertPlateSize): Promise<PlateSize> {
      const result = await db.insert(plateSizes).values(size).returning();
      return result[0];
    },

    async updatePlateSize(id: number, size: Partial<PlateSize>): Promise<PlateSize | undefined> {
      const result = await db.update(plateSizes).set(size).where(eq(plateSizes.id, id)).returning();
      return result[0];
    },

    async deletePlateSize(id: number): Promise<boolean> {
      const result = await db.delete(plateSizes).where(eq(plateSizes.id, id));
      return result.rowCount > 0;
    },

    // Text Styles
    async getTextStyles(): Promise<TextStyle[]> {
      return await db.select().from(textStyles).where(eq(textStyles.isActive, true));
    },

    async getActiveTextStyles(): Promise<TextStyle[]> {
      return await db.select().from(textStyles).where(eq(textStyles.isActive, true));
    },

    async getTextStyle(id: number): Promise<TextStyle | undefined> {
      const result = await db.select().from(textStyles).where(eq(textStyles.id, id));
      return result[0];
    },

    async createTextStyle(style: InsertTextStyle): Promise<TextStyle> {
      const result = await db.insert(textStyles).values(style).returning();
      return result[0];
    },

    async updateTextStyle(id: number, style: Partial<TextStyle>): Promise<TextStyle | undefined> {
      const result = await db.update(textStyles).set(style).where(eq(textStyles.id, id)).returning();
      return result[0];
    },

    async deleteTextStyle(id: number): Promise<boolean> {
      const result = await db.delete(textStyles).where(eq(textStyles.id, id));
      return result.rowCount > 0;
    },

    // Badges
    async getBadges(): Promise<Badge[]> {
      return await db.select().from(badges).where(eq(badges.isActive, true));
    },

    async getActiveBadges(): Promise<Badge[]> {
      return await db.select().from(badges).where(eq(badges.isActive, true));
    },

    async getBadge(id: number): Promise<Badge | undefined> {
      const result = await db.select().from(badges).where(eq(badges.id, id));
      return result[0];
    },

    async createBadge(badge: InsertBadge): Promise<Badge> {
      const result = await db.insert(badges).values(badge).returning();
      return result[0];
    },

    async updateBadge(id: number, badge: Partial<Badge>): Promise<Badge | undefined> {
      const result = await db.update(badges).set(badge).where(eq(badges.id, id)).returning();
      return result[0];
    },

    async deleteBadge(id: number): Promise<boolean> {
      const result = await db.delete(badges).where(eq(badges.id, id));
      return result.rowCount > 0;
    },

    // Colors
    async getColors(): Promise<Color[]> {
      return await db.select().from(colors).where(eq(colors.isActive, true));
    },

    async getActiveColors(): Promise<Color[]> {
      return await db.select().from(colors).where(eq(colors.isActive, true));
    },

    async getColor(id: number): Promise<Color | undefined> {
      const result = await db.select().from(colors).where(eq(colors.id, id));
      return result[0];
    },

    async createColor(color: InsertColor): Promise<Color> {
      const result = await db.insert(colors).values(color).returning();
      return result[0];
    },

    async updateColor(id: number, color: Partial<Color>): Promise<Color | undefined> {
      const result = await db.update(colors).set(color).where(eq(colors.id, id)).returning();
      return result[0];
    },

    async deleteColor(id: number): Promise<boolean> {
      const result = await db.delete(colors).where(eq(colors.id, id));
      return result.rowCount > 0;
    },

    // Car Brands
    async getCarBrands(): Promise<CarBrand[]> {
      return await db.select().from(carBrands).where(eq(carBrands.isActive, true));
    },

    async getActiveCarBrands(): Promise<CarBrand[]> {
      return await db.select().from(carBrands).where(eq(carBrands.isActive, true));
    },

    async getCarBrand(id: number): Promise<CarBrand | undefined> {
      const result = await db.select().from(carBrands).where(eq(carBrands.id, id));
      return result[0];
    },

    async createCarBrand(brand: InsertCarBrand): Promise<CarBrand> {
      const result = await db.insert(carBrands).values(brand).returning();
      return result[0];
    },

    async updateCarBrand(id: number, brand: Partial<CarBrand>): Promise<CarBrand | undefined> {
      const result = await db.update(carBrands).set(brand).where(eq(carBrands.id, id)).returning();
      return result[0];
    },

    async deleteCarBrand(id: number): Promise<boolean> {
      const result = await db.delete(carBrands).where(eq(carBrands.id, id));
      return result.rowCount > 0;
    },

    // Pricing
    async getPricing(): Promise<Pricing | undefined> {
      const result = await db.select().from(pricing).limit(1);
      return result[0];
    },

    async updatePricing(id: number, pricingData: Partial<Pricing>): Promise<Pricing | undefined> {
      const result = await db.update(pricing).set(pricingData).where(eq(pricing.id, id)).returning();
      return result[0];
    },

    // Payment Methods
    async getPaymentMethods(): Promise<PaymentMethod[]> {
      return await db.select().from(paymentMethods);
    },

    async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
      const result = await db.insert(paymentMethods).values(method).returning();
      return result[0];
    },

    async updatePaymentMethod(id: number, method: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
      const result = await db.update(paymentMethods).set(method).where(eq(paymentMethods.id, id)).returning();
      return result[0];
    },

    async deletePaymentMethod(id: number): Promise<boolean> {
      const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
      return result.rowCount > 0;
    },

    // Orders
    async getOrders(): Promise<Order[]> {
      return await db.select().from(orders);
    },

    async getOrder(id: number): Promise<Order | undefined> {
      const result = await db.select().from(orders).where(eq(orders.id, id));
      return result[0];
    },

    async getOrdersByStatus(status: string): Promise<Order[]> {
      return await db.select().from(orders).where(eq(orders.orderStatus, status));
    },

    async createOrder(order: InsertOrder): Promise<Order> {
      const result = await db.insert(orders).values(order).returning();
      return result[0];
    },

    async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
      const result = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
      return result[0];
    },

    async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
      const result = await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id)).returning();
      return result[0];
    },

    async getTotalSales(): Promise<number> {
      const result = await db.select().from(orders);
      return result.reduce((total, order) => total + parseFloat(order.totalPrice || '0'), 0);
    },

    // Uploaded Files
    async getUploadedFiles(): Promise<UploadedFile[]> {
      return await db.select().from(uploadedFiles);
    },

    async getUploadedFile(id: number): Promise<UploadedFile | undefined> {
      const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id));
      return result[0];
    },

    async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
      const result = await db.insert(uploadedFiles).values(file).returning();
      return result[0];
    },

    async deleteUploadedFile(id: number): Promise<boolean> {
      const result = await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
      return result.rowCount > 0;
    },

    // Navigation Items
    async getNavigationItems(): Promise<NavigationItem[]> {
      return await db.select().from(navigationItems);
    },

    async getActiveNavigationItems(): Promise<NavigationItem[]> {
      return await db.select().from(navigationItems).where(eq(navigationItems.isActive, true));
    },

    async createNavigationItem(item: InsertNavigationItem): Promise<NavigationItem> {
      const result = await db.insert(navigationItems).values(item).returning();
      return result[0];
    },

    async updateNavigationItem(id: number, item: Partial<NavigationItem>): Promise<NavigationItem | undefined> {
      const result = await db.update(navigationItems).set(item).where(eq(navigationItems.id, id)).returning();
      return result[0];
    },

    async deleteNavigationItem(id: number): Promise<boolean> {
      const result = await db.delete(navigationItems).where(eq(navigationItems.id, id));
      return result.rowCount > 0;
    },

    // Content Blocks
    async getContentBlocks(): Promise<ContentBlock[]> {
      return await db.select().from(contentBlocks);
    },

    async getActiveContentBlocks(): Promise<ContentBlock[]> {
      return await db.select().from(contentBlocks).where(eq(contentBlocks.isActive, true));
    },

    async getContentBlockByIdentifier(identifier: string): Promise<ContentBlock | undefined> {
      const result = await db.select().from(contentBlocks).where(eq(contentBlocks.identifier, identifier));
      return result[0];
    },

    async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
      const result = await db.insert(contentBlocks).values(block).returning();
      return result[0];
    },

    async updateContentBlock(id: number, block: Partial<ContentBlock>): Promise<ContentBlock | undefined> {
      const result = await db.update(contentBlocks).set(block).where(eq(contentBlocks.id, id)).returning();
      return result[0];
    },

    async deleteContentBlock(id: number): Promise<boolean> {
      const result = await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
      return result.rowCount > 0;
    },

    async upsertContentBlock(identifier: string, title: string, content: string, location: string): Promise<ContentBlock> {
      const existing = await this.getContentBlockByIdentifier(identifier);
      
      if (existing) {
        const result = await db.update(contentBlocks)
          .set({ title, content, location })
          .where(eq(contentBlocks.identifier, identifier))
          .returning();
        return result[0];
      } else {
        const result = await db.insert(contentBlocks)
          .values({ identifier, title, content, location, isActive: true })
          .returning();
        return result[0];
      }
    },

    // Site Configs
    async getSiteConfigs(): Promise<SiteConfig[]> {
      return await db.select().from(siteConfigs);
    },

    async getSiteConfigByKey(key: string): Promise<SiteConfig | undefined> {
      const result = await db.select().from(siteConfigs).where(eq(siteConfigs.configKey, key));
      return result[0];
    },

    async createSiteConfig(config: InsertSiteConfig): Promise<SiteConfig> {
      const result = await db.insert(siteConfigs).values(config).returning();
      return result[0];
    },

    async updateSiteConfig(id: number, config: Partial<SiteConfig>): Promise<SiteConfig | undefined> {
      const result = await db.update(siteConfigs).set(config).where(eq(siteConfigs.id, id)).returning();
      return result[0];
    },

    async upsertSiteConfig(key: string, value: string, type: string, description?: string): Promise<SiteConfig> {
      const existing = await this.getSiteConfigByKey(key);
      
      if (existing) {
        const result = await db.update(siteConfigs)
          .set({ configValue: value, configType: type, description })
          .where(eq(siteConfigs.configKey, key))
          .returning();
        return result[0];
      } else {
        const result = await db.insert(siteConfigs)
          .values({ configKey: key, configValue: value, configType: type, description })
          .returning();
        return result[0];
      }
    },

    // User authentication
    async getUserByUsername(username: string): Promise<User | undefined> {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    },

    async changeAdminPassword(newPassword: string): Promise<void> {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.username, 'admin'));
    },

    // Seed initial data
    async seedInitialData(): Promise<void> {
      try {
        // Check if data already exists
        const existingPlateSizes = await this.getPlateSizes();
        if (existingPlateSizes.length > 0) {
          console.log('Data already exists, skipping seed');
          return;
        }

        console.log('Seeding initial data...');

        // Seed plate sizes
        for (const size of mockData.plateSizes) {
          await this.createPlateSize(size);
        }

        // Seed text styles
        for (const style of mockData.textStyles) {
          await this.createTextStyle(style);
        }

        // Seed badges
        for (const badge of mockData.badges) {
          await this.createBadge(badge);
        }

        // Seed colors
        for (const color of mockData.colors) {
          await this.createColor(color);
        }

        // Seed car brands
        for (const brand of mockData.carBrands) {
          await this.createCarBrand(brand);
        }

        // Seed payment methods
        for (const method of mockData.paymentMethods) {
          await this.createPaymentMethod(method);
        }

        // Seed site configs
        for (const config of mockData.siteConfigs) {
          await this.createSiteConfig(config);
        }

        // Ensure pricing exists
        const existingPricing = await this.getPricing();
        if (!existingPricing) {
          await db.insert(pricing).values({
            frontPlatePrice: "20",
            rearPlatePrice: "25", 
            bothPlatesDiscount: "0",
            deliveryFee: "4.99",
            taxRate: "20"
          });
        }

        console.log('Initial data seeded successfully');
      } catch (error) {
        console.error('Error seeding initial data:', error);
      }
    }
  };
}
