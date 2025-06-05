
import { db, pool } from './server/db';

async function updatePricingSchema() {
  try {
    console.log('Updating pricing schema...');
    
    // Add delivery_fee column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE pricing 
        ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT '4.99'
      `);
      console.log('Added delivery_fee column');
    } catch (error) {
      console.log('delivery_fee column may already exist:', error);
    }
    
    // Add tax_rate column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE pricing 
        ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT '20'
      `);
      console.log('Added tax_rate column');
    } catch (error) {
      console.log('tax_rate column may already exist:', error);
    }
    
    // Update existing record with default values if they're null
    await pool.query(`
      UPDATE pricing 
      SET delivery_fee = COALESCE(delivery_fee, '4.99'),
          tax_rate = COALESCE(tax_rate, '20')
      WHERE id = 1
    `);
    
    console.log('Pricing schema updated successfully');
    
    // Verify the update
    const result = await pool.query(`
      SELECT id, front_plate_price, rear_plate_price, both_plates_discount, 
             delivery_fee, tax_rate, updated_at
      FROM pricing WHERE id = 1
    `);
    
    console.log('Current pricing data:', result.rows[0]);
    
  } catch (error) {
    console.error('Error updating pricing schema:', error);
  } finally {
    process.exit(0);
  }
}

updatePricingSchema();
