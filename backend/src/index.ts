import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { tenantMiddleware } from './middleware/tenantMiddleware';
import donorRoutes from './routes/donor.routes';
import hospitalRoutes from './routes/hospitalRoutes';
import collectionRoutes from './routes/collectionRoutes';
import distributionRoutes from './routes/distributionRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import authRoutes from './routes/authRoutes';
import auditRoutes from './routes/auditRoutes';
import testRoutes from './routes/testRoutes';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Multi-tenant middleware (skip for health check, inventory, donors, and collections)
app.use((req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/api/inventory') || req.path.startsWith('/api/donors') || req.path.startsWith('/api/collections')) {
    // For inventory, donor, and collection routes, extract hospitalId from headers
    if (req.path.startsWith('/api/inventory') || req.path.startsWith('/api/donors') || req.path.startsWith('/api/collections')) {
      req.hospitalId = req.headers['x-hospital-id'] as string;
    }
    return next();
  }
  // For demo purposes, set default tenant if multi-tenant is disabled
  if (process.env.FEATURE_MULTI_TENANT !== 'true') {
    req.tenantId = 'default-tenant';
    req.tenant = { id: 'default-tenant', name: 'Default Tenant' };
    return next();
  }
  return tenantMiddleware(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/test', testRoutes);

// Protected routes example (uncomment to enable auth)
// import { authenticateToken, requireRole } from './middleware/authMiddleware';
// app.use('/api/inventory', authenticateToken, inventoryRoutes);
// app.use('/api/hospitals', authenticateToken, requireRole(['super_admin']), hospitalRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    tenant: req.tenant?.name || 'Unknown'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BBM API Server running on port ${PORT}`);
  console.log(`📊 Multi-tenant: ${process.env.FEATURE_MULTI_TENANT === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`🔐 Biometric Auth: ${process.env.BIOMETRIC_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
});

