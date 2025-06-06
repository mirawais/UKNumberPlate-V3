import { Pool } from 'pg';

// Direct database connection using your Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Complete storage implementation with all admin functionality
export class CompleteNeonStorage {
  
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
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
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
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, email, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.username, userData.password, userData.email || null, userData.isAdmin || false]
    );
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
  
  async updateUser(id: number, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
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

  // Plate sizes - COMPLETE CRUD
  async getPlateSizes() {
    const result = await pool.query('SELECT * FROM plate_sizes ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      dimensions: row.dimensions,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      description: row.description,
      displayOrder: row.display_order
    }));
  }

  async getActivePlateSizes() {
    const result = await pool.query('SELECT * FROM plate_sizes WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      dimensions: row.dimensions,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      description: row.description,
      displayOrder: row.display_order
    }));
  }

  async getPlateSize(id: number) {
    const result = await pool.query('SELECT * FROM plate_sizes WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        dimensions: row.dimensions,
        additionalPrice: row.additional_price?.toString() || '0',
        isActive: row.is_active,
        description: row.description,
        displayOrder: row.display_order
      };
    }
    return undefined;
  }

  async createPlateSize(plateSize: any) {
    const result = await pool.query(
      'INSERT INTO plate_sizes (name, dimensions, additional_price, is_active, description, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [plateSize.name, plateSize.dimensions, parseFloat(plateSize.additionalPrice || '0'), plateSize.isActive !== false, plateSize.description || '', plateSize.displayOrder || 0]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      dimensions: row.dimensions,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      description: row.description,
      displayOrder: row.display_order
    };
  }

  async updatePlateSize(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.name !== undefined) {
      setClause.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.dimensions !== undefined) {
      setClause.push(`dimensions = $${valueIndex++}`);
      values.push(updates.dimensions);
    }
    if (updates.additionalPrice !== undefined) {
      setClause.push(`additional_price = $${valueIndex++}`);
      values.push(parseFloat(updates.additionalPrice));
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${valueIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${valueIndex++}`);
      values.push(updates.description);
    }
    if (updates.displayOrder !== undefined) {
      setClause.push(`display_order = $${valueIndex++}`);
      values.push(updates.displayOrder);
    }

    if (setClause.length === 0) {
      return await this.getPlateSize(id);
    }

    const result = await pool.query(
      `UPDATE plate_sizes SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        dimensions: row.dimensions,
        additionalPrice: row.additional_price?.toString() || '0',
        isActive: row.is_active,
        description: row.description,
        displayOrder: row.display_order
      };
    }
    return undefined;
  }

  async deletePlateSize(id: number) {
    const result = await pool.query('DELETE FROM plate_sizes WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Text styles - COMPLETE CRUD
  async getTextStyles() {
    const result = await pool.query('SELECT * FROM text_styles ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      displayOrder: row.display_order
    }));
  }

  async getActiveTextStyles() {
    const result = await pool.query('SELECT * FROM text_styles WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      displayOrder: row.display_order
    }));
  }

  async getTextStyle(id: number) {
    const result = await pool.query('SELECT * FROM text_styles WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        additionalPrice: row.additional_price?.toString() || '0',
        isActive: row.is_active,
        displayOrder: row.display_order
      };
    }
    return undefined;
  }

  async createTextStyle(textStyle: any) {
    const result = await pool.query(
      'INSERT INTO text_styles (name, description, additional_price, is_active, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [textStyle.name, textStyle.description || '', parseFloat(textStyle.additionalPrice || '0'), textStyle.isActive !== false, textStyle.displayOrder || 0]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      displayOrder: row.display_order
    };
  }

  async updateTextStyle(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.name !== undefined) {
      setClause.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${valueIndex++}`);
      values.push(updates.description);
    }
    if (updates.additionalPrice !== undefined) {
      setClause.push(`additional_price = $${valueIndex++}`);
      values.push(parseFloat(updates.additionalPrice));
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${valueIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.displayOrder !== undefined) {
      setClause.push(`display_order = $${valueIndex++}`);
      values.push(updates.displayOrder);
    }

    if (setClause.length === 0) {
      return await this.getTextStyle(id);
    }

    const result = await pool.query(
      `UPDATE text_styles SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        additionalPrice: row.additional_price?.toString() || '0',
        isActive: row.is_active,
        displayOrder: row.display_order
      };
    }
    return undefined;
  }

  async deleteTextStyle(id: number) {
    const result = await pool.query('DELETE FROM text_styles WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Badges - COMPLETE CRUD
  async getBadges() {
    const result = await pool.query('SELECT * FROM badges ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      imagePath: row.image_path,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      displayOrder: row.display_order
    }));
  }

  async getActiveBadges() {
    const result = await pool.query('SELECT * FROM badges WHERE is_active = true ORDER BY display_order');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      imagePath: row.image_path,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      displayOrder: row.display_order
    }));
  }

  async getBadge(id: number) {
    const result = await pool.query('SELECT * FROM badges WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        imagePath: row.image_path,
        additionalPrice: row.additional_price?.toString() || '0',
        isActive: row.is_active,
        displayOrder: row.display_order
      };
    }
    return undefined;
  }

  async createBadge(badge: any) {
    const result = await pool.query(
      'INSERT INTO badges (name, image_path, additional_price, is_active, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [badge.name, badge.imagePath || '', parseFloat(badge.additionalPrice || '0'), badge.isActive !== false, badge.displayOrder || 0]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      imagePath: row.image_path,
      additionalPrice: row.additional_price?.toString() || '0',
      isActive: row.is_active,
      displayOrder: row.display_order
    };
  }

  async updateBadge(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.name !== undefined) {
      setClause.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.imagePath !== undefined) {
      setClause.push(`image_path = $${valueIndex++}`);
      values.push(updates.imagePath);
    }
    if (updates.additionalPrice !== undefined) {
      setClause.push(`additional_price = $${valueIndex++}`);
      values.push(parseFloat(updates.additionalPrice));
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${valueIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.displayOrder !== undefined) {
      setClause.push(`display_order = $${valueIndex++}`);
      values.push(updates.displayOrder);
    }

    if (setClause.length === 0) {
      return await this.getBadge(id);
    }

    const result = await pool.query(
      `UPDATE badges SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        imagePath: row.image_path,
        additionalPrice: row.additional_price?.toString() || '0',
        isActive: row.is_active,
        displayOrder: row.display_order
      };
    }
    return undefined;
  }

  async deleteBadge(id: number) {
    const result = await pool.query('DELETE FROM badges WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Colors - COMPLETE CRUD
  async getColors() {
    const result = await pool.query('SELECT * FROM colors');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      hexCode: row.hex_code,
      isActive: row.is_active
    }));
  }

  async getActiveColors() {
    const result = await pool.query('SELECT * FROM colors WHERE is_active = true');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      hexCode: row.hex_code,
      isActive: row.is_active
    }));
  }

  async getColor(id: number) {
    const result = await pool.query('SELECT * FROM colors WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        hexCode: row.hex_code,
        isActive: row.is_active
      };
    }
    return undefined;
  }

  async createColor(color: any) {
    const result = await pool.query(
      'INSERT INTO colors (name, hex_code, is_active) VALUES ($1, $2, $3) RETURNING *',
      [color.name, color.hexCode, color.isActive !== false]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      hexCode: row.hex_code,
      isActive: row.is_active
    };
  }

  async updateColor(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.name !== undefined) {
      setClause.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.hexCode !== undefined) {
      setClause.push(`hex_code = $${valueIndex++}`);
      values.push(updates.hexCode);
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${valueIndex++}`);
      values.push(updates.isActive);
    }

    if (setClause.length === 0) {
      return await this.getColor(id);
    }

    const result = await pool.query(
      `UPDATE colors SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        hexCode: row.hex_code,
        isActive: row.is_active
      };
    }
    return undefined;
  }

  async deleteColor(id: number) {
    const result = await pool.query('DELETE FROM colors WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Car brands - COMPLETE CRUD
  async getCarBrands() {
    const result = await pool.query('SELECT * FROM car_brands');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active
    }));
  }

  async getActiveCarBrands() {
    const result = await pool.query('SELECT * FROM car_brands WHERE is_active = true');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active
    }));
  }

  async getCarBrand(id: number) {
    const result = await pool.query('SELECT * FROM car_brands WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        isActive: row.is_active
      };
    }
    return undefined;
  }

  async createCarBrand(brand: any) {
    const result = await pool.query(
      'INSERT INTO car_brands (name, is_active) VALUES ($1, $2) RETURNING *',
      [brand.name, brand.isActive !== false]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      isActive: row.is_active
    };
  }

  async updateCarBrand(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.name !== undefined) {
      setClause.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${valueIndex++}`);
      values.push(updates.isActive);
    }

    if (setClause.length === 0) {
      return await this.getCarBrand(id);
    }

    const result = await pool.query(
      `UPDATE car_brands SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        isActive: row.is_active
      };
    }
    return undefined;
  }

  async deleteCarBrand(id: number) {
    const result = await pool.query('DELETE FROM car_brands WHERE id = $1', [id]);
    return result.rowCount > 0;
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

  async getPaymentMethod(id: number) {
    const result = await pool.query('SELECT * FROM payment_methods WHERE id = $1', [id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        isActive: row.is_active,
        paymentProcessor: row.payment_processor
      };
    }
    return undefined;
  }

  async createPaymentMethod(method: any) {
    const result = await pool.query(
      'INSERT INTO payment_methods (name, is_active, payment_processor) VALUES ($1, $2, $3) RETURNING *',
      [method.name, method.isActive !== false, method.paymentProcessor || 'manual']
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      isActive: row.is_active,
      paymentProcessor: row.payment_processor
    };
  }

  async updatePaymentMethod(id: number, updates: any) {
    const setClause = [];
    const values = [id];
    let valueIndex = 2;

    if (updates.name !== undefined) {
      setClause.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${valueIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.paymentProcessor !== undefined) {
      setClause.push(`payment_processor = $${valueIndex++}`);
      values.push(updates.paymentProcessor);
    }

    if (setClause.length === 0) {
      return await this.getPaymentMethod(id);
    }

    const result = await pool.query(
      `UPDATE payment_methods SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        isActive: row.is_active,
        paymentProcessor: row.payment_processor
      };
    }
    return undefined;
  }

  async deletePaymentMethod(id: number) {
    const result = await pool.query('DELETE FROM payment_methods WHERE id = $1', [id]);
    return result.rowCount > 0;
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

  async getOrders() {
    const result = await pool.query(`
      SELECT * FROM orders 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async getOrder(id: number) {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async getOrdersByStatus(status: string) {
    const result = await pool.query('SELECT * FROM orders WHERE order_status = $1', [status]);
    return result.rows;
  }

  async createOrder(orderData: any) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      plateDetails,
      documentFileId,
      deliveryFee,
      shippingMethod,
      totalPrice,
      paymentMethod,
      orderStatus
    } = orderData;

    const result = await pool.query(`
      INSERT INTO orders (
        customer_name, customer_email, customer_phone, shipping_address,
        plate_details, document_file_id, delivery_fee, shipping_method,
        total_price, payment_method, order_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      JSON.stringify(plateDetails),
      documentFileId,
      deliveryFee || 0,
      shippingMethod || 'pickup',
      totalPrice,
      paymentMethod,
      orderStatus || 'pending_payment'
    ]);

    return result.rows[0];
  }

  async updateOrder(id: number, updates: any) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'plateDetails') {
        fields.push(`plate_details = $${paramIndex}`);
        values.push(JSON.stringify(updates[key]));
      } else if (key === 'stripePaymentIntentId') {
        fields.push(`stripe_payment_intent_id = $${paramIndex}`);
        values.push(updates[key]);
      } else {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(updates[key]);
      }
      paramIndex++;
    });

    if (fields.length === 0) return undefined;

    values.push(id);
    const result = await pool.query(`
      UPDATE orders SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return result.rows[0] || undefined;
  }

  async updateOrderStatus(id: number, status: string) {
    const result = await pool.query(`
      UPDATE orders SET order_status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    return result.rows[0] || undefined;
  }

  async getTotalSales() {
    const result = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) as total 
      FROM orders 
      WHERE order_status IN ('completed', 'shipped', 'delivered')
    `);
    return parseFloat(result.rows[0]?.total || '0');
  }
}