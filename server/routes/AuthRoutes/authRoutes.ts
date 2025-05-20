import express from 'express';
import {
  login,
  logout,
  loginClient,
  forgotPassword,
  resetPassword,
  refreshToken
} from '../../controllers/AuthController/authController';
// Middleware d'authentification non utilisé pour la route de déconnexion
// import { auth } from '../../middlewares/authMiddleware';
import cookieParser from 'cookie-parser';

const router = express.Router();

// Apply cookie parser middleware
router.use(cookieParser());

// Authentication routes
router.post('/login', login as any);
router.post('/login-client', loginClient as any);
// La route de déconnexion ne devrait pas nécessiter d'authentification
// car cela peut empêcher la déconnexion si le token est déjà expiré
router.post('/logout', logout as any);
router.post('/refresh-token', refreshToken as any);

// Password reset routes
router.post('/forgot-password', forgotPassword as any);
router.post('/reset-password/:token', resetPassword as any);

export default router;