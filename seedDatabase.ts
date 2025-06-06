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

async function seedDatabase() {
  try {
    console.log("Seeding database with initial data...");
    
    // Insert plate sizes
    await db.insert(plateSizes).values([
      { name: "Standard", dimensions: "520mm x 111mm", additionalPrice: "0", description: "Standard UK number plate size", isActive: true },
      { name: "Square", dimensions: "279mm x 203mm", additionalPrice: "5", description: "Square motorcycle plate", isActive: true }
    ]);
    
    // Insert text styles
    await db.insert(textStyles).values([
      { name: "Standard", description: "Standard black text", additionalPrice: "0", isActive: true },
      { name: "3D Gel (Standard)", description: "Raised gel letters in black", additionalPrice: "15", isActive: true },
      { name: "4D Laser Cut", description: "Laser cut acrylic letters", additionalPrice: "25", isActive: true }
    ]);
    
    // Insert badges
    await db.insert(badges).values([
      { name: "GB", imagePath: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg", additionalPrice: "0", isActive: true },
      { name: "EU", imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png", additionalPrice: "2", isActive: true }
    ]);
    
    // Insert colors
    await db.insert(colors).values([
      { name: "Black", hexCode: "#000000", isActive: true },
      { name: "White", hexCode: "#FFFFFF", isActive: true },
      { name: "Silver", hexCode: "#C0C0C0", isActive: true },
      { name: "Red", hexCode: "#FF0000", isActive: true },
      { name: "Blue", hexCode: "#0000FF", isActive: true }
    ]);
    
    // Insert car brands
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
    
    // Insert pricing
    await db.insert(pricing).values([
      { 
        frontPlatePrice: "20", 
        rearPlatePrice: "25", 
        bothPlatesDiscount: "5", 
        taxRate: "20",
        deliveryFee: "4.99"
      }
    ]);
    
    // Insert payment methods
    await db.insert(paymentMethods).values([
      { name: "Credit Card", isActive: true },
      { name: "PayPal", isActive: true },
      { name: "Bank Transfer", isActive: true },
      { name: "Apple Pay", isActive: true },
      { name: "Google Pay", isActive: true }
    ]);
    
    // Insert admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values([
      { 
        username: "admin",
        email: "admin@signsquad.com",
        password: hashedPassword,
        isAdmin: true
      }
    ]);
    
    // Insert site configuration
    await db.insert(siteConfig).values([
      { configKey: "site.name", configValue: "NumberPlate Customizer", configType: "text", description: "Site name" },
      { configKey: "site.description", configValue: "Professional UK number plate customization service", configType: "text", description: "Site description" },
      { configKey: "contact.email", configValue: "info@signsquad.com", configType: "email", description: "Contact email" },
      { configKey: "contact.phone", configValue: "07429269149", configType: "text", description: "Contact phone" },
      { configKey: "address.street", configValue: "5 Roger Street", configType: "text", description: "Street address" },
      { configKey: "address.city", configValue: "Manchester", configType: "text", description: "City" },
      { configKey: "address.postcode", configValue: "M4 4EN", configType: "text", description: "Postcode" }
    ]);
    
    console.log("Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();