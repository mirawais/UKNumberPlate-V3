
import { Pool } from 'pg';
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAdminUser() {
  try {
    console.log("Fixing admin user in Neon database...");
    
    // First, check if admin user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (existingUser.rows.length > 0) {
      console.log("Admin user exists, updating password...");
      // Update existing admin user with correct password
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, is_admin = true WHERE username = $2',
        [hashedPassword, 'admin']
      );
      console.log("Admin user password updated successfully!");
    } else {
      console.log("Creating new admin user...");
      // Create new admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, email, is_admin) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'admin@numberplate.com', true]
      );
      console.log("Admin user created successfully!");
    }
    
    // Verify the user was created/updated correctly
    const verifyUser = await pool.query('SELECT username, is_admin, password_hash FROM users WHERE username = $1', ['admin']);
    console.log("Admin user verification:", {
      username: verifyUser.rows[0]?.username,
      isAdmin: verifyUser.rows[0]?.is_admin,
      hasPassword: !!verifyUser.rows[0]?.password_hash
    });
    
    console.log("✓ Admin user fix completed successfully!");
    
  } catch (error) {
    console.error("✗ Error fixing admin user:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixAdminUser().catch(console.error);
