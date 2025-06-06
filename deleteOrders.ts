
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function deleteAllOrders() {
  try {
    console.log("Connecting to database...");
    
    // Get current order count
    const countResult = await pool.query('SELECT COUNT(*) FROM orders');
    const orderCount = countResult.rows[0].count;
    console.log(`Found ${orderCount} orders in the database`);
    
    if (orderCount === '0') {
      console.log("No orders to delete.");
      return;
    }
    
    // Delete all orders
    console.log("Deleting all orders...");
    const deleteResult = await pool.query('DELETE FROM orders');
    console.log(`Successfully deleted ${deleteResult.rowCount} orders`);
    
    // Verify deletion
    const verifyResult = await pool.query('SELECT COUNT(*) FROM orders');
    const remainingCount = verifyResult.rows[0].count;
    console.log(`Orders remaining in database: ${remainingCount}`);
    
    console.log("Order deletion completed successfully!");
    
  } catch (error) {
    console.error("Error deleting orders:", error);
  } finally {
    await pool.end();
  }
}

// Run the deletion
deleteAllOrders();
