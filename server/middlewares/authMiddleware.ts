import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  email: string;
  est_admin: boolean;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, 'your_jwt_secret') as DecodedToken;
    req.user = decoded; // Use the properly typed property
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, 'your_jwt_secret') as DecodedToken;
    
    if (!decoded.est_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = decoded; // Use the properly typed property
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};