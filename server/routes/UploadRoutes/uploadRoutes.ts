import express from 'express';
import { upload, uploadFile } from '../../controllers/UploadController/uploadController';
import { popupUpload, uploadPopupImage } from '../../controllers/UploadController/popupUploadController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Route for general file upload (authenticated users only)
router.post('/',
  auth as express.RequestHandler,
  upload.single('file'),
  uploadFile as express.RequestHandler
);

// Route for popup image upload (admin only)
router.post('/popup-image',
  auth as express.RequestHandler,
  adminAuth as express.RequestHandler,
  popupUpload.single('image'),
  uploadPopupImage as express.RequestHandler
);

export default router;