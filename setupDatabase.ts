import { db } from "./server/db";
import { 
  plateSizes,
  textStyles,
  badges,
  colors,
  carBrands,
  pricing,
  paymentMethods,
  users,
  siteConfig
} from "./shared/schema";

async function setupDatabase() {
  try {
    console.log("Setting up database tables...");
    
    // Create tables
    // Note: This is a simplified approach - in production, use Drizzle migrations
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_config (
        id SERIAL PRIMARY KEY,
        config_key TEXT NOT NULL UNIQUE,
        config_value TEXT NOT NULL,
        config_type TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS plate_sizes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        dimensions TEXT NOT NULL,
        additional_price NUMERIC NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        description TEXT,
        display_order NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS text_styles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_path TEXT,
        image_file_id NUMERIC,
        additional_price NUMERIC NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        display_order NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image_path TEXT NOT NULL,
        additional_price NUMERIC NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        display_order NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS colors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        hex_code TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        display_order NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS car_brands (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo_path TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        display_order NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS pricing (
        id SERIAL PRIMARY KEY,
        front_plate_price NUMERIC NOT NULL,
        rear_plate_price NUMERIC NOT NULL,
        both_plates_price NUMERIC NOT NULL,
        delivery_fee NUMERIC,
        tax_rate NUMERIC,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        payment_processor TEXT NOT NULL,
        display_order NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        plate_details JSONB NOT NULL,
        total_price NUMERIC NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        order_status TEXT NOT NULL DEFAULT 'pending',
        stripe_payment_intent_id TEXT,
        document_file_id NUMERIC,
        shipping_method TEXT DEFAULT 'pickup',
        delivery_fee NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        notes TEXT
      );
    `);

    // Check if we need to seed initial data
    const [plateSizesCount] = await db.select({ count: db.fn.count() }).from(plateSizes);
    
    if (Number(plateSizesCount.count) === 0) {
      console.log("Seeding initial data...");
      
      // Insert plate sizes
      await db.insert(plateSizes).values([
        {
          name: "Standard",
          dimensions: "520mm x 111mm",
          additionalPrice: "0",
          isActive: true,
          displayOrder: "1"
        },
        {
          name: "Range Rover",
          dimensions: "533mm x 152mm",
          additionalPrice: "2.50",
          isActive: true,
          displayOrder: "2"
        },
        {
          name: "Motorbike",
          dimensions: "229mm x 178mm",
          additionalPrice: "3.00",
          isActive: true,
          displayOrder: "3"
        },
        {
          name: "4x4",
          dimensions: "279mm x 203mm",
          additionalPrice: "5.00",
          isActive: true,
          displayOrder: "4"
        }
      ]);

      // Insert colors
      await db.insert(colors).values([
        { name: "Black", hexCode: "#000000", isActive: true },
        { name: "White", hexCode: "#FFFFFF", isActive: true },
        { name: "Red", hexCode: "#FF0000", isActive: true },
        { name: "Blue", hexCode: "#0000FF", isActive: true },
        { name: "Green", hexCode: "#00FF00", isActive: true },
        { name: "Yellow", hexCode: "#FFFF00", isActive: true }
      ]);

      // Insert badges
      await db.insert(badges).values([
        { name: "GB", imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gb.svg", additionalPrice: "0", isActive: true },
        { name: "EU", imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/eu.svg", additionalPrice: "0", isActive: true },
        { name: "SCO", imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gb-sct.svg", additionalPrice: "0", isActive: true },
        { name: "WAL", imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gb-wls.svg", additionalPrice: "0", isActive: true }
      ]);

      // Insert text styles
      await db.insert(textStyles).values([
        { name: "3D Gel (Standard)", description: "Standard 3D gel resin letters", additionalPrice: "0", isActive: true },
        { name: "4D Carbon", description: "Premium 4D carbon fiber effect letters", additionalPrice: "10", isActive: true },
        { name: "3D Chrome", description: "Chrome finish 3D letters", additionalPrice: "5", isActive: true }
      ]);

      // Insert car brands
      await db.insert(carBrands).values([
        { name: "Ford", isActive: true },
        { name: "BMW", isActive: true },
        { name: "Audi", isActive: true },
        { name: "Mercedes", isActive: true },
        { name: "Volkswagen", isActive: true }
      ]);

      // Insert pricing
      await db.insert(pricing).values({
        frontPlatePrice: "15",
        rearPlatePrice: "15",
        bothPlatesPrice: "25",
        deliveryFee: "4.99",
        taxRate: "20"
      });

      // Insert admin user
      await db.insert(users).values({
        username: "admin",
        passwordHash: "$2a$10$rDZ3GfU2.i2jM9Vm2IW16.3XMO5fWBo5tQCISqjNPdNl33LfCShUm", // admin123
        isAdmin: true
      });

      // Insert site config
      await db.insert(siteConfig).values([
        { 
          configKey: "site.name",
          configValue: "Number Plate Builder",
          configType: "string",
          description: "Website name"
        },
        {
          configKey: "site.description", 
          configValue: "Custom UK number plates for all vehicles",
          configType: "string",
          description: "Website description"
        },
        {
          configKey: "features.roadLegalPlates", 
          configValue: "true",
          configType: "boolean",
          description: "Enable road legal plates"
        },
        {
          configKey: "features.showPlates", 
          configValue: "true",
          configType: "boolean",
          description: "Enable show plates"
        },
        {
          configKey: "features.showBadges", 
          configValue: "true",
          configType: "boolean",
          description: "Show badges option"
        },
        {
          configKey: "features.showTextColors", 
          configValue: "true",
          configType: "boolean",
          description: "Show text colors option"
        },
        {
          configKey: "features.showBorders", 
          configValue: "true",
          configType: "boolean",
          description: "Show borders option"
        },
        {
          configKey: "features.showCarBrands", 
          configValue: "true",
          configType: "boolean",
          description: "Show car brands option"
        }
      ]);
    }

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

// Run the setup
setupDatabase();