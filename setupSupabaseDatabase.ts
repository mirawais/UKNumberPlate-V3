
import { db } from "./server/db";
import { mockData } from "./server/mockData";
import { 
  siteConfig, 
  plateSizes, 
  textStyles, 
  badges, 
  colors, 
  carBrands, 
  paymentMethods,
  pricing
} from "./shared/schema";

async function setupSupabaseDatabase() {
  try {
    console.log("Setting up Supabase database...");

    // Create initial pricing record
    console.log("Creating pricing configuration...");
    await db.insert(pricing).values({
      frontPlatePrice: "15.00",
      rearPlatePrice: "15.00",
      bothPlatesPrice: "25.00",
      bothPlatesDiscount: "5",
      taxRate: "20",
      deliveryFee: "4.99"
    }).onConflictDoNothing();

    // Insert site configuration
    console.log("Inserting site configuration...");
    await db.insert(siteConfig).values(mockData.siteConfigs).onConflictDoNothing();

    // Insert plate sizes
    console.log("Inserting plate sizes...");
    await db.insert(plateSizes).values(mockData.plateSizes).onConflictDoNothing();

    // Insert text styles
    console.log("Inserting text styles...");
    await db.insert(textStyles).values(mockData.textStyles).onConflictDoNothing();

    // Insert badges
    console.log("Inserting badges...");
    await db.insert(badges).values(mockData.badges).onConflictDoNothing();

    // Insert colors
    console.log("Inserting colors...");
    await db.insert(colors).values(mockData.colors).onConflictDoNothing();

    // Insert car brands
    console.log("Inserting car brands...");
    await db.insert(carBrands).values(mockData.carBrands).onConflictDoNothing();

    // Insert payment methods
    console.log("Inserting payment methods...");
    await db.insert(paymentMethods).values(mockData.paymentMethods).onConflictDoNothing();

    console.log("Supabase database setup complete!");
  } catch (error) {
    console.error("Error setting up Supabase database:", error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupSupabaseDatabase();
