
import { Pool } from 'pg';
import bcrypt from "bcryptjs";

// Direct database connection using your Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Simple storage implementation using direct SQL queries
export class NeonStorage {
  
  // Users
  async getUser(id: number) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        username: row.username,
        password_hash: row.password_hash,
        email: row.email,
        isAdmin: row.is_admin,
        createdAt: row.created_at,
        lastLogin: row.last_login
      };
    }
    return undefined;
  }
  
  async getUserByUsername(username: string) {
    console.log(`Looking up user: ${username}`);
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    console.log(`Database query result:`, user);
    if (user) {
      return {
        id: user.id,
        username: user.username,
        password_hash: user.password_hash,
        email: user.email,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
        lastLogin: user.last_login
      };
    }
    return undefined;
  }
  
  async createUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, email, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.username, hashedPassword, userData.email || null, userData.isAdmin || false]
    );
    return result.rows[0];
  }
  
  async updateUser(id: number, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // Method to change admin password
  async changeAdminPassword(newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE username = $2 AND is_admin = true RETURNING *',
        [hashedPassword, 'admin']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error changing admin password:', error);
      throw error;
    }
  }

  // Site configs
  async getSiteConfigs() {
    const result = await pool.query('SELECT * FROM site_config ORDER BY config_key');
    return result.rows.map(row => ({
      configKey: row.config_key,
      configValue: row.config_value,
      configType: row.config_type,
      id: row.id
    }));
  }

  async getSiteConfigByKey(key: string) {
    const result = await pool.query('SELECT * FROM site_config WHERE config_key = $1', [key]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        configKey: row.config_key,
        configValue: row.config_value,
        configType: row.config_type,
        id: row.id
      };
    }
    return undefined;
  }

  async createSiteConfig(config: any) {
    const result = await pool.query(
      'INSERT INTO site_config (config_key, config_value, config_type) VALUES ($1, $2, $3) RETURNING *',
      [config.configKey, config.configValue, config.configType]
    );
    const row = result.rows[0];
    return {
      configKey: row.config_key,
      configValue: row.config_value,
      configType: row.config_type,
      id: row.id
    };
  }

  async updateSiteConfig(id: number, config: any) {
    const result = await pool.query(
      'UPDATE site_config SET config_value = $2 WHERE id = $1 RETURNING *',
      [id, config.configValue]
    );
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        configKey: row.config_key,
        configValue: row.config_value,
        configType: row.config_type,
        id: row.id
      };
    }
    return undefined;
  }

  async upsertSiteConfig(key: string, value: string, type: string) {
    const existing = await this.getSiteConfigByKey(key);
    if (existing) {
      return await this.updateSiteConfig(existing.id, { configValue: value });
    } else {
      return await this.createSiteConfig({ configKey: key, configValue: value, configType: type });
    }
  }

  // Plate sizes
  async getPlateSizes() {
    const result = await pool.query('SELECT * FROM plate_sizes WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      dimensions: row.dimensions,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      description: row.description
    }));
  }

  async getActivePlateSizes() {
    return this.getPlateSizes();
  }

  // Text styles
  async getTextStyles() {
    const result = await pool.query('SELECT * FROM text_styles WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active
    }));
  }

  async getActiveTextStyles() {
    return this.getTextStyles();
  }

  // Badges
  async getBadges() {
    const result = await pool.query('SELECT * FROM badges WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      imagePath: row.image_path,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active
    }));
  }

  async getActiveBadges() {
    return this.getBadges();
  }

  // Colors
  async getColors() {
    const result = await pool.query('SELECT * FROM colors WHERE is_active = true');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      hexCode: row.hex_code,
      isActive: row.is_active
    }));
  }

  async getActiveColors() {
    return this.getColors();
  }

  // Car brands
  async getCarBrands() {
    const result = await pool.query('SELECT * FROM car_brands WHERE is_active = true');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active
    }));
  }

  async getActiveCarBrands() {
    return this.getCarBrands();
  }

  // Pricing
  async getPricing() {
    const result = await pool.query('SELECT * FROM pricing ORDER BY id DESC LIMIT 1');
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        frontPlatePrice: row.front_plate_price?.toString() || '20',
        rearPlatePrice: row.rear_plate_price?.toString() || '25',
        bothPlatesPrice: row.both_plates_price?.toString() || '40',
        bothPlatesDiscount: row.both_plates_discount?.toString() || '5',
        taxRate: row.tax_rate?.toString() || '20',
        deliveryFee: row.delivery_fee || '4.99'
      };
    }
    // Return default pricing if none exists
    return {
      id: 1,
      frontPlatePrice: '20',
      rearPlatePrice: '25',
      bothPlatesPrice: '40',
      bothPlatesDiscount: '5',
      taxRate: '20',
      deliveryFee: '4.99'
    };
  }

  async updatePricing(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.frontPlatePrice !== undefined) {
      setClause.push(`front_plate_price = $${valueIndex++}`);
      values.push(parseFloat(updates.frontPlatePrice));
    }
    if (updates.rearPlatePrice !== undefined) {
      setClause.push(`rear_plate_price = $${valueIndex++}`);
      values.push(parseFloat(updates.rearPlatePrice));
    }
    if (updates.bothPlatesPrice !== undefined) {
      setClause.push(`both_plates_price = $${valueIndex++}`);
      values.push(parseFloat(updates.bothPlatesPrice));
    }
    if (updates.bothPlatesDiscount !== undefined) {
      setClause.push(`both_plates_discount = $${valueIndex++}`);
      values.push(parseFloat(updates.bothPlatesDiscount));
    }
    if (updates.taxRate !== undefined) {
      setClause.push(`tax_rate = $${valueIndex++}`);
      values.push(parseFloat(updates.taxRate));
    }
    if (updates.deliveryFee !== undefined) {
      setClause.push(`delivery_fee = $${valueIndex++}`);
      values.push(updates.deliveryFee);
    }

    if (setClause.length === 0) {
      return await this.getPricing();
    }

    const result = await pool.query(
      `UPDATE pricing SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        frontPlatePrice: row.front_plate_price?.toString() || '20',
        rearPlatePrice: row.rear_plate_price?.toString() || '25',
        bothPlatesPrice: row.both_plates_price?.toString() || '40',
        bothPlatesDiscount: row.both_plates_discount?.toString() || '5',
        taxRate: row.tax_rate?.toString() || '20',
        deliveryFee: row.delivery_fee || '4.99'
      };
    }
    return undefined;
  }

  // Payment methods
  async getPaymentMethods() {
    const result = await pool.query('SELECT * FROM payment_methods WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
      paymentProcessor: row.payment_processor
    }));
  }

  async getActivePaymentMethods() {
    return this.getPaymentMethods();
  }

  // Stub methods for features not yet implemented
  async getNavigationItems() { return []; }
  async getActiveNavigationItems() { return []; }
  async getNavigationItem() { return undefined; }
  async createNavigationItem() { throw new Error("Not implemented"); }
  async updateNavigationItem() { return undefined; }
  async deleteNavigationItem() { return false; }

  async getContentBlocks() { return []; }
  async getActiveContentBlocks() { return []; }
  async getContentBlockByIdentifier() { return undefined; }
  async createContentBlock() { throw new Error("Not implemented"); }
  async updateContentBlock() { return undefined; }
  async upsertContentBlock() { throw new Error("Not implemented"); }

  async getUploadedFiles() { return []; }
  async getUploadedFile() { return undefined; }
  async getUploadedFileByFilename() { return undefined; }
  async getUploadedFilesByType() { return []; }
  async createUploadedFile() { throw new Error("Not implemented"); }
  async updateUploadedFile() { return undefined; }
  async deleteUploadedFile() { return false; }

  async getPlateSize() { return undefined; }
  async createPlateSize() { throw new Error("Not implemented"); }
  async updatePlateSize() { return undefined; }
  async deletePlateSize() { return false; }

  async getTextStyle() { return undefined; }
  async createTextStyle() { throw new Error("Not implemented"); }
  async updateTextStyle() { return undefined; }
  async deleteTextStyle() { return false; }

  async getBadge() { return undefined; }
  async createBadge() { throw new Error("Not implemented"); }
  async updateBadge() { return undefined; }
  async deleteBadge() { return false; }

  async getColor() { return undefined; }
  async createColor() { throw new Error("Not implemented"); }
  async updateColor() { return undefined; }
  async deleteColor() { return false; }

  async getCarBrand() { return undefined; }
  async createCarBrand() { throw new Error("Not implemented"); }
  async updateCarBrand() { return undefined; }
  async deleteCarBrand() { return false; }

  async getPaymentMethod() { return undefined; }
  async createPaymentMethod() { throw new Error("Not implemented"); }
  async updatePaymentMethod() { return undefined; }
  async deletePaymentMethod() { return false; }

  async getOrders() { return []; }
  async getOrder() { return undefined; }
  async getOrdersByStatus() { return []; }
  async createOrder() { throw new Error("Not implemented"); }
  async updateOrder() { return undefined; }
  async updateOrderStatus() { return undefined; }
  async getTotalSales() { return 0; }
}
