import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import bcrypt from 'bcryptjs';

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Admin middleware
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  if (!user.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  req.user = user;
  next();
};

export async function login(username: string, password: string) {
  try {
    console.log(`Attempting login for username: ${username}`);

    // Get user from database
    const user = await storage.getUserByUsername(username);
    console.log(`User found:`, user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found in database');
      throw new Error("Invalid credentials");
    }

    if (!user.password_hash) {
      console.log('User found but password_hash is missing');
      throw new Error("Invalid user data");
    }

    console.log('Comparing passwords...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log(`Password valid: ${isValid}`);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await storage.createUser({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@numberplate.com',
      isAdmin: true
    });

    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Auth controller
export const auth = {
  // Login
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    try {
      const userWithoutPassword = await login(username, password);
      
      // Store user ID in session
      req.session.userId = userWithoutPassword.id;
      
      return res.json({ 
        id: userWithoutPassword.id, 
        username: userWithoutPassword.username, 
        isAdmin: userWithoutPassword.isAdmin 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(401).json({ message: error.message || 'Server error during login' });
    }
  },
  
  // Logout
  logout: (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  }
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        isAdmin: boolean;
      }
    }
  }
}

// Extend Express Session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
    cart?: any[];
  }
}