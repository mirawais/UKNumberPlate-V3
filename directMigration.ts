import { pool } from "./server/db";
import bcrypt from "bcryptjs";

async function directMigration() {
  try {
    console.log("Starting direct SQL migration to Neon database...");
    
    // Clear existing data
    await pool.query("DELETE FROM site_config");
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM payment_methods");
    await pool.query("DELETE FROM pricing");
    await pool.query("DELETE FROM car_brands");
    await pool.query("DELETE FROM colors");
    await pool.query("DELETE FROM badges");
    await pool.query("DELETE FROM text_styles");
    await pool.query("DELETE FROM plate_sizes");
    
    console.log("Cleared existing data...");
    
    // Insert plate sizes
    await pool.query(`
      INSERT INTO plate_sizes (name, dimensions, additional_price, is_active, description, display_order) 
      VALUES 
        ('Standard', '520mm x 111mm', 0, true, 'Standard UK number plate size', 0),
        ('Square', '279mm x 203mm', 5, true, 'Square motorcycle plate', 1)
    `);
    console.log("Inserted plate sizes...");
    
    // Insert text styles
    await pool.query(`
      INSERT INTO text_styles (name, description, additional_price, is_active, display_order) 
      VALUES 
        ('Standard', 'Standard black text', 0, true, 0),
        ('3D Gel (Standard)', 'Raised gel letters in black', 15, true, 1),
        ('4D Laser Cut', 'Laser cut acrylic letters', 25, true, 2)
    `);
    console.log("Inserted text styles...");
    
    // Insert badges
    await pool.query(`
      INSERT INTO badges (name, image_path, additional_price, is_active, display_order) 
      VALUES 
        ('GB', 'https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg', 0, true, 0),
        ('EU', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png', 2, true, 1)
    `);
    console.log("Inserted badges...");
    
    // Insert colors
    await pool.query(`
      INSERT INTO colors (name, hex_code, is_active) 
      VALUES 
        ('Black', '#000000', true),
        ('White', '#FFFFFF', true),
        ('Silver', '#C0C0C0', true),
        ('Red', '#FF0000', true),
        ('Blue', '#0000FF', true)
    `);
    console.log("Inserted colors...");
    
    // Insert car brands
    await pool.query(`
      INSERT INTO car_brands (name, is_active) 
      VALUES 
        ('Ford', true),
        ('BMW', true),
        ('Mercedes', true),
        ('Audi', true),
        ('Toyota', true),
        ('Honda', true),
        ('Nissan', true),
        ('Volkswagen', true)
    `);
    console.log("Inserted car brands...");
    
    // Insert pricing
    await pool.query(`
      INSERT INTO pricing (front_plate_price, rear_plate_price, both_plates_price, both_plates_discount, tax_rate, delivery_fee) 
      VALUES (20, 25, 40, 5, 20, '4.99')
    `);
    console.log("Inserted pricing...");
    
    // Insert payment methods
    await pool.query(`
      INSERT INTO payment_methods (name, is_active, payment_processor) 
      VALUES 
        ('Credit Card', true, 'stripe'),
        ('PayPal', true, 'paypal'),
        ('Bank Transfer', true, 'manual'),
        ('Apple Pay', true, 'stripe'),
        ('Google Pay', true, 'stripe')
    `);
    console.log("Inserted payment methods...");
    
    // Insert admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(`
      INSERT INTO users (username, password_hash, is_admin) 
      VALUES ($1, $2, true)
    `, ["admin", hashedPassword]);
    console.log("Inserted admin user...");
    
    // Insert site configuration
    await pool.query(`
      INSERT INTO site_config (config_key, config_value, config_type) 
      VALUES 
        ('site.name', 'NumberPlate Customizer', 'text'),
        ('site.description', 'Professional UK number plate customization service', 'text'),
        ('contact.email', 'info@signsquad.com', 'email'),
        ('contact.phone', '07429269149', 'text'),
        ('address.street', '5 Roger Street', 'text'),
        ('address.city', 'Manchester', 'text'),
        ('address.postcode', 'M4 4EN', 'text')
    `);
    console.log("Inserted site configuration...");
    
    console.log("✓ Direct SQL migration completed successfully!");
    
  } catch (error) {
    console.error("✗ Error in direct migration:", error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

directMigration();