/**
 * Extraction routes
 * POST   /api/v1/extractions - Upload file
 * GET    /api/v1/extractions - List user's extractions
 * GET    /api/v1/extractions/:id - Get extraction details
 * DELETE /api/v1/extractions/:id - Delete extraction
 * POST   /api/v1/extractions/:id/export - Export extraction
 */

import { Router, Request, Response, NextFunction } from 'express';
import ExtractionController from '../controllers/extractionController.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = Router();

// All extraction routes require authentication
router.use(authMiddleware, requireAuth);

// Upload file
router.post(
  '/',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) =>
    ExtractionController.createExtraction(req, res, next)
);

// List user's extractions
router.get('/', (req: Request, res: Response, next: NextFunction) =>
  ExtractionController.listExtractions(req, res, next)
);

// Get extraction details
router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
  ExtractionController.getExtraction(req, res, next)
);

// Delete extraction
router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  ExtractionController.deleteExtraction(req, res, next)
);

// Export extraction
router.post('/:id/export', (req: Request, res: Response, next: NextFunction) =>
  ExtractionController.exportExtraction(req, res, next)
);

export default router;