import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getAllPopups, 
  getActivePopups, 
  createPopup, 
  getPopupById, 
  updatePopup, 
  deletePopup,
  uploadPopupImage
} from '../../controllers/PopupController/PopupController';

// Create uploads directory for popups if it doesn't exist
const popupsUploadsDir = path.join(__dirname, '../../../uploads/popups');
if (!fs.existsSync(popupsUploadsDir)) {
  fs.mkdirSync(popupsUploadsDir, { recursive: true });
}

// Configure multer storage for popup images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, popupsUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'popup-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// Get all popups (admin only)
router.get('/', getAllPopups);

// Get active popups for client
router.get('/active', getActivePopups);

// Create new popup (admin only)
router.post('/', upload.single('image'), createPopup);

// Get popup by ID
router.get('/:id', getPopupById as express.RequestHandler<{ id: string }>);

// Update popup (admin only)
router.put('/:id', upload.single('image'), updatePopup as express.RequestHandler<{ id: string }>);

// Delete popup (admin only)
router.delete('/:id', deletePopup as express.RequestHandler<{ id: string }>);

export default router;