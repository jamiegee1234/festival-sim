import express from 'express';
import simulationRoutes from './simulation';
import festivalRoutes from './festival';
import metricsRoutes from './metrics';
import adminRoutes from './admin';

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Route groups
router.use(`${API_VERSION}/simulation`, simulationRoutes);
router.use(`${API_VERSION}/festival`, festivalRoutes);
router.use(`${API_VERSION}/metrics`, metricsRoutes);
router.use(`${API_VERSION}/admin`, adminRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Festival Simulator API',
    version: '1.0.0',
    description: 'REST API for the Festival Simulator',
    endpoints: {
      simulation: `${API_VERSION}/simulation`,
      festival: `${API_VERSION}/festival`,
      metrics: `${API_VERSION}/metrics`,
      admin: `${API_VERSION}/admin`
    }
  });
});

export default router;