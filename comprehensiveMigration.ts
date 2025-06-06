import { pool } from "./server/db";
import bcrypt from "bcryptjs";

async function comprehensiveMigration() {
  try {
    console.log("Starting comprehensive migration to Neon database...");
    
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
    
    // Insert comprehensive plate sizes with proper data
    await pool.query(`
      INSERT INTO plate_sizes (name, dimensions, additional_price, is_active, description, display_order) 
      VALUES 
        ('Standard', '520mm x 111mm', 0, true, 'Standard UK road legal plate size', 1),
        ('Square', '279mm x 203mm', 5, true, 'Square motorcycle plate size', 2),
        ('4x4 Plate', '229mm x 178mm', 8, true, '4x4 vehicle plate size', 3),
        ('American Style', '304mm x 152mm', 12, true, 'American style plate (show only)', 4),
        ('German Style', '520mm x 110mm', 10, true, 'German style plate (show only)', 5),
        ('Oblong', '330mm x 111mm', 3, true, 'Oblong rear plate for motorcycles', 6)
    `);
    console.log("Inserted comprehensive plate sizes...");
    
    // Insert comprehensive text styles
    await pool.query(`
      INSERT INTO text_styles (name, description, additional_price, is_active, display_order) 
      VALUES 
        ('Standard', 'Standard black text on white/yellow background', 0, true, 1),
        ('3D Gel (Black)', 'Raised black gel letters for premium look', 15, true, 2),
        ('3D Gel (Silver)', 'Raised silver gel letters', 18, true, 3),
        ('4D Laser Cut (Black)', 'Laser cut black acrylic letters', 25, true, 4),
        ('4D Laser Cut (Silver)', 'Laser cut silver acrylic letters', 28, true, 5),
        ('4D Laser Cut (Chrome)', 'Laser cut chrome effect letters', 35, true, 6),
        ('Carbon Fiber Effect', 'Carbon fiber texture letters', 22, true, 7),
        ('Neon Green', 'Fluorescent green letters (show plates only)', 20, true, 8),
        ('Electric Blue', 'Electric blue letters (show plates only)', 20, true, 9),
        ('Hot Pink', 'Hot pink letters (show plates only)', 20, true, 10)
    `);
    console.log("Inserted comprehensive text styles...");
    
    // Insert comprehensive badges
    await pool.query(`
      INSERT INTO badges (name, image_path, additional_price, is_active, display_order) 
      VALUES 
        ('GB', 'https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg', 0, true, 1),
        ('EU', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png', 2, true, 2),
        ('England', 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Flag_of_England.svg/320px-Flag_of_England.svg.png', 3, true, 3),
        ('Scotland', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Scotland.svg/320px-Flag_of_Scotland.svg.png', 3, true, 4),
        ('Wales', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Flag_of_Wales.svg/320px-Flag_of_Wales.svg.png', 3, true, 5),
        ('Ireland', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/320px-Flag_of_Ireland.svg.png', 3, true, 6),
        ('Union Jack', 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/320px-Flag_of_the_United_Kingdom.svg.png', 4, true, 7),
        ('Custom Badge', '', 8, true, 8)
    `);
    console.log("Inserted comprehensive badges...");
    
    // Insert comprehensive colors
    await pool.query(`
      INSERT INTO colors (name, hex_code, is_active) 
      VALUES 
        ('Black', '#000000', true),
        ('White', '#FFFFFF', true),
        ('Silver', '#C0C0C0', true),
        ('Grey', '#808080', true),
        ('Red', '#FF0000', true),
        ('Blue', '#0000FF', true),
        ('Green', '#008000', true),
        ('Yellow', '#FFFF00', true),
        ('Orange', '#FFA500', true),
        ('Purple', '#800080', true),
        ('Pink', '#FFC0CB', true),
        ('Gold', '#FFD700', true),
        ('Chrome', '#E5E5E5', true),
        ('Carbon Black', '#1C1C1C', true),
        ('Racing Green', '#004225', true),
        ('Navy Blue', '#000080', true),
        ('Burgundy', '#800020', true),
        ('Lime Green', '#32CD32', true)
    `);
    console.log("Inserted comprehensive colors...");
    
    // Insert comprehensive car brands
    await pool.query(`
      INSERT INTO car_brands (name, is_active) 
      VALUES 
        ('Aston Martin', true),
        ('Audi', true),
        ('Bentley', true),
        ('BMW', true),
        ('Chevrolet', true),
        ('Chrysler', true),
        ('Citroen', true),
        ('Dacia', true),
        ('Ferrari', true),
        ('Fiat', true),
        ('Ford', true),
        ('Honda', true),
        ('Hyundai', true),
        ('Infiniti', true),
        ('Jaguar', true),
        ('Jeep', true),
        ('Kia', true),
        ('Lamborghini', true),
        ('Land Rover', true),
        ('Lexus', true),
        ('Maserati', true),
        ('Mazda', true),
        ('McLaren', true),
        ('Mercedes-Benz', true),
        ('MINI', true),
        ('Mitsubishi', true),
        ('Nissan', true),
        ('Peugeot', true),
        ('Porsche', true),
        ('Renault', true),
        ('Rolls-Royce', true),
        ('SEAT', true),
        ('Skoda', true),
        ('Subaru', true),
        ('Suzuki', true),
        ('Tesla', true),
        ('Toyota', true),
        ('Vauxhall', true),
        ('Volkswagen', true),
        ('Volvo', true),
        ('Other', true)
    `);
    console.log("Inserted comprehensive car brands...");
    
    // Insert updated pricing
    await pool.query(`
      INSERT INTO pricing (front_plate_price, rear_plate_price, both_plates_price, both_plates_discount, tax_rate, delivery_fee) 
      VALUES (25, 30, 50, 5, 20, '4.99')
    `);
    console.log("Inserted updated pricing...");
    
    // Insert comprehensive payment methods
    await pool.query(`
      INSERT INTO payment_methods (name, is_active, payment_processor, display_order) 
      VALUES 
        ('Credit/Debit Card', true, 'stripe', 1),
        ('PayPal', true, 'paypal', 2),
        ('Apple Pay', true, 'stripe', 3),
        ('Google Pay', true, 'stripe', 4),
        ('Bank Transfer', true, 'manual', 5),
        ('Klarna', false, 'klarna', 6)
    `);
    console.log("Inserted comprehensive payment methods...");
    
    // Insert admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(`
      INSERT INTO users (username, password_hash, is_admin, email) 
      VALUES ($1, $2, true, 'admin@signsquad.com')
    `, ["admin", hashedPassword]);
    console.log("Inserted admin user...");
    
    // Insert comprehensive site configuration
    await pool.query(`
      INSERT INTO site_config (config_key, config_value, config_type) 
      VALUES 
        ('site.name', 'Sign Squad - Number Plate Specialists', 'text'),
        ('site.description', 'Professional UK number plate customization and manufacturing service', 'text'),
        ('site.tagline', 'Quality plates, delivered fast', 'text'),
        ('contact.email', 'info@signsquad.com', 'email'),
        ('contact.phone', '07429269149', 'text'),
        ('contact.whatsapp', '07429269149', 'text'),
        ('address.street', '5 Roger Street', 'text'),
        ('address.city', 'Manchester', 'text'),
        ('address.postcode', 'M4 4EN', 'text'),
        ('address.country', 'United Kingdom', 'text'),
        ('business.hours', 'Monday-Friday: 9AM-6PM, Saturday: 9AM-4PM', 'text'),
        ('social.facebook', 'https://facebook.com/signsquad', 'url'),
        ('social.instagram', 'https://instagram.com/signsquad', 'url'),
        ('social.twitter', 'https://twitter.com/signsquad', 'url'),
        ('features.road_legal', 'true', 'boolean'),
        ('features.show_plates', 'true', 'boolean'),
        ('features.next_day_delivery', 'true', 'boolean'),
        ('features.custom_fonts', 'true', 'boolean'),
        ('legal.company_number', '12345678', 'text'),
        ('legal.vat_number', 'GB123456789', 'text'),
        ('production.turnaround_standard', '3-5 working days', 'text'),
        ('production.turnaround_express', 'Next working day', 'text'),
        ('shipping.standard_cost', '4.99', 'currency'),
        ('shipping.express_cost', '9.99', 'currency'),
        ('shipping.free_threshold', '50.00', 'currency')
    `);
    console.log("Inserted comprehensive site configuration...");
    
    console.log("✓ Comprehensive migration completed successfully!");
    
  } catch (error) {
    console.error("✗ Error in comprehensive migration:", error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

comprehensiveMigration();