import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';

const router = Router();
const auditController = new AuditController();

// GET /api/audit/logs - Get audit logs with filtering
router.get('/logs', (req, res) => auditController.getAuditLogs(req, res));

// GET /api/audit/stats - Get audit statistics
router.get('/stats', (req, res) => auditController.getAuditStats(req, res));

export default router;