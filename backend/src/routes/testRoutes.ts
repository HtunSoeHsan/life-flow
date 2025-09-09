import { Router } from 'express';
import { createAuditLog } from '../middleware/auditLogger';

const router = Router();

// Test route to manually create an audit log
router.post('/audit', async (req, res) => {
  try {
    const hospitalId = req.headers['x-hospital-id'] as string;
    if (!hospitalId) {
      return res.status(400).json({ error: 'Hospital ID required' });
    }

    await createAuditLog(hospitalId, {
      userId: 'test-user',
      userEmail: 'test@example.com',
      action: 'TEST',
      entityType: 'TestEntity',
      entityId: 'test-123',
      newValues: { test: 'data' }
    });

    res.json({ success: true, message: 'Audit log created' });
  } catch (error) {
    console.error('Test audit log creation failed:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

export default router;