import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Fix the import to match what's actually exported from tokenUtils
import { createToken } from './tokenUtils';

// Define the token payload interface
interface TokenPayload {
  id: string;
  email: string;
  est_admin: boolean;
}

// Define the JWT secret directly here since it's not exported from tokenUtils
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Accès non autorisé: Token manquant' });
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Add user info to request object
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Accès non autorisé: Token invalide' });
  }
};

// Middleware to check if user is admin
export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Accès non autorisé: Token manquant' });
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Check if user is admin
    if (!decoded.est_admin) {
      return res.status(403).json({ message: 'Accès non autorisé: Droits administrateur requis' });
    }
    
    // Add user info to request object
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(401).json({ message: 'Accès non autorisé: Token invalide' });
  }
};