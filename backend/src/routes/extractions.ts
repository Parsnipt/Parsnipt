import { Router, Request, Response } from 'express';
import { ExtractionService } from '../services/extraction/extraction.service.js';
import { authMiddleware } from '../middleware/auth.js';
import db from '../config/database.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = Router();
const extractionService = new ExtractionService();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/v1/extractions
 * Extract artifacts from uploaded file
 */
router.post(
  '/',
  authMiddleware,
  upload.single('file'),

  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const code = req.file.buffer.toString('utf-8');
      const fileName = req.file.originalname;
      const language = req.body.language;

      // Extract artifacts using our new engine
      const fileAnalysis = await extractionService.extractFromCode(
        code,
        fileName,
        language
      );

      // Save individual artifacts to the migrated 'extractions' table
      for (const artifact of fileAnalysis.artifacts) {
        await db('extractions').insert({
          id: artifact.id || uuidv4(),
          user_id: (req as any).user?.id || null,
          name: artifact.name,
          code: artifact.code,
          kind: artifact.kind,
          role: artifact.role,
          fingerprint: crypto.createHash('sha256').update(artifact.code || '').digest('hex'),
          documentation: JSON.stringify(artifact.documentation),
          parent_id: artifact.parent?.id || null,
          scope_depth: 0,
          syntax_is_async: artifact.syntax.isAsync,
          syntax_is_arrow: artifact.syntax.isArrow,
          syntax_is_generator: artifact.syntax.isGenerator,
          syntax_visibility: artifact.syntax.visibility,
          syntax_export_type: artifact.syntax.exportType,
          parameters: JSON.stringify(artifact.parameters),
          returns: JSON.stringify(artifact.returns),
          analysis_complexity: artifact.analysis.complexity,
          analysis_cyclomatic: artifact.analysis.cyclomaticComplexity,
          analysis_nesting_depth: artifact.analysis.nestingDepth,
          analysis_branch_count: artifact.analysis.branchCount,
          analysis_loop_count: artifact.analysis.loopCount,
          analysis_call_count: artifact.analysis.callCount,
          relationships: JSON.stringify(artifact.relationships),
          confidence: JSON.stringify(artifact.confidence),
          created_at: new Date()
        });
      }

      res.json({
        success: true,
        data: fileAnalysis
      });
    } catch (error) {
      console.error('Extraction error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Extraction failed'
      });
    }
  }
);

/**
 * GET /api/v1/extractions/:extractionId
 * Get a specific artifact extraction
 */
router.get('/:extractionId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const artifact = await db('extractions')
      .where('id', req.params.extractionId)
      .where('user_id', (req as any).user?.id)
      .first();

    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }

    // Parse JSON fields back to objects for the frontend
    const parsedArtifact = {
      ...artifact,
      documentation: JSON.parse(artifact.documentation || '{}'),
      relationships: JSON.parse(artifact.relationships || '{}'),
      confidence: JSON.parse(artifact.confidence || '{}'),
      parameters: JSON.parse(artifact.parameters || '[]'),
      returns: JSON.parse(artifact.returns || '{}')
    };

    res.json({
      success: true,
      data: parsedArtifact
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve extraction'
    });
  }
});

export default router;