import { Router } from 'express';
import { getReportsSummary } from '../controllers/reports.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Reportes accesibles para Admin y Supervisor
router.get('/resumen', verifyToken, requireRole('admin', 'supervisor'), getReportsSummary);

export default router;
