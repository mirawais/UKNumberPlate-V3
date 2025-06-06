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
import bcrypt from "bcryptjs";

async function migrateToDatabase() {
  try {
    console.log("Migrating data to Neon database...");
    
    // Clear existing data
    await db.delete(siteConfig);
    await db.delete(users);
    await db.delete(paymentMethods);
    await db.delete(pricing);
    await db.delete(carBrands);
    await db.delete(colors);
    await db.delete(badges);
    await db.delete(textStyles);
    await db.delete(plateSizes);
    
    console.log("Cleared existing data...");
    
    // Insert plate sizes (only required fields)
    await db.insert(plateSizes).values([
      { name: "Standard", dimensions: "520mm x 111mm", additionalPrice: "0", isActive: true },
      { name: "Square", dimensions: "279mm x 203mm", additionalPrice: "5", isActive: true }
    ]);
    console.log("Inserted plate sizes...");
    
    // Insert text styles (with all required fields)
    await db.insert(textStyles).values([
      { name: "Standard", description: "Standard black text", additionalPrice: "0", isActive: true },
      { name: "3D Gel (Standard)", description: "Raised gel letters in black", additionalPrice: "15", isActive: true },
      { name: "4D Laser Cut", description: "Laser cut acrylic letters", additionalPrice: "25", isActive: true }
    ]);
    console.log("Inserted text styles...");
    
    // Insert badges (matching database schema)
    await db.insert(badges).values([
      { name: "GB", imagePath: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg", additionalPrice: "0", isActive: true },
      { name: "EU", imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png", additionalPrice: "2", isActive: true }
    ]);
    console.log("Inserted badges...");
    
    // Insert colors (only required fields)
    await db.insert(colors).values([
      { name: "Black", hexCode: "#000000", isActive: true },
      { name: "White", hexCode: "#FFFFFF", isActive: true },
      { name: "Silver", hexCode: "#C0C0C0", isActive: true },
      { name: "Red", hexCode: "#FF0000", isActive: true },
      { name: "Blue", hexCode: "#0000FF", isActive: true }
    ]);
    console.log("Inserted colors...");
    
    // Insert car brands (only required fields)
    await db.insert(carBrands).values([
      { name: "Ford", isActive: true },
      { name: "BMW", isActive: true },
      { name: "Mercedes", isActive: true },
      { name: "Audi", isActive: true },
      { name: "Toyota", isActive: true },
      { name: "Honda", isActive: true },
      { name: "Nissan", isActive: true },
      { name: "Volkswagen", isActive: true }
    ]);
    console.log("Inserted car brands...");
    
    // Insert pricing (only required fields)
    await db.insert(pricing).values([
      { 
        frontPlatePrice: "20", 
        rearPlatePrice: "25", 
        bothPlatesDiscount: "5", 
        taxRate: "20",
        deliveryFee: "4.99"
      }
    ]);
    console.log("Inserted pricing...");
    
    // Insert payment methods (only required fields)
    await db.insert(paymentMethods).values([
      { name: "Credit Card", isActive: true },
      { name: "PayPal", isActive: true },
      { name: "Bank Transfer", isActive: true },
      { name: "Apple Pay", isActive: true },
      { name: "Google Pay", isActive: true }
    ]);
    console.log("Inserted payment methods...");
    
    // Insert admin user (only required fields)
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values([
      { 
        username: "admin",
        password: hashedPassword,
        isAdmin: true
      }
    ]);
    console.log("Inserted admin user...");
    
    // Insert site configuration (only required fields)
    await db.insert(siteConfig).values([
      { configKey: "site.name", configValue: "NumberPlate Customizer", configType: "text" },
      { configKey: "site.description", configValue: "Professional UK number plate customization service", configType: "text" },
      { configKey: "contact.email", configValue: "info@signsquad.com", configType: "email" },
      { configKey: "contact.phone", configValue: "07429269149", configType: "text" },
      { configKey: "address.street", configValue: "5 Roger Street", configType: "text" },
      { configKey: "address.city", configValue: "Manchester", configType: "text" },
      { configKey: "address.postcode", configValue: "M4 4EN", configType: "text" }
    ]);
    console.log("Inserted site configuration...");
    
    console.log("✓ Database migration completed successfully!");
    
  } catch (error) {
    console.error("✗ Error migrating database:", error);
    throw error;
  }
}

migrateToDatabase();