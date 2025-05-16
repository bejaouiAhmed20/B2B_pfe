import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getFlights, 
  addFlight, 
  updateFlight, 
  deleteFlight, 
  getFlightById,
  assignPlaneToFlight,
  createSeatReservations,
  getFlightSeats,
  allocateSeats
} from '../../controllers/FlightController/flightController';
import { adminAuth } from '../../middlewares/authMiddleware';

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
    cb(null, 'flight-' + uniqueSuffix + ext);
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

router.get('/', getFlights);
router.get('/:id', getFlightById as express.RequestHandler);
router.post('/', upload.single('image'), addFlight as express.RequestHandler);
router.put('/:id', upload.single('image'), updateFlight as express.RequestHandler);
router.delete('/:id', deleteFlight as express.RequestHandler);
// Add this route to the existing router
router.post('/assign-plane', adminAuth as express.RequestHandler, assignPlaneToFlight as express.RequestHandler);

// Add new routes for seat management
router.get('/:id/seats', getFlightSeats as express.RequestHandler);
router.post('/:id/allocate-seats', allocateSeats as express.RequestHandler);
router.post('/:id/seat-reservations', createSeatReservations as express.RequestHandler);

export default router;