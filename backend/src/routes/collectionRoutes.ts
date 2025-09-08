import express from 'express';
import {
  getCollections,
  createCollection,
  updateCollectionStatus,
  completeCollection,
  testEndpoint
} from '../controllers/collectionController';

const router = express.Router();

// Test endpoint
router.post('/test', testEndpoint);

// Get all collections
router.get('/', getCollections);

// Create new collection
router.post('/', createCollection);

// Update collection status
router.put('/:collectionId/status', updateCollectionStatus);

// Complete collection (create blood unit)
router.post('/:collectionId/complete', completeCollection);

export default router;