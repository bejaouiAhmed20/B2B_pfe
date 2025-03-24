import express from 'express';
import { login, logout, loginClient, forgotPassword, resetPassword } from '../../controllers/AuthController/authController';

const router = express.Router();

router.post('/login', login as express.RequestHandler);
router.post('/loginClient', loginClient as express.RequestHandler);
router.post('/logout', logout);

// Fix the type casting for the new routes
router.post('/forgot-password', forgotPassword as any);
router.post('/reset-password/:token', resetPassword as any);

export default router;