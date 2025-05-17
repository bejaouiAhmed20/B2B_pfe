import express from 'express';
import multer from 'multer';
import path from 'path';
import { getLocations, addLocation, updateLocation, deleteLocation, getLocationById } from '../../controllers/LocationController/locationController';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'location-' + uniqueSuffix + ext);
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

router.get('/', getLocations);
router.get('/:id', getLocationById as express.RequestHandler);
router.post('/', upload.single('image'), addLocation);
router.put('/:id', upload.single('image'), updateLocation as express.RequestHandler);
router.delete('/:id', deleteLocation as express.RequestHandler);

export default router;