import express from 'express';
import { upload, uploadFile } from '../../controllers/UploadController/uploadController';

const router = express.Router();

// Route for file upload
router.post('/', upload.single('file'), uploadFile as express.RequestHandler);

export default router;