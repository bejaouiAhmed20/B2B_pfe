import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Add more detailed error logging to help diagnose issues
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header and log it (for debugging)
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded:', decoded);
      
      // Find user
      const user = await User.findOne({ where: { id: (decoded as any).id } });
      
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Add user to request
      (req as any).user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Admin authentication middleware
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First run the regular auth middleware
    auth(req, res, () => {
      // Check if user is admin
      const user = (req as any).user;
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error during admin authentication' });
  }
};