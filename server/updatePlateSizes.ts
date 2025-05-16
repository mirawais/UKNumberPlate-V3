import { db } from "./db";
import { plateSizes } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updatePlateSizesData() {
  try {
    // Clear existing plate sizes first
    await db.delete(plateSizes);
    
    // Insert the new plate sizes
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
    
    console.log("Plate sizes updated successfully");
  } catch (error) {
    console.error("Error updating plate sizes:", error);
  }
}

// Run the update
updatePlateSizesData();