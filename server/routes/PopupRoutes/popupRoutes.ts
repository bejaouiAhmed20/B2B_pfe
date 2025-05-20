import express from 'express';
import {
  getPopups,
  getActivePopups,
  getPopupById,
  createPopup,
  updatePopup,
  deletePopup,
  togglePopupStatus
} from '../../controllers/PopupController/popupController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/active', getActivePopups);

// Admin routes (protected)
router.get('/', auth as express.RequestHandler, adminAuth as express.RequestHandler, getPopups);
router.get('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, getPopupById as express.RequestHandler);
router.post('/', auth as express.RequestHandler, adminAuth as express.RequestHandler, createPopup as express.RequestHandler);
router.put('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, updatePopup as express.RequestHandler);
router.delete('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, deletePopup as express.RequestHandler);
router.put('/:id/toggle', auth as express.RequestHandler, adminAuth as express.RequestHandler, togglePopupStatus as express.RequestHandler);

export default router;
