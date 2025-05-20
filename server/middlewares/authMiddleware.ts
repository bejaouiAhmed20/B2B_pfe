import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyAccessToken } from '../utils/tokenUtils';

// Interface for extended request with user
export interface AuthRequest extends Request {
  user?: User;
}

// Standard authentication middleware
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Log pour le débogage
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Extraire le token en gérant différents formats possibles
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Enlever 'Bearer '
    } else {
      token = authHeader; // Utiliser le header tel quel
    }

    // Log pour le débogage
    console.log('Token extrait:', token.substring(0, 20) + '...');

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Find user
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user to request
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin authentication middleware
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First run the regular auth middleware
    auth(req, res, () => {
      // Check if user is admin
      const user = (req as AuthRequest).user;

      if (!user || !user.est_admin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
          code: 'ADMIN_REQUIRED'
        });
      }

      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authentication',
      code: 'SERVER_ERROR'
    });
  }
};

// Client authentication middleware (non-admin users)
export const clientAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First run the regular auth middleware
    auth(req, res, () => {
      // No additional checks needed for clients
      next();
    });
  } catch (error) {
    console.error('Client auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during client authentication',
      code: 'SERVER_ERROR'
    });
  }
};