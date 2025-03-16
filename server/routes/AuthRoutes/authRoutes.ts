import express from 'express';
import { login, logout , loginClient } from '../../controllers/AuthController/authController';

const router = express.Router();

router.post('/login', login as express.RequestHandler);
router.post('/loginClient', loginClient as express.RequestHandler);

router.post('/logout', logout);

export default router;